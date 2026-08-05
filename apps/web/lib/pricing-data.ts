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
    priceMonthly: 999,
    priceYearly: 9990,
    campaignLimit: 9999,
    keywordLimit: 9999,
    dmLimitMonthly: 999999,
  },
  {
    id: 'plan-agency',
    key: 'ENTERPRISE',
    name: 'Agency',
    description: 'Custom infrastructure & multi-seat workspace for agencies & big creators',
    priceMonthly: 0,
    priceYearly: 0,
    campaignLimit: 9999,
    keywordLimit: 9999,
    dmLimitMonthly: 999999,
  },
];

export const DEFAULT_PROMO: PromoSettings = {
  text: '⚡ Special Launch Offer: 100% OFF for the First 100 Users! (84/100 claimed)',
  enabled: true,
  discountPercent: 100,
};

export const LAUNCH_SPECIAL_STATS = {
  claimed: 84,
  total: 100,
  remaining: 16,
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'flag-no-branding',
    key: 'NO_BRANDING',
    description: '✨ No AutoDM Branding (Clean Whitelabel DMs)',
    enabledForPlans: 'FREE,PRO,ENTERPRISE',
    isEnabled: true,
  },
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
];

export const DEFAULT_PRICING_DATA: PricingPromoResponse = {
  plans: DEFAULT_PLANS,
  promo: DEFAULT_PROMO,
  featureFlags: DEFAULT_FEATURE_FLAGS,
};

export const COMPARISON_SPECIFICATIONS = [
  {
    category: 'Core Capabilities',
    features: [
      { name: '✨ No AutoDM Branding (Whitelabel DMs)', free: 'Included', pro: 'Included', agency: 'Included' },
      { name: 'Active Automation Campaigns', free: '2 Campaigns', pro: 'Unlimited', agency: 'Unlimited' },
      { name: 'Monthly DM Volume', free: '200 DMs/mo', pro: 'Unlimited', agency: 'Unlimited' },
      { name: 'Keywords Per Campaign', free: '5 Keywords', pro: 'Unlimited', agency: 'Unlimited' },
    ],
  },
  {
    category: 'Smart Engines',
    features: [
      { name: 'Smart Reply Desk (Buyer Filter)', free: true, pro: true, agency: true },
      { name: 'Hinglish & Regional Language Engine', free: true, pro: true, agency: true },
      { name: 'Anti-Spam Copy Variation Rotation', free: false, pro: true, agency: true },
      { name: 'Redis Surge-Paced Viral Queue', free: false, pro: true, agency: true },
      { name: 'Real-Time Mobile PWA Push Alerts', free: false, pro: true, agency: true },
      { name: 'Voice Funnel Builder', free: false, pro: true, agency: true },
      { name: 'Follow-Gate Unlock Quick Replies', free: false, pro: true, agency: true },
    ],
  },
  {
    category: 'Account & Management',
    features: [
      { name: 'Connected Instagram Accounts', free: '1 Account', pro: '1 Account', agency: 'Custom (5-50+)' },
      { name: 'Team Seats', free: '1 Seat', pro: '1 Seat', agency: 'Custom Team Workspace' },
      { name: 'Dedicated Account Manager', free: false, pro: false, agency: true },
    ],
  },
];
