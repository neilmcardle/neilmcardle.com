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
    description: 'Write your book. Export it. No card needed.',
    features: [
      'Unlimited local books',
      'EPUB, PDF & DOCX export',
      'Chapter management & notes',
      'Focus mode & ambient sounds',
      'Works offline',
    ],
    cta: 'Start writing free',
    highlighted: false,
    checkoutType: null,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'An AI editor that reads every chapter and keeps your book safe on Amazon.',
    features: [
      'Everything in Free',
      'Book Mind reads your whole manuscript and catches plot holes, contradictions, and pacing breaks',
      'Pre-flight checks against Amazon\u2019s spam filter so your book doesn\u2019t get delisted',
      'Rewrite any sentence in your voice. See 3 alternatives, pick one',
      'Type \u201c/continue\u201d when you\u2019re stuck. Book Mind writes the next paragraph in your style',
      'Remembers your characters, world, and decisions across sessions',
      'Your draft syncs across laptop, tablet, and phone. Pick up wherever you left off',
    ],
    cta: 'Start 7-day free trial',
    highlighted: true,
    checkoutType: 'pro',
  },
  {
    name: 'Lifetime',
    price: '$149',
    period: ' once',
    description: 'For authors planning more than one book. Pay once, never renew.',
    features: [
      'Everything in Pro',
      'Unlimited Book Mind access',
      'All future features included',
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
    q: 'Will Amazon delist my book if I write it with AI?',
    a: 'Not for using AI. Amazon delists books for failing to disclose AI use, or for low-quality output that triggers their spam filter. Pro runs a pre-flight against the patterns Amazon flags (uniform chapter lengths, repetitive phrasing, implausible metadata) and generates the exact disclosure text to paste into KDP. Honest disclosure is what keeps your book live.',
  },
  {
    q: 'Is my manuscript private?',
    a: 'Your draft is yours. Book Mind sends only the relevant chunks of your manuscript to Anthropic at query time, and Anthropic\u2019s API does not train on customer data. Nothing is shared with third parties. On Free, your books live in your browser. On Pro, cloud sync stores them in your account.',
  },
  {
    q: 'What if my book is half-written in Word or Google Docs?',
    a: 'Paste it in or upload a .docx. makeEbook splits the manuscript into chapters automatically, so a Google Doc, a Word file, or a Scrivener compile lands in the editor in seconds. You do not start over.',
  },
  {
    q: 'What is your refund policy?',
    a: 'Pro: cancel anytime in one click, no charge after that. Lifetime: 30-day full refund, no questions. Either way, your books are yours and you can export them at any point.',
  },
  {
    q: 'Why trust a one-person team with my book?',
    a: 'Fair question. makeEbook is built by Neil McArdle, working solo. No roadmap dictated by investors, no support tickets routed through a queue, every email reaches the person who wrote the code. The flip side: bigger teams ship faster. The trade is intentional. You can reply to any email and get a real answer.',
  },
];
