import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/logger/logger.service';
import { SendDmProducer } from './send-dm.producer';
import {
  CampaignType,
  CampaignStatus,
  MatchingRule,
  MessageDirection,
  MessageStatus,
} from '@prisma/client';

export interface MessageEvent {
  instagramId: string; // The page ID
  messageId: string; // mid
  text: string;
  fromId: string; // Recipient/Sender ID
  fromUsername?: string;
  webhookEventId: string;
}

@Injectable()
export class MessageAutomationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly sendDmProducer: SendDmProducer,
  ) {
    this.logger.setContext('MessageAutomationService');
  }

  async handle(event: MessageEvent): Promise<void> {
    const { instagramId, messageId, text, fromId, fromUsername } = event;

    // 1. Resolve the InstagramAccount record (match by instagramId or page id, with developer bypass if instagramId is '0' or '23245')
    const account = await this.prisma.instagramAccount.findFirst({
      where:
        instagramId === '0' || instagramId === '23245'
          ? { isConnected: true, deletedAt: null }
          : {
              OR: [{ instagramId }, { instagramPageId: instagramId }],
              isConnected: true,
              deletedAt: null,
            },
    });

    if (!account) {
      this.logger.warn(`No active InstagramAccount found for ID=${instagramId}`);
      return;
    }

    // 2. Dedup incoming message
    const existing = await this.prisma.message.findUnique({
      where: { messageId },
    });
    if (existing) {
      this.logger.log(`Message ${messageId} already saved — skipping duplicate.`);
      return;
    }

    // 3. Save incoming message to DB
    const savedMessage = await this.prisma.message.create({
      data: {
        instagramAccountId: account.id,
        recipientId: fromId,
        senderId: instagramId,
        text,
        messageId,
        direction: MessageDirection.INCOMING,
        status: MessageStatus.SENT,
      },
    });

    this.logger.log(`Received incoming message from @${fromUsername || fromId}: "${text}"`);

    // 4. Fetch ACTIVE campaigns for this account that handle messaging
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        instagramAccountId: account.id,
        status: CampaignStatus.ACTIVE,
        type: { in: [CampaignType.KEYWORD_TO_DM, CampaignType.WELCOME_DM] },
        deletedAt: null,
      },
      include: { keywords: true },
    });

    if (campaigns.length === 0) {
      this.logger.log(`No active messaging campaigns for account ${account.id}.`);
      return;
    }

    const normalizedText = text.toLowerCase().trim();

    for (const campaign of campaigns) {
      let matched = false;

      if (campaign.type === CampaignType.KEYWORD_TO_DM) {
        matched = campaign.keywords.some((k) => {
          const kw = k.keyword.toLowerCase().trim();
          if (k.matchingRule === MatchingRule.EXACT) {
            return normalizedText === kw;
          }
          if (k.matchingRule === MatchingRule.CONTAINS) {
            return normalizedText.includes(kw);
          }
          if (k.matchingRule === MatchingRule.STARTS_WITH) {
            return normalizedText.startsWith(kw);
          }
          return false;
        });
      } else if (campaign.type === CampaignType.WELCOME_DM) {
        // Welcome DM triggers if this is the first incoming message from this user
        const messageCount = await this.prisma.message.count({
          where: {
            instagramAccountId: account.id,
            recipientId: fromId,
          },
        });
        // count === 1 means the only message is the one we just saved above!
        if (messageCount === 1) {
          matched = true;
        }
      }

      if (matched) {
        this.logger.log(
          `Message ${messageId} matched campaign "${campaign.name}" (${campaign.type}) — enqueuing reply.`,
        );

        await this.sendDmProducer.enqueueSendDm({
          campaignId: campaign.id,
          instagramAccountId: account.id,
          recipientId: fromId,
          recipientUsername: fromUsername || 'user',
          replyMessage: campaign.replyMessage,
          replyMediaUrl: campaign.replyMediaUrl ?? undefined,
        });

        // Only reply with one campaign per trigger
        break;
      }
    }
  }
}
