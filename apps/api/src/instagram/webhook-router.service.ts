import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/logger/logger.service';
import { CommentAutomationService } from './comment-automation.service';

/**
 * Routes incoming Meta webhook payloads to the appropriate automation handler.
 * This is called asynchronously after the webhook event is saved to DB —
 * the HTTP 200 is already returned before this runs.
 */
@Injectable()
export class WebhookRouterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly commentAutomation: CommentAutomationService,
  ) {
    this.logger.setContext('WebhookRouterService');
  }

  async route(webhookEventId: string, payload: Record<string, any>): Promise<void> {
    try {
      const entries: any[] = payload?.entry ?? [];

      for (const entry of entries) {
        const instagramId: string = entry?.id;

        // --- Comment changes ---
        const changes: any[] = entry?.changes ?? [];
        for (const change of changes) {
          if (change?.field === 'comments') {
            await this.handleCommentChange(instagramId, change.value, webhookEventId);
          }
        }

        // --- Messaging (future) ---
        // const messaging: any[] = entry?.messaging ?? [];
      }

      await this.prisma.webhookEvent.update({
        where: { id: webhookEventId },
        data: { status: 'PROCESSED' },
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`WebhookRouter failed for event ${webhookEventId}: ${msg}`);
      await this.prisma.webhookEvent
        .update({
          where: { id: webhookEventId },
          data: { status: 'FAILED', errorMessage: msg },
        })
        .catch(() => null);
    }
  }

  private async handleCommentChange(
    instagramId: string,
    value: Record<string, any>,
    webhookEventId: string,
  ) {
    const commentId: string = value?.id;
    const mediaId: string = value?.media?.id;
    const text: string = value?.text ?? '';
    const fromId: string = value?.from?.id;
    const fromUsername: string = value?.from?.username ?? '';

    if (!commentId || !mediaId || !fromId) {
      this.logger.warn(
        `Skipping comment event — missing fields. commentId=${commentId} mediaId=${mediaId} fromId=${fromId}`,
      );
      return;
    }

    this.logger.log(
      `Routing comment event: commentId=${commentId} mediaId=${mediaId} from=${fromUsername}`,
    );

    await this.commentAutomation.handle({
      instagramId,
      commentId,
      mediaId,
      text,
      fromId,
      fromUsername,
      webhookEventId,
    });
  }
}
