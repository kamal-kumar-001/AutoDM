import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureFlagService } from '../billing/feature-flag.service';
import { MonitoringService } from '../monitoring/monitoring.service';
import { AuditLogService } from '../auth/audit-log.service';
import { UserRole, CampaignStatus, Plan } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly monitoringService: MonitoringService,
    private readonly auditLogService: AuditLogService,
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

  async getDeleteRequests(opts: { page: number; limit: number }) {
    const { page, limit } = opts;
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.prisma.deleteRequest.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              name: true,
              role: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.deleteRequest.count(),
    ]);

    return { data: requests, total, page, limit };
  }

  async approveDeleteRequests(ids: string[]) {
    const requests = await this.prisma.deleteRequest.findMany({
      where: { id: { in: ids } },
      select: { userId: true },
    });

    const userIds = requests.map((r) => r.userId);

    const deleteResult = await this.prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });

    await this.auditLogService.log({
      action: 'ADMIN_USER_BULK_DELETE_APPROVE',
      details: JSON.stringify({ count: deleteResult.count, userIds }),
    });

    return { count: deleteResult.count };
  }

  async rejectDeleteRequests(ids: string[]) {
    const result = await this.prisma.deleteRequest.deleteMany({
      where: { id: { in: ids } },
    });

    return { count: result.count };
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

  // ─── Billing Plans ───────────────────────────────────────────────
  getBillingPlans() {
    return this.prisma.billingPlan.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async updateBillingPlan(
    key: Plan,
    data: {
      name?: string;
      description?: string;
      priceMonthly?: number;
      priceYearly?: number;
      campaignLimit?: number;
      keywordLimit?: number;
      dmLimitMonthly?: number;
    },
  ) {
    const updated = await this.prisma.billingPlan.update({
      where: { key },
      data,
    });

    await this.auditLogService.log({
      action: 'ADMIN_PLAN_UPDATE',
      details: JSON.stringify({ key, data }),
    });

    return updated;
  }

  async getSaaSStats() {
    const [
      creatorsCount,
      campaignsCount,
      usageRecords,
      subscriptions,
      billingPlans,
      recentInvoices,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.CREATOR } }),
      this.prisma.campaign.count({ where: { deletedAt: null } }),
      this.prisma.usageRecord.findMany({
        where: { metric: 'max_dms' },
      }),
      this.prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.billingPlan.findMany(),
      this.prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    const totalDMsSent = usageRecords.reduce((acc, curr) => acc + curr.value, 0);

    const monthlyPriceMap = Object.fromEntries(billingPlans.map((p) => [p.key, p.priceMonthly]));
    const yearlyPriceMap = Object.fromEntries(billingPlans.map((p) => [p.key, p.priceYearly]));

    const tiersBreakdown = {
      FREE: 0,
      PRO: 0,
      ENTERPRISE: 0,
    };

    let calculatedMRR = 0;

    for (const sub of subscriptions) {
      const plan = sub.plan;
      const isYearly = sub.cycle === 'YEARLY';
      if (plan === Plan.PRO) {
        tiersBreakdown.PRO++;
        calculatedMRR += isYearly
          ? (yearlyPriceMap[Plan.PRO] ?? 9990) / 12
          : (monthlyPriceMap[Plan.PRO] ?? 999);
      } else if (plan === Plan.ENTERPRISE) {
        tiersBreakdown.ENTERPRISE++;
        calculatedMRR += isYearly
          ? (yearlyPriceMap[Plan.ENTERPRISE] ?? 49990) / 12
          : (monthlyPriceMap[Plan.ENTERPRISE] ?? 4999);
      } else {
        tiersBreakdown.FREE++;
      }
    }

    const activeSubscribers = subscriptions.length;

    const recentSignups = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        subscription: { select: { plan: true } },
      },
    });

    return {
      creatorsCount,
      campaignsCount,
      totalDMsSent,
      activeSubscribers,
      mrr: Math.round(calculatedMRR),
      arr: Math.round(calculatedMRR * 12),
      tiers: tiersBreakdown,
      recentSignups,
      recentInvoices,
    };
  }

  async getPromoSettings() {
    const settings = await this.prisma.systemSetting.findMany({
      where: {
        key: {
          in: ['promo_banner_text', 'promo_banner_enabled', 'promo_discount_percent'],
        },
      },
    });

    const settingsMap = settings.reduce(
      (acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    return {
      text: settingsMap['promo_banner_text'] || '',
      enabled: settingsMap['promo_banner_enabled'] === 'true',
      discountPercent: parseInt(settingsMap['promo_discount_percent'] || '0', 10),
    };
  }

  async updatePromoSettings(data: { text: string; enabled: boolean; discountPercent: number }) {
    await this.prisma.systemSetting.upsert({
      where: { key: 'promo_banner_text' },
      update: { value: data.text },
      create: { key: 'promo_banner_text', value: data.text },
    });

    await this.prisma.systemSetting.upsert({
      where: { key: 'promo_banner_enabled' },
      update: { value: String(data.enabled) },
      create: { key: 'promo_banner_enabled', value: String(data.enabled) },
    });

    await this.prisma.systemSetting.upsert({
      where: { key: 'promo_discount_percent' },
      update: { value: String(data.discountPercent) },
      create: { key: 'promo_discount_percent', value: String(data.discountPercent) },
    });

    return { success: true };
  }
}
