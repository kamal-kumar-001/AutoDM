import {
  Zap,
  Hash,
  Users,
  BarChart3,
  Link2,
  RefreshCw,
  Twitter,
  Github,
  Linkedin,
} from 'lucide-react';

export const LANDING_NAV = {
  logo: 'AutoDM',
  links: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
};

export const HERO_CONTENT = {
  badge: 'Trusted by 2,000+ creators',
  title: 'Turn Comments Into Customers, Automatically',
  titleGradient: 'Automatically',
  description:
    'AutoDM watches your Instagram comments 24/7 and instantly fires personalised DMs to every commenter — no bots, no risk, fully Meta-compliant.',
  ctaPrimary: 'Start for Free',
  ctaSecondary: 'Watch Demo',
};

export const TRUSTED_LOGOS = [
  'CreatorHub',
  'StyleBrand',
  'GrowthLabs',
  'MerchKing',
  'FitCreator',
  'DropShip Pro',
  'Artisan Co',
  'BrandFlow',
];

export const FEATURES_CONTENT = {
  badge: 'Platform Features',
  title: 'Everything you need to automate at scale',
  description:
    'From first comment to DM sent in under 500ms — with enterprise-grade reliability baked in.',
  items: [
    {
      icon: Zap,
      title: 'Comment → DM in Seconds',
      desc: 'The moment someone comments on your post, AutoDM fires a personalised DM instantly — no delays, no missed opportunities.',
    },
    {
      icon: Hash,
      title: 'Smart Keyword Matching',
      desc: 'Trigger replies on exact words, phrases, or patterns. Configure EXACT, CONTAINS, and STARTS_WITH rules per campaign.',
    },
    {
      icon: Users,
      title: 'Multi-Account Support',
      desc: 'Manage DM automation across multiple Instagram accounts from a single unified dashboard.',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      desc: 'Track DMs sent, success rates, top-performing posts, keyword triggers, and daily usage — all live.',
    },
    {
      icon: Link2,
      title: 'Webhook Automation',
      desc: 'Meta webhooks are received, validated, and processed instantly with a robust event log for debugging.',
    },
    {
      icon: RefreshCw,
      title: 'Queue & Retry System',
      desc: 'Built on BullMQ + Redis. Failed DMs retry automatically with exponential back-off, so nothing is ever lost.',
    },
  ],
};

export const PRICING_CONTENT = {
  title: 'Simple, transparent pricing',
  description: 'Start for free. Scale as you grow. Cancel anytime.',
  plans: [
    {
      name: 'Free',
      price: '₹0',
      period: '/month',
      popular: false,
      features: [
        '1 Instagram account',
        '1 campaign',
        '100 DMs/month',
        '5 keywords',
        'Basic analytics',
        'Email support',
      ],
    },
    {
      name: 'Pro',
      price: '₹999',
      period: '/month',
      popular: true,
      features: [
        '3 Instagram accounts',
        '10 campaigns',
        '5,000 DMs/month',
        '50 keywords',
        'Advanced analytics',
        'Priority support',
        'Webhook logs',
        'Multi-account',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      popular: false,
      features: [
        'Unlimited accounts',
        'Unlimited campaigns',
        'Unlimited DMs',
        'Unlimited keywords',
        'Full analytics',
        'Dedicated support',
        'SLA guarantee',
        'API access',
      ],
    },
  ],
};

export const FAQS_CONTENT = [
  {
    q: 'How does comment-to-DM work?',
    a: 'When someone comments on a monitored Instagram post, Meta sends a webhook to AutoDM. We match the comment text against your configured keywords, then fire a personalised DM to that user via the official Instagram Messaging API — all within seconds.',
  },
  {
    q: 'Is it safe for my Instagram account?',
    a: "Yes. AutoDM uses the official Meta Graph API and Instagram Messaging API, so everything is fully compliant with Meta's Terms of Service. We never use unofficial bots or scraping.",
  },
  {
    q: 'Can I use multiple accounts?',
    a: 'Pro and Enterprise plans support multiple Instagram accounts. You can connect up to 3 accounts on Pro and unlimited on Enterprise, each with their own campaigns and analytics.',
  },
  {
    q: 'What happens if Meta changes their API?',
    a: 'Our engineering team monitors Meta API changelogs closely. When breaking changes occur, we update AutoDM and notify all users. Our webhook architecture is designed to handle API versioning gracefully.',
  },
  {
    q: 'How do I cancel?',
    a: 'You can cancel anytime from your account settings — no phone calls, no cancellation fees. Your data is retained for 30 days after cancellation.',
  },
];

export const FOOTER_CONTENT = {
  tagline: 'The fastest way to turn Instagram comments into revenue — automatically.',
  copyright: `© ${new Date().getFullYear()} AutoDM. All rights reserved.`,
  socials: [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/autodm' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/kamal-kumar-001/AutoDM' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/in/kamalkhatiwal' },
  ],
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Changelog', href: '#' },
        { label: 'Roadmap', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Cookies', href: '#' },
        { label: 'Security', href: '#' },
      ],
    },
  ],
};

export const PRIVACY_CONTENT = {
  title: 'Privacy Policy',
  lastUpdated: 'Last Updated: July 2026',
  commitment:
    'We never upload, collect, or store your Instagram password. All credentials and messaging tasks are secured using industry-standard AES-256 encryption. Your DM flows and comments are processed dynamically to ensure complete data compliance.',
  sections: [
    {
      id: '1',
      title: 'Meta-Compliant Processing',
      desc: 'When a webhook event is received from Meta, AutoDM processes it in a secure cloud architecture. Your comment text is matched locally within our workers, and DMs are dispatched immediately via official Graph APIs.',
      bullets: [
        'Secure token storage: Access tokens are stored using AES-256 encryption at rest.',
        'No passive profile scraping: We only read comments and send messages as authorized by your Meta account consent.',
        'Data deletion on request: If you disconnect your Instagram account, all associated message logs and tokens are deleted instantly.',
      ],
    },
    {
      id: '2',
      title: 'Information We Process',
      desc: 'We store access tokens, campaigns configuration (keywords and auto-responses), and basic automation analytics (DM success rate and trigger count). We never parse private personal DMs or off-platform user profiles.',
      bullets: [],
    },
    {
      id: '3',
      title: 'Security Auditing',
      desc: 'All actions taken by system administrators or creators are logged in a tamper-resistant Audit Log. Critical security actions (such as plan modifications or token updates) trigger immediate administrative notifications.',
      bullets: [],
    },
  ],
};

export const TERMS_CONTENT = {
  title: 'Terms of Service',
  lastUpdated: 'Last Updated: July 2026',
  sections: [
    {
      id: '1',
      title: 'Acceptance of Terms',
      desc: 'By registering for an AutoDM account, you agree to these Terms of Service. If you do not agree to these terms, do not register for or use the service.',
    },
    {
      id: '2',
      title: 'Acceptable Use of Automation',
      desc: "You agree to use AutoDM solely for legitimate marketing, customer engagement, and creator outreach. Spamming, bulk message abuse, sending malicious links, or violating Meta's developer guidelines is strictly prohibited and will result in immediate account suspension.",
    },
    {
      id: '3',
      title: 'Meta & Instagram Affiliation',
      desc: 'AutoDM is an independent integration platform. It is not affiliated with, sponsored by, or endorsed by Meta Platforms, Inc. or Instagram. You must maintain active and compliant developer access tokens via Meta Developer Suite.',
    },
    {
      id: '4',
      title: 'Limitation of Liability',
      desc: 'We are not liable for any account suspension, page bans, or restricted functionality imposed by Instagram/Meta resulting from your configured automation campaigns or keyword triggers.',
    },
  ],
};

export const ABOUT_CONTENT = {
  title: 'About AutoDM',
  mission:
    'To empower creators and brands with high-performance, compliant, and reliable social automation tools that turn engagement into growth.',
  developer: {
    name: 'Kamal',
    role: 'Creator & Lead Architect',
    bio: 'I built AutoDM to bridge the gap between social engagement and pipeline growth, providing creators with a robust, enterprise-grade comment automation suite without the premium agency price tag.',
    github: 'https://github.com/kamal-kumar-001',
    linkedin: 'https://www.linkedin.com/in/kamalkhatiwal/',
    email: 'mr.kamal0120@gmail.com',
    portfolio: 'https://kamalkhatiwal.vercel.app/',
  },
};
