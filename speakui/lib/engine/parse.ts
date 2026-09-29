import { KINDS } from "@/lib/design/catalog";
import { iconsIn } from "@/lib/design/icons";
import type { Kind, Mode } from "@/lib/design/types";

const VERB_START =
  /^(?:please\s+|now\s+|also\s+|and\s+)*(?:add|insert|put|place|include|create|make|build|give|remove|delete|drop|hide|get rid of|take out|lose|change|update|set|rename|relabel|edit|replace|swap|turn|move|shift|push|check|uncheck|tick|untick|toggle|enable|disable|use|undo|redo|revert|clear|reset|start over|label|call|title|align|center|centre|increase|decrease|reduce|widen|shrink|bump)\b/i;

const ADD_VERB =
  /^(?:please\s+|now\s+)*(?:add|insert|put|place|include|create|give)\b/i;

const BACK_REFERENCE =
  /^(?:please\s+|now\s+|also\s+|and\s+|then\s+)*\w+\s+(?:them|these|those|both|all of them|all of these)\b/i;

const OPENER_WORDS =
  /\b(?:ok(?:ay)?|hi|hey|so|now|right|well|please|thanks?|thank you|can|could|would|will|shall|you|i|we|let'?s|just|maybe|actually|um+|uh+|er+|and|then|also|like|hmm)\b/gi;

function isOpener(text: string): boolean {
  return text.replace(OPENER_WORDS, "").replace(/[^a-z]/gi, "").length === 0;
}
const SEPARATOR =
  /\s*(?:,\s*)?\b(?:and then|and also|then|and|also|plus)\b\s*|\s*[.;]\s+/gi;

function nounsFor(mode: Mode | "all"): { phrase: string; kind: Kind }[] {
  return (Object.keys(KINDS) as Kind[])
    .flatMap((kind) => {
      const spoken = KINDS[kind].spoken;
      const phrases =
        mode === "all"
          ? [...(spoken.card ?? []), ...(spoken.hero ?? [])]
          : (spoken[mode] ?? []);
      return phrases.map((phrase) => ({ phrase, kind }));
    })
    .sort((a, b) => b.phrase.length - a.phrase.length);
}
const NOUNS: Record<Mode | "all", { phrase: string; kind: Kind }[]> = {
  card: nounsFor("card"),
  hero: nounsFor("hero"),
  all: nounsFor("all"),
};
const pattern = (list: { phrase: string }[]) =>
  [...new Set(list.map((n) => n.phrase.replace(/[-\s]/g, "[-\\s]?")))].join(
    "|",
  );
const NOUN_PATTERN = pattern(nounsFor("all"));
const MODE_PATTERN: Record<Mode | "all", string> = {
  card: pattern(NOUNS.card),
  hero: pattern(NOUNS.hero),
  all: NOUN_PATTERN,
};

export function splitClauses(transcript: string): string[] {
  const text = normalise(transcript);
  if (!text) return [];

  const nounStart = new RegExp(
    `^(?:a|an|another|one more|the)\\s+(?:[\\w'@.-]+\\s+){0,4}?(?:${NOUN_PATTERN})\\b`,
    "i",
  );
  const clauses: string[] = [];
  let start = 0;
  let prefix = "";
  let adding = ADD_VERB.test(text);

  for (const m of text.matchAll(SEPARATOR)) {
    const cut = m.index!;
    const rest = text.slice(cut + m[0].length);
    const current = text.slice(start, cut);

    const insideValue =
      /\b(?:say|says|saying|called|named|titled|labell?ed|reads?)\s+\S/i.test(
        current,
      );

    const startsVerb = VERB_START.test(rest);
    const carriesAdd =
      !startsVerb && adding && !insideValue && nounStart.test(rest);
    if (!startsVerb && !carriesAdd) continue;

    const deliberate = /then|[.;]/i.test(m[0]);
    if (insideValue && !deliberate) continue;

    if (BACK_REFERENCE.test(rest)) continue;

    if (isOpener(current)) continue;

    clauses.push(prefix + current.trim());
    start = cut + m[0].length;
    prefix = carriesAdd ? "add " : "";
    if (startsVerb) adding = ADD_VERB.test(rest);
  }
  clauses.push(prefix + text.slice(start).trim());

  return clauses.filter((c) => c.replace(/[^a-z]/gi, "").length > 1);
}

export function namesComponent(text: string): boolean {
  return new RegExp(`\\b(?:${NOUN_PATTERN})\\b`, "i").test(normalise(text));
}

export function normalise(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .replace(/^[\s,.;:-]+|[\s,;:-]+$/g, "")
    .trim();
}

export type Explicit = {
  value: string | null;

  via: string | null;

  modifier: string | null;

  trailing: string | null;

  kind: Kind | null;

  phrase: string | null;

  icons: string[];

  deictic: boolean;

  checked: boolean | null;

  mentionsPlaceholder: boolean;

  mentionsColour: boolean;

  emphasis: string | null;
};

function emphasisWord(clause: string): string | null {
  const m =
    clause.match(
      /\b(?:make|turn|set)\s+(?:the\s+word\s+)?["“]?([\w'-]+(?:\s(?!(?:a|an|the|into)\b)[\w'-]+)?)["”]?\s+(?:into\s+)?(?:a\s+)?(?:link|underlined|highlighted|stand out|bold|the accent)\b/i,
    ) ??
    clause.match(
      /\b(?:underline|highlight|emphasi[sz]e|link)\s+(?:the\s+word\s+)?["“]?([\w'-]+(?:\s[\w'-]+)?)["”]?/i,
    );
  const w = m?.[1]?.trim();
  return w && !/^(?:it|this|that|the|a|an)$/i.test(w)
    ? w.replace(/[.,!?]+$/, "")
    : null;
}

export function splitList(value: string): string[] {
  return value
    .split(/\s*,\s*(?:and\s+)?|\s+and\s+/i)
    .map((v) => v.trim())
    .filter(Boolean);
}

const COLOUR_WORD =
  /\b(?:colou?r|accent|brand|black|neutral|grey|gray|blue|navy|green|emerald|violet|purple|rose|red|pink|orange|amber|yellow|gold|teal|cyan|turquoise)\b/;

const VALUE_PATTERNS: { re: RegExp; via: string }[] = [
  { re: /["“”]([^"“”]{1,80})["“”]/, via: "quoted text" },
  {
    re: /\b(?:to say|to read|that says|which says|that reads|it says|saying|reading)\s*[,:]?\s+(.+)$/i,
    via: "“…say …”",
  },
  {
    re: /\bplaceholder\s+(?:text\s+)?(?:to|as|of|with|into|:)?\s*(?:say\s+|read\s+)?(.+)$/i,
    via: "“placeholder …”",
  },
  {
    re: /\b(?:called|named|titled|labell?ed|with the (?:text|label|title|words?))\s+(.+)$/i,
    via: "“called …”",
  },
];

const TRAILING_NOT_TEXT =
  /^(?:to|in|into|on|onto|at|below|above|under|underneath|over|after|before|beneath|next|beside|inside|within|near|for|about|that|which|with|and|then|please|here|there|too|as well|at the|by default|full|so|of|from)\b/i;

const CHANGE_TO =
  /\b(?:change|rename|update|set|relabel|edit|replace|switch|make)\b.*?\b(?:to|into|as)\s+(?:say[,:]?\s+|read[,:]?\s+)?(.+)$/i;
const REPLACE_WITH = /\b(?:replace|swap)\b.*?\bwith\s+(.+)$/i;
const FOR_VALUE = /\b(?:for|about)\s+(.+)$/i;

const STYLE_WORD =
  /^(?:new|another|simple|basic|small|smaller|big|bigger|large|larger|primary|secondary|outline|outlined|ghost|destructive|red|green|blue|full[-\s]?width|wide|little|second|third|extra|single|default|required|optional|text)$/i;

const LEADING_FILLER =
  /^(?:the|a|an|some|other|one|more|please|now|also|me|us|we|i|let's|lets|can|could|would|you|want|like|to|need|just|and|then|so|ok|okay|um|uh)$/i;

export function parseClause(
  clause: string,
  action?: string,
  mode: Mode | "all" = "card",
): Explicit {
  const lower = clause.toLowerCase();

  let value: string | null = null;
  let via: string | null = null;
  for (const p of VALUE_PATTERNS) {
    const m = clause.match(p.re);
    if (m?.[1]) {
      value = m[1];
      via = p.via;
      break;
    }
  }
  if (!value && action === "edit_text") {
    const r = clause.match(REPLACE_WITH);
    const m = r ?? clause.match(CHANGE_TO);
    if (m?.[1]) {
      value = m[1];
      via = r ? "“replace … with …”" : "“change … to …”";
    }
  }

  let kind: Kind | null = null;
  let modifier: string | null = null;
  let trailing: string | null = null;
  let matchedPhrase: string | null = null;
  const nounRe = new RegExp(
    `\\b((?:[\\w'@.-]+\\s+){0,5}?)(${MODE_PATTERN[mode]})\\b`,
    "i",
  );
  const withoutValue = value
    ? clause.slice(0, clause.toLowerCase().indexOf(value.toLowerCase())) ||
      clause
    : clause;
  const nm = withoutValue.match(nounRe);
  if (nm) {
    let phrase = nm[2].toLowerCase().replace(/[-\s]+/g, " ");
    const kindOf = (p: string) =>
      NOUNS[mode].find((n) => n.phrase.replace(/-/g, " ") === p)?.kind ?? null;
    kind = kindOf(phrase);

    const glued: string[] = [];
    while (phrase.includes(" ")) {
      const [head, ...tail] = phrase.split(" ");
      const shorter = tail.join(" ");
      if (kindOf(shorter) !== kind) break;
      glued.push(head);
      phrase = shorter;
    }
    matchedPhrase = phrase;

    if (phrase === "text" && action !== "add") kind = null;
    const words = (nm[1] ?? "").trim().split(/\s+/).filter(Boolean);

    while (
      words.length &&
      (VERB_START.test(words[0]) ||
        LEADING_FILLER.test(words[0]) ||
        STYLE_WORD.test(words[0]))
    )
      words.shift();
    for (let w = words.length - 1; w >= 0; w--)
      if (STYLE_WORD.test(words[w])) words.splice(w, 1);

    const label = [...words, ...glued];
    modifier = label.length ? label.join(" ") : null;

    const after = withoutValue.slice((nm.index ?? 0) + nm[0].length).trim();
    if (after && !TRAILING_NOT_TEXT.test(after)) trailing = after;
  }

  if (!value && action === "add" && kind && !modifier) {
    const m = clause.match(FOR_VALUE);
    if (m?.[1]) {
      value = m[1];
      via = "“… for …”";
    }
  }

  const deicticText = lower.replace(/\bthat\s+(?:says|reads|is)\b/g, "");
  const deictic = /\b(?:this|that|it|these|those|here|there)\b/.test(
    value ? deicticText.replace(value.toLowerCase(), "") : deicticText,
  );

  let checked: boolean | null = null;
  if (
    /\b(?:uncheck|untick|unchecked|off by default|turn(?:ed)? off|not checked|disable|deselect)\b/.test(
      lower,
    )
  )
    checked = false;
  else if (
    /\b(?:check|tick|checked|on by default|turn(?:ed)? on|enable|select(?:ed)? by default)\b/.test(
      lower,
    )
  )
    checked = true;

  return {
    value: value
      ? cleanValue(value, { stopAtLocation: via === "“… for …”" })
      : null,
    via,
    modifier,
    trailing: trailing
      ? cleanValue(trailing, { stopAtLocation: true }) || null
      : null,
    kind,
    phrase: matchedPhrase,
    icons: iconsIn(clause),
    deictic,
    checked,
    mentionsPlaceholder: /\bplaceholder|hint text\b/.test(lower),
    mentionsColour: COLOUR_WORD.test(lower),
    emphasis: emphasisWord(clause),
  };
}

const LOCATION_TAIL =
  /\s+(?:below|above|under|underneath|beneath|over|after|before|beside|next to|at the (?:top|bottom|start|end)|in the (?:header|body|footer|top|bottom)|to the (?:header|body|footer|top|bottom|left|right)|on the (?:left|right))\b.*$/i;

export function cleanValue(
  raw: string,
  opts: { stopAtLocation?: boolean } = {},
): string {
  let v = raw.trim();
  if (opts.stopAtLocation) v = v.replace(LOCATION_TAIL, "");
  v = v
    .replace(/^["“”']+|["“”']+$/g, "")
    .replace(/[.!?,;:]+$/, "")
    .replace(/\s+(?:please|instead|for me|thanks|thank you)$/i, "")
    .replace(/\s+(?:instead)$/i, "")
    .trim();

  if (/\b\w+\s+at\s+\w+(?:\s+dot\s+\w+)+\b/i.test(v)) {
    v = v
      .replace(/\s+at\s+/i, "@")
      .replace(/\s+dot\s+/gi, ".")
      .replace(/\s+/g, "");
  }
  return v;
}

export function fastCommand(transcript: string): "undo" | "redo" | null {
  const t = transcript
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/, "");
  if (/^(?:undo|undo (?:that|it|this)|go back|revert(?: that)?)$/.test(t))
    return "undo";
  if (/^(?:redo|redo (?:that|it|this))$/.test(t)) return "redo";
  return null;
}

export function looksUnfinished(text: string): boolean {
  const t = text
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?…]+$/, "")
    .trim();
  if (!t) return false;
  if (
    /\b(?:a|an|the|and|and then|then|or|but|to|with|of|at|in|on|for|from|into|that|which|who|so|like|um|uh|er|is|are|be|should|needs to|need to|want|wants|have|has|some|my|your|its|this|these|next to|below|above|under)$/.test(
      t,
    )
  )
    return true;

  if (
    /\b(?:say|says|saying|read|reads|reading|called|named|titled|labell?ed)$/.test(
      t,
    )
  )
    return true;

  if (
    /^(?:and\s+)?(?:then\s+)?(?:at|in|on|to)\s+the\s+(?:top|bottom|left|right|middle|centre|center|end|start)(?:\s+(?:left|right|corner))?$/.test(
      t,
    )
  )
    return true;
  return false;
}
