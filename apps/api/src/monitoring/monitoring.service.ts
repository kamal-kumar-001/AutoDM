import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { totalmem } from 'os';
import { PrismaService } from '../prisma/prisma.service';
import { QUEUE_NAMES } from '../queue/constants';

export interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

export interface FailedJob {
  id: string;
  queue: string;
  name: string;
  data: unknown;
  failedReason: string;
  attemptsMade: number;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
}

export interface SystemMetrics {
  uptimeSeconds: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  memoryPercent: number;
  nodeVersion: string;
  pid: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  api: boolean;
  database: boolean;
  redis: boolean;
  checkedAt: string;
}

@Injectable()
export class MonitoringService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.INSTAGRAM_MEDIA_FETCH) private readonly mediaFetchQueue: Queue,
    @InjectQueue(QUEUE_NAMES.SEND_DM) private readonly sendDmQueue: Queue,
  ) {}

  // ──────────────── Health ────────────────

  async getHealth(): Promise<HealthStatus> {
    let database = false;
    let redis = false;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = true;
    } catch {
      database = false;
    }

    try {
      const client = (this.sendDmQueue as any).opts?.connection;
      // Ping via BullMQ's internal client
      await this.sendDmQueue.getJobCounts('waiting');
      redis = true;
    } catch {
      redis = false;
    }

    const allHealthy = database && redis;
    const anyDown = !database || !redis;

    return {
      api: true,
      database,
      redis,
      status: allHealthy ? 'healthy' : anyDown ? 'degraded' : 'down',
      checkedAt: new Date().toISOString(),
    };
  }

  // ──────────────── Queue Stats ────────────────

  async getQueueStats(): Promise<QueueStats[]> {
    const queues = [
      { queue: this.mediaFetchQueue, name: QUEUE_NAMES.INSTAGRAM_MEDIA_FETCH },
      { queue: this.sendDmQueue, name: QUEUE_NAMES.SEND_DM },
    ];

    return Promise.all(
      queues.map(async ({ queue, name }) => {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getCompletedCount(),
          queue.getFailedCount(),
          queue.getDelayedCount(),
        ]);
        const isPaused = await queue.isPaused();
        return { name, waiting, active, completed, failed, delayed, paused: isPaused };
      }),
    );
  }

  // ──────────────── Failed Jobs ────────────────

  async getFailedJobs(limit = 50): Promise<FailedJob[]> {
    const queues = [
      { queue: this.mediaFetchQueue, name: QUEUE_NAMES.INSTAGRAM_MEDIA_FETCH },
      { queue: this.sendDmQueue, name: QUEUE_NAMES.SEND_DM },
    ];

    const results: FailedJob[] = [];

    for (const { queue, name } of queues) {
      const jobs = await queue.getFailed(0, limit - 1);
      for (const job of jobs) {
        results.push({
          id: String(job.id),
          queue: name,
          name: job.name,
          data: job.data,
          failedReason: job.failedReason ?? 'Unknown error',
          attemptsMade: job.attemptsMade,
          timestamp: job.timestamp,
          processedOn: job.processedOn ?? undefined,
          finishedOn: job.finishedOn ?? undefined,
        });
      }
    }

    return results.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  async retryFailedJob(queueName: string, jobId: string): Promise<{ retried: boolean }> {
    const queueMap: Record<string, Queue> = {
      [QUEUE_NAMES.INSTAGRAM_MEDIA_FETCH]: this.mediaFetchQueue,
      [QUEUE_NAMES.SEND_DM]: this.sendDmQueue,
    };

    const queue = queueMap[queueName];
    if (!queue) return { retried: false };

    const job = await queue.getJob(jobId);
    if (!job) return { retried: false };

    await job.retry();
    return { retried: true };
  }

  // ──────────────── Webhook Logs ────────────────

  async getWebhookLogs(page = 1, limit = 30) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.webhookEvent.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          eventId: true,
          provider: true,
          status: true,
          errorMessage: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.webhookEvent.count(),
    ]);
    return { logs, total, page, limit };
  }

  // ──────────────── System Metrics ────────────────

  getSystemMetrics(): SystemMetrics {
    const mem = process.memoryUsage();
    const totalMem = totalmem();
    const usedMB = Math.round(mem.rss / 1024 / 1024);
    const totalMB = Math.round(totalMem / 1024 / 1024);

    return {
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsedMB: usedMB,
      memoryTotalMB: totalMB,
      memoryPercent: Math.round((usedMB / totalMB) * 100),
      nodeVersion: process.version,
      pid: process.pid,
    };
  }
}
