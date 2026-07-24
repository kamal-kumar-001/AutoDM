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
      igCommentId,
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

    // 1b. Load campaign details (if not manual)
    const campaign =
      campaignId !== 'manual'
        ? await this.prisma.campaign.findUnique({ where: { id: campaignId } })
        : null;

    // 2. Decrypt access token
    const accessToken = this.encryptionService.decrypt(account.accessToken);
    this.logger.log(
      `[Job ${job.id}] Decrypted token starts with: "${accessToken.substring(0, 10)}..." length=${accessToken.length}`,
    );

    // Resolve name from Meta Profile API to handle personalized templates ({name}, {username})
    let recipientName = recipientUsername;
    if (!accessToken.startsWith('mock_')) {
      try {
        const profileRes = await axios.get(
          `https://graph.facebook.com/v20.0/${targetRecipientId}`,
          {
            params: {
              fields: 'name',
              access_token: accessToken,
            },
            timeout: 5000,
          },
        );
        if (profileRes.data?.name) {
          recipientName = profileRes.data.name;
        }
      } catch (e: any) {
        this.logger.warn(
          `[Job ${job.id}] Failed to fetch profile name for recipient ${targetRecipientId}: ${e.message}`,
        );
      }
    }

    if (campaign?.type === 'COMMENT_REPLY') {
      this.logger.log(
        `[Job ${job.id}] COMMENT_REPLY type — skipping DM, posting public comment reply only.`,
      );

      if (commentId) {
        await this.prisma.comment.update({
          where: { id: commentId },
          data: {
            isReplied: true,
            replyText: `Public reply: ${campaign.commentReplyText?.slice(0, 50)}...`,
          },
        });
      }

      if (commentId && campaign.commentReplyText) {
        try {
          const triggeringComment = await this.prisma.comment.findUnique({
            where: { id: commentId },
          });

          if (triggeringComment?.commentId) {
            const commentReplyUrl = `https://graph.facebook.com/v20.0/${triggeringComment.commentId}/replies`;
            this.logger.log(`[Job ${job.id}] Posting public comment reply via: ${commentReplyUrl}`);

            const personalizedCommentReply = campaign.commentReplyText
              .replace(/{username}/g, recipientUsername)
              .replace(/{name}/g, recipientName);

            if (accessToken.startsWith('mock_')) {
              this.logger.log(`[Job ${job.id}] Sandbox mode — mocking public comment reply.`);
            } else {
              await axios.post(
                commentReplyUrl,
                { message: personalizedCommentReply },
                {
                  params: { access_token: accessToken },
                  timeout: 10000,
                },
              );
            }
            this.logger.log(`[Job ${job.id}] Successfully posted public comment reply.`);
          }
        } catch (replyError: any) {
          const metaError = replyError?.response?.data?.error?.message;
          this.logger.error(
            `[Job ${job.id}] Failed to post public comment reply: ${metaError || replyError.message}`,
          );
        }
      }
      return;
    }

    const personalizedMessage = replyMessage
      .replace(/{username}/g, recipientUsername)
      .replace(/{name}/g, recipientName);

    let messageId: string;
    let sendStatus: MessageStatus = MessageStatus.SENT;
    let errorMsg: string | null = null;

    // 3a. Sandbox mock path
    if (accessToken.startsWith('mock_')) {
      this.logger.log(`[Job ${job.id}] Sandbox mode — mocking Meta API send DM.`);
      messageId = `mock_msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    } else {
      // 3b. Live Meta Graph API call — Instagram Messaging API
      // Docs: https://developers.facebook.com/docs/instagram-messaging/send-messages
      try {
        // Facebook Page Access Tokens (starting with EAA) must send DMs via the Facebook Graph API messages endpoint
        const baseUrl = `https://graph.facebook.com/v20.0/me/messages`;

        // Determine recipient payload: Comment-to-DM (Private Reply) uses comment_id, standard DM uses recipient id
        const recipientPayload = igCommentId
          ? { comment_id: igCommentId }
          : { id: targetRecipientId };

        this.logger.log(
          `[Job ${job.id}] Sending DM via: ${baseUrl}. Recipient config: ${JSON.stringify(recipientPayload)}`,
        );

        const response = await axios.post<MetaSendMessageResponse>(
          baseUrl,
          {
            recipient: recipientPayload,
            message: { text: personalizedMessage },
          },
          {
            params: { access_token: accessToken },
            timeout: 10_000,
          },
        );
        messageId = response.data.message_id;
        this.logger.log(`[Job ${job.id}] Meta API success — message_id=${messageId}`);
      } catch (error: any) {
        // Log the full Meta API error response for debugging
        const metaError = error?.response?.data?.error;
        if (metaError) {
          this.logger.error(
            `[Job ${job.id}] Meta API Error: code=${metaError.code} subcode=${metaError.error_subcode} type=${metaError.type} message="${metaError.message}"`,
          );
        }
        const msg = metaError?.message || (error instanceof Error ? error.message : String(error));
        this.logger.error(`[Job ${job.id}] Meta API failed: ${msg}`);
        sendStatus = MessageStatus.FAILED;
        errorMsg = msg;

        // Persist the FAILED message status and mark the comment as processed in the database
        await this.prisma
          .$transaction(async (tx) => {
            await tx.message.create({
              data: {
                instagramAccountId: account.id,
                recipientId: targetRecipientId,
                senderId: account.instagramId,
                text: personalizedMessage,
                mediaUrl: replyMediaUrl ?? null,
                messageId: `failed_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                direction: MessageDirection.OUTGOING,
                status: MessageStatus.FAILED,
                errorMessage: errorMsg,
                campaignId: campaignId === 'manual' ? null : campaignId,
              },
            });

            if (commentId) {
              await tx.comment.update({
                where: { id: commentId },
                data: {
                  isReplied: true,
                  replyText: `Failed: ${errorMsg}`,
                },
              });
            }
          })
          .catch((dbErr) => {
            this.logger.error(
              `[Job ${job.id}] Failed to save failure state to DB: ${dbErr.message}`,
            );
          });

        // Determine if it is a temporary error (e.g. 5xx or network timeout/no response)
        const isTemporary = error.response ? error.response.status >= 500 : true;

        // Meta permission/authentication errors (code 200, 10, 190, 100) are permanent
        const isMetaPermissionError =
          metaError &&
          (metaError.code === 200 ||
            metaError.code === 10 ||
            metaError.code === 190 ||
            metaError.code === 100);

        if (isTemporary && !isMetaPermissionError) {
          // Re-throw so BullMQ will retry the job
          throw error;
        }

        // Otherwise return normally so the job completes successfully and isn't retried endlessly
        return;
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
          text: personalizedMessage,
          mediaUrl: replyMediaUrl ?? null,
          messageId,
          direction: MessageDirection.OUTGOING,
          status: sendStatus,
          errorMessage: errorMsg,
          campaignId: campaignId === 'manual' ? null : campaignId,
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

    // 5. Post public comment reply (outside DB transaction)
    if (
      sendStatus === MessageStatus.SENT &&
      commentId &&
      campaign?.commentReplyEnabled &&
      campaign.commentReplyText
    ) {
      try {
        const triggeringComment = await this.prisma.comment.findUnique({
          where: { id: commentId },
        });

        if (triggeringComment?.commentId) {
          const commentReplyUrl = `https://graph.facebook.com/v20.0/${triggeringComment.commentId}/replies`;
          this.logger.log(`[Job ${job.id}] Posting public comment reply via: ${commentReplyUrl}`);

          const personalizedCommentReply = campaign.commentReplyText
            .replace(/{username}/g, recipientUsername)
            .replace(/{name}/g, recipientName);

          await axios.post(
            commentReplyUrl,
            { message: personalizedCommentReply },
            {
              params: { access_token: accessToken },
              timeout: 10000,
            },
          );
          this.logger.log(`[Job ${job.id}] Successfully posted public comment reply.`);
        }
      } catch (replyError: any) {
        const metaError = replyError?.response?.data?.error?.message;
        this.logger.error(
          `[Job ${job.id}] Failed to post public comment reply: ${metaError || replyError.message}`,
        );
      }
    }
  }
}
