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
import { SendDmProducer } from './send-dm.producer';

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
    followers_count?: number;
    follows_count?: number;
    media_count?: number;
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
    private readonly sendDmProducer: SendDmProducer,
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
              fields:
                'instagram_business_account{id,username,name,profile_picture_url,followers_count,follows_count,media_count}',
              access_token: page.access_token,
            },
          },
        );

        this.logger.log(
          `Page Details Response for ${page.name}: ${JSON.stringify(pageDetailsResponse.data)}`,
        );

        const igAccount = pageDetailsResponse.data.instagram_business_account;

        if (igAccount) {
          // Automatically subscribe the Facebook Page to this app's webhooks
          try {
            await axios.post(
              `https://graph.facebook.com/v20.0/${page.id}/subscribed_apps`,
              {},
              {
                params: { access_token: page.access_token },
              },
            );
            this.logger.log(`Successfully subscribed Page ${page.name} (${page.id}) to webhooks.`);
          } catch (subError) {
            const msg = subError instanceof Error ? subError.message : String(subError);
            const detail = axios.isAxiosError(subError)
              ? JSON.stringify(subError.response?.data)
              : '';
            this.logger.warn(
              `Failed to automatically subscribe Page ${page.name} to app webhooks: ${msg}. Details: ${detail}`,
            );
          }

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
              followersCount: igAccount.followers_count || 0,
              followingCount: igAccount.follows_count || 0,
              mediaCount: igAccount.media_count || 0,
              isConnected: true,
            },
            update: {
              userId,
              username: igAccount.username,
              displayName: igAccount.name || null,
              profilePicture: igAccount.profile_picture_url || null,
              accessToken: encryptedPageToken,
              instagramPageId: page.id,
              followersCount: igAccount.followers_count || 0,
              followingCount: igAccount.follows_count || 0,
              mediaCount: igAccount.media_count || 0,
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
        if (process.env.NODE_ENV !== 'production') {
          const mockIgId = '17841458228090598';
          const encryptedMockToken = this.encryptionService.encrypt('mock_dev_access_token');
          await this.prisma.instagramAccount.upsert({
            where: { instagramId: mockIgId },
            create: {
              userId,
              instagramId: mockIgId,
              username: 'demo_creator_hub',
              displayName: 'Demo Creator Hub',
              profilePicture: 'https://picsum.photos/seed/creator/200/200',
              accessToken: encryptedMockToken,
              followersCount: 12450,
              followingCount: 380,
              mediaCount: 42,
              isConnected: true,
            },
            update: {
              userId,
              isConnected: true,
              deletedAt: null,
            },
          });
          return userId;
        }

        throw new BadRequestException(
          'No connected Instagram Business Accounts found on your Facebook Pages. Please ensure your IG Business Profile is linked to your FB Page.',
        );
      }

      return userId;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
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

  async getConversations(userId: string) {
    const accounts = await this.prisma.instagramAccount.findMany({
      where: { userId, isConnected: true, deletedAt: null },
      select: { id: true, username: true },
    });

    const accountIds = accounts.map((a) => a.id);
    if (accountIds.length === 0) return [];

    // Retrieve all messages for these accounts to determine threads
    const messages = await this.prisma.message.findMany({
      where: { instagramAccountId: { in: accountIds } },
      orderBy: { createdAt: 'desc' },
    });

    // Grouping manually in JS for thread representation
    const threadsMap = new Map<string, any>();
    for (const msg of messages) {
      if (!threadsMap.has(msg.recipientId)) {
        const account = accounts.find((a) => a.id === msg.instagramAccountId);
        threadsMap.set(msg.recipientId, {
          recipientId: msg.recipientId,
          lastMessage: msg.text || (msg.mediaUrl ? 'Attachment' : ''),
          updatedAt: msg.createdAt,
          instagramAccountId: msg.instagramAccountId,
          instagramAccountUsername: account?.username || 'unknown',
          unreadCount: 0,
        });
      }
    }

    return Array.from(threadsMap.values());
  }

  async getMessages(userId: string, recipientId: string) {
    const accounts = await this.prisma.instagramAccount.findMany({
      where: { userId, isConnected: true, deletedAt: null },
      select: { id: true },
    });
    const accountIds = accounts.map((a) => a.id);

    return this.prisma.message.findMany({
      where: {
        instagramAccountId: { in: accountIds },
        recipientId,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendManualMessage(
    userId: string,
    recipientId: string,
    instagramAccountId: string,
    text: string,
  ) {
    // 1. Verify ownership of account
    const account = await this.prisma.instagramAccount.findFirst({
      where: { id: instagramAccountId, userId, isConnected: true, deletedAt: null },
    });

    if (!account) {
      throw new NotFoundException('Instagram account not found or access denied');
    }

    // 2. Save outgoing message to DB
    const outgoingMsg = await this.prisma.message.create({
      data: {
        instagramAccountId,
        recipientId,
        senderId: account.instagramId,
        text,
        messageId: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        direction: 'OUTGOING',
        status: 'SENT',
      },
    });

    // 3. Enqueue sending the actual message to Meta using SendDmProducer
    await this.sendDmProducer.enqueueSendDm({
      campaignId: 'manual', // Demarcates manual response
      instagramAccountId,
      recipientId,
      recipientUsername: 'user',
      replyMessage: text,
    });

    return outgoingMsg;
  }

  async syncAccountStats(accountId: string): Promise<void> {
    try {
      const account = await this.prisma.instagramAccount.findUnique({
        where: { id: accountId },
      });
      if (!account || !account.isConnected) return;

      const accessToken = this.encryptionService.decrypt(account.accessToken);
      if (accessToken.startsWith('mock_')) return;

      const url = `https://graph.facebook.com/v20.0/${account.instagramId}`;
      const res = await axios.get(url, {
        params: {
          fields: 'followers_count,follows_count,media_count',
          access_token: accessToken,
        },
        timeout: 5000,
      });

      if (res.data) {
        await this.prisma.instagramAccount.update({
          where: { id: account.id },
          data: {
            followersCount: res.data.followers_count ?? account.followersCount,
            followingCount: res.data.follows_count ?? account.followingCount,
            mediaCount: res.data.media_count ?? account.mediaCount,
          },
        });
        this.logger.log(
          `Synced metrics for Instagram account ${account.username}: followers=${res.data.followers_count}`,
        );
      }
    } catch (e: any) {
      this.logger.warn(`Failed to sync Instagram account stats for ${accountId}: ${e.message}`);
    }
  }
}
