import { z } from "zod";
import {
  ACCENTS,
  DEFAULT_HERO,
  KINDS,
  SECTIONS,
  createElement,
  emptyDesign,
  kindsFor,
} from "@/lib/design/catalog";
import { ICON_NAMES } from "@/lib/design/icons";
import type {
  Accent,
  Design,
  Element,
  Kind,
  Mode,
  Section,
} from "@/lib/design/types";

const ALL_KINDS = Object.keys(KINDS) as [Kind, ...Kind[]];
const ALL_SECTIONS = [
  ...new Set([...Object.keys(SECTIONS.card), ...Object.keys(SECTIONS.hero)]),
] as [Section, ...Section[]];

export const DraftSchema = z.object({
  name: z
    .string()
    .describe("A short name for this design, e.g. 'Personal hero'"),
  mode: z.enum(["card", "hero"]),
  accent: z.enum(Object.keys(ACCENTS) as [Accent, ...Accent[]]),
  hero: z
    .object({
      layout: z.enum(["centered", "left", "split"]),
      background: z.enum(["solid", "aurora", "mesh", "glow", "dots", "grid"]),
      theme: z.enum(["light", "dark"]),
      height: z.enum(["compact", "tall", "full"]),
      intensity: z.number().int().min(1).max(5),
    })
    .nullable()
    .describe("Hero settings. Null for a card."),
  elements: z.array(
    z.object({
      kind: z.enum(ALL_KINDS),
      section: z.enum(ALL_SECTIONS),
      text: z.string().nullable(),
      label: z.string().nullable(),
      placeholder: z.string().nullable(),
      variant: z
        .enum(["default", "secondary", "outline", "ghost", "link"])
        .nullable(),
      icon: z.enum(ICON_NAMES as [string, ...string[]]).nullable(),
      emphasis: z
        .string()
        .nullable()
        .describe("A word inside the headline to show as a link, if asked"),
      checked: z.boolean().nullable(),
    }),
  ),
  note: z
    .string()
    .describe(
      "One short sentence naming anything asked for that isn't in the kit, or what placeholder content you added. Empty if nothing.",
    ),
});
export type Draft = z.infer<typeof DraftSchema>;

export function kitDescription(): string {
  const block = (mode: Mode) =>
    [
      `${mode.toUpperCase()} parts (section: meaning):`,
      ...Object.entries(SECTIONS[mode]).map(([k, v]) => `  ${k}: ${v}`),
      `${mode.toUpperCase()} components (kind: meaning, default section):`,
      ...kindsFor(mode).map(
        (k) => `  ${k}: ${KINDS[k].describe} (default: ${KINDS[k].home[mode]})`,
      ),
    ].join("\n");
  return [block("card"), block("hero"), `Icons: ${ICON_NAMES.join(", ")}`].join(
    "\n\n",
  );
}

export function draftToDesign(
  draft: Draft,
  mode: Mode,
): { design: Design; dropped: number } {
  const allowed = kindsFor(mode);
  const slots = Object.keys(SECTIONS[mode]) as Section[];
  let dropped = 0;
  const elements: Element[] = [];

  for (const d of draft.elements) {
    if (!allowed.includes(d.kind)) {
      dropped++;
      continue;
    }
    const section = slots.includes(d.section)
      ? d.section
      : KINDS[d.kind].home[mode]!;
    const base = createElement(d.kind, section, {
      value: d.text ?? d.label ?? null,
      icon: d.icon,
    });
    const el: Element = {
      ...base,
      ...(d.label && { label: d.label }),
      ...(d.placeholder && { placeholder: d.placeholder }),
      ...(d.variant && d.kind === "button" && { variant: d.variant }),
      ...(d.icon &&
        (d.kind === "icon" || d.kind === "button") && { icon: d.icon }),
      ...(d.emphasis &&
        d.text?.toLowerCase().includes(d.emphasis.toLowerCase()) && {
          emphasis: d.emphasis,
        }),
      ...(d.checked !== null &&
        (d.kind === "checkbox" || d.kind === "switch") && {
          checked: d.checked,
        }),
    };
    if (d.kind === "icon") delete el.text;
    elements.push(el);
  }

  const order = slots;
  elements.sort((a, b) => order.indexOf(a.section) - order.indexOf(b.section));

  const base = emptyDesign(mode);
  const design: Design = {
    ...base,
    name: draft.name || base.name,
    accent: draft.accent,
    ...(mode === "hero" && {
      hero: { ...DEFAULT_HERO, ...(draft.hero ?? {}) },
    }),
    elements,
  };
  return { design, dropped };
}

export type ComposeResponse = {
  draft: Draft;
  ms: number;
  model: string;
  usage: { input_tokens: number; output_tokens: number };
  costUsd: number;
};
