import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { SubscriptionService } from './subscription.service';
import { FeatureFlagService } from './feature-flag.service';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  /** GET /billing/subscription — current user's subscription */
  @Get('subscription')
  getSubscription(@GetUser() user: { id: string }) {
    return this.subscriptionService.getOrCreate(user.id);
  }

  /** GET /billing/plans — all available plans with metadata */
  @Get('plans')
  getPlans() {
    return this.subscriptionService.getPlans();
  }

  /** GET /billing/usage — current period usage vs limits */
  @Get('usage')
  getUsage(@GetUser() user: { id: string }) {
    return this.subscriptionService.getUsageSummary(user.id);
  }

  /** GET /billing/flags — feature flags visible to user's plan */
  @Get('flags')
  async getFlags(@GetUser() user: { id: string }) {
    const sub = await this.subscriptionService.getOrCreate(user.id);
    const allFlags = await this.featureFlagService.getAll();
    return allFlags.map((f) => ({
      key: f.key,
      description: f.description,
      enabled: f.isEnabled && f.enabledForPlans.split(',').includes(sub.plan),
    }));
  }
}
