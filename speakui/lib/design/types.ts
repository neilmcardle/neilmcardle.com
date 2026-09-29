export type Mode = "card" | "hero";

export type CardKind =
  | "heading"
  | "text"
  | "input"
  | "textarea"
  | "select"
  | "checkbox"
  | "switch"
  | "button"
  | "badge"
  | "separator";
export type HeroOnlyKind =
  | "logo"
  | "link"
  | "eyebrow"
  | "headline"
  | "avatar"
  | "image"
  | "brand"
  | "icon"
  | "scroll";
export type Kind = CardKind | HeroOnlyKind;

export type CardSection = "header" | "body" | "footer";
export type HeroSlot =
  "nav-left" | "nav-right" | "main" | "actions" | "proof" | "media" | "bottom";
export type Section = CardSection | HeroSlot;

export type ButtonVariant =
  "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";

export type Size = "sm" | "md" | "lg";
export type InputType = "text" | "email" | "password" | "number";

export type Accent =
  | "neutral"
  | "blue"
  | "green"
  | "violet"
  | "rose"
  | "orange"
  | "amber"
  | "teal";

export type Density = "compact" | "comfortable" | "spacious";
export type CardWidth = "narrow" | "medium" | "wide";
export type FooterAlign = "start" | "end" | "between" | "stretch";

export type HeroLayout = "centered" | "left" | "split";
export type HeroBackground =
  "solid" | "aurora" | "mesh" | "glow" | "shader" | "dots" | "grid";
export type HeroTheme = "light" | "dark";
export type HeroHeight = "compact" | "tall" | "full";

export type HeroSettings = {
  layout: HeroLayout;
  background: HeroBackground;
  theme: HeroTheme;
  height: HeroHeight;

  intensity: number;
};

export type Element = {
  id: string;
  kind: Kind;
  section: Section;

  text?: string;

  label?: string;
  placeholder?: string;
  inputType?: InputType;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  size?: Size;
  checked?: boolean;
  required?: boolean;

  icon?: string;

  emphasis?: string;
};

export type Design = {
  mode?: Mode;
  name: string;
  accent: Accent;
  density: Density;
  width: CardWidth;
  footerAlign: FooterAlign;
  hero?: HeroSettings;
  elements: Element[];
};

export const modeOf = (d: Design): Mode => d.mode ?? "card";

export type PointerTarget = { type: "element"; id: string } | { type: "card" };
