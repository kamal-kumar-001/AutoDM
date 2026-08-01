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
    { label: 'Platform Engine', href: '#innovations' },
    { label: 'Smart Inbox', href: '#reply-desk' },
    { label: 'Mobile PWA', href: '#mobile' },
    { label: 'Pricing Matrix', href: '/pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
};

export const HERO_CONTENT = {
  badge: '🇮🇳 India’s #1 Autonomous Instagram Growth & Conversion Engine',
  title: 'Turn Reels Engagement Into High-Intent Sales, Instantly',
  titleGradient: 'Instantly',
  description:
    'AutoDM monitors your Instagram account 24/7, filters out spam comments to highlight real buyers, and sends safe, multi-variant DMs in Hinglish, Tamil, & 10+ languages — engineered specifically for creator monetization and digital brand scale.',
  ctaPrimary: 'Start Automation Free',
  ctaSecondary: 'View Platform Architecture',
};

export const TRUSTED_LOGOS = [
  'Kavya Fashion House',
  'FitCraft India',
  'Aarav Vlogs Studio',
  'Elevate Growth Media',
  'Bharat D2C Labs',
  'Artisan Craft Collective',
  'NextGen Creator Academy',
  'Pulse Commerce Tech',
];

export const TRUSTED_AGENCIES = [
  { name: 'Elevate Growth Media', label: 'Managing 25+ Top Indian Creators' },
  { name: 'Bharat D2C Labs', label: '8M+ Monthly DM Conversions' },
  { name: 'Pulse Commerce Tech', label: 'Scaling 40+ E-Commerce Brands' },
  { name: 'NextGen Creator Academy', label: '500+ Active Creator Funnels' },
];

export const INNOVATIONS_CONTENT = {
  badge: 'Proprietary Technology',
  title: 'Six Engineering Breakthroughs Built for Social Commerce',
  description:
    'Legacy DM bots rely on rigid keyword matching. AutoDM delivers a modern social commerce operating system built from the ground up for creators, D2C brands, and agencies.',
  items: [
    {
      number: '01',
      icon: MessageSquare,
      title: 'Smart Reply Desk',
      subtitle: 'Isolate high-value buyer queries from comment noise.',
      desc: 'When a Reel trends, thousands of repetitive single-word comments like "PRICE" or "LINK" bury authentic leads. Smart Reply Desk automatically isolates genuine buyer questions and surfaces them for immediate action.',
      example: {
        noise: ['price?', 'link plz', 'PRICE', 'send link 🙏'],
        real: 'Do you ship to Bangalore within 2 business days for a size M dress?',
      },
    },
    {
      number: '02',
      icon: Languages,
      title: 'Hinglish & Regional Engine',
      subtitle: 'Native support for 10+ Indian scripts & conversational slang.',
      desc: 'Connect with your audience in the exact way India types online. AutoDM handles Hindi, Tamil, Marathi, Bengali, Telugu, Hinglish ("bhai exact price kitna hai"), and Tanglish using ultra-fast low-token classification.',
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
      title: 'Dynamic Copy Variations',
      subtitle: 'Eliminate bot signatures with automated copy rotation.',
      desc: 'Sending identical DM copy repeatedly triggers Meta rate limits. AutoDM dynamically rotates approved text phrasing every 50 sends while keeping your destination links and offers 100% consistent.',
      variantDemo: [
        'Hey @username! Here is your requested access link → autodm.org',
        'Hi there! Grab your requested resource right here → autodm.org',
        'Hey friend! Tap here to access your link instantly → autodm.org',
      ],
    },
    {
      number: '04',
      icon: Flame,
      title: 'Surge-Paced Viral Queue',
      subtitle: 'Automated queue adaptive rate-limiting during comment spikes.',
      desc: 'When content goes viral and 10,000 comments arrive in minutes, AutoDM auto-detects volume spikes and paces message dispatch to safe, human-like intervals using Redis-backed BullMQ queues.',
      badgeText: 'Surge Detected • Pacing Queue to Human-Safe Intervals',
    },
    {
      number: '05',
      icon: BellRing,
      title: 'Real-Time Surge Alerts',
      subtitle: 'Instant mobile PWA push notifications during high volume.',
      desc: 'Receive immediate push alerts on your phone and dashboard when a campaign surges (e.g., 2,500 DMs/hr). Inspect status or adjust pacing with a single tap.',
      alertDemo: '⚡ Viral Spike: 2,500 DMs enqueued in the last 60m. Queue auto-paced safely.',
    },
    {
      number: '06',
      icon: Mic,
      title: 'Voice Funnel Builder',
      subtitle: 'Generate complete automation funnels using natural speech.',
      desc: 'Build complex trigger-and-reply sequences in seconds. Simply state "When users comment GUIDE on my latest post, DM them my e-book link" and AutoDM configures the funnel automatically.',
      voiceDemo: 'Listening… -> Funnel Created: Trigger "GUIDE" + Button DM Ready to Publish.',
    },
  ],
};

export const PWA_MOBILE_CONTENT = {
  badge: 'Mobile PWA OS',
  title: 'Manage Your Entire DM Engine Anywhere',
  description:
    'No App Store download required. AutoDM installs directly as a lightweight Progressive Web App on iOS & Android with lock-screen quick replies and real-time push alerts.',
  features: [
    {
      icon: BellRing,
      title: 'Lock-Screen Push Notifications',
      desc: 'Get instant notifications when high-intent buyers ask questions in Smart Reply Desk or when a Reel experiences a traffic spike.',
    },
    {
      icon: Smartphone,
      title: 'On-The-Go Campaign Controls',
      desc: 'Activate, pause, or adjust keywords and DM templates from your smartphone with zero latency.',
    },
    {
      icon: MessageSquare,
      title: 'Mobile Reply Desk',
      desc: 'Review and answer genuine customer inquiries right from your phone screen in your audience’s native language.',
    },
  ],
};

export const PERSONAS_CONTENT = {
  badge: 'Engineered For Scale',
  title: 'Tailored Operating Modes for Every Creator & Business Model',
  items: [
    {
      type: 'Digital Creators',
      icon: Sparkles,
      tag: '🎬 Digital Creators',
      desc: 'Automate digital product links, course access, and community invites while focusing on content creation.',
      stat: '28,400+ DMs Automated / Month',
      creatorHandle: '@aarav_vlogs',
    },
    {
      type: 'Local Retailers',
      icon: Building2,
      tag: '💼 Local Retailers',
      desc: 'Sell apparel, jewelry, handcrafted goods, and custom cakes directly through instant Instagram DM conversations.',
      stat: '5.2x Conversion Increase',
      creatorHandle: '@kavya_fashion_house',
    },
    {
      type: 'D2C Brands',
      icon: ShoppingBag,
      tag: '🛍️ D2C Brands',
      desc: 'Deliver discount vouchers, product catalog cards, and Razorpay checkout links the second users ask.',
      stat: '₹18.6L Revenue via Automated DMs',
      creatorHandle: '@fitcraft_india',
    },
    {
      type: 'Creator Agencies',
      icon: Briefcase,
      tag: '👥 Creator Agencies',
      desc: 'Manage multiple client rosters with multi-seat workspaces, permission roles, and white-label options.',
      stat: '35 Client Accounts Managed',
      creatorHandle: 'Elevate Growth Media',
    },
  ],
};

export const FOUNDING_MEMBER_CONTENT = {
  title: 'Founding Member Pricing',
  subtitle: 'Exclusive intro offer for the first 1,000 accounts — locked in for life!',
  claimed: 950,
  total: 1000,
  remaining: 50,
};

export const FAQS_CONTENT = {
  badge: 'Clear Answers',
  title: 'Frequently Asked Questions',
  items: [
    {
      q: 'How does AutoDM ensure full compliance with Meta Graph API policies?',
      a: 'AutoDM is engineered exclusively on official Meta Graph API v20.0 endpoints. It utilizes dynamic copy rotation every 50 sends and Redis surge queue pacing to ensure your Instagram account remains 100% compliant and safe.',
    },
    {
      q: 'How does the Hinglish and Multilingual Engine work?',
      a: 'Our hybrid architecture combines fast local regex/ML pattern classifiers with low-token LLM prompt compression. It parses Hinglish ("bhai price kya hai"), Tanglish, and 10+ regional scripts instantly without expensive token overhead.',
    },
    {
      q: 'What makes the Smart Reply Desk different from standard comment bots?',
      a: 'Smart Reply Desk evaluates incoming comments using intent classification to filter out generic single-word spam ("PRICE", "LINK") and surface high-value buyer questions requiring direct attention.',
    },
    {
      q: 'Can agencies manage multiple client Instagram channels?',
      a: 'Yes. The Agency Plan supports 5 to 20 team seats, multi-client workspace separation, role permissions, and dedicated relationship manager support.',
    },
    {
      q: 'Does AutoDM require an App Store installation on mobile?',
      a: 'No. AutoDM is built as a Progressive Web App (PWA). You can tap "Add to Home Screen" on iOS or Android to receive push notifications and manage campaigns directly.',
    },
  ],
};

export const ABOUT_CONTENT = {
  title: 'Empowering India’s Creator Economy & Social Commerce',
  description:
    'AutoDM was founded to bridge the gap between social media engagement and automated revenue generation.',
  mission:
    'To provide creators, businesses, and agencies across India with enterprise-grade Meta automation tools.',
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
  title: 'Privacy Policy & Security Standards',
  updated: 'Last updated: August 2026',
  lastUpdated: 'August 2026',
  commitment: '100% Meta Graph API Compliant & Token Encrypted',
  sections: [
    {
      id: 'meta-compliance',
      title: 'Meta Graph API Security',
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
      title: 'Data Privacy & Usage',
      content:
        'We process comments and DMs exclusively to execute your active automation funnels and populate Reply Desk queries.',
      desc: 'We process comments and DMs exclusively to execute your active automation funnels and populate Reply Desk queries.',
      bullets: [],
    },
  ],
};

export const TERMS_CONTENT = {
  title: 'Terms of Service',
  updated: 'Last updated: August 2026',
  lastUpdated: 'August 2026',
  sections: [
    {
      id: 'acceptable-use',
      title: 'Acceptable Use & Compliance Policy',
      content:
        'AutoDM enforces strict Meta rate limits, copy rotation, and anti-spam queue pacing to protect user channels.',
      desc: 'AutoDM enforces strict Meta rate limits, copy rotation, and anti-spam queue pacing to protect user channels.',
    },
  ],
};

export const FOOTER_CONTENT = {
  brand: 'AutoDM',
  tagline: 'India’s #1 Instagram Growth OS & Autonomous DM Engine.',
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
        { label: 'Platform Engine', href: '#innovations' },
        { label: 'Smart Inbox', href: '#reply-desk' },
        { label: 'Mobile PWA', href: '#mobile' },
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
