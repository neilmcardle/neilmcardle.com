import {
  ALL_KINDS,
  KINDS,
  SECTION_NAMES,
  backgroundNamedIn,
  capitalise,
  colourNamedIn,
  createElement,
  describeElement,
  emptyDesign,
  kindsFor,
  modeForKind,
} from "@/lib/design/catalog";
import { ICON_NAMES } from "@/lib/design/icons";
import {
  findElement,
  insertElement,
  moveElement,
  removeElement,
  updateElement,
  type Placement,
} from "@/lib/design/ops";
import {
  PATTERN_WORD,
  TEMPLATES,
  templateNamedIn,
  type TemplateKey,
} from "@/lib/design/templates";
import {
  modeOf,
  type Accent,
  type CardWidth,
  type Density,
  type Design,
  type Element,
  type FooterAlign,
  type HeroBackground,
  type HeroHeight,
  type HeroLayout,
  type HeroTheme,
  type Kind,
  type Mode,
  type Section,
} from "@/lib/design/types";
import type { Answer } from "./jev";
import { namesComponent, parseClause, splitList, type Explicit } from "./parse";
import type { Action, EvalContext, PlacementChoice, Style } from "./questions";

export type Source =
  "Your words" | "Jev" | "Claude" | "Parser" | "Pointer" | "Recent" | "Code";

export type Step = {
  label: string;
  value: string;
  detail?: string;
  source: Source;

  confidence?: number;
};

export type ClauseStatus =
  "applied" | "incomplete" | "unclear" | "not_ui" | "unsupported";

export type ClauseResult = {
  clause: string;
  action: Action | null;
  status: ClauseStatus;
  steps: Step[];
  summary: string;
};

export type Command = "undo" | "redo" | "clear" | "compose";

export type ApplyOutcome = {
  design: Design;
  clauses: ClauseResult[];
  command: Command | null;

  commandMode?: Mode;

  deferred?: boolean;
  lastAddedId: string | null;

  compose?: { mode: Mode; fallback: TemplateKey | null };
};

const ACTION_LABELS: Record<Action, string> = {
  add: "Add a component",
  remove: "Remove a component",
  edit_text: "Change text",
  restyle: "Restyle a component",
  move: "Move a component",
  set_checked: "Set the default state",
  design: "Change the whole design",
  template: "Start from a pattern",
  compose: "Draft something new from your description",
  undo: "Undo",
  redo: "Redo",
  clear: "Clear the canvas",
  none: "Not a design instruction",
};

const MIN_ACTION_CONFIDENCE = 0.4;
const MIN_TARGET_CONFIDENCE = 0.35;

type Picked = { choice: string | null; p: number };

function pick(answers: Record<string, Answer>, key: string): Picked {
  const a = answers[key];
  if (!a || a.type !== "choice") return { choice: null, p: 0 };
  return {
    choice: a.choice,
    p: a.probabilities?.[a.choice] ?? a.confidence ?? 0,
  };
}

function noulValue(
  answers: Record<string, Answer>,
  key: string,
): number | null {
  const a = answers[key];
  return a && a.type === "noul" ? a.noul : null;
}

const HERO_WORDS =
  /\b(?:hero|landing|homepage|home page|web ?page|website|site|section|header)\b/i;

function asksForCanvas(clause: string): boolean {
  const creates =
    /\b(?:start|create|new|make|build|open|set up|give me|i want|i'?d like)\b/i.test(
      clause,
    );
  return creates && (HERO_WORDS.test(clause) || /\bcard\b/i.test(clause));
}

const pct = (p: number) => `${Math.round(p * 100)}%`;

export function applyAnswers(
  clauses: string[],
  answers: Record<string, Answer>,
  committed: Design,
  ctx: EvalContext,
): ApplyOutcome {
  let design = committed;
  let lastAddedId = ctx.lastAddedId;
  let addedThisRequest: string | null = null;
  let command: Command | null = null;
  let commandMode: Mode | undefined;
  let deferred = false;
  let compose: ApplyOutcome["compose"];
  const results: ClauseResult[] = [];

  clauses.forEach((clause, i) => {
    const key = (name: string) => `c${i}_${name}`;
    const act = pick(answers, key("action"));
    const action = (act.choice as Action | null) ?? null;
    const mode = modeOf(design);

    const blank = design.elements.length === 0;
    const parsed = parseClause(
      clause,
      action ?? undefined,
      blank ? "all" : mode,
    );
    const steps: Step[] = [
      { label: "Read request", value: clause, source: "Your words" },
    ];

    const finish = (status: ClauseStatus, summary: string) => {
      steps.push({ label: "Result", value: summary, source: "Code" });
      results.push({ clause, action, status, steps, summary });
    };

    const blankCanvas = () => {
      if (ctx.preview) {
        deferred = true;
        return finish("incomplete", "Will start a new canvas when you pause");
      }
      if (!asksForCanvas(clause))
        return finish(
          "unclear",
          "Name the parts to build, or say “start a hero section”",
        );
      const newMode: Mode = HERO_WORDS.test(clause)
        ? "hero"
        : /\bcard\b/i.test(clause)
          ? "card"
          : mode;
      command = "clear";
      commandMode = newMode;
      steps.push({
        label: "Canvas",
        value: newMode === "hero" ? "Empty hero section" : "Empty card",
        source: "Parser",
      });
      return finish(
        "applied",
        `Started an empty ${newMode === "hero" ? "hero section" : "card"}`,
      );
    };

    if (!action) return finish("unclear", "No answer from Jev");
    steps.push({
      label: "Choose action",
      value: ACTION_LABELS[action],
      source: "Jev",
      confidence: act.p,
    });
    if (action === "none") return finish("not_ui", "Nothing to change");

    const namesPattern =
      (action === "template" || action === "compose") &&
      templateNamedIn(clause);

    const namesCanvas =
      ["template", "compose", "clear"].includes(action) &&
      asksForCanvas(clause);
    if (act.p < MIN_ACTION_CONFIDENCE && !namesPattern && !namesCanvas)
      return finish("unclear", `Not confident enough to act (${pct(act.p)})`);

    if (namesPattern) {
      if (ctx.preview) {
        deferred = true;
        return finish(
          "incomplete",
          `Will load “${TEMPLATES[namesPattern].describe.split(":")[0].trim()}” when you pause`,
        );
      }
      const tpl = TEMPLATES[namesPattern];
      design = tpl.build();
      lastAddedId = null;
      if (tpl.mode === "hero")
        steps.push({ label: "Canvas", value: "Hero section", source: "Code" });
      steps.push({
        label: "Choose pattern",
        value: tpl.describe.split(":")[0].trim(),
        detail: "You named it",
        source: "Parser",
      });
      return finish("applied", `Started “${design.name}”`);
    }

    const editing = !["template", "compose", "undo", "redo", "clear"].includes(
      action,
    );
    const heroOnly =
      !blank && mode === "card" && !parsed.kind
        ? parseClause(clause, action, "hero").kind
        : null;
    if (editing && heroOnly && !kindsFor("card").includes(heroOnly)) {
      steps.push({
        label: "Check it's possible",
        value: `A ${KINDS[heroOnly].noun} only exists in hero sections`,
        source: "Parser",
      });
      return finish(
        "unsupported",
        "That needs a hero section. Say “start a hero section” or describe the hero you want.",
      );
    }
    const supported = noulValue(answers, key("supported"));
    if (editing && !blank && supported !== null && supported < 0.3) {
      steps.push({
        label: "Check it's possible",
        value: "Needs parts this canvas doesn't have",
        source: "Jev",
        confidence: 1 - supported,
      });
      const heroWords =
        mode === "card" &&
        parseClause(clause, action, "hero").kind &&
        !parsed.kind;
      return finish(
        "unsupported",
        heroWords
          ? "That needs a hero section. Say “start a hero section” or describe the hero you want."
          : `That isn't in the ${mode} kit yet, so nothing changed`,
      );
    }

    const resolveTarget = (
      opts: { allowCard?: boolean; kinds?: Kind[] } = {},
    ): { el: Element | null; card: boolean } => {
      const t = pick(answers, key("target"));
      const pointerEl =
        ctx.pointer?.type === "element"
          ? findElement(design, ctx.pointer.id)
          : undefined;
      const jevEl = t.choice ? findElement(design, t.choice) : undefined;
      const fits = (el?: Element) =>
        !!el && (!opts.kinds || opts.kinds.includes(el.kind));
      const say = (
        el: Element,
        source: Source,
        detail: string,
        confidence?: number,
      ) => {
        steps.push({
          label: "Resolve target",
          value: describeElement(el),
          detail: `${detail} · ${el.section}`,
          source,
          confidence,
        });
        return { el, card: false };
      };

      const earlier = addedThisRequest
        ? findElement(design, addedThisRequest)
        : undefined;
      if (
        earlier &&
        fits(earlier) &&
        (t.choice === "earlier" || parsed.deictic)
      ) {
        return say(earlier, "Recent", "Added earlier in this request");
      }
      if (opts.allowCard && t.choice === "card" && t.p >= 0.5) {
        steps.push({
          label: "Resolve target",
          value: "The whole card",
          source: "Jev",
          confidence: t.p,
        });
        return { el: null, card: true };
      }

      if (fits(pointerEl)) {
        const lower = clause.toLowerCase();

        const naming = parsed.value
          ? lower.replace(parsed.value.toLowerCase(), " ")
          : lower;
        const namesKind = parsed.kind && pointerEl!.kind !== parsed.kind;

        const namesOther = design.elements.some(
          (e) =>
            e.id !== pointerEl!.id &&
            [e.text, e.label].some(
              (w) => w && w.length > 2 && naming.includes(w.toLowerCase()),
            ),
        );
        if (!namesKind && !namesOther) {
          return say(
            pointerEl!,
            "Pointer",
            parsed.deictic
              ? "“this/it” → pointer"
              : "Under the pointer, nothing else named",
          );
        }
      }
      if (fits(jevEl) && t.p >= MIN_TARGET_CONFIDENCE)
        return say(jevEl!, "Jev", "Named in request", t.p);
      if (fits(pointerEl))
        return say(pointerEl!, "Pointer", "Under the pointer");
      const recent = findElement(design, lastAddedId);
      if (fits(recent) && (!parsed.kind || recent!.kind === parsed.kind))
        return say(recent!, "Recent", "Most recently added");
      const kinds = opts.kinds ?? (parsed.kind ? [parsed.kind] : null);
      if (kinds) {
        const only = design.elements.filter((e) => kinds.includes(e.kind));
        if (only.length === 1)
          return say(only[0], "Code", `The only ${KINDS[only[0].kind].noun}`);
      }
      if (opts.allowCard && t.choice === "card") {
        steps.push({
          label: "Resolve target",
          value: "The whole card",
          source: "Jev",
          confidence: t.p,
        });
        return { el: null, card: true };
      }
      return { el: null, card: false };
    };

    const placementOf = (): {
      section: Section | null;
      placement: Placement;
      anchor: Element | null;
      sectionConf: number;
    } => {
      const sec = pick(answers, key("section"));
      const pl = pick(answers, key("placement"));
      const an = pick(answers, key("anchor"));
      const anchor =
        an.choice === "earlier" && addedThisRequest
          ? (findElement(design, addedThisRequest) ?? null)
          : an.p >= 0.4
            ? (findElement(design, an.choice) ?? null)
            : null;
      const map: Record<PlacementChoice, Placement> = {
        natural: "end",
        before_anchor: "before",
        after_anchor: "after",
        top_of_section: "start",
        bottom_of_section: "end",
      };
      let placement = map[(pl.choice as PlacementChoice) ?? "natural"] ?? "end";
      if ((placement === "before" || placement === "after") && !anchor)
        placement = "end";
      return {
        section: (sec.choice as Section) ?? null,
        placement,
        anchor: placement === "before" || placement === "after" ? anchor : null,
        sectionConf: sec.p,
      };
    };

    const valueStep = (value: string, via: string | null) =>
      steps.push({
        label: "Extract text",
        value: `“${value}”`,
        detail: via ? `Matched ${via}` : undefined,
        source: "Parser",
      });

    const emphasised =
      parsed.emphasis && ["restyle", "edit_text", "add"].includes(action)
        ? design.elements.find(
            (e) =>
              e.text?.toLowerCase().includes(parsed.emphasis!.toLowerCase()) &&
              e.kind !== "link",
          )
        : undefined;
    if (emphasised) {
      const words = emphasised.text!;
      const at = words.toLowerCase().indexOf(parsed.emphasis!.toLowerCase());
      steps.push({
        label: "Resolve target",
        value: describeElement(emphasised),
        detail: "It contains that word",
        source: "Parser",
      });
      valueStep(parsed.emphasis!, "“make … a link”");
      design = updateElement(design, emphasised.id, {
        emphasis: words.slice(at, at + parsed.emphasis!.length),
      });
      return finish("applied", `“${parsed.emphasis}” now stands out`);
    }

    switch (action) {
      case "undo":
      case "redo":
      case "clear":
        command = action;
        return finish("applied", ACTION_LABELS[action]);

      case "template": {
        const t = pick(answers, key("template"));
        const named = templateNamedIn(clause);

        const tpl = named
          ? TEMPLATES[named]
          : PATTERN_WORD.test(clause)
            ? TEMPLATES[t.choice as TemplateKey]
            : undefined;
        if (!tpl) return blankCanvas();
        if (ctx.preview) {
          deferred = true;
          return finish(
            "incomplete",
            `Will load “${tpl.describe.split(":")[0].trim()}” when you pause`,
          );
        }
        design = tpl.build();
        lastAddedId = null;
        if (tpl.mode === "hero")
          steps.push({
            label: "Canvas",
            value: "Hero section",
            source: "Code",
          });
        steps.push(
          named
            ? {
                label: "Choose pattern",
                value: tpl.describe.split(":")[0].trim(),
                detail: "You named it",
                source: "Parser",
              }
            : {
                label: "Choose pattern",
                value: tpl.describe.split(":")[0].trim(),
                source: "Jev",
                confidence: t.p,
              },
        );
        return finish("applied", `Started “${design.name}”`);
      }

      case "compose": {
        const m = pick(answers, key("new_mode"));
        const heroNamed = HERO_WORDS.test(clause);
        const newMode: Mode = heroNamed ? "hero" : ((m.choice as Mode) ?? mode);

        if (!namesComponent(clause)) return blankCanvas();
        steps.push({
          label: "Canvas",
          value: newMode === "hero" ? "Hero section" : "Card",
          source: heroNamed ? "Parser" : "Jev",
          confidence: heroNamed ? undefined : m.p,
        });
        const t = pick(answers, key("template"));
        const guess =
          templateNamedIn(clause) ?? (t.choice as TemplateKey | null);
        const fallback =
          guess &&
          TEMPLATES[guess]?.mode === (newMode === "hero" ? "hero" : undefined)
            ? guess
            : null;
        command = "compose";
        compose = { mode: newMode, fallback };
        return finish(
          "applied",
          `Drafting a ${newMode === "hero" ? "hero section" : "card"} from your description`,
        );
      }

      case "add": {
        const comp = pick(answers, key("component"));

        const allowed = blank ? ALL_KINDS : kindsFor(mode);
        let kind: Kind | null = null;

        const contested =
          blank &&
          !!comp.choice &&
          comp.choice !== parsed.kind &&
          comp.p >= 0.5 &&
          allowed.includes(comp.choice as Kind);
        if (parsed.kind && !contested && allowed.includes(parsed.kind)) {
          kind = parsed.kind;
          steps.push({
            label: "Choose component",
            value: capitalise(KINDS[kind].noun),
            detail: "You named it",
            source: "Parser",
          });
        } else if (comp.choice && allowed.includes(comp.choice as Kind)) {
          kind = comp.choice as Kind;
          steps.push({
            label: "Choose component",
            value: capitalise(KINDS[kind].noun),
            source: "Jev",
            confidence: comp.p,
          });
        }
        if (!kind) return finish("unclear", "Couldn't tell what to add");

        let kindMode = mode;
        if (blank) {
          kindMode = modeForKind(kind) ?? "card";
          if (kindMode !== mode) {
            design = {
              ...design,
              mode: kindMode,
              ...(kindMode === "hero"
                ? { hero: emptyDesign("hero").hero }
                : {}),
            };
            steps.push({
              label: "Canvas",
              value: kindMode === "hero" ? "Hero section" : "Card",
              detail: `A ${KINDS[kind].noun} belongs to a ${kindMode}`,
              source: "Parser",
            });
          }
        }

        const pos = placementOf();
        let section: Section;
        if (pos.anchor) section = pos.anchor.section;
        else if (
          pos.section &&
          pos.sectionConf >= 0.5 &&
          pos.section in (SECTION_NAMES as object)
        )
          section = pos.section;
        else section = KINDS[kind].home[kindMode]!;

        const textual = [
          "heading",
          "text",
          "button",
          "badge",
          "checkbox",
          "switch",
          "headline",
          "eyebrow",
          "logo",
          "link",
          "brand",
        ].includes(kind);
        const value = parsed.value ?? (textual ? parsed.trailing : null);
        if (value)
          valueStep(
            value,
            parsed.value ? parsed.via : "words after the component",
          );

        const listy =
          kind === "link" ||
          kind === "brand" ||
          kind === "button" ||
          kind === "badge";
        const many = listy && value ? splitList(value) : null;
        let items: { value: string | null; icon?: string | null }[];
        if (kind === "icon") {
          const named = parsed.icons.length ? parsed.icons : [];
          const j = pick(answers, key("icon"));
          const count = countIn(clause);
          const picks = named.length
            ? named
            : j.choice && ICON_NAMES.includes(j.choice) && j.p >= 0.4
              ? [j.choice]
              : [];
          const icons = picks.length
            ? picks
            : DEFAULT_ICONS.slice(0, count ?? 1);
          steps.push({
            label: "Choose icons",
            value: icons.join(", "),
            source: named.length ? "Parser" : picks.length ? "Jev" : "Code",
            confidence: !named.length && picks.length ? j.p : undefined,
          });
          items = icons.map((icon) => ({ value: null, icon }));
        } else if (many && many.length > 1) {
          items = many.map((v) => ({ value: v }));
        } else if (
          !value &&
          kind === "link" &&
          /menu|nav|navigation|links|items/.test(parsed.phrase ?? "")
        ) {
          items = ["Work", "About", "Contact"].map((v) => ({ value: v }));
          steps.push({
            label: "Fill in",
            value: "Work, About, Contact",
            detail: "No link names given, so placeholders",
            source: "Code",
          });
        } else if (
          !value &&
          kind === "brand" &&
          /logos|row|strip|trusted/.test(parsed.phrase ?? "")
        ) {
          items = ["Northwind", "Lumen", "Harbor"].map((v) => ({ value: v }));
          steps.push({
            label: "Fill in",
            value: "Three placeholder logos",
            detail: "Say the company names to replace them",
            source: "Code",
          });
        } else {
          items = [
            {
              value,
              icon: kind === "button" ? (parsed.icons[0] ?? null) : null,
            },
          ];
        }

        let anchorId = pos.anchor?.id;
        let placement = pos.placement;
        let added: Element | null = null;

        if (
          kind === "brand" &&
          /trusted/.test(clause.toLowerCase()) &&
          !design.elements.some(
            (e) => e.kind === "eyebrow" && e.section === "proof",
          )
        ) {
          design = insertElement(
            design,
            createElement("eyebrow", "proof", { value: "Trusted by" }),
            "start",
          );
        }
        for (const item of items) {
          const el = createElement(kind, section, {
            value: item.value,
            modifier: item.value ? null : parsed.modifier,
            icon: item.icon,
          });
          design = insertElement(design, el, placement, anchorId);

          anchorId = el.id;
          placement = "after";
          added = added ?? el;
          lastAddedId = el.id;
        }
        steps.push({
          label: "Place it",
          value: pos.anchor
            ? `${pos.placement === "before" ? "Above" : "Below"} ${describeElement(pos.anchor)}`
            : `${capitalise(SECTION_NAMES[section])}, ${pos.placement === "start" ? "start" : "end"}`,
          source: pos.anchor || pos.sectionConf >= 0.5 ? "Jev" : "Code",
          confidence: pos.anchor
            ? undefined
            : pos.sectionConf >= 0.5
              ? pos.sectionConf
              : undefined,
        });
        addedThisRequest = added!.id;
        return finish(
          "applied",
          items.length > 1
            ? `Added ${items.length} ${KINDS[kind].noun}s`
            : `Added ${describeElement(added!)}`,
        );
      }

      case "remove": {
        if (mode === "hero" && design.hero && /\bbackground\b/i.test(clause)) {
          design = { ...design, hero: { ...design.hero, background: "solid" } };
          steps.push({
            label: "Choose property",
            value: "Background",
            source: "Parser",
          });
          return finish("applied", "Background → solid");
        }
        const { el } = resolveTarget();
        if (!el)
          return finish(
            "incomplete",
            "Which component? Point at it or name it",
          );

        const plural = /\b(?:them|these|those|both|all)\b/i.test(clause);
        const named = [el.text, el.label].some(
          (w) =>
            w && w.length > 2 && clause.toLowerCase().includes(w.toLowerCase()),
        );
        if (plural && !named && ctx.pointer?.type !== "element") {
          return finish(
            "incomplete",
            "Which ones? Name them, or remove them one at a time",
          );
        }
        design = removeElement(design, el.id);
        if (lastAddedId === el.id) lastAddedId = null;
        return finish("applied", `Removed ${describeElement(el)}`);
      }

      case "edit_text": {
        const listKind =
          parsed.kind && ["brand", "link", "icon"].includes(parsed.kind)
            ? parsed.kind
            : null;
        const items = parsed.value ? splitList(parsed.value) : [];
        if (
          listKind &&
          (items.length > 1 || parsed.via === "“replace … with …”")
        ) {
          const existing = design.elements.filter((e) => e.kind === listKind);
          const section = existing[0]?.section ?? KINDS[listKind].home[mode]!;
          valueStep(parsed.value!, parsed.via);
          const anchor = existing[0]
            ? design.elements[design.elements.indexOf(existing[0]) - 1]
            : undefined;
          design = {
            ...design,
            elements: design.elements.filter(
              (e) => e.kind !== listKind || e.section !== section,
            ),
          };
          let after = anchor?.id;
          for (const v of items) {
            const el = createElement(listKind, section, { value: v });
            design = insertElement(design, el, after ? "after" : "end", after);
            after = el.id;
            lastAddedId = el.id;
          }
          return finish(
            "applied",
            `Replaced ${existing.length} ${KINDS[listKind].noun}s with ${items.length}`,
          );
        }
        let { el } = resolveTarget({ allowCard: true });
        if (!el) el = design.elements.find((e) => e.kind === "heading") ?? null;
        if (!el)
          return finish(
            "incomplete",
            "Which component? Point at it or name it",
          );
        if (el.kind === "separator")
          return finish("unsupported", "Dividers have no text");
        if (!parsed.value)
          return finish(
            "incomplete",
            "Waiting for the new text: say “to say …”",
          );
        valueStep(parsed.value, parsed.via);

        const hasPlaceholder =
          el.kind === "input" || el.kind === "textarea" || el.kind === "select";
        const f = pick(answers, key("field"));
        const toPlaceholder =
          hasPlaceholder &&
          (parsed.mentionsPlaceholder ||
            (f.choice === "placeholder" && f.p >= 0.5));
        if (hasPlaceholder) {
          steps.push({
            label: "Choose field",
            value: toPlaceholder ? "Placeholder" : "Label",
            source: parsed.mentionsPlaceholder ? "Parser" : "Jev",
            confidence: parsed.mentionsPlaceholder ? undefined : f.p,
          });
        }
        const before = describeElement(el);
        const value = toPlaceholder ? parsed.value : capitalise(parsed.value);
        const patch: Partial<Element> = toPlaceholder
          ? { placeholder: value }
          : hasPlaceholder
            ? { label: value }
            : { text: value };
        design = updateElement(design, el.id, patch);
        return finish(
          "applied",
          `${before} → “${value}”${toPlaceholder ? " (placeholder)" : ""}`,
        );
      }

      case "restyle": {
        const s = pick(answers, key("style"));
        const emphasisTarget = parsed.emphasis
          ? design.elements.find((e) =>
              e.text?.toLowerCase().includes(parsed.emphasis!.toLowerCase()),
            )
          : undefined;

        const style = (emphasisTarget ? "emphasis" : s.choice) as Style | null;
        const withWord =
          style === "emphasis" && parsed.emphasis
            ? design.elements.find((e) =>
                e.text?.toLowerCase().includes(parsed.emphasis!.toLowerCase()),
              )
            : undefined;
        const resolved = withWord
          ? { el: withWord, card: false }
          : resolveTarget({ allowCard: true });
        if (withWord)
          steps.push({
            label: "Resolve target",
            value: describeElement(withWord),
            detail: "It contains that word",
            source: "Code",
          });
        const { el, card } = resolved;
        if (!style) return finish("unclear", "Couldn't tell which style");
        steps.push(
          emphasisTarget
            ? {
                label: "Choose style",
                value: "emphasis",
                detail: `“${parsed.emphasis}” is a word in the text`,
                source: "Parser",
              }
            : {
                label: "Choose style",
                value: style.replace(/_/g, " ").replace("variant ", ""),
                source: "Jev",
                confidence: s.p,
              },
        );

        if (style === "colour") {
          const a = pick(answers, key("accent"));
          if (!parsed.mentionsColour)
            return finish("unclear", "No colour was named, so nothing changed");

          const named = colourNamedIn(clause);
          const accent = named ?? (a.choice as Accent | null);
          if (!accent) return finish("unclear", "Couldn't tell which colour");
          design = { ...design, accent };
          steps.push(
            named
              ? {
                  label: "Choose colour",
                  value: capitalise(named),
                  detail: "Colour is set per card (accent)",
                  source: "Parser",
                }
              : {
                  label: "Choose colour",
                  value: capitalise(accent),
                  detail: "Colour is set per card (accent)",
                  source: "Jev",
                  confidence: a.p,
                },
          );
          return finish("applied", `Accent → ${a.choice}`);
        }
        if (card || !el) {
          if (style === "larger" || style === "smaller") {
            const order: CardWidth[] = ["narrow", "medium", "wide"];
            const idx = Math.max(
              0,
              Math.min(
                2,
                order.indexOf(design.width) + (style === "larger" ? 1 : -1),
              ),
            );
            if (mode === "hero") {
              const heights: HeroHeight[] = ["compact", "tall", "full"];
              const h =
                heights[
                  Math.max(
                    0,
                    Math.min(
                      2,
                      heights.indexOf(design.hero!.height) +
                        (style === "larger" ? 1 : -1),
                    ),
                  )
                ];
              design = { ...design, hero: { ...design.hero!, height: h } };
              return finish("applied", `Hero height → ${h}`);
            }
            design = { ...design, width: order[idx] };
            return finish("applied", `Card width → ${order[idx]}`);
          }
          return finish(
            "incomplete",
            "Which component? Point at it or name it",
          );
        }

        if (style === "convert") {
          const comp = pick(answers, key("component"));
          const to = (
            parsed.kind && parsed.kind !== el.kind ? parsed.kind : comp.choice
          ) as Kind | null;
          if (!to || !(to in KINDS) || to === el.kind)
            return finish("unclear", "Couldn't tell what to turn it into");
          const converted = convertElement(el, to);
          if (!converted)
            return finish(
              "unsupported",
              `Can't turn a ${KINDS[el.kind].noun} into a ${KINDS[to].noun}`,
            );
          steps.push({
            label: "Convert to",
            value: capitalise(KINDS[to].noun),
            source: parsed.kind === to ? "Parser" : "Jev",
            confidence: parsed.kind === to ? undefined : comp.p,
          });
          design = {
            ...design,
            elements: design.elements.map((e) =>
              e.id === el.id ? converted : e,
            ),
          };
          return finish(
            "applied",
            `${describeElement(el)} → ${KINDS[to].noun}`,
          );
        }

        if (style === "icon") {
          const j = pick(answers, key("icon"));
          const icon =
            parsed.icons[0] ??
            (j.choice && ICON_NAMES.includes(j.choice) ? j.choice : null);
          if (!icon) return finish("unclear", "Couldn't tell which icon");
          if (el.kind !== "icon" && el.kind !== "button")
            return finish(
              "unsupported",
              `A ${KINDS[el.kind].noun} can't have an icon`,
            );
          steps.push({
            label: "Choose icon",
            value: icon,
            source: parsed.icons[0] ? "Parser" : "Jev",
            confidence: parsed.icons[0] ? undefined : j.p,
          });
          design = updateElement(design, el.id, { icon });
          return finish("applied", `${describeElement(el)}: ${icon} icon`);
        }
        if (style === "emphasis") {
          const word = parsed.emphasis;
          const words = el.text ?? "";
          if (!word || !words.toLowerCase().includes(word.toLowerCase()))
            return finish("incomplete", "Which word? Say “make London a link”");
          valueStep(word, "“make … a link”");
          design = updateElement(design, el.id, {
            emphasis: words.slice(
              words.toLowerCase().indexOf(word.toLowerCase()),
              words.toLowerCase().indexOf(word.toLowerCase()) + word.length,
            ),
          });
          return finish("applied", `“${word}” now stands out`);
        }

        const patch = stylePatch(el, style);
        if (!patch)
          return finish(
            "unsupported",
            `Can't make a ${KINDS[el.kind].noun} ${style.replace(/_/g, " ").replace("variant ", "")}`,
          );
        design = updateElement(design, el.id, patch);
        return finish(
          "applied",
          `${describeElement(el)}: ${style.replace(/_/g, " ").replace("variant ", "")}`,
        );
      }

      case "move": {
        const { el } = resolveTarget();
        if (!el)
          return finish(
            "incomplete",
            "Which component? Point at it or name it",
          );
        const pos = placementOf();
        const anchor =
          pos.anchor && pos.anchor.id !== el.id ? pos.anchor : null;
        const section = anchor
          ? anchor.section
          : pos.section && pos.sectionConf >= 0.5
            ? pos.section
            : el.section;
        const next = moveElement(
          design,
          el.id,
          section,
          anchor
            ? pos.placement
            : pos.placement === "before" || pos.placement === "after"
              ? "end"
              : pos.placement,
          anchor?.id,
        );
        steps.push({
          label: "Place it",
          value: anchor
            ? `${pos.placement === "before" ? "Above" : "Below"} ${describeElement(anchor)}`
            : `${capitalise(section)}, ${pos.placement === "start" ? "top" : "end"}`,
          source: "Jev",
        });
        if (JSON.stringify(next.elements) === JSON.stringify(design.elements))
          return finish("unsupported", "It's already there");
        design = next;
        return finish("applied", `Moved ${describeElement(el)}`);
      }

      case "set_checked": {
        const { el } = resolveTarget({ kinds: ["checkbox", "switch"] });
        if (!el) return finish("incomplete", "Which checkbox or switch?");
        const n = noulValue(answers, key("checked"));
        const checked = parsed.checked ?? (n === null ? true : n >= 0.5);
        steps.push({
          label: "Choose state",
          value: checked ? "Checked" : "Unchecked",
          source: parsed.checked !== null ? "Parser" : "Jev",
          confidence:
            parsed.checked !== null || n === null
              ? undefined
              : checked
                ? n
                : 1 - n,
        });
        design = updateElement(design, el.id, { checked });
        return finish(
          "applied",
          `${describeElement(el)} → ${checked ? "checked" : "unchecked"} by default`,
        );
      }

      case "design": {
        const prop = pick(answers, key("design_prop"));
        steps.push({
          label: "Choose property",
          value: capitalise((prop.choice ?? "?").replace("_", " ")),
          source: "Jev",
          confidence: prop.p,
        });
        const set = <T>(q: string, apply: (v: T) => Design, label: string) => {
          const v = pick(answers, key(q));
          if (!v.choice) return finish("unclear", "Couldn't tell which value");
          design = apply(v.choice as T);
          steps.push({
            label: "Choose value",
            value: capitalise(v.choice),
            source: "Jev",
            confidence: v.p,
          });
          return finish("applied", `${label} → ${v.choice}`);
        };
        switch (prop.choice) {
          case "accent":
            return set<Accent>(
              "accent",
              (v) => ({ ...design, accent: v }),
              "Accent",
            );
          case "density":
            return set<Density>(
              "density",
              (v) => ({ ...design, density: v }),
              "Spacing",
            );
          case "width":
            return set<CardWidth>(
              "width",
              (v) => ({ ...design, width: v }),
              "Card width",
            );
          case "footer_align":
            return set<FooterAlign>(
              "footer_align",
              (v) => ({ ...design, footerAlign: v }),
              "Footer alignment",
            );
          case "background": {
            const named = backgroundNamedIn(clause);
            if (named) {
              design = {
                ...design,
                hero: { ...design.hero!, background: named },
              };
              steps.push({
                label: "Choose value",
                value: capitalise(named),
                source: "Parser",
              });
              return finish("applied", `Background → ${named}`);
            }
            return set<HeroBackground>(
              "background",
              (v) => ({ ...design, hero: { ...design.hero!, background: v } }),
              "Background",
            );
          }
          case "theme":
            return set<HeroTheme>(
              "theme",
              (v) => ({ ...design, hero: { ...design.hero!, theme: v } }),
              "Theme",
            );
          case "layout":
            return set<HeroLayout>(
              "layout",
              (v) => ({ ...design, hero: { ...design.hero!, layout: v } }),
              "Layout",
            );
          case "height":
            return set<HeroHeight>(
              "height",
              (v) => ({ ...design, hero: { ...design.hero!, height: v } }),
              "Height",
            );
          case "intensity": {
            const a = answers[key("intensity")];
            if (!a || a.type !== "score")
              return finish("unclear", "Couldn't tell how strong");
            const level = Math.max(1, Math.min(5, Math.round(a.score) + 1));
            design = { ...design, hero: { ...design.hero!, intensity: level } };
            steps.push({
              label: "Choose strength",
              value: `${level} of 5`,
              source: "Jev",
              confidence: a.confidence,
            });
            return finish("applied", `Background strength → ${level} of 5`);
          }
          default:
            return finish("unclear", "Couldn't tell what to change");
        }
      }
    }
  });

  return {
    design,
    clauses: results,
    command,
    commandMode,
    deferred,
    lastAddedId,
    compose,
  };
}

const TEXT_KINDS: Kind[] = [
  "checkbox",
  "switch",
  "heading",
  "text",
  "badge",
  "button",
  "headline",
  "eyebrow",
  "link",
  "logo",
  "brand",
];

const DEFAULT_ICONS = ["mail", "layers", "book", "code", "at"];

function countIn(clause: string): number | null {
  const words: Record<string, number> = {
    two: 2,
    couple: 2,
    three: 3,
    few: 3,
    four: 4,
    five: 5,
  };
  const m = clause
    .toLowerCase()
    .match(/\b(\d|two|couple|three|few|four|five)\b/);
  if (!m) return null;
  return Number(m[1]) || words[m[1]] || null;
}
const FIELD_KINDS: Kind[] = ["input", "textarea", "select"];

function convertElement(el: Element, to: Kind): Element | null {
  const group = TEXT_KINDS.includes(el.kind)
    ? TEXT_KINDS
    : FIELD_KINDS.includes(el.kind)
      ? FIELD_KINDS
      : null;
  if (!group || !group.includes(to)) return null;
  const fresh = createElement(to, el.section, { value: el.text ?? el.label });
  const keep: Partial<Element> = {
    id: el.id,
    ...(el.checked !== undefined &&
      (to === "checkbox" || to === "switch") && { checked: el.checked }),
    ...(el.placeholder &&
      FIELD_KINDS.includes(to) && { placeholder: el.placeholder }),
    ...(el.required !== undefined && { required: el.required }),
  };
  return { ...fresh, ...keep };
}

function stylePatch(el: Element, style: Style): Partial<Element> | null {
  const isField =
    el.kind === "input" || el.kind === "textarea" || el.kind === "select";
  switch (style) {
    case "full_width":
      return el.kind === "button" ? { fullWidth: true } : null;
    case "auto_width":
      return el.kind === "button" ? { fullWidth: false } : null;
    case "variant_default":
    case "variant_secondary":
    case "variant_outline":
    case "variant_ghost":
    case "variant_destructive":
    case "variant_link":
      return el.kind === "button"
        ? { variant: style.replace("variant_", "") as Element["variant"] }
        : null;
    case "larger":
    case "smaller": {
      if (!["heading", "button", "text", "headline", "logo"].includes(el.kind))
        return null;
      const order = ["sm", "md", "lg"] as const;
      const idx =
        order.indexOf(el.size ?? "md") + (style === "larger" ? 1 : -1);
      return { size: order[Math.max(0, Math.min(2, idx))] };
    }
    case "type_masked":
      return el.kind === "input" ? { inputType: "password" } : null;
    case "type_email":
    case "type_number":
    case "type_text":
      return el.kind === "input"
        ? { inputType: style.replace("type_", "") as Element["inputType"] }
        : null;
    case "required":
    case "optional":
      return isField || el.kind === "checkbox"
        ? { required: style === "required" }
        : null;
    case "colour":
    case "convert":
    case "icon":
    case "emphasis":
      return null;
  }
}

export type { Explicit };
