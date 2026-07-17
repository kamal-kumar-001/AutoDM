import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import { AppLogger } from '../common/logger/logger.service';
import { AuditLogService } from '../auth/audit-log.service';
import axios from 'axios';

interface MetaTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

interface MetaPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
}

interface MetaPagesResponse {
  data: MetaPage[];
}

interface MetaIgAccountDetails {
  instagram_business_account?: {
    id: string;
    username: string;
    name?: string;
    profile_picture_url?: string;
  };
}

@Injectable()
export class InstagramService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly auditLogService: AuditLogService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('InstagramService');
  }

  getAuthUrl(userId: string): string {
    const appId = this.configService.get('META_APP_ID');
    const redirectUri = this.configService.get('META_REDIRECT_URI');

    const state = Buffer.from(JSON.stringify({ userId })).toString('base64url');

    const scopes = [
      'pages_show_list',
      'instagram_basic',
      'instagram_manage_comments',
      'instagram_manage_messages',
      'pages_read_engagement',
    ].join(',');

    return `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&state=${state}&scope=${scopes}`;
  }

  async exchangeCodeForTokens(code: string, state: string): Promise<string> {
    let userId = '';
    try {
      const decodedState = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      userId = decodedState.userId;
    } catch {
      throw new BadRequestException('Invalid state parameter in callback');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User associated with OAuth session not found');
    }

    const appId = this.configService.get('META_APP_ID')!;
    const appSecret = this.configService.get('META_APP_SECRET')!;
    const redirectUri = this.configService.get('META_REDIRECT_URI')!;

    try {
      // 1. Get short-lived user token
      const shortTokenResponse = await axios.get<MetaTokenResponse>(
        'https://graph.facebook.com/v20.0/oauth/access_token',
        {
          params: {
            client_id: appId,
            redirect_uri: redirectUri,
            client_secret: appSecret,
            code,
          },
        },
      );

      const shortLivedToken = shortTokenResponse.data.access_token;

      // 2. Exchange for long-lived user token
      const longTokenResponse = await axios.get<MetaTokenResponse>(
        'https://graph.facebook.com/v20.0/oauth/access_token',
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: appId,
            client_secret: appSecret,
            fb_exchange_token: shortLivedToken,
          },
        },
      );

      const longLivedToken = longTokenResponse.data.access_token;

      // 3. Fetch Facebook pages list
      const pagesResponse = await axios.get<MetaPagesResponse>(
        'https://graph.facebook.com/v20.0/me/accounts',
        {
          params: {
            access_token: longLivedToken,
          },
        },
      );

      const pages = pagesResponse.data.data || [];
      this.logger.log(
        `Retrieved Facebook Pages count: ${pages.length}. Pages: ${JSON.stringify(pages.map((p) => ({ id: p.id, name: p.name })))}`,
      );
      let linkedAccountsCount = 0;

      for (const page of pages) {
        this.logger.log(`Fetching details for Facebook Page: ${page.name} (${page.id})`);
        // 4. Fetch Instagram business account connected to page
        const pageDetailsResponse = await axios.get<MetaIgAccountDetails>(
          `https://graph.facebook.com/v20.0/${page.id}`,
          {
            params: {
              fields: 'instagram_business_account{id,username,name,profile_picture_url}',
              access_token: page.access_token,
            },
          },
        );

        this.logger.log(
          `Page Details Response for ${page.name}: ${JSON.stringify(pageDetailsResponse.data)}`,
        );

        const igAccount = pageDetailsResponse.data.instagram_business_account;

        if (igAccount) {
          // Encrypt the page access token (long-lived / non-expiring)
          const encryptedPageToken = this.encryptionService.encrypt(page.access_token);

          await this.prisma.instagramAccount.upsert({
            where: { instagramId: igAccount.id },
            create: {
              userId,
              instagramId: igAccount.id,
              username: igAccount.username,
              displayName: igAccount.name || null,
              profilePicture: igAccount.profile_picture_url || null,
              accessToken: encryptedPageToken,
              instagramPageId: page.id,
              isConnected: true,
            },
            update: {
              username: igAccount.username,
              displayName: igAccount.name || null,
              profilePicture: igAccount.profile_picture_url || null,
              accessToken: encryptedPageToken,
              isConnected: true,
              deletedAt: null,
            },
          });

          await this.auditLogService.log({
            userId,
            action: 'INSTAGRAM_ACCOUNT_LINKED',
            details: JSON.stringify({ instagramId: igAccount.id, username: igAccount.username }),
          });

          linkedAccountsCount++;
        }
      }

      if (linkedAccountsCount === 0) {
        throw new BadRequestException(
          'No connected Instagram Business Accounts found on your Facebook Pages. Verify your FB Page links.',
        );
      }

      return userId;
    } catch (error) {
      this.logger.error(
        'Meta OAuth Token exchange failed',
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Meta Integration OAuth failure',
      );
    }
  }

  async disconnectAccount(accountId: string, userId: string) {
    const account = await this.prisma.instagramAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Connected Instagram channel not found');
    }

    // Perform soft-delete
    await this.prisma.instagramAccount.update({
      where: { id: accountId },
      data: {
        isConnected: false,
        deletedAt: new Date(),
      },
    });

    await this.auditLogService.log({
      userId,
      action: 'INSTAGRAM_ACCOUNT_DISCONNECTED',
      details: JSON.stringify({ instagramId: account.instagramId, username: account.username }),
    });

    return { message: 'Instagram connection removed successfully' };
  }
}
