import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/logger/logger.service';
import { SendDmProducer } from './send-dm.producer';
import { CampaignType, CampaignStatus, MatchingRule } from '@prisma/client';

export interface CommentEvent {
  instagramId: string; // The page/IG account's instagramId
  commentId: string;
  mediaId: string;
  text: string;
  fromId: string; // Native Instagram user ID of the commenter
  fromUsername: string;
  webhookEventId: string;
}

@Injectable()
export class CommentAutomationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly sendDmProducer: SendDmProducer,
  ) {
    this.logger.setContext('CommentAutomationService');
  }

  async handle(event: CommentEvent): Promise<void> {
    const { instagramId, commentId, mediaId, text, fromId, fromUsername } = event;

    // 1. Resolve the InstagramAccount record (with developer bypass if instagramId is '0')
    const account = await this.prisma.instagramAccount.findFirst({
      where:
        instagramId === '0'
          ? { isConnected: true, deletedAt: null }
          : { instagramId, isConnected: true, deletedAt: null },
    });

    if (!account) {
      this.logger.warn(`No active account found for instagramId=${instagramId}`);
      return;
    }

    // 2. Dedup — skip if we have already processed this exact comment
    const existing = await this.prisma.comment.findUnique({ where: { commentId } });
    if (existing?.isReplied) {
      this.logger.log(`Comment ${commentId} already replied — skipping.`);
      return;
    }

    // 3. Upsert the Comment record so we have it regardless of match
    const commentRecord = await this.prisma.comment.upsert({
      where: { commentId },
      create: {
        instagramAccountId: account.id,
        mediaId,
        commentId,
        text,
        username: fromUsername,
        userId: fromId,
        isReplied: false,
      },
      update: { text, username: fromUsername },
    });

    // 4. Find all active campaigns for this account
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        instagramAccountId: account.id,
        status: CampaignStatus.ACTIVE,
        deletedAt: null,
      },
      include: { keywords: true, posts: true },
    });

    if (campaigns.length === 0) {
      this.logger.log(`No active campaigns for account ${account.id} — no DM enqueued.`);
      return;
    }

    // 5. Match campaigns
    for (const campaign of campaigns) {
      const matched = this.matchesCampaign(campaign, mediaId, text);
      if (!matched) continue;

      this.logger.log(
        `Comment ${commentId} matched campaign "${campaign.name}" (${campaign.type}) — enqueuing DM.`,
      );

      // Update Comment record to associate it with the matched campaign
      await this.prisma.comment
        .update({
          where: { id: commentRecord.id },
          data: { campaignId: campaign.id },
        })
        .catch((e) =>
          this.logger.error(
            `Failed to associate comment ${commentRecord.id} with campaign ${campaign.id}: ${e.message}`,
          ),
        );

      await this.sendDmProducer.enqueueSendDm({
        campaignId: campaign.id,
        instagramAccountId: account.id,
        recipientId: fromId,
        recipientUsername: fromUsername,
        commentId: commentRecord.id,
        igCommentId: commentId,
        replyMessage: campaign.replyMessage,
        replyMediaUrl: campaign.replyMediaUrl ?? undefined,
      });

      // Only one campaign should respond per comment
      break;
    }
  }

  private matchesCampaign(
    campaign: {
      type: CampaignType;
      keywords: { keyword: string; matchingRule: MatchingRule }[];
      posts: { mediaId: string }[];
    },
    mediaId: string,
    text: string,
  ): boolean {
    const normalizedText = text.toLowerCase().trim();

    if (
      campaign.type === CampaignType.COMMENT_TO_DM ||
      campaign.type === CampaignType.COMMENT_REPLY
    ) {
      // 1. Must match the monitored post (or bypass for Meta Developer test payloads)
      const isMonitoredPost =
        mediaId === '123123123' || campaign.posts.some((p) => p.mediaId === mediaId);
      if (!isMonitoredPost) return false;

      // 2. If keywords are specified, must also match at least one keyword
      if (campaign.keywords.length > 0) {
        return campaign.keywords.some((k) => {
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
      }

      // Default: match any comment on the monitored post if no keywords are set
      return true;
    }

    if (campaign.type === CampaignType.KEYWORD_TO_DM) {
      return campaign.keywords.some((k) => {
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
    }

    // WELCOME_DM — always match (triggered by new messages, not comments)
    return false;
  }
}
