import { createElement, emptyDesign } from "./catalog";
import type { Design, Element, HeroSettings, Mode } from "./types";

export type TemplateKey =
  | "invite"
  | "login"
  | "signup"
  | "settings"
  | "feedback"
  | "checkout"
  | "hero_personal"
  | "hero_product"
  | "hero_split"
  | "hero_waitlist";

export const TEMPLATES: Record<
  TemplateKey,
  { describe: string; mode?: Mode; build: () => Design }
> = {
  invite: {
    describe: "Invite a teammate / invite a colleague / share access card",
    build: () =>
      design("Invite dialog", [
        el("heading", "header", "Invite a teammate"),
        el("text", "header", "Give someone access to your workspace."),
        el("input", "body", "Email"),
        el("button", "footer", "Send invite"),
      ]),
  },
  login: {
    describe: "Log in / sign in form with email and password",
    build: () =>
      design(
        "Sign in",
        [
          el("heading", "header", "Welcome back"),
          el("text", "header", "Sign in to continue."),
          el("input", "body", "Email"),
          el("input", "body", "Password"),
          el("checkbox", "body", "Remember me"),
          { ...el("button", "footer", "Sign in"), fullWidth: true },
        ],
        "stretch",
      ),
  },
  signup: {
    describe: "Sign up / create an account / registration form",
    build: () =>
      design(
        "Create account",
        [
          el("heading", "header", "Create your account"),
          el("text", "header", "It takes less than a minute."),
          el("input", "body", "Full name"),
          el("input", "body", "Email"),
          el("input", "body", "Password"),
          el("checkbox", "body", "I agree to the terms"),
          { ...el("button", "footer", "Create account"), fullWidth: true },
        ],
        "stretch",
      ),
  },
  settings: {
    describe:
      "Settings / preferences / notification settings panel with toggles",
    build: () =>
      design("Notification settings", [
        el("heading", "header", "Notifications"),
        el("text", "header", "Choose what you want to hear about."),
        { ...el("switch", "body", "Product updates"), checked: true },
        el("switch", "body", "Weekly digest"),
        el("switch", "body", "Security alerts"),
        { ...el("button", "footer", "Cancel"), variant: "outline" },
        el("button", "footer", "Save changes"),
      ]),
  },
  feedback: {
    describe: "Feedback / contact / support form with a message box",
    build: () =>
      design("Feedback", [
        el("heading", "header", "Send feedback"),
        el("text", "header", "Tell us what's working and what isn't."),
        el("select", "body", "Topic"),
        el("textarea", "body", "Message"),
        el("button", "footer", "Submit"),
      ]),
  },
  checkout: {
    describe: "Checkout / payment / billing details form",
    build: () =>
      design(
        "Checkout",
        [
          el("heading", "header", "Payment details"),
          el("input", "body", "Name on card"),
          el("input", "body", "Card number"),
          el("checkbox", "body", "Save card for next time"),
          { ...el("button", "footer", "Place order"), fullWidth: true },
        ],
        "stretch",
      ),
  },
  hero_personal: {
    mode: "hero",
    describe:
      "Personal intro hero: a designer's or developer's portfolio homepage with name, tagline, trusted-by logos and social icons",
    build: () =>
      hero(
        "Personal hero",
        { layout: "left", background: "aurora", theme: "dark" },
        "violet",
        [
          el("logo", "nav-left", "Your name"),
          el("link", "nav-right", "Work"),
          el("link", "nav-right", "About"),
          el("link", "nav-right", "Contact"),
          el("avatar", "main", "You"),
          el("headline", "main", "Designer in London."),
          el(
            "text",
            "main",
            "I design and build tools for people who make things.",
          ),
          el("eyebrow", "proof", "Trusted by"),
          el("brand", "proof", "Northwind"),
          el("brand", "proof", "Lumen"),
          el("brand", "proof", "Harbor"),
          { ...el("icon", "bottom", ""), icon: "layers", text: undefined },
          { ...el("icon", "bottom", ""), icon: "book", text: undefined },
          { ...el("icon", "bottom", ""), icon: "code", text: undefined },
          { ...el("icon", "bottom", ""), icon: "mail", text: undefined },
        ],
      ),
  },
  hero_product: {
    mode: "hero",
    describe:
      "Product launch hero: announcement pill, big centred headline, subheadline and two call-to-action buttons",
    build: () =>
      hero(
        "Launch hero",
        { layout: "centered", background: "glow", theme: "dark" },
        "blue",
        [
          el("logo", "nav-left", "Product"),
          el("link", "nav-right", "Features"),
          el("link", "nav-right", "Pricing"),
          {
            ...el("button", "nav-right", "Sign in"),
            variant: "ghost",
            size: "sm",
          },
          el("badge", "main", "Now in beta"),
          el("headline", "main", "Ship your ideas faster."),
          el(
            "text",
            "main",
            "Everything you need to go from first draft to launch.",
          ),
          el("button", "actions", "Get started"),
          {
            ...el("button", "actions", "Watch demo"),
            variant: "outline",
            icon: "play",
          },
          el("scroll", "bottom", ""),
        ],
      ),
  },
  hero_split: {
    mode: "hero",
    describe:
      "SaaS split hero: text and buttons on the left, a product screenshot on the right",
    build: () =>
      hero(
        "Split hero",
        { layout: "split", background: "grid", theme: "light" },
        "violet",
        [
          el("logo", "nav-left", "Acme"),
          el("link", "nav-right", "Product"),
          el("link", "nav-right", "Customers"),
          el("link", "nav-right", "Pricing"),
          el("eyebrow", "main", "Analytics for teams"),
          el("headline", "main", "Know what's working."),
          el(
            "text",
            "main",
            "Dashboards your whole team can read, set up in minutes.",
          ),
          el("button", "actions", "Start free trial"),
          { ...el("button", "actions", "Talk to sales"), variant: "outline" },
          el("image", "media", "Dashboard screenshot"),
        ],
      ),
  },
  hero_waitlist: {
    mode: "hero",
    describe:
      "Waitlist / coming soon hero: headline and an email signup field with a join button",
    build: () =>
      hero(
        "Waitlist hero",
        { layout: "centered", background: "mesh", theme: "light" },
        "rose",
        [
          el("logo", "nav-left", "Soon"),
          el("eyebrow", "main", "Coming soon"),
          el("headline", "main", "Be the first to know."),
          el("text", "main", "Join the waitlist for early access."),
          {
            ...el("input", "actions", "Email"),
            placeholder: "name@example.com",
          },
          el("button", "actions", "Join the waitlist"),
        ],
      ),
  },
};

function hero(
  name: string,
  settings: Partial<HeroSettings>,
  accent: Design["accent"],
  elements: Element[],
): Design {
  const base = emptyDesign("hero");
  return {
    ...base,
    name,
    accent,
    hero: { ...base.hero!, ...settings },
    elements,
  };
}

function el(
  kind: Element["kind"],
  section: Element["section"],
  value: string,
): Element {
  return createElement(kind, section, { value: value || null });
}

function design(
  name: string,
  elements: Element[],
  footerAlign: Design["footerAlign"] = "end",
): Design {
  return { ...emptyDesign(), name, elements, footerAlign };
}

const TEMPLATE_WORDS: [RegExp, TemplateKey][] = [
  [/\b(?:personal|portfolio|about me|intro(?:duction)?)\b/i, "hero_personal"],
  [/\b(?:launch|product|announcement)\b/i, "hero_product"],
  [/\b(?:split|saas|screenshot)\b/i, "hero_split"],
  [/\b(?:waitlist|wait list|coming soon)\b/i, "hero_waitlist"],
  [/\binvite\b/i, "invite"],
  [/\b(?:log ?in|sign ?in)\b/i, "login"],
  [/\b(?:sign ?up|register|registration|create (?:an )?account)\b/i, "signup"],
  [/\b(?:settings|preferences|notifications)\b/i, "settings"],
  [/\b(?:feedback|contact form|support form)\b/i, "feedback"],
  [/\b(?:checkout|payment|billing)\b/i, "checkout"],

  [/\bhero\b/i, "hero_personal"],
];

export const PATTERN_WORD =
  /\b(?:template|pattern|preset|starter|boilerplate|example|layout|like the|same as the|the usual|pull|load|populate|fill in|bring (?:in|up|me)|give me the|show me the|use the|grab the|insert the)\b/i;

export function templateNamedIn(text: string): TemplateKey | null {
  if (!PATTERN_WORD.test(text)) return null;
  for (const [re, key] of TEMPLATE_WORDS) if (re.test(text)) return key;
  return null;
}
