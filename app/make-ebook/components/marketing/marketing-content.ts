// ── Marketing copy content ────────────────────────────────────────────────────
// All public-facing copy for the marketing landing page lives here so non-engineers
// (or future you) can edit headlines, pricing labels, and FAQ answers without
// touching component layout. Each constant is consumed by exactly one section
// component in components/marketing/sections/.

export type HowItWorksStep = {
  step: string;
  title: string;
  description: string;
};

export const HOW_IT_WORKS: readonly HowItWorksStep[] = [
  {
    step: '01',
    title: 'Write your book',
    description: 'Use the distraction-free editor to write chapter by chapter. Drag and drop to reorganise anytime.',
  },
  {
    step: '02',
    title: 'Polish with AI',
    description: 'Book Mind reads your entire manuscript, catching inconsistencies, summarising chapters, and surfacing insights.',
  },
  {
    step: '03',
    title: 'Export everywhere',
    description: 'Download a publication-ready EPUB in one click. Ready for Amazon KDP, Apple Books, Kobo, and more.',
  },
];

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
};

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote: 'I found the app really impressive, very easy to use and a beautiful design.',
    author: 'Jon',
    role: 'Early Access User',
    avatar: '/neil-avatar.png',
  },
];

export type CheckoutType = 'pro' | 'lifetime' | null;

export type PricingPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: readonly string[];
  cta: string;
  highlighted: boolean;
  checkoutType: CheckoutType;
};

export const PRICING: readonly PricingPlan[] = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'The complete editor, free forever',
    features: [
      'Unlimited local books',
      'EPUB, PDF & DOCX export',
      'Chapter management & notes',
      'Focus mode & ambient sounds',
      'Works offline',
    ],
    cta: 'Sign Up',
    highlighted: false,
    checkoutType: null,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'Book Mind, the editorial brain',
    features: [
      'Everything in Free',
      'Book Mind AI (chat, insights, issues)',
      '\u2318K inline editing with branching takes',
      'Amazon KDP pre-flight & disclosure helper',
      '/draft, /continue, /describe slash commands',
      'Flow mode: ghost-text sentence completion',
      'Project memory across sessions',
      'Cloud sync across devices',
    ],
    cta: 'Get Pro',
    highlighted: true,
    checkoutType: 'pro',
  },
  {
    name: 'Lifetime',
    price: '$149',
    period: ' once',
    description: 'Pay once, write forever',
    features: [
      'Everything in Pro',
      'Unlimited Book Mind access',
      'All future features included',
      'Support a one-person team',
    ],
    cta: 'Get Lifetime',
    highlighted: false,
    checkoutType: 'lifetime',
  },
];

export type FaqItem = {
  q: string;
  a: string;
};

export const FAQ: readonly FaqItem[] = [
  {
    q: 'Can I try it before paying?',
    a: 'Yes. The Free plan gives you unlimited local books, EPUB & PDF export, and professional typography. No credit card needed.',
  },
  {
    q: 'Can I upgrade or cancel anytime?',
    a: "Absolutely. Upgrade to Pro whenever you\u2019re ready, and cancel with one click. Your books are always yours.",
  },
  {
    q: 'What formats can I export?',
    a: 'EPUB (for Kindle, Kobo, Apple Books, and all major platforms), PDF, and Word. All publication-ready.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. makeEbook runs entirely in your browser and works offline too.',
  },
];
