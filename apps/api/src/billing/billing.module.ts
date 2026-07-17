import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { SubscriptionService } from './subscription.service';
import { FeatureFlagService } from './feature-flag.service';
import { UsageLimitGuard } from './usage-limit.guard';
import { PlanGuard } from './plan.guard';

@Module({
  controllers: [BillingController],
  providers: [SubscriptionService, FeatureFlagService, UsageLimitGuard, PlanGuard],
  exports: [SubscriptionService, FeatureFlagService, UsageLimitGuard, PlanGuard],
})
export class BillingModule {}
