import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Plan } from '@prisma/client';

// Default feature flags seeded at startup
const DEFAULT_FLAGS: Array<{ key: string; description: string; enabledForPlans: string }> = [
  {
    key: 'COMMENT_TO_DM',
    description: 'Comment-triggered DM automation',
    enabledForPlans: 'FREE,PRO,ENTERPRISE',
  },
  {
    key: 'KEYWORD_TO_DM',
    description: 'Keyword-triggered DM automation',
    enabledForPlans: 'FREE,PRO,ENTERPRISE',
  },
  { key: 'WELCOME_DM', description: 'New follower welcome DM', enabledForPlans: 'PRO,ENTERPRISE' },
  {
    key: 'ANALYTICS_ADVANCED',
    description: 'Advanced analytics dashboard',
    enabledForPlans: 'PRO,ENTERPRISE',
  },
  {
    key: 'MULTI_ACCOUNT',
    description: 'Connect multiple Instagram accounts',
    enabledForPlans: 'PRO,ENTERPRISE',
  },
  {
    key: 'WEBHOOK_LOGS',
    description: 'Access webhook event logs',
    enabledForPlans: 'PRO,ENTERPRISE',
  },
  {
    key: 'EXPORT_DATA',
    description: 'Export analytics and message history',
    enabledForPlans: 'ENTERPRISE',
  },
  { key: 'API_ACCESS', description: 'Direct REST API access', enabledForPlans: 'ENTERPRISE' },
  {
    key: 'audit_logging',
    description: 'System-wide audit logging tracker',
    enabledForPlans: 'FREE,PRO,ENTERPRISE',
  },
  {
    key: 'EMAIL_VERIFICATION_REQUIRED',
    description: 'Enforce email verification for campaign automation and account link actions',
    enabledForPlans: 'FREE,PRO,ENTERPRISE',
  },
];

@Injectable()
export class FeatureFlagService {
  constructor(private readonly prisma: PrismaService) {}

  /** Seed default flags (call on module init). */
  async seedDefaults() {
    try {
      for (const flag of DEFAULT_FLAGS) {
        await this.prisma.featureFlag.upsert({
          where: { key: flag.key },
          create: flag,
          update: {},
        });
      }
    } catch (e) {
      console.warn('FeatureFlagService seedDefaults skipped:', e instanceof Error ? e.message : e);
    }
  }

  /** Get all feature flags (admin view). */
  async getAll() {
    return this.prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  /** Check if a feature is enabled for a given plan. */
  async isEnabled(key: string, plan: Plan): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({ where: { key } });
    if (!flag || !flag.isEnabled) return false;
    return flag.enabledForPlans.split(',').includes(plan);
  }

  /** Toggle global kill-switch for a flag (admin). */
  async toggle(key: string, isEnabled: boolean) {
    return this.prisma.featureFlag.update({ where: { key }, data: { isEnabled } });
  }

  /** Update which plans have access to a flag (admin). */
  async updatePlans(key: string, plans: Plan[]) {
    return this.prisma.featureFlag.update({
      where: { key },
      data: { enabledForPlans: plans.join(',') },
    });
  }
}
