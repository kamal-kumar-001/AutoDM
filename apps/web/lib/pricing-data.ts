import { BillingPlan, FeatureFlag, PromoSettings, PricingPromoResponse } from '@/types';

export const DEFAULT_PLANS: BillingPlan[] = [
  {
    id: 'plan-free',
    key: 'FREE',
    name: 'Free',
    description: 'Perfect for creators just starting out with DM automation',
    priceMonthly: 0,
    priceYearly: 0,
    campaignLimit: 1,
    keywordLimit: 3,
    dmLimitMonthly: 100,
  },
  {
    id: 'plan-pro',
    key: 'PRO',
    name: 'Pro',
    description: 'For growing creators & businesses scaling engagement',
    priceMonthly: 999,
    priceYearly: 9588, // ₹799/mo billed annually
    campaignLimit: 10,
    keywordLimit: 25,
    dmLimitMonthly: 5000,
  },
  {
    id: 'plan-enterprise',
    key: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'For agencies & high-volume commerce brands requiring custom scale',
    priceMonthly: 4999,
    priceYearly: 47988,
    campaignLimit: 9999,
    keywordLimit: 9999,
    dmLimitMonthly: 50000,
  },
];

export const DEFAULT_PROMO: PromoSettings = {
  text: '🚀 Special Launch Discount — Save 20% on Annual Billing!',
  enabled: true,
  discountPercent: 20,
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'flag-comment-to-dm',
    key: 'COMMENT_TO_DM',
    description: 'Comment to Direct Message Automation Trigger',
    enabledForPlans: 'FREE,PRO,ENTERPRISE',
    isEnabled: true,
  },
  {
    id: 'flag-keyword-to-dm',
    key: 'KEYWORD_TO_DM',
    description: 'Direct Message Keyword Trigger Automation',
    enabledForPlans: 'FREE,PRO,ENTERPRISE',
    isEnabled: true,
  },
  {
    id: 'flag-welcome-dm',
    key: 'WELCOME_DM',
    description: 'Automated New Follower Welcome Messages',
    enabledForPlans: 'PRO,ENTERPRISE',
    isEnabled: true,
  },
  {
    id: 'flag-story-reply-to-dm',
    key: 'STORY_REPLY_TO_DM',
    description: 'Instagram Story Reply Automation Funnel',
    enabledForPlans: 'PRO,ENTERPRISE',
    isEnabled: true,
  },
  {
    id: 'flag-comment-reply',
    key: 'COMMENT_REPLY',
    description: 'Public Comment Auto-Reply Posting',
    enabledForPlans: 'PRO,ENTERPRISE',
    isEnabled: true,
  },
  {
    id: 'flag-follow-gate',
    key: 'FOLLOW_CHECK_GATE',
    description: 'Follow Gate Verification & Native Quick Reply Prompts',
    enabledForPlans: 'PRO,ENTERPRISE',
    isEnabled: true,
  },
  {
    id: 'flag-webhook-logs',
    key: 'WEBHOOK_LOGS',
    description: 'Live Meta Webhook Ingest Log Inspector & Pause Controls',
    enabledForPlans: 'ENTERPRISE',
    isEnabled: true,
  },
  {
    id: 'flag-analytics',
    key: 'ADVANCED_ANALYTICS',
    description: 'Real-time Chart Visualizations & Conversion Rate Metrics',
    enabledForPlans: 'PRO,ENTERPRISE',
    isEnabled: true,
  },
];

export const DEFAULT_PRICING_DATA: PricingPromoResponse = {
  plans: DEFAULT_PLANS,
  promo: DEFAULT_PROMO,
  featureFlags: DEFAULT_FEATURE_FLAGS,
};

export const COMPARISON_SPECIFICATIONS = {
  accounts: {
    FREE: '1 Account',
    PRO: '3 Accounts',
    ENTERPRISE: 'Unlimited Accounts',
  },
  campaignOptions: {
    FREE: '2 Funnels (Comment, Keyword)',
    PRO: 'All 5 Funnels Enabled',
    ENTERPRISE: 'All 5 Funnels + Custom Flows',
  },
  support: {
    FREE: 'Standard Support',
    PRO: 'Priority Support',
    ENTERPRISE: '24/7 Dedicated Support',
  },
};
