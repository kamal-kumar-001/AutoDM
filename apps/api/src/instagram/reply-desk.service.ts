import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendDmProducer } from './send-dm.producer';
import { AuditLogService } from '../auth/audit-log.service';

export interface BuyerQueryItem {
  id: string;
  commentId: string;
  mediaId: string;
  text: string;
  username: string;
  userId: string;
  category: 'PRICE' | 'SHIPPING' | 'AVAILABILITY' | 'GENERAL';
  intentScore: number;
  suggestedReply: string;
  isReplied: boolean;
  createdAt: Date;
  account: {
    id: string;
    username: string;
  };
}

@Injectable()
export class ReplyDeskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sendDmProducer: SendDmProducer,
    private readonly auditLogService: AuditLogService,
  ) {}

  /** Classify text into buyer intent category & suggested reply */
  private classifyIntent(text: string): {
    category: 'PRICE' | 'SHIPPING' | 'AVAILABILITY' | 'GENERAL';
    intentScore: number;
    suggestedReply: string;
  } {
    const lower = text.toLowerCase().trim();

    if (
      lower.includes('price') ||
      lower.includes('rate') ||
      lower.includes('cost') ||
      lower.includes('kitne ka') ||
      lower.includes('dam') ||
      lower.includes('how much') ||
      lower.includes('ticket price')
    ) {
      return {
        category: 'PRICE',
        intentScore: 95,
        suggestedReply:
          'Hey! Thanks for asking. Sending you the complete pricing details in DM now! 📩',
      };
    }

    if (
      lower.includes('ship') ||
      lower.includes('delivery') ||
      lower.includes('mumbai') ||
      lower.includes('delhi') ||
      lower.includes('bangalore') ||
      lower.includes('pincode')
    ) {
      return {
        category: 'SHIPPING',
        intentScore: 88,
        suggestedReply:
          'Hi! We ship pan-India with cash-on-delivery. Check your DM for shipping timelines! 🚀',
      };
    }

    if (
      lower.includes('available') ||
      lower.includes('stock') ||
      lower.includes('size') ||
      lower.includes('color') ||
      lower.includes('m hai kya')
    ) {
      return {
        category: 'AVAILABILITY',
        intentScore: 90,
        suggestedReply:
          'Hey! Yes, this item is currently in stock. Check your DM for size options! ✨',
      };
    }

    return {
      category: 'GENERAL',
      intentScore: 80,
      suggestedReply: 'Hey! Thanks for reaching out. Sent you all the details in DM! 🌟',
    };
  }

  /** Get all high-intent buyer queries for a creator's connected accounts */
  async getBuyerQueries(userId: string): Promise<BuyerQueryItem[]> {
    const accounts = await this.prisma.instagramAccount.findMany({
      where: { userId, isConnected: true, deletedAt: null },
      select: { id: true, username: true },
    });

    if (accounts.length === 0) return [];

    const accountIds = accounts.map((a) => a.id);
    const accountMap = Object.fromEntries(accounts.map((a) => [a.id, a]));

    // Fetch user's active campaign trigger keywords to separate simple automated triggers
    const activeKeywords = await this.prisma.keyword.findMany({
      where: {
        campaign: { userId, status: 'ACTIVE', deletedAt: null },
      },
      select: { keyword: true },
    });

    const activeKeywordsSet = new Set(activeKeywords.map((k) => k.keyword.toLowerCase().trim()));

    // Fetch recent comments from connected accounts
    const comments = await this.prisma.comment.findMany({
      where: {
        instagramAccountId: { in: accountIds },
      },
      orderBy: { createdAt: 'desc' },
      take: 60,
    });

    // Intelligently separate simple campaign triggers ("ebook", "ticket") from genuine buyer queries
    return comments
      .filter((c) => {
        const textClean = c.text.toLowerCase().trim();
        const words = textClean.split(/\s+/);

        // 1. Exclude simple single-word or two-word exact campaign keyword triggers (e.g. "ebook", "ticket", "link")
        // which are already handled automatically by automated DM campaigns.
        if (words.length <= 2 && activeKeywordsSet.has(textClean) && !c.text.includes('?')) {
          return false;
        }

        // 2. Include genuine buyer inquiries:
        // - Comments containing question marks (?)
        // - Comments containing high-intent buyer words (price, shipping, availability, cost, etc.)
        // - Conversational inquiries that extend beyond simple keyword triggers
        const hasQuestionMark = c.text.includes('?');
        const hasBuyerKeyword =
          textClean.includes('price') ||
          textClean.includes('rate') ||
          textClean.includes('cost') ||
          textClean.includes('kitne') ||
          textClean.includes('dam') ||
          textClean.includes('ship') ||
          textClean.includes('delivery') ||
          textClean.includes('availab') ||
          textClean.includes('stock') ||
          textClean.includes('size') ||
          textClean.includes('how much') ||
          textClean.includes('where') ||
          textClean.includes('location') ||
          textClean.includes('timing');

        return (
          hasQuestionMark ||
          hasBuyerKeyword ||
          (words.length > 3 && !activeKeywordsSet.has(textClean))
        );
      })
      .map((c) => {
        const intent = this.classifyIntent(c.text);
        return {
          id: c.id,
          commentId: c.commentId,
          mediaId: c.mediaId,
          text: c.text,
          username: c.username,
          userId: c.userId,
          category: intent.category,
          intentScore: intent.intentScore,
          suggestedReply: intent.suggestedReply,
          isReplied: c.isReplied,
          createdAt: c.createdAt,
          account: accountMap[c.instagramAccountId] || {
            id: c.instagramAccountId,
            username: 'creator',
          },
        };
      });
  }

  /** Dispatch 1-click buyer reply from Reply Desk UI */
  async replyToBuyer(
    userId: string,
    commentDbId: string,
    replyText: string,
  ): Promise<{ success: boolean }> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentDbId },
      include: { instagramAccount: true },
    });

    if (!comment || comment.instagramAccount.userId !== userId) {
      throw new NotFoundException('Comment not found or access denied');
    }

    // Enqueue direct DM reply via SendDmProducer
    await this.sendDmProducer.enqueueSendDm({
      campaignId: 'manual',
      instagramAccountId: comment.instagramAccountId,
      recipientId: comment.userId,
      recipientUsername: comment.username,
      commentId: comment.id,
      igCommentId: comment.commentId,
      replyMessage: replyText,
    });

    // Mark comment as replied in DB
    await this.prisma.comment.update({
      where: { id: commentDbId },
      data: { isReplied: true, replyText },
    });

    await this.auditLogService.log({
      userId,
      action: 'REPLY_DESK_DISPATCH',
      details: JSON.stringify({ commentId: comment.id, username: comment.username }),
    });

    return { success: true };
  }
}
