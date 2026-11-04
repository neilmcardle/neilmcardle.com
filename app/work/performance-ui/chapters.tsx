import type { Chapter } from "../Story";
import {
  Banned,
  Checks,
  Credits,
  Files,
  Flow,
  Layers,
  LooksChecks,
  Pair,
  Picker,
  Trio,
} from "./Parts";

export const PERFORMANCE_UI: Chapter[] = [
  {
    label: "The problem",
    body: "Coding agents build interfaces from memory, so every page drifts towards the same generic look, and nobody checks how heavy or slow it is. I wanted one set of rules an agent loads before it touches any UI.",
    visual: <Files />,
  },
  {
    label: "Decision 1",
    title: "Decide by looking, not by remembering",
    body: "I built a picker with 141 decisions in 14 areas. Each one has a live demo, dials for the exact value, what it costs in speed and where the idea came from. I set every value by eye, not from memory.",
    instead:
      "writing rules from memory, which drift towards whatever is fashionable.",
    visual: <Picker />,
  },
  {
    label: "Decision 2",
    title: "One set of choices, two systems",
    body: "Each decision gets an answer for a fast site and an answer for a site where the impression matters most. Performance UI is the fast one. Looks UI sits on top of it and changes only the 33 decisions where the answer differs, like a dark page or one showpiece effect.",
    instead:
      "one system that tries to be fast and expressive at once, and is neither.",
    visual: <Layers />,
  },
  {
    label: "Decision 3",
    title: "Short rules first, detail on demand",
    body: "The agent reads 33 hard rules on one page. Each area has its own reference with the value, the reason and the source, and the agent opens only the one it needs.",
    instead:
      "one long style guide that an agent has to read in full, and skims.",
  },
  {
    label: "Decision 4",
    title: "One source for every value",
    body: "Every colour, size, space and duration lives in one file. A script writes the CSS variables and the Tailwind theme from it, and the same file imports into Figma as variables.",
    instead: "values copied by hand into code and Figma, drifting apart.",
    visual: <Flow />,
  },
  {
    label: "Decision 5",
    title: "Budgets an agent can check",
    body: "Page weight, JavaScript, requests and speed targets are stored as numbers, so an agent can measure a page against them rather than judge it by eye.",
    instead: "advice like keep it fast, which nobody can check.",
  },
  {
    label: "Decision 6",
    title: "Name the defaults to avoid",
    body: "A banned list names the moves that make a page look generated, so the agent avoids them on purpose rather than by luck.",
    instead: "hoping good taste comes through on its own.",
    visual: <Banned />,
  },
  {
    label: "The proof",
    title: "One brief, with and without",
    body: "A booking page for a made-up rail company, built by Claude twice from the same brief: once on its own, once with Performance UI loaded. This is a demo, not client work.",
    visual: <Pair />,
  },
  {
    label: "What changed",
    body: "Without the rules, the agent still made a good-looking page, but it led with the fare and added the fee at checkout, used nine type sizes and loaded its font from Google. With them, it showed the total first, kept to five sizes and one font file. It also left three 36px buttons below the 44px tap size the rules ask for, so the next version gives buttons a bigger tap area.",
    visual: <Checks />,
  },
  {
    label: "The proof, with Looks UI",
    title: "One launch page, three ways",
    body: "A launch page for a made-up app, built by three agents from the same brief: one with no skills, one with Performance UI, one with Performance UI and Looks UI. The same speed rules sit under the last two; Looks UI only changes how it feels.",
    visual: <Trio />,
  },
  {
    label: "What Looks UI changed",
    body: "Without skills, the agent reached for a cream page with a red accent, one of the banned defaults, and faded every section in. Performance UI made it calm and fast but plain. Looks UI kept the speed and gave it a dark page, one brand colour, edges instead of borders and a single showpiece. Both rule-guided pages still made some buttons smaller than the 44px the rules ask for, so that rule needs to be stricter.",
    visual: <LooksChecks />,
  },
  {
    label: "Credits",
    title: "Whose ideas these are",
    body: "Most of the ideas came from people whose work I admire, and every decision in the picker names its source. The numbers count how many of the 141 decisions each source informed; some cite more than one. I set every value myself, so a source means the idea came from them, not that I copied their rules. Jakub Krehel's article on shadows instead of borders shaped the edges in Looks UI.",
    visual: <Credits />,
  },
  {
    label: "What I led",
    body: "All of it: the picker, both systems, the rules, the references, the tokens and the specimen page, each rule picked one at a time and credited to its source. This site follows both, and the picker is free to try.",
  },
];
