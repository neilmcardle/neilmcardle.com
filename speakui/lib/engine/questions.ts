import {
  ACCENTS,
  DENSITIES,
  FOOTER_ALIGNS,
  HERO_BACKGROUNDS,
  HERO_HEIGHTS,
  HERO_LAYOUTS,
  HERO_THEMES,
  KINDS,
  SECTIONS,
  WIDTHS,
  describeElement,
  ALL_KINDS,
  kindsFor,
} from "@/lib/design/catalog";
import { ICONS, ICON_NAMES } from "@/lib/design/icons";
import { TEMPLATES } from "@/lib/design/templates";
import {
  modeOf,
  type Design,
  type Mode,
  type PointerTarget,
} from "@/lib/design/types";
import type { ChoiceQuestion, JevRequest, NoulQuestion, Question } from "./jev";

export const ACTIONS = {
  add: "Add one or a few new components to what's already there",
  remove: "Remove, delete or get rid of an existing component",
  edit_text:
    "Change the words of a component: its text, label, title, headline or placeholder",
  restyle:
    "Change how one component looks: width, size, button style, colour, icon, emphasis, input type, required",
  move: "Move an existing component somewhere else: above/below another, or to another part",
  set_checked:
    "Check or uncheck a checkbox, or turn a switch on/off, by default",
  design:
    "Change the whole thing: colour, spacing, width, background, light/dark theme, layout, height",
  template:
    "Start fresh from a named pattern: invite, login, sign-up, settings, feedback, checkout card, or a personal, launch, split or waitlist hero",
  compose:
    "Describe a whole new card, hero section or page from scratch, listing several parts it should have",
  undo: "Undo, go back or revert the last change",
  redo: "Redo the change that was just undone",
  clear: "Clear everything, empty the canvas, start over from scratch",
  none: "Not a design instruction: chatter, filler, a question, thinking aloud, or too incomplete to act on",
} as const;
export type Action = keyof typeof ACTIONS;

export const STYLES = {
  full_width: "Make it full width / stretch it across",
  auto_width: "Make it fit its content / not full width",
  variant_default: "Solid primary button style",
  variant_secondary: "Secondary / subtle / grey button style",
  variant_outline: "Outline / bordered button style",
  variant_ghost: "Ghost / borderless / minimal button style",
  variant_destructive: "Destructive / danger / red warning style",
  variant_link: "Link / text-only style",
  larger: "Bigger / larger / more prominent",
  smaller: "Smaller / less prominent",
  colour: "Change its colour",
  icon: "Give it an icon, or change its icon",
  emphasis: "Make one word stand out: a link, underlined or highlighted word",
  convert:
    "Turn it into a different kind of component, e.g. a checkbox into a switch, a field into a text area",
  type_email: "Make the field an email field",
  type_masked: "Make the field a password field (hidden characters)",
  type_number: "Make the field a number field",
  type_text: "Make the field plain text",
  required: "Mark as required / mandatory",
  optional: "Mark as optional / not required",
} as const;
export type Style = keyof typeof STYLES;

export const PLACEMENTS = {
  natural: "Wherever it naturally belongs: the end of its part",
  before_anchor: "Directly above / before a specific component",
  after_anchor: "Directly below / after / under a specific component",
  top_of_section: "At the very top / start of its part",
  bottom_of_section: "At the very bottom / end of its part",
} as const;
export type PlacementChoice = keyof typeof PLACEMENTS;

export const FIELDS = {
  main: "The main visible words: button text, heading, label, link text",
  placeholder: "The placeholder: faint hint text inside an empty input",
} as const;

const DESIGN_PROPS: Record<Mode, Record<string, string>> = {
  card: {
    accent: "Accent / brand / primary colour",
    density: "Spacing, padding, density, how cramped or roomy it feels",
    width: "How wide the card is",
    footer_align: "How the footer buttons are aligned",
  },
  hero: {
    accent:
      "Accent / brand / primary colour, including the background's colour",
    background:
      "The background effect: aurora, gradient, glow, an animated shader, dots, grid or plain",
    theme: "Light or dark",
    layout: "Centred, left-aligned, or split with an image",
    height: "How tall the hero is",
    intensity: "How strong or subtle the background effect is",
  },
};

export const NEW_MODES = {
  card: "A single card, form, dialog or settings panel",
  hero: "A hero section, landing page top, homepage header or website intro",
} as const;

export const INTENSITY = [
  "Very subtle, barely there",
  "Subtle",
  "Balanced",
  "Strong",
  "Very bold and vivid",
];

export type EvalContext = {
  pointer: PointerTarget | null;
  lastAddedId: string | null;

  preview?: boolean;
};

function choice(
  instructions: string,
  criteria: Record<string, string>,
): ChoiceQuestion {
  return { type: "choice", instructions, criteria };
}

function noul(instructions: string, yes: string, no: string): NoulQuestion {
  return { type: "noul", instructions, criteria: { true: yes, false: no } };
}

export function capabilities(mode: Mode, empty = false): string {
  if (empty)
    return `an empty canvas, which can hold: ${ALL_KINDS.map((k) => KINDS[k].noun).join(", ")}`;
  const kinds = kindsFor(mode).map((k) => KINDS[k].noun);
  return mode === "card"
    ? `a single card with: ${kinds.join(", ")}`
    : `a hero section with a background effect and: ${kinds.join(", ")}`;
}

export function describeCanvas(design: Design, ctx: EvalContext) {
  const pointerId = ctx.pointer?.type === "element" ? ctx.pointer.id : null;
  const pointerEl = pointerId
    ? design.elements.find((e) => e.id === pointerId)
    : null;
  const recent = design.elements.find((e) => e.id === ctx.lastAddedId);
  const mode = modeOf(design);
  return {
    canvas: {
      mode: mode === "hero" ? "hero section" : "card",
      name: design.name,
      accent: design.accent,
      ...(mode === "card"
        ? {
            density: design.density,
            width: design.width,
            footer_alignment: design.footerAlign,
          }
        : { ...design.hero }),
      components: design.elements.map((e) => ({
        id: e.id,
        kind: e.kind,
        part: e.section,
        ...(e.text !== undefined && { text: e.text }),
        ...(e.label !== undefined && { label: e.label }),
        ...(e.placeholder !== undefined && { placeholder: e.placeholder }),
        ...(e.icon && { icon: e.icon }),
        ...(e.variant && { style: e.variant }),
        ...(e.fullWidth && { full_width: true }),
        ...(e.checked !== undefined && { checked: e.checked }),
      })),
    },
    can_build: capabilities(mode, !design.elements.length),
    pointer_is_on: pointerEl
      ? `${describeElement(pointerEl)} (id ${pointerEl.id})`
      : ctx.pointer?.type === "card"
        ? "the whole canvas"
        : "nothing",
    most_recently_added: recent
      ? `${describeElement(recent)} (id ${recent.id})`
      : "nothing",
  };
}

export function buildJevRequest(
  transcript: string,
  clauses: string[],
  design: Design,
  ctx: EvalContext,
): JevRequest {
  const mode = modeOf(design);
  const questions: Record<string, Question> = {};

  const elementOptions = (i: number, extra: Record<string, string>) => {
    const opts: Record<string, string> = {};
    for (const e of design.elements) {
      const notes = [
        ctx.pointer?.type === "element" && ctx.pointer.id === e.id
          ? "under the pointer"
          : null,
        ctx.lastAddedId === e.id ? "most recently added" : null,
      ].filter(Boolean);
      opts[e.id] =
        `The ${describeElement(e)} in the ${e.section}${notes.length ? ` (${notes.join(", ")})` : ""}`;
    }
    if (i > 0)
      opts.earlier =
        "A component that an earlier instruction in this same request is adding";
    return { ...opts, ...extra };
  };

  clauses.forEach((clause, i) => {
    const q = (name: string) => `c${i}_${name}`;
    const about = `Instruction ${i + 1} of ${clauses.length}: “${clause}”.`;

    questions[q("action")] = choice(
      `${about} What kind of change does this instruction ask for?`,
      { ...ACTIONS },
    );

    questions[q("supported")] = noul(
      `${about} The canvas can only build ${capabilities(mode, !design.elements.length)}. Starting a new card or hero is always possible. Can this instruction be done with only those parts?`,
      "Yes, it only needs those parts, or it starts something new",
      "No, it needs something not in that list",
    );

    questions[q("target")] = choice(
      `${about} Which existing component does it refer to or change? “this”, “that” or “it” usually means the one under the pointer.`,
      elementOptions(i, {
        card: "The whole canvas, not one component",
        none: "No existing component is referred to",
      }),
    );

    questions[q("component")] = choice(
      `${about} If a component is being added, which kind fits best?`,
      Object.fromEntries(
        (design.elements.length ? kindsFor(mode) : ALL_KINDS).map((k) => [
          k,
          KINDS[k].describe,
        ]),
      ),
    );

    questions[q("section")] = choice(
      `${about} Which part should the new or moved component go in?`,
      { ...SECTIONS[mode] } as Record<string, string>,
    );

    questions[q("placement")] = choice(
      `${about} Where exactly within that part?`,
      { ...PLACEMENTS },
    );

    questions[q("anchor")] = choice(
      `${about} If it says above/below/before/after another component, which one is that reference point?`,
      elementOptions(i, { none: "No reference component is mentioned" }),
    );

    questions[q("field")] = choice(
      `${about} If text is being changed, which text?`,
      { ...FIELDS },
    );

    questions[q("style")] = choice(
      `${about} If a component's look is changing, which change?`,
      { ...STYLES },
    );

    questions[q("checked")] = noul(
      `${about} If a checkbox or switch's default state is being set, should it end up checked / on?`,
      "Checked, ticked, on, enabled, selected by default",
      "Unchecked, unticked, off, disabled, not selected",
    );

    questions[q("design_prop")] = choice(
      `${about} If the whole thing is changing, which property?`,
      DESIGN_PROPS[mode],
    );

    questions[q("accent")] = choice(
      `${about} If a colour is mentioned, which accent colour?`,
      Object.fromEntries(Object.entries(ACCENTS).map(([k, v]) => [k, v.label])),
    );

    if (mode === "card") {
      questions[q("density")] = choice(
        `${about} If spacing is changing, which density?`,
        { ...DENSITIES },
      );
      questions[q("width")] = choice(
        `${about} If the card's width is changing, which width?`,
        { ...WIDTHS },
      );
      questions[q("footer_align")] = choice(
        `${about} If footer alignment is changing, which alignment?`,
        { ...FOOTER_ALIGNS },
      );
    } else {
      questions[q("background")] = choice(
        `${about} If the background is changing, which effect?`,
        { ...HERO_BACKGROUNDS },
      );
      questions[q("theme")] = choice(
        `${about} If light or dark is mentioned, which?`,
        { ...HERO_THEMES },
      );
      questions[q("layout")] = choice(
        `${about} If the layout is changing, which layout?`,
        { ...HERO_LAYOUTS },
      );
      questions[q("height")] = choice(
        `${about} If the height is changing, which height?`,
        { ...HERO_HEIGHTS },
      );
      questions[q("intensity")] = {
        type: "score",
        instructions: `${about} If the background's strength is changing, how strong should it be?`,
        criteria: INTENSITY,
      };
      questions[q("icon")] = choice(
        `${about} If an icon is mentioned, which one fits best?`,
        Object.fromEntries(ICON_NAMES.map((n) => [n, ICONS[n].label])),
      );
    }

    questions[q("template")] = choice(
      `${about} If starting from a pattern, which one?`,
      Object.fromEntries(
        Object.entries(TEMPLATES).map(([k, v]) => [k, v.describe]),
      ),
    );

    questions[q("new_mode")] = choice(
      `${about} If something new is being started or described, is it a card or a hero section?`,
      { ...NEW_MODES },
    );
  });

  return {
    state: {
      spoken_request: transcript,
      instructions: clauses.map((c, i) => `${i + 1}. ${c}`),
      ...describeCanvas(design, ctx),
    },
    questions,
  };
}
