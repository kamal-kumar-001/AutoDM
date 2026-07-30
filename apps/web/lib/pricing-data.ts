import { BillingPlan, FeatureFlag, PromoSettings, PricingPromoResponse } from '@/types';

export const DEFAULT_PLANS: BillingPlan[] = [
  {
    id: 'plan-free',
    key: 'FREE',
    name: 'Free',
    description: 'Ideal for individual creators getting started with smart DM automation',
    priceMonthly: 0,
    priceYearly: 0,
    campaignLimit: 2,
    keywordLimit: 5,
    dmLimitMonthly: 200,
  },
  {
    id: 'plan-pro',
    key: 'PRO',
    name: 'Pro',
    description: 'Unlimited everything for serious creators & growing digital brands',
    priceMonthly: 1990,
    priceYearly: 11988, // ₹999/mo billed annually
    campaignLimit: 9999,
    keywordLimit: 9999,
    dmLimitMonthly: 999999,
  },
  {
    id: 'plan-agency',
    key: 'ENTERPRISE', // Map Agency plan to ENTERPRISE key for backward compatibility
    name: 'Agency',
    description: 'Built for agencies & managers handling multiple high-tier creator accounts',
    priceMonthly: 3990,
    priceYearly: 35880, // ₹2990/mo billed annually
    campaignLimit: 9999,
    keywordLimit: 9999,
    dmLimitMonthly: 999999,
  },
];

export const DEFAULT_PROMO: PromoSettings = {
  text: '🔥 Founding Member Offer: 50 spots left at ₹999/mo locked in forever! (950/1,000 claimed)',
  enabled: true,
  discountPercent: 50,
};

export const FOUNDING_MEMBER_STATS = {
  claimed: 950,
  total: 1000,
  remaining: 50,
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'flag-reply-desk',
    key: 'REPLY_DESK',
    description: 'AI Query Filtering & Real Buyer Question Surface',
    enabledForPlans: 'FREE,PRO,ENTERPRISE',
    isEnabled: true,
  },
  {
    id: 'flag-multilingual',
    key: 'MULTILINGUAL_HINGLISH',
    description: '10+ Regional Languages & Hinglish/Tanglish Processing',
    enabledForPlans: 'FREE,PRO,ENTERPRISE',
    isEnabled: true,
  },
  {
    id: 'flag-dm-variants',
    key: 'DM_VARIANTS',
    description: 'Anti-Spam DM Variation Rotation Every 50 Sends',
    enabledForPlans: 'PRO,ENTERPRISE',
    isEnabled: true,
  },
  {
    id: 'flag-viral-queue',
    key: 'VIRAL_QUEUE',
    description: 'Automated Surge Pacing & Spam Alarm Protection',
    enabledForPlans: 'PRO,ENTERPRISE',
    isEnabled: true,
  },
  {
    id: 'flag-spike-alerts',
    key: 'SPIKE_ALERTS',
    description: 'Real-time Mobile Push & Dashboard Surge Alerts',
    enabledForPlans: 'PRO,ENTERPRISE',
    isEnabled: true,
  },
  {
    id: 'flag-voice-create',
    key: 'VOICE_CREATE',
    description: 'Speech-to-Automation AI Campaign Builder',
    enabledForPlans: 'PRO,ENTERPRISE',
    isEnabled: true,
  },
  {
    id: 'flag-follow-gate',
    key: 'FOLLOW_CHECK_GATE',
    description: 'Follow-to-Unlock Verification & Native Quick Replies',
    enabledForPlans: 'PRO,ENTERPRISE',
    isEnabled: true,
  },
  {
    id: 'flag-team-seats',
    key: 'TEAM_SEATS',
    description: 'Agency Team Seats (5–20 Seats) & Multi-Account Hub',
    enabledForPlans: 'ENTERPRISE',
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
    FREE: '1 IG Account',
    PRO: '3 IG Accounts',
    ENTERPRISE: '5–20 Client Accounts',
  },
  campaignOptions: {
    FREE: '2 Funnels (Comment, Keyword)',
    PRO: 'All 5 Funnels + Voice Create',
    ENTERPRISE: 'All Funnels + Agency Workspaces',
  },
  support: {
    FREE: 'WhatsApp Support',
    PRO: 'Priority WhatsApp Support',
    ENTERPRISE: 'Dedicated Relationship Manager',
  },
};

export const AGENCY_SEAT_OPTIONS = [
  { seats: 5, clientAccounts: 5, label: '5 Seats / 5 Accounts' },
  { seats: 10, clientAccounts: 10, label: '10 Seats / 10 Accounts' },
  { seats: 15, clientAccounts: 15, label: '15 Seats / 15 Accounts' },
  { seats: 20, clientAccounts: 20, label: '20 Seats / 20 Accounts' },
];
