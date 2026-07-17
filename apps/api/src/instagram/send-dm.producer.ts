import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '../queue/constants';

export interface SendDmPayload {
  campaignId: string;
  instagramAccountId: string;
  recipientId: string; // Native Instagram user ID
  recipientUsername: string;
  commentId?: string; // Internal DB Comment.id (optional)
  replyMessage: string;
  replyMediaUrl?: string;
}

@Injectable()
export class SendDmProducer {
  constructor(@InjectQueue(QUEUE_NAMES.SEND_DM) private readonly queue: Queue) {}

  async enqueueSendDm(payload: SendDmPayload) {
    await this.queue.add('send_dm', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 10_000 }, // 10s, 20s, 40s
      removeOnComplete: { count: 500 },
      removeOnFail: { count: 1000 },
    });
    return { queued: true };
  }
}
