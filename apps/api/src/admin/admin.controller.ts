import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, CampaignStatus, Plan } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Creators ────────────────────────────────────────────────────

  @Get('creators')
  getCreators(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getCreators({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    });
  }

  @Post('creators/:id/suspend')
  @HttpCode(HttpStatus.OK)
  suspend(@Param('id') id: string) {
    return this.adminService.suspendUser(id);
  }

  @Post('creators/:id/unsuspend')
  @HttpCode(HttpStatus.OK)
  unsuspend(@Param('id') id: string) {
    return this.adminService.unsuspendUser(id);
  }

  @Patch('creators/:id/plan')
  changePlan(@Param('id') id: string, @Body('plan') plan: Plan) {
    return this.adminService.changePlan(id, plan);
  }

  // ─── Campaigns ───────────────────────────────────────────────────

  @Get('campaigns')
  getCampaigns(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: CampaignStatus,
  ) {
    return this.adminService.getCampaigns({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
      status,
    });
  }

  // ─── Audit Logs ──────────────────────────────────────────────────

  @Get('logs')
  getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
  ) {
    return this.adminService.getAuditLogs({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 30,
      userId,
      action,
    });
  }

  // ─── Feature Flags ───────────────────────────────────────────────

  @Get('flags')
  getFlags() {
    return this.adminService.getFeatureFlags();
  }

  @Patch('flags/:key/toggle')
  toggleFlag(@Param('key') key: string, @Body('isEnabled') isEnabled: boolean) {
    return this.adminService.toggleFeatureFlag(key, isEnabled);
  }

  @Patch('flags/:key/plans')
  updateFlagPlans(@Param('key') key: string, @Body('plans') plans: Plan[]) {
    return this.adminService.updateFlagPlans(key, plans);
  }

  // ─── Queue ───────────────────────────────────────────────────────

  @Get('queues')
  getQueues() {
    return this.adminService.getQueueStats();
  }

  @Get('failed-jobs')
  getFailedJobs(@Query('limit') limit?: string) {
    return this.adminService.getFailedJobs(limit ? parseInt(limit, 10) : 50);
  }

  @Post('failed-jobs/:queue/:jobId/retry')
  @HttpCode(HttpStatus.OK)
  retryJob(@Param('queue') queue: string, @Param('jobId') jobId: string) {
    return this.adminService.retryJob(queue, jobId);
  }

  // ─── System Health ───────────────────────────────────────────────

  @Get('health')
  getHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('metrics')
  getMetrics() {
    return this.adminService.getSystemMetrics();
  }
}
