import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import axios from 'axios';
import { QUEUE_NAMES } from '../queue/constants';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import { SendDmPayload } from './send-dm.producer';
import { MessageDirection, MessageStatus } from '@prisma/client';

interface MetaSendMessageResponse {
  recipient_id: string;
  message_id: string;
}

@Processor(QUEUE_NAMES.SEND_DM)
export class SendDmProcessor extends WorkerHost {
  private readonly logger = new Logger(SendDmProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
  }

  async process(job: Job<SendDmPayload>): Promise<void> {
    const {
      campaignId,
      instagramAccountId,
      recipientId,
      recipientUsername,
      commentId,
      replyMessage,
      replyMediaUrl,
    } = job.data;

    let targetRecipientId = recipientId;
    if (recipientId === '232323232' || recipientId === '12334') {
      targetRecipientId = '17841458228090598';
      this.logger.log(
        `[Developer Override] Overriding mock recipient ${recipientId} with test ID 17841458228090598`,
      );
    }

    this.logger.log(
      `[Job ${job.id}] Sending DM to @${recipientUsername} (${targetRecipientId}) for campaign ${campaignId}`,
    );

    // 1. Load account
    const account = await this.prisma.instagramAccount.findUnique({
      where: { id: instagramAccountId },
    });

    if (!account || !account.isConnected) {
      this.logger.warn(`Account ${instagramAccountId} not found or disconnected — aborting job.`);
      return;
    }

    // 2. Decrypt access token
    const accessToken = this.encryptionService.decrypt(account.accessToken);

    let messageId: string;
    let sendStatus: MessageStatus = MessageStatus.SENT;
    let errorMsg: string | null = null;

    // 3a. Sandbox mock path
    if (accessToken.startsWith('mock_')) {
      this.logger.log(`[Job ${job.id}] Sandbox mode — mocking Meta API send DM.`);
      messageId = `mock_msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    } else {
      // 3b. Live Meta Graph API call
      // Required scopes: instagram_manage_messages, pages_messaging
      try {
        const isInstagramToken = accessToken.startsWith('IG');
        const baseUrl = isInstagramToken
          ? 'https://graph.instagram.com/v25.0/me/messages'
          : 'https://graph.facebook.com/v20.0/me/messages';

        this.logger.log(`[Job ${job.id}] Sending DM via: ${baseUrl}`);

        const response = await axios.post<MetaSendMessageResponse>(
          baseUrl,
          {
            recipient: { id: targetRecipientId },
            message: { text: replyMessage },
          },
          {
            params: { access_token: accessToken },
            timeout: 10_000,
          },
        );
        messageId = response.data.message_id;
        this.logger.log(`[Job ${job.id}] Meta API success — message_id=${messageId}`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        this.logger.error(`[Job ${job.id}] Meta API failed: ${msg}`);
        sendStatus = MessageStatus.FAILED;
        errorMsg = msg;
        // Re-throw so BullMQ will retry the job
        throw error;
      }
    }

    // 4. Persist result in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Save outgoing Message record
      await tx.message.create({
        data: {
          instagramAccountId: account.id,
          recipientId: targetRecipientId,
          senderId: account.instagramId,
          text: replyMessage,
          mediaUrl: replyMediaUrl ?? null,
          messageId,
          direction: MessageDirection.OUTGOING,
          status: sendStatus,
          errorMessage: errorMsg,
        },
      });

      // Mark the triggering Comment as replied (only if commentId is present)
      if (commentId) {
        await tx.comment.update({
          where: { id: commentId },
          data: {
            isReplied: true,
            replyText: replyMessage,
          },
        });
      }
    });

    this.logger.log(
      `[Job ${job.id}] DM delivered to @${recipientUsername} — messageId=${messageId}`,
    );
  }
}
