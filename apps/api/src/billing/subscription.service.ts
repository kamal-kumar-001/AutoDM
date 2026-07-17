import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Plan, SubscriptionStatus } from '@prisma/client';

// ─── Plan limits ─────────────────────────────────────────────────────────────
// Easy to adjust — will be checked by UsageLimitGuard
export const PLAN_LIMITS: Record<Plan, Record<string, number>> = {
  FREE: {
    max_campaigns: 1,
    max_accounts: 1,
    max_dms_per_month: 100,
    max_keywords: 5,
  },
  PRO: {
    max_campaigns: 10,
    max_accounts: 3,
    max_dms_per_month: 5_000,
    max_keywords: 50,
  },
  ENTERPRISE: {
    max_campaigns: -1, // -1 = unlimited
    max_accounts: -1,
    max_dms_per_month: -1,
    max_keywords: -1,
  },
};

// ─── Plan metadata (used for plan picker UI) ──────────────────────────────────
export const PLAN_METADATA = [
  {
    plan: Plan.FREE,
    label: 'Free',
    price: 0,
    currency: 'INR',
    description: 'Get started with basic automation.',
    highlight: false,
    features: [
      '1 Instagram account',
      '1 campaign',
      '100 DMs / month',
      '5 keywords',
      'Basic analytics',
    ],
  },
  {
    plan: Plan.PRO,
    label: 'Pro',
    price: 999,
    currency: 'INR',
    description: 'For serious creators scaling their reach.',
    highlight: true,
    features: [
      '3 Instagram accounts',
      '10 campaigns',
      '5,000 DMs / month',
      '50 keywords',
      'Advanced analytics',
      'Priority support',
    ],
  },
  {
    plan: Plan.ENTERPRISE,
    label: 'Enterprise',
    price: -1, // contact sales
    currency: 'INR',
    description: 'Unlimited scale for agencies & brands.',
    highlight: false,
    features: [
      'Unlimited accounts',
      'Unlimited campaigns',
      'Unlimited DMs',
      'Unlimited keywords',
      'Full analytics',
      'Dedicated support',
      'SLA guarantee',
    ],
  },
];

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  /** Get or auto-create a FREE subscription for a user. */
  async getOrCreate(userId: string) {
    const existing = await this.prisma.subscription.findUnique({ where: { userId } });
    if (existing) return existing;

    return this.prisma.subscription.create({
      data: {
        userId,
        plan: Plan.FREE,
        status: SubscriptionStatus.TRIAL,
        trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
      },
    });
  }

  /** Return plan limits for a user's current plan. */
  async getLimits(userId: string) {
    const sub = await this.getOrCreate(userId);
    return { subscription: sub, limits: PLAN_LIMITS[sub.plan] };
  }

  /** Check whether a user is within a specific usage limit. */
  async checkLimit(
    userId: string,
    metric: string,
  ): Promise<{ allowed: boolean; used: number; limit: number }> {
    const { subscription, limits } = await this.getLimits(userId);
    const limit = limits[metric] ?? -1;
    if (limit === -1) return { allowed: true, used: 0, limit: -1 };

    const period = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const record = await this.prisma.usageRecord.findUnique({
      where: { userId_metric_period: { userId, metric, period } },
    });
    const used = record?.value ?? 0;
    return { allowed: used < limit, used, limit };
  }

  /** Increment a usage metric for the current billing period. */
  async incrementUsage(userId: string, metric: string, by = 1) {
    const period = new Date().toISOString().slice(0, 7);
    await this.prisma.usageRecord.upsert({
      where: { userId_metric_period: { userId, metric, period } },
      create: { userId, metric, period, value: by },
      update: { value: { increment: by } },
    });
  }

  /** Get all plans with metadata. */
  getPlans() {
    return PLAN_METADATA;
  }

  /**
   * Upgrade/downgrade a plan.
   * Real payment flow: call Razorpay, confirm webhook, THEN call this.
   */
  async changePlan(userId: string, plan: Plan) {
    return this.prisma.subscription.update({
      where: { userId },
      data: {
        plan,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  /** Get usage summary for current period. */
  async getUsageSummary(userId: string) {
    const period = new Date().toISOString().slice(0, 7);
    const { subscription, limits } = await this.getLimits(userId);

    const records = await this.prisma.usageRecord.findMany({ where: { userId, period } });
    const usageMap = Object.fromEntries(records.map((r) => [r.metric, r.value]));

    return {
      plan: subscription.plan,
      status: subscription.status,
      period,
      usage: Object.entries(limits).map(([metric, limit]) => ({
        metric,
        used: usageMap[metric] ?? 0,
        limit,
        unlimited: limit === -1,
        percent:
          limit === -1 ? 0 : Math.min(100, Math.round(((usageMap[metric] ?? 0) / limit) * 100)),
      })),
    };
  }
}
