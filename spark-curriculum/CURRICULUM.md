# Spark — Curriculum Spine

*Designer → Design Engineer (→ full-stack). The derived syllabus: outcomes, ordered modules, checkpoints.*

---

## What this document is (and is not)

This is **the metal, refined from the mine.** The mine is
[`../spark-teaching-log/`](../spark-teaching-log/) — the raw, chronological record of learning this material, warts and all. This file is the *designed* course spine derived from it,
ordered for a learner we haven't met.

**Two rules that make Spark Spark:**

1. **The rubric is borrowed; the content is lived.** The Definition of Done and per-module template
   are a rubric to build **toward**, never a machine to generate **from**.
2. **AI is banned as author.** Every lesson's content and code is hand-lived and hand-written by
   the instructor, documented while it's "still wet." The best assets (the S08 semicolon bug, the S10
   Babel-drift fight) prove why — real friction can't be prompted.

**Status markers:** `LIVED` = real source material exists · `PARTIAL` = touched, not fully lived ·
`AHEAD` = designed, not yet lived. Modules get their lessons written only *after* they're lived.

---

## North Star: the target profile

The competency bar we aim at is the **Design Engineer role**: *a builder who owns the seam between design and engineering — ships polished production UI
with obsessive craft (typography, color, motion, microinteractions), builds design systems in Figma
**and** code (React/TypeScript/Tailwind), keeps consistency across desktop platforms (Electron), and
invents new interaction patterns for AI-native products.*

**Shape decision (2026-07-02):** the **Design Engineer craft is the primary spine and priority**
(Phase 2 below). The broader **full-stack engineering material is also taught**, as a *completion
layer* (Phase 3) — so a Spark graduate is a great DE who can also go full-stack, not a generalist who
happens to touch design. This role plays *directly* to a designer's edge: taste, systems thinking,
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
   gestures, `prefers-reduced-motion`, and the judgment for **when *not* to animate**.
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

## B. The spine — named through-threads

Discovered by living the material; every module reinforces at least one. What a generic AI course
can't fake.

- **Craft is the differentiator** — polish, restraint, "just right." Woven from Phase 0, not saved
  for the end. *(The DE role's whole thesis.)*
- **Design in the browser / Figma ↔ code** — the designer's edge deployed early: read a design, build
  it faithfully, move tokens both directions.
- **Chosen vs. fixed tokens** — author-chosen names vs. language-fixed syntax; three-bucket sort +
  rename test. *(S09.)*
- **Language vs. framework (the two layers)** — Tailwind→CSS, JSX→JS, TS→JS; learn the layer beneath
  first. *(S04–S05.)*
- **The browser speaks more than one language** — HTML hosts CSS, JS, SVG as siblings. *(S03.)*
- **The error's location is a hint, not the truth** — read raw bytes, eliminate outward. *(S08, S10.)*
- **Your code vs. the platform** — telling "bug I wrote" from "bug in the tooling." *(S08 vs. S10.)*
- **Debugging is first-class from day one** — the paired case studies anchor a through-line.

---

## C. Roadmap

Five phases. **Phase 2 is the priority spine.** Phase 3 completes the full-stack picture.

| # | Module | Phase | Status | Feeds from |
|---|--------|-------|--------|-----------|
| 0 | Make a real file yours | 0 · Foundations | LIVED | S02–S06 |
| 1 | How the web runs | 0 | PARTIAL | S10 |
| 2 | HTML, the language | 0 | PARTIAL | S03 |
| 3 | CSS as a system | 0 | PARTIAL | S04, S06 |
| 4 | CSS craft | 0 | AHEAD | — |
| 5 | JavaScript fundamentals | 1 · JS & React | LIVED | S06–S10 |
| 6 | Intermediate JavaScript | 1 | AHEAD | — |
| 7 | TypeScript for UI | 1 | AHEAD | — |
| 8 | React fundamentals | 1 | PARTIAL | S05, S10, practice/search |
| 9 | **Design systems in code (Figma↔code)** | **2 · DE core** | AHEAD | — |
| 10 | **Motion & interaction engineering** | **2 · DE core** | AHEAD | — |
| 11 | **Shipping UI: Next.js + desktop/Electron** | **2 · DE core** | AHEAD | — |
| 12 | **Designing AI-native interaction patterns** | **2 · DE core** | AHEAD | — |
| 13 | Data & APIs in depth | 3 · Full-stack | AHEAD | — |
| 14 | Databases & ORM | 3 | AHEAD | — |
| 15 | Auth | 3 | AHEAD | — |
| 16 | Professional practice & deploy | 3 | PARTIAL | S08, S10 |
| 17 | Capstone | 4 | AHEAD | — |

**Pacing (8–10 hrs/week):** ~9-month gentle (1 module / 2–3 wks) or ~6-month intensive (1 / 1.5–2 wks).
A learner aiming *only* at the DE role can ship after Phase 2 + capstone; Phase 3 makes them full-stack.

---

## D. Modules

Template: **Promise · Outcomes · Concepts (in order) · Guided build · Checkpoint · Common designer
mistakes · Threads.** `AHEAD` modules carry the frame only — lived, then written.

---

### PHASE 0 — FOUNDATIONS

#### M0 — Make a real file yours · `LIVED`
**Promise:** Read every line of a real shipped file and say what it does and why.
**Concepts:** the file as unit of work · imports (object vs. default) · `export default` · JSX as
"HTML-shaped JS" · chosen-vs-fixed sort on a real line.
**Build:** annotate the student's own landing page line-by-line, comprehension first.
**Checkpoint:** name any token's bucket; rename every chosen name and keep it running.
**Threads:** chosen-vs-fixed · language-vs-framework.

#### M1 — How the web runs · `PARTIAL`
**Promise:** Know what happens between saving a file and seeing it in a browser.
**Concepts:** terminal as text UI · `file://` vs. local server · client↔server round-trip · packages
& version pinning / dependency drift.
**Build:** serve a static page over `http.server`, then Vite; watch the same file behave differently.
**Checkpoint:** start a server, explain `file://` caching, spot an unpinned dependency.
**Threads:** your-code-vs-the-platform · error-location-is-a-hint. *(S10 delivered this reactively,
at the moment of pain — keep that discovery framing.)*

#### M2 — HTML, the language · `PARTIAL`
**Promise:** Hand-write semantic, accessible HTML — and start designing in the browser.
**Concepts:** DOM as a tree · semantic vs. `div` soup · `href` vs. `target` · buttons vs. links ·
forms & labels (a11y from the start) · SVG as an embedded language · `currentColor`.
**Build:** a **type-specimen page** — pure semantic HTML, screen-reader clean.
**Checkpoint:** keyboard tab-through passes; no `div` where a semantic element exists; SVG inherits
color via `currentColor`.
**Threads:** the-browser-speaks-more-than-one-language · craft-is-the-differentiator · a11y-from-day-one.

#### M3 — CSS as a system · `PARTIAL`
**Promise:** Build responsive layouts and fluid type without a framework.
**Concepts:** cascade & specificity · box model · flexbox · grid · custom properties (tokens in raw
CSS) · `em`/`rem` & unitless `line-height` · `clamp()` fluid type · three responsive patterns · why
Tailwind is "just classes."
**Build:** a **pricing page**, hand-CSS'd, fully responsive, fluid type.
**Checkpoint:** no magic numbers where a token belongs; holds 320→1440px; type scales fluidly.
**Threads:** language-vs-framework · design-in-the-browser.

#### M4 — CSS craft · `AHEAD`
**Promise:** Recreate a real design pixel-faithfully and add tasteful transitions.
**Frame:** web typography depth · faithful layout recreation from a screenshot · CSS transitions with
restraint. *Build: recreate a well-known product screen, then add transitions.*
**Threads:** craft-is-the-differentiator · when-not-to-animate (previews Phase 2).

---

### PHASE 1 — JAVASCRIPT & REACT

#### M5 — JavaScript fundamentals · `LIVED`
**Promise:** Solve UI problems in plain JavaScript.
**Concepts (in order):** values & variables · functions & arrow functions · the `.` (property vs.
method) · arrays, `.length`, indexing · `.filter`/`.map` as folded-up loops · objects · arrays of
objects · booleans & comparisons · statements vs. expressions · `if`/`else` & the ternary · template
literals · the semicolon/ASI footgun · **reading an error to its true cause.**
**Build:** a **command-palette-style filter** in plain JS (no React yet).
**Checkpoint:** write a filter from blank; classify every token's bucket; trace an error past its
reported line.
**Common mistakes:** storing derived data; trusting the error's line number; smart-quotes.
**Threads:** chosen-vs-fixed · statements-vs-expressions · error-location-is-a-hint. *(Best-sourced
module after M0: S07 ternary, S08 map/filter/objects + ASI bug, S09 chosen-vs-fixed.)*

#### M6 — Intermediate JavaScript · `AHEAD`
**Promise:** Fetch and work with real data in the UI.
**Frame:** async/await · `fetch` · APIs & JSON · ES modules. *Build: a live data-backed card.*
**Threads:** error-location-is-a-hint (async errors).

#### M7 — TypeScript for UI · `AHEAD`
**Promise:** Type component props and data confidently.
**Frame:** what types add · structural typing · typing props & API responses. *Build: retype M6.*
**Threads:** language-vs-framework (TS→JS).

#### M8 — React fundamentals · `PARTIAL`
**Promise:** Build a small React app and reason about state.
**Concepts (in order):** component = function returning one JSX root · `useState` & the
event→setState→re-render loop · derived vs. stored state · the controlled input · **props: data
parent→child** · composition into a tree · lifting state up · the four states (idle/loading/empty/error).
**Build:** the search interaction in React → split into a component tree → real empty/loading/error states.
**Checkpoint:** no derived data in `useState`; justify the state shape aloud; handle all four states;
hand-write a prop.
**Common mistakes:** derived data in state; one giant component; happy-path only.
**Threads:** chosen-vs-fixed (`onClick` spelling) · your-code-vs-the-platform.
*(S05, S10, and `practice/search*.html` feed this. **Next lived frontier: hand-writing props.**)*

---

### PHASE 2 — DESIGN ENGINEER CORE *(the priority spine)*

#### M9 — Design systems in code (Figma ↔ code) · `AHEAD`
**Promise:** Turn a design system into a coded, themed component library — and move tokens both directions.
**Frame:** design tokens (Figma variables ↔ CSS custom properties / Tailwind theme) · theming & dark
mode · component API design · variants (CVA / Tailwind, and a vanilla-extract-style look) · documenting
components. *Build: a **design-token pipeline + themed component set**, mirrored from a Figma file.*
**Checkpoint:** one source of truth for tokens; components have a deliberate, minimal API; dark mode via
tokens, not overrides; a designer *and* an engineer would both respect it.
**Threads:** design-in-the-browser / Figma↔code · craft-is-the-differentiator · language-vs-framework.
*(Design-systems expertise is the edge here — lean on it.)*

#### M10 — Motion & interaction engineering · `AHEAD`
**Promise:** Implement high-craft motion and microinteractions — and know when to withhold them.
**Frame:** CSS transitions/animations · Framer Motion · springs vs. easing · gestures · layout & page
transitions · `prefers-reduced-motion` · **when *not* to animate.** *Build: an **animated onboarding
flow** with a genuine reduced-motion path.*
**Checkpoint:** motion serves meaning, never decorates; spring/easing chosen with intent; reduced-motion
is real, not an afterthought; nothing drops frames.
**Threads:** craft-is-the-differentiator · when-not-to-animate.

#### M11 — Shipping UI: Next.js + desktop/Electron · `AHEAD`
**Promise:** Ship a real, polished multi-surface app and understand desktop delivery.
**Frame:** Next.js routing · server vs. client components (working level) · forms · data fetching ·
performance basics (no dropped frames, bundle awareness) · **Electron & cross-platform (Mac/Windows)
consistency.** *Build: an **interactive portfolio or dashboard**, deployed; note where a desktop shell
changes the calculus.*
**Threads:** craft-is-the-differentiator · your-code-vs-the-platform.

#### M12 — Designing AI-native interaction patterns · `AHEAD`
**Promise:** Invent interaction patterns for AI products where no precedent exists.
**Frame:** streaming & latency UX · uncertainty/confidence states · human-in-the-loop editing · the
four states for *non-deterministic* output · trust, correction, and "undo the AI." *Build: a small
AI-driven UI (e.g. a live-summarizing note field) with first-class loading/uncertain/error states.*
**Checkpoint:** the interface stays calm under streaming/latency; the user can always correct or undo;
uncertainty is shown honestly. **This is the role's headline skill — treat it as the differentiator.**
**Threads:** craft-is-the-differentiator · your-code-vs-the-platform.

---

### PHASE 3 — FULL-STACK COMPLETION *(also taught)*

#### M13 — Data & APIs in depth · `AHEAD`
**Frame:** what a request really is · route handlers · server actions · validation. *Build: a working
endpoint behind one of the earlier UIs (e.g. a waitlist).*

#### M14 — Databases & ORM · `AHEAD`
**Frame:** relational thinking · schemas · what an ORM is (Drizzle) · a from-scratch raw-SQL detour
before the ORM. *Build: persist real data.*

#### M15 — Auth · `AHEAD`
**Frame:** sessions vs. tokens · a hand-written session-cookie detour · then why Supabase Auth exists.
*Build: gate something behind login.*

#### M16 — Professional practice & deploy · `PARTIAL`
**Promise:** Work like an engineer on a team.
**Concepts:** Git mental model · branches, PRs & PR descriptions (the *why*, tradeoffs) · dissecting a
real component (Radix, shadcn/ui) · component tests · devtools debugging · the debugging **method** ·
deploy to Vercel · **AI-assisted dev with judgment** (draft, then verify by hand) · reading & contributing
to an **existing codebase** (not just greenfield).
**Checkpoint:** trace a bug in unfamiliar code; PR explains *why*; can say what in AI output they'd
verify before trusting it.
**Threads:** debugging-first-class (S08 in-your-code vs. S10 in-the-platform, as a matched pair) ·
error-location-is-a-hint. *(The two authentic debugging arcs are the anchor assets here.)*

---

### PHASE 4 — CAPSTONE

#### M17 — Capstone · `AHEAD` — see Section E.

---

## E. Capstone brief & rubric

**Brief:** Design, build, and deploy one polished product **with no AI writing the core**, integrating:
a coded design system (tokens + themed components, mirrored to Figma), real motion with a reduced-motion
path, at least one AI-native interaction handled with craft, an accessibility audit, and (for the
full-stack extension) real data + auth. Public GitHub repo, professional README. A designer should be
*proud* to show it; an engineer should respect the code.

**Milestones:** brief & wireframes → tokens & component set → app assembled → motion pass → AI-interaction
pass → accessibility audit → (optional) data/auth → deploy → README & case study.

**Rubric (mid-level DE hiring bar):**
- **Craft:** faithful spacing/type/color; motion that serves; the restraint to *not* animate.
- **Design systems:** one source of truth for tokens; minimal, deliberate component APIs; Figma↔code parity.
- **Code quality:** semantic HTML, typed props, no derived-data-in-state, composed not monolithic.
- **Accessibility:** keyboard-complete, focus managed, screen-reader-audited.
- **Engineering practice:** clean Git history, README that explains the *why*, deployed and live.
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
[`../spark-teaching-log/`](../spark-teaching-log/) (sessions 01–10). `LIVED`/`PARTIAL`/`AHEAD` markers are
honest as of 2026-07-02. Modules get their lessons written only **after** they are lived — never generated
ahead.
