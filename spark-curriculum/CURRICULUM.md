# Spark — Curriculum Spine

_Designer → Design Engineer (→ full-stack). The derived syllabus: outcomes, ordered modules, checkpoints._

---

## What this document is (and is not)

This is **the metal, refined from the mine.** The mine is
[`../spark-teaching-log/`](../spark-teaching-log/) — the raw, chronological record of learning this material, warts and all. This file is the _designed_ course spine derived from it,
ordered for a learner we haven't met.

**The rule that makes Spark Spark:** the rubric is borrowed, the judgment is not. The Definition of
Done and the per-module template are a rubric to build **toward**, never a machine to generate
**from**. Lived friction stays the best material Spark has: the S08 semicolon bug and the S10
Babel-drift fight are worth more than any explanation written from the outside.

The earlier ban on AI as author was **retired 2026-08-23**. Lesson prose and code are now written
directly and reviewed, rather than hand-typed first. What has not changed is that the teaching log
remains the source of the hard-won parts.

**Status markers:** `INTERACTIVE` = shipped with a widget or checkpoints · `PROSE` = shipped, reads
as an article, no way to test yourself · `STUB` = thin, needs writing. Counts below are generated
from `content/spark/`, not maintained by hand.

---

## North Star: the target profile

The competency bar we aim at is the **Design Engineer role**: _a builder who owns the seam between design and engineering — ships polished production UI
with obsessive craft (typography, color, motion, microinteractions), builds design systems in Figma
**and** code (React/TypeScript/Tailwind), keeps consistency across desktop platforms (Electron), and
invents new interaction patterns for AI-native products._

**Shape decision (2026-07-02):** the **Design Engineer craft is the primary spine and priority**
(Phase 2 below). The broader **full-stack engineering material is also taught**, as a _completion
layer_ (Phase 3) — so a Spark graduate is a great DE who can also go full-stack, not a generalist who
happens to touch design. This role plays _directly_ to a designer's edge: taste, systems thinking,
"just right" polish are the top of its wishlist.

---

## A. Outcomes contract (Definition of Done)

### Design Engineer core (primary — the bar this course is built to clear)

1. Hand-write **semantic, accessible HTML** and **modern CSS** (flexbox, grid, custom properties,
   fluid type, container queries) with no framework.
2. Achieve **craft-level polish**: web typography, faithful design recreation, color systems.
3. **Translate a design system into code**, both directions — **Figma ↔ code**: tokens, theming,
   dark mode, component APIs, variants.
4. Implement **high-craft motion & microinteractions**: CSS transitions, Framer Motion, springs,
   gestures, `prefers-reduced-motion`, and the judgment for **when _not_ to animate**.
5. Build **production React with Next.js** and understand **desktop/cross-platform** delivery
   (Electron; Mac/Windows consistency).
6. **Design new interaction patterns for AI-native products** — novel UX without precedent.
7. Meet **accessibility standards**: WCAG basics, keyboard nav, focus management, ARIA only where
   needed, a screen-reader pass.

### Full-stack completion (also taught — the second half of "designer → engineer")

8. Write **intermediate JavaScript & TypeScript**: DOM, events, async, data fetching, modules, types.
9. Work the **back half**: API/route handlers & server actions, relational databases + an ORM, and
   auth (sessions/tokens, Supabase) at a working level.
10. Use **professional workflow**: terminal, Git/GitHub, PRs, npm, Vite/Next, deploy to Vercel,
    basic UI tests, devtools debugging, and **AI assistants with judgment** (built on hand-written
    fundamentals).
11. Present a **portfolio + capstone** at a mid-level DE hiring bar, with an interview narrative.

**Deferred to a "Keep Growing" appendix:** WebGL/shaders, CI pipelines, visual-regression testing,
Storybook, native Swift. Add only if a real lesson needs them.

---

## B. What every module owes the learner

The through-threads device was **retired 2026-08-23** and removed from the product. What replaced it
is plainer and easier to hold: every module should leave the learner able to do something they could
not do before, and should give them a way to find out whether they can.

- **A promise, in one sentence.** Stated in frontmatter, shown as the standfirst, and honest.
- **A way to be wrong.** A checkpoint, a widget, or a checklist. A module that can only be read is a
  module nobody can fail, and nobody learns from something they cannot fail.
- **Sections that work on a phone.** One idea each, per the sectioned-scroll format.
- **Craft carried throughout,** not saved for Phase 2. It is the DE role's whole thesis.

---

## C. Roadmap

Five phases. **Phase 2 is the priority spine.** Phase 3 completes the full-stack picture.

> **Numbering:** this table uses the module numbers the product uses, 1 to 19, matching the
> `module:` field in each MDX file and the numerals on `/spark/lessons`. The old zero-indexed
> M0–M17 scheme is retired; the filenames (`m0-…` to `m18-…`) are one behind and are not a numbering
> scheme, just filenames.

| #   | Module                                       | Phase           | State       | Size | Widgets | Checks | Checklist |
| --- | -------------------------------------------- | --------------- | ----------- | ---- | ------- | ------ | --------- |
| 1   | Make a real file yours                       | 0 · Foundations | INTERACTIVE | 11k  | 1       | 4      |           |
| 2   | How the web runs                             | 0 · Foundations | PROSE       | 9k   |         |        |           |
| 3   | HTML, the language                           | 0 · Foundations | INTERACTIVE | 17k  | 1       |        |           |
| 4   | CSS as a system                              | 0 · Foundations | INTERACTIVE | 21k  |         | 4      | 6         |
| 5   | CSS Craft                                    | 0 · Foundations | PROSE       | 7k   |         |        |           |
| 6   | JavaScript fundamentals                      | 1 · JS & React  | INTERACTIVE | 20k  |         | 3      | 10        |
| 7   | Intermediate JavaScript                      | 1 · JS & React  | INTERACTIVE | 21k  | 1       |        | 8         |
| 8   | TypeScript for UI                            | 1 · JS & React  | PROSE       | 8k   |         |        |           |
| 9   | React Fundamentals                           | 1 · JS & React  | INTERACTIVE | 15k  | 1       | 4      |           |
| 10  | Testing React UI                             | 1 · JS & React  | PROSE       | 21k  |         |        | 6         |
| 11  | **Design Systems in Code**                   | **2 · DE core** | PROSE       | 39k  |         |        | 12        |
| 12  | **Motion & Interaction Engineering**         | **2 · DE core** | INTERACTIVE | 26k  | 1       |        | 21        |
| 13  | **Shipping UI: Next.js + Electron**          | **2 · DE core** | PROSE       | 46k  |         |        | 66        |
| 14  | **Designing AI-native interaction patterns** | **2 · DE core** | PROSE       | 16k  |         |        |           |
| 15  | Data & APIs in depth                         | 3 · Full-stack  | PROSE       | 21k  |         |        | 7         |
| 16  | Databases & ORM                              | 3 · Full-stack  | INTERACTIVE | 22k  | 1       |        | 9         |
| 17  | Auth                                         | 3 · Full-stack  | PROSE       | 10k  |         |        |           |
| 18  | Professional Practice & Deploy               | 3 · Full-stack  | PROSE       | 33k  |         |        | 18        |
| 19  | Capstone                                     | 4 · Capstone    | PROSE       | 28k  |         |        | 132       |

**Where the work is.** Every module is written. Eleven of nineteen have no widget and no checkpoint,
so they can be read but not failed. Modules 5 and 8 are thin enough to be worth rewriting rather than
extending. Module 13 is 46k in one scroll and needs splitting more than it needs a widget.

The widget backlog and the test a concept has to pass before it earns one are kept separately, in the
Spark Widget Catalogue.

**Pacing (8–10 hrs/week):** ~9-month gentle (1 module / 2–3 wks) or ~6-month intensive (1 / 1.5–2 wks).
A learner aiming _only_ at the DE role can ship after Phase 2 + capstone; Phase 3 makes them full-stack.

---

## D. Modules

Template: **Promise · Outcomes · Concepts (in order) · Guided build · Checkpoint · Common designer
mistakes.** Every module now has all of these written; what varies is whether the checkpoint is
something you can actually fail. See the state column above.

Note that module 10, Testing React UI, has no entry below. It was added after this section was
written and its frame lives in the MDX file rather than here.

---

### PHASE 0 — FOUNDATIONS

#### M1 — Make a real file yours · `INTERACTIVE`

**Promise:** Read every line of a real shipped file and say what it does and why.
**Concepts:** the file as unit of work · imports (object vs. default) · `export default` · JSX as
"HTML-shaped JS" · chosen-vs-fixed sort on a real line.
**Build:** annotate the student's own landing page line-by-line, comprehension first.
**Checkpoint:** name any token's bucket; rename every chosen name and keep it running.
**Threads:** chosen-vs-fixed · language-vs-framework.

#### M2 — How the web runs · `PROSE`

**Promise:** Know what happens between saving a file and seeing it in a browser.
**Concepts:** terminal as text UI · `file://` vs. local server · client↔server round-trip · packages
& version pinning / dependency drift.
**Build:** serve a static page over `http.server`, then Vite; watch the same file behave differently.
**Checkpoint:** start a server, explain `file://` caching, spot an unpinned dependency.
**Threads:** your-code-vs-the-platform · error-location-is-a-hint. _(S10 delivered this reactively,
at the moment of pain — keep that discovery framing.)_

#### M3 — HTML, the language · `INTERACTIVE`

**Promise:** Hand-write semantic, accessible HTML — and start designing in the browser.
**Concepts:** DOM as a tree · semantic vs. `div` soup · `href` vs. `target` · buttons vs. links ·
forms & labels (a11y from the start) · SVG as an embedded language · `currentColor`.
**Build:** a **type-specimen page** — pure semantic HTML, screen-reader clean.
**Checkpoint:** keyboard tab-through passes; no `div` where a semantic element exists; SVG inherits
color via `currentColor`.
**Threads:** the-browser-speaks-more-than-one-language · craft-is-the-differentiator · a11y-from-day-one.

#### M4 — CSS as a system · `INTERACTIVE`

**Promise:** Build responsive layouts and fluid type without a framework.
**Concepts:** cascade & specificity · box model · flexbox · grid · custom properties (tokens in raw
CSS) · `em`/`rem` & unitless `line-height` · `clamp()` fluid type · three responsive patterns · why
Tailwind is "just classes."
**Build:** a **pricing page**, hand-CSS'd, fully responsive, fluid type.
**Checkpoint:** no magic numbers where a token belongs; holds 320→1440px; type scales fluidly.
**Threads:** language-vs-framework · design-in-the-browser.

#### M5 — CSS craft · `PROSE`

**Promise:** Recreate a real design pixel-faithfully and add tasteful transitions.
**Frame:** web typography depth · faithful layout recreation from a screenshot · CSS transitions with
restraint. _Build: recreate a well-known product screen, then add transitions._
**Threads:** craft-is-the-differentiator · when-not-to-animate (previews Phase 2).

---

### PHASE 1 — JAVASCRIPT & REACT

#### M6 — JavaScript fundamentals · `INTERACTIVE`

**Promise:** Solve UI problems in plain JavaScript.
**Concepts (in order):** values & variables · functions & arrow functions · the `.` (property vs.
method) · arrays, `.length`, indexing · `.filter`/`.map` as folded-up loops · objects · arrays of
objects · booleans & comparisons · statements vs. expressions · `if`/`else` & the ternary · template
literals · the semicolon/ASI footgun · **reading an error to its true cause.**
**Build:** a **command-palette-style filter** in plain JS (no React yet).
**Checkpoint:** write a filter from blank; classify every token's bucket; trace an error past its
reported line.
**Common mistakes:** storing derived data; trusting the error's line number; smart-quotes.
**Threads:** chosen-vs-fixed · statements-vs-expressions · error-location-is-a-hint. _(Best-sourced
module after M0: S07 ternary, S08 map/filter/objects + ASI bug, S09 chosen-vs-fixed.)_

#### M7 — Intermediate JavaScript · `INTERACTIVE`

**Promise:** Fetch and work with real data in the UI.
**Frame:** async/await · `fetch` · APIs & JSON · ES modules. _Build: a live data-backed card._
**Threads:** error-location-is-a-hint (async errors).

#### M8 — TypeScript for UI · `PROSE`

**Promise:** Type component props and data confidently.
**Frame:** what types add · structural typing · typing props & API responses. _Build: retype M6._
**Threads:** language-vs-framework (TS→JS).

#### M9 — React fundamentals · `INTERACTIVE`

**Promise:** Build a small React app and reason about state.
**Concepts (in order):** component = function returning one JSX root · `useState` & the
event→setState→re-render loop · derived vs. stored state · the controlled input · **props: data
parent→child** · composition into a tree · lifting state up · the four states (idle/loading/empty/error).
**Build:** the search interaction in React → split into a component tree → real empty/loading/error states.
**Checkpoint:** no derived data in `useState`; justify the state shape aloud; handle all four states;
hand-write a prop.
**Common mistakes:** derived data in state; one giant component; happy-path only.
**Threads:** chosen-vs-fixed (`onClick` spelling) · your-code-vs-the-platform.
_(S05, S10, and `practice/search*.html` feed this. **Next lived frontier: hand-writing props.**)_

---

### PHASE 2 — DESIGN ENGINEER CORE _(the priority spine)_

#### M11 — Design systems in code (Figma ↔ code) · `PROSE`

**Promise:** Turn a design system into a coded, themed component library — and move tokens both directions.
**Frame:** design tokens (Figma variables ↔ CSS custom properties / Tailwind theme) · theming & dark
mode · component API design · variants (CVA / Tailwind, and a vanilla-extract-style look) · documenting
components. _Build: a **design-token pipeline + themed component set**, mirrored from a Figma file._
**Checkpoint:** one source of truth for tokens; components have a deliberate, minimal API; dark mode via
tokens, not overrides; a designer _and_ an engineer would both respect it.
**Threads:** design-in-the-browser / Figma↔code · craft-is-the-differentiator · language-vs-framework.
_(Design-systems expertise is the edge here — lean on it.)_

#### M12 — Motion & interaction engineering · `INTERACTIVE`

**Promise:** Implement high-craft motion and microinteractions — and know when to withhold them.
**Frame:** CSS transitions/animations · Framer Motion · springs vs. easing · gestures · layout & page
transitions · `prefers-reduced-motion` · **when _not_ to animate.** _Build: an **animated onboarding
flow** with a genuine reduced-motion path._
**Checkpoint:** motion serves meaning, never decorates; spring/easing chosen with intent; reduced-motion
is real, not an afterthought; nothing drops frames.
**Threads:** craft-is-the-differentiator · when-not-to-animate.

#### M13 — Shipping UI: Next.js + desktop/Electron · `PROSE`

**Promise:** Ship a real, polished multi-surface app and understand desktop delivery.
**Frame:** Next.js routing · server vs. client components (working level) · forms · data fetching ·
performance basics (no dropped frames, bundle awareness) · **Electron & cross-platform (Mac/Windows)
consistency.** _Build: an **interactive portfolio or dashboard**, deployed; note where a desktop shell
changes the calculus._
**Threads:** craft-is-the-differentiator · your-code-vs-the-platform.

#### M14 — Designing AI-native interaction patterns · `PROSE`

**Promise:** Invent interaction patterns for AI products where no precedent exists.
**Frame:** streaming & latency UX · uncertainty/confidence states · human-in-the-loop editing · the
four states for _non-deterministic_ output · trust, correction, and "undo the AI." _Build: a small
AI-driven UI (e.g. a live-summarizing note field) with first-class loading/uncertain/error states._
**Checkpoint:** the interface stays calm under streaming/latency; the user can always correct or undo;
uncertainty is shown honestly. **This is the role's headline skill — treat it as the differentiator.**
**Threads:** craft-is-the-differentiator · your-code-vs-the-platform.

---

### PHASE 3 — FULL-STACK COMPLETION _(also taught)_

#### M15 — Data & APIs in depth · `PROSE`

**Frame:** what a request really is · route handlers · server actions · validation. _Build: a working
endpoint behind one of the earlier UIs (e.g. a waitlist)._

#### M16 — Databases & ORM · `INTERACTIVE`

**Frame:** relational thinking · schemas · what an ORM is (Drizzle) · a from-scratch raw-SQL detour
before the ORM. _Build: persist real data._

#### M17 — Auth · `PROSE`

**Frame:** sessions vs. tokens · a hand-written session-cookie detour · then why Supabase Auth exists.
_Build: gate something behind login._

#### M18 — Professional practice & deploy · `PROSE`

**Promise:** Work like an engineer on a team.
**Concepts:** Git mental model · branches, PRs & PR descriptions (the _why_, tradeoffs) · dissecting a
real component (Radix, shadcn/ui) · component tests · devtools debugging · the debugging **method** ·
deploy to Vercel · **AI-assisted dev with judgment** (draft, then verify by hand) · reading & contributing
to an **existing codebase** (not just greenfield).
**Checkpoint:** trace a bug in unfamiliar code; PR explains _why_; can say what in AI output they'd
verify before trusting it.
**Threads:** debugging-first-class (S08 in-your-code vs. S10 in-the-platform, as a matched pair) ·
error-location-is-a-hint. _(The two authentic debugging arcs are the anchor assets here.)_

---

### PHASE 4 — CAPSTONE

#### M19 — Capstone · `PROSE` — see Section E.

---

## E. Capstone brief & rubric

**Brief:** Design, build, and deploy one polished product **with no AI writing the core**, integrating:
a coded design system (tokens + themed components, mirrored to Figma), real motion with a reduced-motion
path, at least one AI-native interaction handled with craft, an accessibility audit, and (for the
full-stack extension) real data + auth. Public GitHub repo, professional README. A designer should be
_proud_ to show it; an engineer should respect the code.

**Milestones:** brief & wireframes → tokens & component set → app assembled → motion pass → AI-interaction
pass → accessibility audit → (optional) data/auth → deploy → README & case study.

**Rubric (mid-level DE hiring bar):**

- **Craft:** faithful spacing/type/color; motion that serves; the restraint to _not_ animate.
- **Design systems:** one source of truth for tokens; minimal, deliberate component APIs; Figma↔code parity.
- **Code quality:** semantic HTML, typed props, no derived-data-in-state, composed not monolithic.
- **Accessibility:** keyboard-complete, focus managed, screen-reader-audited.
- **Engineering practice:** clean Git history, README that explains the _why_, deployed and live.
- **Narrative:** walks through it with genuine opinions about tradeoffs made.

---

## F. Scope guardrails

Out of core (future "Keep Growing" appendix): WebGL/shaders, CI, visual-regression testing, Storybook,
native Swift. The **self-audit → entry-point** feature from the source spec is deferred — a mature
multi-student feature; Spark ships linearly first.

---

## Provenance

Frame (Definition of Done, module template, pacing) adapted from a course-generation spec, used strictly
as a **rubric to build toward**. Target profile from the Granola Design Engineer role (flagged 2026-07-02),
used as a competency benchmark. All substance is refined from the lived log in
[`../spark-teaching-log/`](../spark-teaching-log/) (sessions 01–10). The state column is generated from
`content/spark/` and was last regenerated 2026-08-27. The hard-won parts still come from the log; the
connective prose no longer waits for a session to produce it.
