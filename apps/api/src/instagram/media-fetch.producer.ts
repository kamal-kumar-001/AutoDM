import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '../queue/constants';

/** Enqueues background jobs to fetch Instagram media for a given account. */
@Injectable()
export class MediaFetchProducer {
  constructor(@InjectQueue(QUEUE_NAMES.INSTAGRAM_MEDIA_FETCH) private readonly queue: Queue) {}

  /** Enqueue a fetch_media job with exponential back-off retries. */
  async enqueueFetch(instagramAccountId: string) {
    await this.queue.add(
      'fetch_media',
      { instagramAccountId },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 200 },
      },
    );
    return { queued: true };
  }
}
