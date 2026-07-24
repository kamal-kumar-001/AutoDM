import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Plan, SubscriptionStatus, BillingCycle } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

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
    const planConfig = await this.prisma.billingPlan.findUnique({
      where: { key: sub.plan },
    });

    return {
      subscription: sub,
      limits: planConfig
        ? {
            max_campaigns: planConfig.campaignLimit,
            max_keywords: planConfig.keywordLimit,
            max_dms_per_month: planConfig.dmLimitMonthly,
            max_accounts: sub.plan === 'FREE' ? 1 : sub.plan === 'PRO' ? 3 : -1,
          }
        : PLAN_LIMITS[sub.plan],
    };
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
  async getPlans() {
    const dbPlans = await this.prisma.billingPlan.findMany();
    if (dbPlans.length === 0) return PLAN_METADATA;

    return dbPlans.map((p) => ({
      plan: p.key,
      label: p.name,
      price: p.priceMonthly,
      currency: 'INR',
      description: p.description || '',
      highlight: p.key === 'PRO',
      features: [
        `${p.campaignLimit === -1 ? 'Unlimited' : p.campaignLimit} campaigns`,
        `${p.keywordLimit === -1 ? 'Unlimited' : p.keywordLimit} keywords`,
        `${p.dmLimitMonthly === -1 ? 'Unlimited' : p.dmLimitMonthly.toLocaleString()} DMs / month`,
        p.key === 'FREE'
          ? 'Basic analytics'
          : p.key === 'PRO'
            ? 'Advanced analytics'
            : 'Full analytics',
      ],
    }));
  }

  /**
   * Upgrade/downgrade a plan.
   * Real payment flow: call Razorpay, confirm webhook, THEN call this.
   */
  async changePlan(
    userId: string,
    plan: Plan,
    cycle: BillingCycle = BillingCycle.MONTHLY,
    paymentId?: string,
    paymentLinkId?: string,
    billingDetails?: any,
  ) {
    const daysToAdd = cycle === BillingCycle.YEARLY ? 365 : 30;
    const expiresAt = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

    const subscription = await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan,
        status: SubscriptionStatus.ACTIVE,
        cycle,
        expiresAt,
        cancelAtPeriodEnd: false,
        externalId: paymentLinkId || null,
        billingAddress: billingDetails || undefined,
      },
      update: {
        plan,
        status: SubscriptionStatus.ACTIVE,
        cycle,
        expiresAt,
        cancelAtPeriodEnd: false,
        externalId: paymentLinkId || null,
        billingAddress: billingDetails || undefined,
      },
    });

    if (plan !== Plan.FREE) {
      const planConfig = await this.prisma.billingPlan.findUnique({ where: { key: plan } });
      const basePrice =
        cycle === BillingCycle.YEARLY
          ? planConfig?.priceYearly || (plan === Plan.PRO ? 9990 : 49990)
          : planConfig?.priceMonthly || (plan === Plan.PRO ? 999 : 4999);
      const totalAmountWithTax = Math.round(basePrice * 1.18);

      await this.prisma.invoice.create({
        data: {
          userId,
          amount: totalAmountWithTax,
          currency: 'INR',
          plan,
          cycle,
          status: 'PAID',
          paymentId: paymentId || null,
          paymentLinkId: paymentLinkId || null,
          billingDetails: billingDetails || undefined,
        },
      });
    }

    return subscription;
  }

  async seedPlansDefaults(): Promise<void> {
    try {
      const plansData = [
        {
          key: Plan.FREE,
          name: 'Free Creator',
          description: 'Get started with basic automation.',
          priceMonthly: 0,
          priceYearly: 0,
          campaignLimit: 1,
          keywordLimit: 5,
          dmLimitMonthly: 100,
        },
        {
          key: Plan.PRO,
          name: 'Pro Creator',
          description: 'For serious creators scaling their reach.',
          priceMonthly: 999,
          priceYearly: 9990,
          campaignLimit: 10,
          keywordLimit: 50,
          dmLimitMonthly: 5000,
        },
        {
          key: Plan.ENTERPRISE,
          name: 'Enterprise Scale',
          description: 'Unlimited scale for agencies & brands.',
          priceMonthly: 4999,
          priceYearly: 49990,
          campaignLimit: -1,
          keywordLimit: -1,
          dmLimitMonthly: -1,
        },
      ];

      for (const p of plansData) {
        await this.prisma.billingPlan.upsert({
          where: { key: p.key },
          create: p,
          update: p,
        });
      }
    } catch (e) {
      console.warn(
        'SubscriptionService seedPlansDefaults skipped:',
        e instanceof Error ? e.message : e,
      );
    }
  }

  async seedPromoDefaults(): Promise<void> {
    try {
      const defaults = [
        {
          key: 'promo_banner_text',
          value: 'Special launch discount! 30% off for the first 100 creators! Use code: LAUNCH30',
        },
        { key: 'promo_banner_enabled', value: 'true' },
        { key: 'promo_discount_percent', value: '30' },
      ];

      for (const d of defaults) {
        await this.prisma.systemSetting.upsert({
          where: { key: d.key },
          create: d,
          update: {}, // Only create default if it does not exist, do not overwrite custom values
        });
      }
    } catch (e) {
      console.warn(
        'SubscriptionService seedPromoDefaults skipped:',
        e instanceof Error ? e.message : e,
      );
    }
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

  async createCheckoutSession(
    userId: string,
    plan: Plan,
    cycle: BillingCycle = BillingCycle.MONTHLY,
    billingDetails?: any,
  ) {
    // Normalize cycle string
    const normalizedCycle =
      String(cycle).toUpperCase() === 'YEARLY' ? BillingCycle.YEARLY : BillingCycle.MONTHLY;
    const normalizedPlan = String(plan).toUpperCase() === 'ENTERPRISE' ? Plan.ENTERPRISE : Plan.PRO;

    const razorpayKeyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const razorpayKeySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    // If Razorpay keys are missing or set to mock placeholders, simulate instant successful checkout for dev mode
    if (
      !razorpayKeyId ||
      !razorpayKeySecret ||
      razorpayKeyId.includes('mock') ||
      razorpayKeyId.includes('placeholder')
    ) {
      await this.changePlan(
        userId,
        normalizedPlan,
        normalizedCycle,
        'pay_mock_' + Date.now(),
        'plink_mock_' + Date.now(),
        billingDetails,
      );
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      return { url: `${frontendUrl}/settings?payment=success` };
    }

    try {
      const razorpay = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      });

      const planConfig = await this.prisma.billingPlan.findUnique({
        where: { key: normalizedPlan },
      });

      const basePrice =
        normalizedCycle === BillingCycle.YEARLY
          ? planConfig
            ? planConfig.priceYearly
            : normalizedPlan === Plan.PRO
              ? 9990
              : 49990
          : planConfig
            ? planConfig.priceMonthly
            : normalizedPlan === Plan.PRO
              ? 999
              : 4999;

      // Fetch promotions discount config
      const promoEnabledSetting = await this.prisma.systemSetting.findUnique({
        where: { key: 'promo_banner_enabled' },
      });
      const promoDiscountSetting = await this.prisma.systemSetting.findUnique({
        where: { key: 'promo_discount_percent' },
      });

      const isPromoEnabled = promoEnabledSetting?.value === 'true';
      const promoDiscountPercent = isPromoEnabled
        ? parseInt(promoDiscountSetting?.value || '0', 10)
        : 0;

      const discountedBasePrice = Math.round(basePrice * (1 - promoDiscountPercent / 100));
      const totalAmountPaise = Math.round(discountedBasePrice * 1.18 * 100);

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (billingDetails) {
        await this.prisma.subscription.upsert({
          where: { userId },
          create: { userId, plan: Plan.FREE, billingAddress: billingDetails },
          update: { billingAddress: billingDetails },
        });
      }

      const paymentLink = await razorpay.paymentLink.create({
        amount: totalAmountPaise,
        currency: 'INR',
        accept_partial: false,
        first_min_partial_amount: 0,
        description: `AutoDM ${normalizedPlan} Plan (${normalizedCycle}) - Grow your audience automatically.`,
        customer: {
          name: billingDetails?.name || user?.name || 'Creator',
          email: billingDetails?.email || user?.email || 'creator@autodm.com',
          contact: billingDetails?.phone || undefined,
        },
        notify: {
          sms: false,
          email: true,
        },
        reminder_enable: true,
        notes: {
          userId,
          plan: normalizedPlan,
          cycle: normalizedCycle,
          billingDetails: billingDetails ? JSON.stringify(billingDetails) : '',
        },
        callback_url: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/settings?payment=success`,
        callback_method: 'get',
      });

      return { url: paymentLink.short_url };
    } catch (error: any) {
      console.error('Razorpay payment link creation error:', error);
      // If live keys fail (e.g. invalid credentials or sandbox mode error), fallback gracefully or return clear error
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      if (process.env.NODE_ENV !== 'production') {
        await this.changePlan(
          userId,
          normalizedPlan,
          normalizedCycle,
          'pay_dev_fallback_' + Date.now(),
          'plink_dev_fallback_' + Date.now(),
          billingDetails,
        );
        return { url: `${frontendUrl}/settings?payment=success` };
      }
      throw new BadRequestException(
        error?.error?.description ||
          error?.message ||
          'Failed to initialize Razorpay checkout gateway.',
      );
    }
  }

  getInvoices(userId: string) {
    return this.prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvoiceReceipt(userId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async cancelSubscription(userId: string, body?: { reason?: string; feedback?: string }) {
    const reason = body?.reason || 'No reason provided';
    const feedback = body?.feedback || 'No comments';

    // Log to console for admin visibility
    console.log(
      `[Subscription Cancelled] User ${userId} cancelled. Reason: "${reason}", Feedback: "${feedback}"`,
    );

    // Create an audit log record
    await this.prisma.auditLog
      .create({
        data: {
          userId,
          action: 'SUBSCRIPTION_CANCELLATION_REQUESTED',
          details: `Reason: ${reason} | Feedback: ${feedback}`,
        },
      })
      .catch(() => null);

    // Create a warning notification for the user
    await this.prisma.notification
      .create({
        data: {
          userId,
          title: 'Auto-Renewal Cancelled ⚠️',
          message: `Your premium subscription auto-renewal was successfully cancelled. You will continue to have PRO access until the end of your billing cycle. Reason: "${reason}".`,
          type: 'WARNING',
        },
      })
      .catch(() => null);

    return this.prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: true,
        status: SubscriptionStatus.CANCELLED,
      },
    });
  }
}
