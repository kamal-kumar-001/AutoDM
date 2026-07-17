import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '../config/config.service';

/**
 * QueueModule configures the global BullMQ connection to Redis.
 * Each feature module (e.g. InstagramModule) registers its own named queues
 * via BullModule.registerQueue() and declares its own producers / processors.
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get('REDIS_URL') || 'redis://localhost:6379';
        return {
          connection: {
            lazyConnect: true,
            maxRetriesPerRequest: null,
            // ioredis accepts a URL string directly
            ...(redisUrl.startsWith('redis') ? { url: redisUrl } : {}),
          },
        };
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
