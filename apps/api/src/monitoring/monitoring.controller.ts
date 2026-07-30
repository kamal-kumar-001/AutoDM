import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('monitoring')
@UseGuards(JwtAuthGuard)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  /** GET /monitoring/health — API, DB, Redis liveness */
  @Get('health')
  getHealth() {
    return this.monitoringService.getHealth();
  }

  /** GET /monitoring/queues — BullMQ queue stats */
  @Get('queues')
  getQueueStats() {
    return this.monitoringService.getQueueStats();
  }

  /** GET /monitoring/failed-jobs — list failed jobs across all queues */
  @Get('failed-jobs')
  getFailedJobs(@Query('limit') limit?: string) {
    return this.monitoringService.getFailedJobs(limit ? parseInt(limit, 10) : 50);
  }

  /** POST /monitoring/failed-jobs/:queue/:jobId/retry — retry a specific failed job */
  @Post('failed-jobs/:queue/:jobId/retry')
  @HttpCode(HttpStatus.OK)
  retryJob(@Param('queue') queue: string, @Param('jobId') jobId: string) {
    return this.monitoringService.retryFailedJob(queue, jobId);
  }

  /** GET /monitoring/webhook-logs — paginated webhook event history */
  @Get('webhook-logs')
  getWebhookLogs(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.monitoringService.getWebhookLogs(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 30,
    );
  }

  /** GET /monitoring/metrics — Node.js process / system metrics */
  @Get('metrics')
  getMetrics() {
    return this.monitoringService.getSystemMetrics();
  }

  /** GET /monitoring/webhook-status — check if webhook routing is paused */
  @Get('webhook-status')
  getWebhookStatus() {
    return this.monitoringService.getWebhookStatus();
  }

  /** POST /monitoring/webhook-status — pause/resume webhook processing */
  @Post('webhook-status')
  @HttpCode(HttpStatus.OK)
  updateWebhookStatus(@Body() body: { paused: boolean }) {
    return this.monitoringService.updateWebhookStatus(body.paused);
  }

  /** DELETE /monitoring/webhook-logs — purge webhook logs with timeframe filter */
  @Delete('webhook-logs')
  purgeWebhookLogs(@Query('olderThan') olderThan?: string) {
    return this.monitoringService.purgeWebhookLogs(olderThan);
  }
}
