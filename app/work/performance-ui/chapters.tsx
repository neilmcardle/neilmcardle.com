import type { Chapter } from "../Story";
import {
  BrandPair,
  Checks,
  Credits,
  Kit,
  LooksChecks,
  Pair,
  Picker,
  Trio,
} from "./Parts";
import pui from "./pui.module.css";

export const PERFORMANCE_UI: Chapter[] = [
  {
    label: "The problem",
    body: "Coding agents build interfaces from memory, so every page drifts towards the same generic look, and nobody checks how heavy it is.",
  },
  {
    label: "Decision 1",
    title: "I decided by looking, not by remembering",
    body: "I built a picker with 141 decisions in 14 areas. Each one has a live demo, dials for the exact value, its cost in speed and where the idea came from. I set every value by eye.",
    instead:
      "writing rules from memory, which drift towards whatever is fashionable.",
    visual: <Picker />,
  },
  {
    label: "Decision 2",
    title: "I split it into two layers",
    body: "I made Performance UI for sites where speed matters, and Looks UI to sit on top and change only the 33 decisions where looks matter more than speed, condensed into 21 rules. I tagged every Performance UI rule Foundation or Style, so on a site with its own brand only the Foundation rules apply unless told otherwise.",
    instead:
      "one set of rules that erases a brand it was only meant to make faster.",
    visual: <BrandPair />,
  },
  {
    label: "Decision 3",
    title: "I packaged it for an agent",
    body: "I wrote 33 short rules on one page, with references the agent opens only when it needs the detail. One token file writes the CSS, the Tailwind theme and 77 Figma variables. I set page budgets as numbers it can check, and a banned list of the moves that make a page look generated.",
    visual: <Kit />,
  },
  {
    label: "The proof",
    title: "A booking page, with and without",
    body: "I had Claude build a booking page for a made-up rail company twice from one brief. With the rules, it showed the total price first and served one font file. It still left three buttons under the 44px tap size.",
    visual: (
      <div className={pui.stack}>
        <Pair />
        <Checks />
      </div>
    ),
  },
  {
    label: "The proof, with Looks UI",
    title: "One launch page, three ways",
    body: "I gave three agents one brief for a made-up app: no skills, Performance UI, and Performance UI with Looks UI. Both rule-guided pages still made some buttons too small, so I need to make that rule stricter.",
    visual: (
      <div className={pui.stack}>
        <Trio />
        <LooksChecks />
      </div>
    ),
  },
  {
    label: "Credits",
    title: "Who I learned from",
    body: "Every decision in the picker links to where its idea came from. I chose and set every value myself, and many came from my own sites, brands and writing rules. Jakub Krehel's article on shadows instead of borders shaped the edges in Looks UI.",
    visual: <Credits />,
  },
  {
    label: "What I led",
    body: "All of it: the picker, both systems, the rules, the tokens and the references. This site follows both.",
  },
];
