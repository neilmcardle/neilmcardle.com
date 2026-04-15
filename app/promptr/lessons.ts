// The six micro-lessons — one per rubric dimension.
//
// Rendered inside the "How great prompts work" section below the
// scorecard, and expanded inline when the user clicks "(Why this)" on a
// scorecard dimension. Kept as data (not prose files) so they're easy
// to revise without touching markup.
//
// Each lesson is structured the same way: a short body (2–3 sentences),
// a before/after example, and a one-liner "why it matters". The
// before/after does most of the teaching — the body is the frame.

import type { DimensionKey } from "./rubric";

export interface Lesson {
  key: DimensionKey;
  title: string;
  body: string;
  before: string;
  after: string;
  whyItMatters: string;
}

export const LESSONS: Lesson[] = [
  {
    key: "clarity",
    title: "Clarity",
    body:
      "A clear prompt states its goal in one read. The model shouldn't have to guess what you want, or pick one of three plausible readings. Short, declarative, first-sentence-first.",
    before: "Write something about productivity.",
    after:
      "Write a 300-word piece for busy parents on why single-tasking beats multitasking. Lead with a concrete morning-routine example.",
    whyItMatters:
      "A model that has to guess your goal will always pick the blandest option that fits.",
  },
  {
    key: "specificity",
    title: "Specificity",
    body:
      "Specificity means naming the audience, the tone, the domain, and the output shape. Vague prompts produce vague writing. The more you specify up front, the less editing you do after.",
    before: "Explain AI to a beginner.",
    after:
      "Explain large language models to a curious 12-year-old, in three short paragraphs, using one metaphor from cooking.",
    whyItMatters:
      "Every missing detail is a decision the model will make for you, usually at the median.",
  },
  {
    key: "role",
    title: "Role & Context",
    body:
      "Giving the model a role (\"you are a developmental editor\") or a frame (\"this is a letter to a skeptical investor\") changes the voice and the priorities of its response. Not every prompt needs a role, but when one fits, it does more than any other single word.",
    before: "Critique this pitch deck.",
    after:
      "You are a Series A lead investor reading this deck on a Sunday evening. Tell me what you would ask the founder next, in three sharp questions.",
    whyItMatters:
      "The right frame replaces paragraphs of instructions with a single shared assumption.",
  },
  {
    key: "constraints",
    title: "Constraints",
    body:
      "Constraints are the negative space of a prompt: what's in, what's out, how long, what to avoid. Counter-intuitively, tighter constraints produce better work, because they force the model to make real choices.",
    before: "Give me some marketing ideas.",
    after:
      "List three marketing ideas for a solo-founder productivity app. Each under 40 words. No paid ads, no influencer deals, no cold outreach.",
    whyItMatters:
      "Constraints are where taste lives. A prompt without them is a request for a committee.",
  },
  {
    key: "output_format",
    title: "Output format",
    body:
      "Say how the response should be structured. A bulleted list, a table, a JSON object, three short paragraphs with a summary at the top. Naming the shape turns a model's answer into something you can immediately use.",
    before: "Compare these three tools.",
    after:
      "Compare Notion, Obsidian, and Craft as a three-row markdown table with columns for Pricing, Offline support, and Best for. One sentence per cell.",
    whyItMatters:
      "An unspecified format is an invitation for the model to write an essay when you wanted a checklist.",
  },
  {
    key: "examples",
    title: "Examples",
    body:
      "One example of what good looks like is worth a page of description. Give the model a tiny sample of the style, tone, or structure you're after and it will calibrate faster than any adjective.",
    before: "Write product descriptions in our brand voice.",
    after:
      "Write product descriptions in our brand voice. Here is one we like: \"Cold-brewed for twelve hours, poured into a jar that survived three moves. Coffee for people who take their weekends seriously.\"",
    whyItMatters:
      "Showing beats telling. A single concrete example outperforms three paragraphs of style notes.",
  },
];
