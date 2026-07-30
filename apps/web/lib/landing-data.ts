import {
  Zap,
  MessageSquare,
  Languages,
  ShieldCheck,
  Flame,
  BellRing,
  Mic,
  Smartphone,
  Sparkles,
  Users,
  Building2,
  ShoppingBag,
  Briefcase,
  Check,
  Instagram,
  Mail,
  Github,
  Linkedin,
} from 'lucide-react';

export const LANDING_NAV = {
  logo: 'AutoDM',
  links: [
    { label: 'Innovations', href: '#innovations' },
    { label: 'Reply Desk', href: '#reply-desk' },
    { label: 'PWA Mobile', href: '#mobile' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
};

export const HERO_CONTENT = {
  badge: '🇮🇳 India’s #1 Meta-Compliant DM Automation Platform',
  title: 'Turn Comments Into Customers, Automatically',
  titleGradient: 'Automatically',
  description:
    'AutoDM watches your Instagram 24/7, surfaces genuine buyer questions out of noisy comments, and sends safe, multi-variant DMs in Hinglish, Tamil, & 10+ languages — built for how creators and businesses actually scale.',
  ctaPrimary: 'Start for Free',
  ctaSecondary: 'Explore Innovations',
};

export const TRUSTED_LOGOS = [
  'Apex Media Studio',
  'Nova Digital',
  'GrowthMatrix',
  'BrandFlow',
  'CreatorHub',
  'StyleLabs',
  'MerchKing',
  'DropShip Pro',
];

export const TRUSTED_AGENCIES = [
  { name: 'Apex Creator Studio', label: 'Managing 15+ Top Creators' },
  { name: 'Nova Digital Media', label: '5M+ Monthly DM Volume' },
  { name: 'GrowthMatrix Labs', label: 'D2C Brand Accelerator' },
  { name: 'BrandFlow Media', label: '30+ E-commerce Accounts' },
];

export const INNOVATIONS_CONTENT = {
  badge: 'Our Innovations',
  title: 'Six Innovations No Other DM Tool Built',
  description:
    'Every legacy DM tool solves the same boring problems. We built six game-changing features tailored for creators, D2C brands, and agencies in India.',
  items: [
    {
      number: '01',
      icon: MessageSquare,
      title: 'Reply Desk',
      subtitle: 'Find real questions hidden in the noise.',
      desc: 'A viral reel brings thousands of "PRICE" and "LINK" comments drowning out genuine buyers asking real questions. Reply Desk surfaces high-intent queries so you can reply instantly.',
      example: {
        noise: ['price?', 'link plz', 'PRICE', 'link 🙏'],
        real: 'Does this work for a smaller account with ~5k followers?',
      },
    },
    {
      number: '02',
      icon: Languages,
      title: 'Multilingual & Hinglish',
      subtitle: 'Built for India. 10+ languages, end to end.',
      desc: "From trigger words to DMs, converse in your audience's native tongue. Supports Hindi, Tamil, Marathi, Bengali, Telugu, Hinglish ('bhai price kya hai'), and Tanglish. Powered by low-token ML optimization.",
      languages: [
        'हिन्दी (Hindi)',
        'தமிழ் (Tamil)',
        'मराठी (Marathi)',
        'বাংলা (Bengali)',
        'తెలుగు (Telugu)',
        'Hinglish',
        'Tanglish',
      ],
    },
    {
      number: '03',
      icon: ShieldCheck,
      title: 'DM Variants',
      subtitle: 'Never look like a bot. Account stays 100% safe.',
      desc: 'Sending the exact same DM 1,000 times triggers spam alarms. AutoDM auto-rotates approved variations of your message every 50 sends while keeping your link, offer, and CTA identical.',
      variantDemo: [
        "Hey! 🙌 Here's the course link you asked for → autodm.org",
        "Hi there! Here's that link you wanted → autodm.org",
        'Heya 🙌 grab your link right here → autodm.org',
      ],
    },
    {
      number: '04',
      icon: Flame,
      title: 'Viral Queue',
      subtitle: 'Blow up without blowing up your account.',
      desc: 'When a reel goes viral and 10,000 comments hit at once, Instagram flags sudden bursts. AutoDM auto-detects spikes and paces queue delivery to human-safe speeds.',
      badgeText: 'Spike Detected • Auto Paced to Safe Speeds',
    },
    {
      number: '05',
      icon: BellRing,
      title: 'Spike Alerts',
      subtitle: 'Know the exact moment your content heats up.',
      desc: 'Get instant mobile push notifications and dashboard banners when an automation hits surge volume (e.g. 2,400 DMs/hr). Pause or let it ride with a single tap.',
      alertDemo: '🔥 Reel Heating Up: 2,400 DMs in the last hour. Sends are paced & safe.',
    },
    {
      number: '06',
      icon: Mic,
      title: 'Voice Create',
      subtitle: 'Say it, and your automation exists.',
      desc: 'Creating an automation takes one spoken sentence. Say "When someone comments LINK on my new reel, send them my course link" and AutoDM builds the whole trigger & DM flow instantly.',
      voiceDemo:
        'Listening… -> Automation Created: Trigger "LINK" + DM with Button Ready to Publish.',
    },
  ],
};

export const PWA_MOBILE_CONTENT = {
  badge: 'PWA Mobile OS',
  title: 'Run Your Entire DM Engine From Your Pocket',
  description:
    'No app store hassle. AutoDM functions as a full-featured Progressive Web App (PWA) for iOS & Android with real-time push notifications and lock-screen controls.',
  features: [
    {
      icon: BellRing,
      title: 'Real-time Push Notifications',
      desc: 'Get pinged the instant a comment fires a DM, a real buyer question lands in Reply Desk, or an automation heats up.',
    },
    {
      icon: Smartphone,
      title: 'Manage Automations On The Go',
      desc: 'Pause, activate, or tweak triggers and message templates from anywhere. Your entire flow library in your hand.',
    },
    {
      icon: MessageSquare,
      title: 'Reply Desk In Your Pocket',
      desc: 'Spot genuine buyers hidden in thousands of comments and reply in their native language right from your mobile lock screen.',
    },
  ],
};

export const PERSONAS_CONTENT = {
  badge: 'Built for Everyone',
  title: 'Empowering Creators, D2C Brands & Agencies Across India',
  items: [
    {
      type: 'Creators',
      icon: Sparkles,
      tag: '🎬 Creators',
      desc: 'Spend less time replying to repetitive DMs, more time creating viral content.',
      stat: '19,200 DMs sent in 30 days',
      creatorHandle: '@aarav.creates',
    },
    {
      type: 'Businesses',
      icon: Building2,
      tag: '💼 Businesses',
      desc: 'Whether you sell sarees, cakes, jewelry, or furniture, sell more through instant DMs.',
      stat: '4.8x Conversion Lift',
      creatorHandle: '@artisan.sarees',
    },
    {
      type: 'D2C Brands',
      icon: ShoppingBag,
      tag: '🛍️ D2C Brands',
      desc: 'Send product links, discount codes, and Razorpay checkout links the second users ask.',
      stat: '₹12.4L Revenue via DMs',
      creatorHandle: '@glowskin.co',
    },
    {
      type: 'Agencies',
      icon: Briefcase,
      tag: '👥 Agencies',
      desc: 'Equip your creator roster with multi-seat workspaces and dedicated relationship support.',
      stat: '25 Client Accounts Managed',
      creatorHandle: 'Apex Media Studio',
    },
  ],
};

export const FOUNDING_MEMBER_CONTENT = {
  title: 'Founding Member Pricing',
  subtitle: 'Limited to the first 1,000 users — locked in forever!',
  claimed: 950,
  total: 1000,
  remaining: 50,
};

export const FAQS_CONTENT = {
  badge: 'Got Questions?',
  title: 'Frequently Asked Questions',
  items: [
    {
      q: 'Will my Instagram account be safe from restrictions?',
      a: 'Yes 100%. AutoDM is built on official Meta Graph APIs and features DM Variants (rotating messages every 50 sends) + Viral Queue auto-pacing. We offer a 100% Refund Guarantee if your account is restricted while using Pro/Agency plans.',
    },
    {
      q: 'How does the Multilingual & Hinglish engine work?',
      a: 'Our hybrid architecture combines fast local regex/ML models with low-token LLM prompt compression. It parses Hinglish ("bhai price kya hai"), Tanglish, and 10+ regional languages instantly without racking up expensive API token costs.',
    },
    {
      q: 'What is the Reply Desk?',
      a: 'Reply Desk is an AI-powered query surface that filters out repetitive "PRICE" or "LINK" comments and highlights genuine buyer questions so you can convert real customers first.',
    },
    {
      q: 'Can I manage client accounts as an Agency?',
      a: 'Yes! Our Agency Plan supports 5 to 20 team seats and allows managing multiple client Instagram channels with team role permissions and white-label options.',
    },
    {
      q: 'Does AutoDM work on mobile phones?',
      a: 'Yes! AutoDM is a full PWA (Progressive Web App). You can install it on iOS or Android, receive real-time push notifications, and manage automations on the go.',
    },
  ],
};

export const ABOUT_CONTENT = {
  title: 'Building India’s Premier Instagram Business OS',
  description:
    'AutoDM was engineered to bridge the gap between high-volume creator engagement and native social commerce conversion.',
  mission:
    'To empower 100,000+ creators, D2C brands, and local Indian businesses to turn social interactions into revenue on autopilot.',
  developer: {
    name: 'Kamal Kumar',
    role: 'Lead Architect & Senior Software Engineer',
    bio: 'Specializing in distributed systems, real-time messaging, and high-performance Meta automation engines.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    email: 'kamal@dmpilot.org',
    portfolio: 'https://dmpilot.org',
  },
};

export const PRIVACY_CONTENT = {
  title: 'Privacy Policy & Data Security',
  updated: 'Last updated: July 2026',
  lastUpdated: 'July 2026',
  commitment: '100% Meta Graph API Compliant & Token Encrypted',
  sections: [
    {
      id: 'meta-compliance',
      title: 'Meta Graph API Compliance',
      content:
        'AutoDM connects strictly via official Meta Graph API endpoints. We store access tokens encrypted using AES-256-GCM symmetric encryption.',
      desc: 'AutoDM connects strictly via official Meta Graph API endpoints. We store access tokens encrypted using AES-256-GCM symmetric encryption.',
      bullets: [
        'Tokens are encrypted in-memory and at rest using AES-256-GCM.',
        'We never ask for or store your personal Instagram passwords.',
        'User data deletion requests can be initiated at any time in Settings.',
      ],
    },
    {
      id: 'data-collection',
      title: 'Data Collection & Usage',
      content:
        'We process comments and DMs exclusively to execute your active automation funnels and populate Reply Desk queries.',
      desc: 'We process comments and DMs exclusively to execute your active automation funnels and populate Reply Desk queries.',
      bullets: [],
    },
  ],
};

export const TERMS_CONTENT = {
  title: 'Terms of Service',
  updated: 'Last updated: July 2026',
  lastUpdated: 'July 2026',
  sections: [
    {
      id: 'acceptable-use',
      title: 'Acceptable Use Policy',
      content:
        'AutoDM enforces strict Meta rate limits, DM Variants rotation, and anti-spam pacing to protect user channels.',
      desc: 'AutoDM enforces strict Meta rate limits, DM Variants rotation, and anti-spam pacing to protect user channels.',
    },
  ],
};

export const FOOTER_CONTENT = {
  brand: 'AutoDM',
  tagline: 'India’s #1 Instagram Business OS & DM Automation Engine.',
  copyright: '© 2026 AutoDM Technologies Inc. All rights reserved.',
  socials: [
    { name: 'Instagram', href: 'https://instagram.com', icon: Instagram },
    { name: 'Mail', href: 'mailto:support@dmpilot.org', icon: Mail },
    { name: 'GitHub', href: 'https://github.com', icon: Github },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
  ],
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'Innovations', href: '#innovations' },
        { label: 'Reply Desk', href: '#reply-desk' },
        { label: 'PWA Mobile', href: '#mobile' },
        { label: 'Pricing Matrix', href: '/pricing' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact Support', href: '/contact' },
        { label: 'Founding Offer', href: '/pricing' },
      ],
    },
    {
      title: 'Legal & Safety',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Meta Compliance', href: '/privacy' },
      ],
    },
  ],
};
