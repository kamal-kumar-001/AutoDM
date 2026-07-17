import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureFlagService } from '../billing/feature-flag.service';
import { MonitoringService } from '../monitoring/monitoring.service';
import { UserRole, CampaignStatus, Plan } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly monitoringService: MonitoringService,
  ) {}

  // ─── Creators ────────────────────────────────────────────────────
  async getCreators(opts: { page: number; limit: number; search?: string; suspended?: boolean }) {
    const { page, limit, search } = opts;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          createdAt: true,
          subscription: { select: { plan: true, status: true } },
          _count: {
            select: {
              campaigns: true,
              instagramAccounts: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, total, page, limit };
  }

  async suspendUser(userId: string) {
    // Soft-suspension: set role to CREATOR (no effect) or use a dedicated field
    // For now archive all active campaigns and mark as suspended via AuditLog
    await this.prisma.campaign.updateMany({
      where: { userId, status: CampaignStatus.ACTIVE },
      data: { status: CampaignStatus.PAUSED },
    });
    await this.prisma.auditLog.create({
      data: { userId, action: 'ADMIN_SUSPEND', details: `User ${userId} suspended by admin` },
    });
    return { suspended: true, userId };
  }

  async unsuspendUser(userId: string) {
    await this.prisma.auditLog.create({
      data: { userId, action: 'ADMIN_UNSUSPEND', details: `User ${userId} unsuspended by admin` },
    });
    return { unsuspended: true, userId };
  }

  async changePlan(userId: string, plan: Plan) {
    await this.prisma.subscription.upsert({
      where: { userId },
      create: { userId, plan, status: 'ACTIVE' },
      update: { plan, status: 'ACTIVE' },
    });
    await this.prisma.auditLog.create({
      data: { userId, action: 'ADMIN_PLAN_CHANGE', details: `Plan changed to ${plan}` },
    });
    return { userId, plan };
  }

  // ─── Campaigns ───────────────────────────────────────────────────
  async getCampaigns(opts: {
    page: number;
    limit: number;
    search?: string;
    status?: CampaignStatus;
  }) {
    const { page, limit, search, status } = opts;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, name: true } },
          instagramAccount: { select: { username: true } },
          _count: { select: { keywords: true, posts: true } },
        },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return { data: campaigns, total, page, limit };
  }

  // ─── Audit Logs ──────────────────────────────────────────────────
  async getAuditLogs(opts: { page: number; limit: number; userId?: string; action?: string }) {
    const { page, limit, userId, action } = opts;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action, mode: 'insensitive' };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, name: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data: logs, total, page, limit };
  }

  async deleteAuditLogs(olderThan: string) {
    const date = new Date(olderThan);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: date,
        },
      },
    });

    return { count: result.count };
  }

  async getAllAuditLogs(opts: { userId?: string; action?: string }) {
    const { userId, action } = opts;
    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action, mode: 'insensitive' };

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, name: true } } },
    });
  }

  // ─── Feature Flags ───────────────────────────────────────────────
  getFeatureFlags() {
    return this.featureFlagService.getAll();
  }

  toggleFeatureFlag(key: string, isEnabled: boolean) {
    return this.featureFlagService.toggle(key, isEnabled);
  }

  updateFlagPlans(key: string, plans: Plan[]) {
    return this.featureFlagService.updatePlans(key, plans);
  }

  // ─── Queue / Jobs ────────────────────────────────────────────────
  getQueueStats() {
    return this.monitoringService.getQueueStats();
  }

  getFailedJobs(limit = 50) {
    return this.monitoringService.getFailedJobs(limit);
  }

  retryJob(queue: string, jobId: string) {
    return this.monitoringService.retryFailedJob(queue, jobId);
  }

  // ─── System Health ───────────────────────────────────────────────
  getSystemHealth() {
    return this.monitoringService.getHealth();
  }

  getSystemMetrics() {
    return this.monitoringService.getSystemMetrics();
  }
}
