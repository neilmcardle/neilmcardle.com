const REF_NAMES = {
  emil: "Emil Kowalski",
  apple: "Apple",
  imp: "Impeccable",
  anthropic: "Anthropic",
  vercel: "Vercel",
  wcag: "WCAG 2.2",
  cwv: "Core Web Vitals",
};
const REFS = {
  "page-bg": {
    imp: {
      say: "Pick light or dark from where and when it is used, not from the category.",
    },
  },
  "body-colour": {
    imp: {
      say: "Body text at least 4.5:1. On coloured surfaces, tint secondary text from the hue, never plain grey.",
    },
  },
  accent: {
    imp: {
      say: "In product UI, colour marks action, selection and status, and rarity gives it force. Keep the primary action easy to find. New palettes in OKLCH.",
      opt: 1,
    },
  },
  hairline: {
    imp: {
      say: "Prefer explicit colours over translucent overlays when alpha would make contrast depend on what is behind.",
      opt: 1,
    },
  },
  selection: {
    imp: {
      say: "Theme text selection from the palette. Browser defaults belong to no design system.",
    },
  },
  "dark-mode": {
    apple: {
      say: "Colours that adapt to light and dark, with an eased change between them.",
      opt: 1,
    },
    imp: {
      say: "Compose each theme separately, never a mechanical inversion.",
    },
  },
  "status-colours": {
    imp: {
      say: "Anything carried by colour also needs text, shape, an icon or position.",
    },
  },
  "grey-temp": {
    imp: {
      say: "Tint neutrals only when the brand hue earns it. Neutral grey is valid.",
      opt: 0,
    },
  },
  "ui-family": {
    apple: {
      say: "Start with the system font. It already has optical sizing and tracking tables. Override only with a reason.",
      opt: 0,
    },
  },
  "display-family": {
    imp: {
      say: "For product and reading surfaces, one well-tuned family. A second family needs a job only it can do.",
      opt: 0,
    },
  },
  "reading-type": {
    apple: {
      say: "Body at 100% (16px), line height 1.5, tracking near 0.",
      d: { size: 16, lh: 1.5, tr: 0 },
    },
    imp: { say: "16px is the ordinary floor for body text.", d: { size: 16 } },
  },
  "ui-type": {
    apple: {
      say: "Small text wants slightly positive tracking for legibility. No exact figure given.",
    },
  },
  "heading-type": {
    apple: {
      say: "Display: line height 1.05, tracking -2%, up to 4rem (64px).",
      d: { size: 64, tr: -2, lh: 1.05 },
    },
    imp: { say: "Tracking no tighter than -4%. Display no bigger than 6rem." },
  },
  "type-scale": {
    imp: {
      say: "Obvious steps in size and weight. Use the fewest roles that make the hierarchy clear.",
    },
  },
  measure: {
    imp: {
      say: "Body measure 65 to 75 characters.",
      d: { ch: 70 },
      range: true,
    },
  },
  "tracking-by-size": {
    apple: {
      say: "Tracking is size-specific, never one value. Tighten big text, leave body near 0.",
      opt: 0,
    },
    imp: { say: "Tune tracking to the actual face and size.", opt: 0 },
  },
  numerals: {
    imp: { say: "Tabular figures wherever the numbers are data.", opt: 1 },
  },
  "text-wrap": { imp: { say: "Balanced headings.", opt: 1 } },
  "font-loading": {
    imp: {
      say: "Metric-compatible fallbacks, and never invisible text.",
      opt: 2,
    },
  },
  "paragraph-rhythm": {
    imp: { say: "Space or indent, never both. Both double-marks the break." },
  },
  "spacing-unit": {
    imp: {
      say: "A 4-unit base gives the useful middle steps an 8-only scale misses.",
      opt: 0,
    },
    apple: {
      say: "Space in rem or em so a larger text setting does not break the layout.",
    },
  },
  "section-gap": {
    imp: {
      say: "Tight groups, generous separation, more space above a heading than below it.",
    },
  },
  separation: {
    imp: {
      say: "Group by proximity before adding containers. Use depth only when it clarifies state or hierarchy.",
      opt: 4,
    },
    apple: {
      say: "Bigger surfaces read as thicker: stronger blur and a deeper shadow than small chips.",
    },
  },
  shadow: {
    imp: {
      say: "Shadows carry an offset and a soft blur. No zero-offset halos, no hard offset block shadows.",
    },
  },
  "icon-style": {
    imp: {
      say: "Drawn icons from a real library or authored SVG, in one consistent stroke and weight.",
    },
  },
  "emoji-icons": {
    imp: {
      say: "Unicode glyphs or emoji standing in for an icon system is refused.",
      opt: 0,
    },
  },
  press: {
    emil: {
      say: "Shrink to 0.97 on :active, 160ms ease-out. Keep it between 0.95 and 0.98.",
      opt: 0,
      d: { s: 0.97, dur: 160 },
    },
    apple: {
      say: "Shrink to 0.97 over 100ms ease-out, on pointer down, not release.",
      opt: 0,
      d: { s: 0.97, dur: 100 },
    },
    imp: {
      say: "Immediate feedback takes 100 to 150ms.",
      d: { dur: 130 },
      range: true,
    },
  },
  "hover-gating": {
    emil: {
      say: "Gate hover behind (hover: hover) and (pointer: fine). Touch fires hover on tap.",
      opt: 0,
    },
  },
  links: {
    imp: {
      say: "Theme the underline offset. It ships with a browser default otherwise.",
    },
  },
  validation: { apple: { say: "Validate inline, not on submit." } },
  focus: {
    imp: {
      say: "Theme focus rings from the palette, at 3:1 contrast or better.",
    },
  },
  tooltips: {
    emil: {
      say: "Delay the first one, then open neighbours instantly with no animation. 125ms ease-out when they do animate.",
      opt: 0,
    },
  },
  "browser-surfaces": {
    imp: {
      say: "Selection, caret, scrollbars, focus rings, underline offset and table numerals all themed. The cheapest sign a page was built, not assembled.",
      c: "all",
    },
  },
  easing: {
    emil: {
      say: "Strong ease-out, cubic-bezier(0.23, 1, 0.32, 1). Never ease-in for interface motion.",
      opt: 2,
    },
    imp: {
      say: "Natural deceleration, cubic-bezier(0.16, 1, 0.3, 1). No bounce or elastic by reflex.",
      opt: 3,
    },
    apple: {
      say: "Springs for anything you can touch. Mirror the curve on reversible transitions.",
    },
  },
  durations: {
    emil: {
      say: "Press 100 to 160ms, tooltip 125 to 200, dropdown 150 to 250, modal 200 to 500. Interface motion stays under 300ms.",
      d: { press: 130, tip: 160, drop: 200, modal: 350 },
      range: true,
    },
    imp: {
      say: "Feedback 100 to 150ms, routine change 150 to 300, overlay or view change 300 to 500.",
      d: { press: 130, tip: 220, drop: 220, modal: 400 },
      range: true,
    },
  },
  enter: {
    emil: {
      say: "Never from scale(0). Start at scale(0.95) with opacity 0.",
      opt: 1,
    },
    imp: {
      say: "Exponential ease-out from a default that is already visible, so a failed script never hides content.",
    },
    apple: {
      say: "For glass surfaces, animate blur and scale together so the material arrives.",
    },
  },
  exit: {
    emil: {
      say: "Exit faster than enter. Slow where the user decides, fast where the system responds.",
      opt: 0,
    },
    imp: { say: "Exit faster than entrance.", opt: 0 },
    apple: { say: "Leave along the same path you arrived on." },
  },
  origin: {
    emil: {
      say: "Popovers scale from their trigger. Modals stay centred.",
      opt: 0,
    },
    apple: {
      say: "Anchor menus, popovers and sheets to the element that opened them.",
      opt: 0,
    },
  },
  springs: {
    apple: {
      say: "Default damping 1.0, response 0.3 to 0.4. Damping 0.8 only after a flick or throw.",
      d: { z: 1, r: 0.35 },
      range: true,
    },
    emil: {
      say: "duration 0.5, bounce 0.2, roughly damping 0.8. Keep bounce 0.1 to 0.3, and avoid it in most UI.",
      d: { z: 0.8, r: 0.5 },
    },
  },
  stagger: {
    emil: {
      say: "30 to 80ms between items. His example: 50ms gaps, 300ms each. Never block interaction while it plays.",
      d: { gap: 50, dur: 300 },
    },
    imp: {
      say: "Only when a list appears as a list, and cap the total delay.",
    },
  },
  frequency: {
    emil: {
      say: "100+ times a day: no animation. Tens of times: reduce. Occasional: standard. Rare: delight.",
      opt: 0,
    },
    imp: {
      say: "In product UI, keep routine transitions fast. No waiting through load choreography.",
    },
  },
  interruptible: {
    emil: {
      say: "Transitions retarget mid-flight; keyframes restart from zero.",
      opt: 0,
    },
    apple: {
      say: "Springs from the current on-screen value for anything gesture-driven. Neither transitions nor keyframes.",
    },
  },
  "reduced-motion": {
    emil: {
      say: "Fewer and gentler, not zero. Keep opacity and colour.",
      opt: 0,
    },
    apple: {
      say: "Swap slides and springs for short cross-fades. Drop overshoot.",
      opt: 0,
    },
    imp: {
      say: "Reduce movement, keep the feedback that confirms an action.",
      opt: 0,
    },
  },
  "scroll-reveal": {
    imp: {
      say: "One authored moment, not the same entrance on every section.",
      opt: 2,
    },
  },
  "page-transitions": {
    imp: {
      say: "View transitions or shared elements when continuity is the point.",
      opt: 2,
    },
  },
  "card-hover": {
    emil: {
      say: "Hover is seen tens of times a day, so remove it or reduce it a lot.",
    },
  },
  "header-surface": {
    apple: {
      say: "Translucent layer with content scrolling under it, and an edge fade instead of a hard 1px divider.",
      opt: 1,
    },
    imp: {
      say: "Glass and blur only as a specific effect, never as decoration.",
    },
  },
  collections: {
    imp: {
      say: "Same-size cards as the page structure is a default to refuse. Nested cards are always wrong.",
    },
  },
  toasts: {
    emil: {
      say: "Enter and leave from the same side, with transitions so rapid toasts retarget. Pause timers when the tab is hidden.",
    },
  },
  overlays: {
    imp: {
      say: "No modal for a task that needs neither interruption nor protected focus.",
    },
    apple: {
      say: "Dim to focus for a modal task. A side panel that should not break flow gets no scrim.",
    },
  },
  folds: {
    imp: {
      say: "Avoid animating height directly. Use grid or transform techniques.",
    },
  },
  tabs: {
    emil: {
      say: "Duplicate the tab list and animate a clip-path, for a colour change no per-tab transition can match.",
    },
  },
  loading: {
    emil: {
      say: "A faster-spinning spinner makes the same wait feel shorter.",
    },
  },
  "error-messages": {
    imp: { say: "Name the problem and the way out." },
    apple: { say: "Validate inline, not on submit." },
  },
  destructive: {
    apple: {
      say: "Easy undo for slips. Confirm only for genuinely destructive, irreversible actions, and rarely.",
      opt: 0,
    },
  },
  hero: {
    imp: {
      say: "The big number, small label and supporting stats template is refused.",
    },
  },
  "section-breaks": {
    imp: {
      say: "No section numbers unless the sequence itself is information.",
    },
  },
  "fluid-type": {
    apple: {
      say: "clamp(2rem, 5vw, 4rem): 32px on a phone, 64px wide.",
      opt: 0,
      d: { min: 32, max: 64 },
    },
    imp: {
      say: "Marketing display type can respond to space. Keep product and reading surfaces predictable.",
    },
  },
  breakpoints: { imp: { say: "Prefer container-aware components.", opt: 2 } },
  eyebrows: {
    imp: { say: "A ban, not a default. No brief earns it back.", opt: 0 },
  },
  "cta-labels": {
    imp: { say: "Controls name their action.", opt: 0 },
    apple: { say: "Direct, specific labels beat safe generic ones.", opt: 0 },
  },
  "error-voice": {
    imp: { say: "Errors name the problem and the recovery.", opt: 0 },
  },
  "living-gradient": {
    apple: {
      say: "Avoid full-viewport moving backgrounds and slow loops near one cycle per 5 seconds.",
    },
  },
  glass: {
    apple: {
      say: "rgba(255,255,255,0.6), blur(20px) saturate(180%). Never stack light glass on light glass.",
      d: { blur: 20, tint: 0.6, sat: 180 },
    },
    emil: {
      say: "Keep blur under 20px. Heavy blur is expensive, especially in Safari.",
    },
    imp: { say: "Only as a specific effect, never decoration." },
  },
  tilt: {
    emil: {
      say: "Run pointer-driven movement through a spring (stiffness 100, damping 10) so it has momentum. Decorative only.",
    },
  },
  magnetic: {
    emil: {
      say: "Spring the pointer-driven value rather than setting it directly.",
    },
  },
  "text-effects": {
    imp: { say: "No gradient text. Emphasis comes from weight or size." },
  },
  marquee: { emil: { say: "Constant motion uses linear easing." } },
  "scroll-driven": {
    imp: {
      say: "Only when the scroll relationship carries meaning, with a fallback.",
    },
  },
  sound: {
    apple: {
      say: "Only on meaningful moments, fired on the same frame as the visual, matched to the action.",
      opt: 1,
    },
  },
  intro: {
    emil: {
      say: "Rare and first-time moments are where delight belongs.",
      opt: 1,
    },
    imp: {
      say: "In product UI, never make people wait through load choreography.",
    },
  },
  javascript: {
    emil: {
      say: "CSS animations run off the main thread and stay smooth while JS is busy.",
    },
  },
  "font-budget": {
    apple: { say: "System font first.", opt: 0 },
    imp: { say: "Load only the faces and weights you use." },
  },
  "layout-shift": {
    imp: { say: "No disruptive reflow while things load.", opt: 0 },
  },
  "animation-cost": {
    emil: {
      say: "Transform and opacity. Set transforms directly, not through inherited CSS variables.",
    },
    imp: {
      say: "Blur, clip-path, mask and shadow are fine when they stay smooth. will-change only during the animation.",
    },
    apple: {
      say: "Transform and opacity, with will-change where motion is imminent.",
    },
  },
  perceived: {
    emil: {
      say: "A 180ms select feels faster than a 400ms one. Instant tooltips after the first make the whole toolbar feel quicker.",
    },
  },
  contrast: {
    imp: {
      say: "AA: 4.5:1 for body, 3:1 for large text, controls, icons and focus.",
      opt: 0,
    },
  },
  targets: {
    apple: { say: "About 10px of extra hit area around a tap target." },
    imp: {
      say: "Keep the tap area usable even when the visible mark is small.",
    },
  },
  keyboard: { emil: { say: "Never animate keyboard-initiated actions." } },
  preferences: {
    apple: {
      say: "Respect reduced motion, reduced transparency and increased contrast, each separately.",
    },
  },
  "worst-case": {
    imp: {
      say: "Run the real copy at every breakpoint and fix what overflows.",
      opt: 2,
    },
  },
  "mobile-native": {
    apple: {
      say: "Highlight on touch down, commit on touch up, and allow cancel by dragging away.",
    },
  },
  language: { imp: { say: "Test long headings and translation expansion." } },
  semantics: {
    imp: {
      say: "Keyboard, touch and screen-reader order match the visual order.",
    },
  },
  mode: {
    imp: {
      say: "Persuade, Operate, Read or Experience, chosen per surface, not per product. This item is theirs.",
    },
  },
  boldness: {
    imp: {
      say: "One authored moment. When torn between refined and committed, commit.",
      opt: 0,
    },
  },
  "motion-personality": {
    emil: {
      say: "Match motion to the mood: playful can bounce, a professional dashboard should be crisp and fast.",
    },
  },
  "anti-defaults": {
    imp: {
      say: "Most of this list comes from their refusals: eyebrows, gradient text, card grids, hero metrics, decorative glass.",
    },
  },
  consistency: {
    apple: {
      say: "Things that look the same must behave the same and live in the same place.",
      opt: 0,
    },
  },
  "token-names": {
    imp: { say: "Token names describe purpose, not values.", opt: 0 },
  },
  "review-habits": {
    emil: {
      say: "Review the next day, and play motion in slow motion or frame by frame.",
    },
    apple: {
      say: "Prototype interactively and test with real people in real context.",
    },
    imp: {
      say: "Inspect in bounded passes, desktop and mobile together, then stop.",
    },
  },
};
const REFS_MORE = {
  "page-bg": {
    anthropic: {
      say: "Generated design clusters around warm cream (near #F4F1EA) or near-black with one acid accent. Don't spend a free choice on either.",
    },
  },
  "body-colour": { wcag: { say: "4.5:1 for body text at AA, 7:1 at AAA." } },
  "heading-colour": {
    anthropic: {
      say: "A tinted near-black (#0B0B0B, #111) standing in for black is a template tell.",
    },
  },
  accent: {
    anthropic: {
      say: "Near-black with a single bright acid-green or vermilion accent is a default, not a choice.",
    },
  },
  "dark-mode": {
    vercel: {
      say: "Set color-scheme on html, match theme-color to the page background, give native selects explicit colours.",
    },
    emil: {
      say: "One theme-color per colour scheme, matched to the top of the page.",
    },
  },
  "status-colours": {
    wcag: { say: "Colour is never the only way information is shown (1.4.1)." },
  },
  "ui-family": {
    anthropic: {
      say: "Choose typefaces deliberately, not the defaults you would reach for on any project.",
    },
  },
  "display-family": {
    anthropic: {
      say: "One family or two. If two, make them clearly distinct.",
    },
  },
  "reading-type": {
    wcag: {
      say: "Text must survive 200% zoom (1.4.4) and user spacing of line height 1.5 and letter spacing 0.12em (1.4.12).",
    },
  },
  "heading-type": {
    anthropic: {
      say: "Don't accent a single word of a headline in italic, bold or colour.",
    },
  },
  "type-scale": {
    anthropic: {
      say: "A clear scale following The Elements of Typographic Style, with intentional weights.",
    },
  },
  measure: {
    anthropic: {
      say: "Under 80 characters. Serif can run slightly longer, with a little more line height.",
    },
  },
  numerals: {
    vercel: { say: "tabular-nums for number columns and comparisons.", opt: 1 },
  },
  "text-wrap": {
    vercel: { say: "balance or pretty on headings to avoid widows.", opt: 1 },
  },
  labels: {
    anthropic: {
      say: "All caps for labels is one of the commonest tells of a generated page.",
      opt: 0,
    },
  },
  "font-loading": {
    vercel: {
      say: "Preload critical fonts and use font-display: swap.",
      opt: 1,
    },
  },
  radius: {
    anthropic: {
      say: "One radius on everything regardless of hierarchy is the SaaS-card kit.",
    },
  },
  shadow: {
    anthropic: {
      say: "The same soft grey shadow, rgba(0,0,0,.1), under every card is a default.",
    },
    emil: {
      say: "When a shadow animates, use filter: drop-shadow() rather than box-shadow, which repaints every frame.",
    },
  },
  separation: {
    anthropic: {
      say: "Borders, dividers and labels should carry information, not decorate.",
    },
  },
  dividers: {
    anthropic: {
      say: "Hairline rules, zero radius and dense newspaper columns is a default look.",
    },
  },
  "image-placeholder": {
    vercel: {
      say: "Every image gets explicit width and height so nothing shifts while it loads.",
    },
  },
  "cta-arrows": {
    anthropic: {
      say: "A → appended to link and button text is template chrome.",
      opt: 0,
    },
  },
  "hover-gating": {
    emil: {
      say: "Gate hover behind (hover: hover) and (pointer: fine). Touch fires hover on tap and it sticks.",
      opt: 0,
    },
    vercel: {
      say: "Buttons and links need a hover state, and hover, active and focus should all stand out from rest.",
    },
  },
  inputs: {
    emil: {
      say: "Inputs at 16px or more, or iOS zooms the page and doesn't zoom back. Never fix it by disabling zoom.",
      d: { fs: 16 },
    },
    vercel: {
      say: "autocomplete, a meaningful name, the right type and inputmode, and never block paste.",
    },
  },
  "field-labels": {
    vercel: {
      say: "Labels are clickable. Placeholders end with … and show an example.",
    },
    wcag: { say: "Fields have labels or instructions (3.3.2)." },
  },
  validation: {
    vercel: {
      say: "Errors inline next to their fields. On submit, focus the first error. Keep submit enabled until the request starts.",
    },
  },
  focus: {
    vercel: {
      say: "A visible :focus-visible ring. Never remove an outline without a replacement.",
    },
    wcag: {
      say: "Focus is visible (2.4.7) and never hidden under sticky content (2.4.11).",
    },
  },
  toggles: {
    vercel: {
      say: "A checkbox and its label share one hit target with no dead zone.",
    },
  },
  enter: {
    anthropic: {
      say: "Fade-and-slide-up entrances on each section read as generated.",
    },
  },
  interruptible: {
    vercel: { say: "Animations must be interruptible by user input." },
  },
  "reduced-motion": {
    vercel: {
      say: "A reduced variant or no animation. Muted decorative loops stop.",
    },
    wcag: {
      say: "Motion triggered by interaction can be turned off (2.3.3, AAA).",
    },
  },
  "scroll-reveal": {
    anthropic: {
      say: "One orchestrated moment lands better than scattered effects.",
      opt: 2,
    },
  },
  "card-hover": {
    anthropic: { say: "Hover transitions on every card read as generated." },
  },
  folds: {
    emil: {
      say: "Height is the one layout property he tolerates animating, for accordions only.",
      opt: 0,
    },
  },
  tabs: {
    vercel: { say: "Put the active tab in the URL so it can be linked to." },
  },
  "header-surface": {
    vercel: { say: "Sticky headers must never cover the focused element." },
  },
  collections: {
    anthropic: {
      say: "Content chopped into identical rounded cards is the SaaS-card kit.",
    },
    vercel: { say: "Virtualise lists over 50 items." },
  },
  toasts: { vercel: { say: 'Announce them with aria-live="polite".' } },
  overlays: {
    vercel: {
      say: "overscroll-behavior: contain inside modals, drawers and sheets.",
    },
    emil: {
      say: "contain on sheet content so the page behind doesn't scroll, and safe-area padding at the bottom.",
    },
  },
  loading: {
    vercel: {
      say: 'Loading text ends with … ("Saving…"). Show the spinner only once the request starts.',
    },
  },
  "empty-states": {
    anthropic: { say: "An empty screen is an invitation to act.", opt: 0 },
    vercel: { say: "Empty strings and arrays must never render broken UI." },
    emil: { say: "Zero items is one of the first worst cases to test." },
  },
  tables: {
    vercel: { say: "A real table element, with tabular figures for numbers." },
  },
  "error-messages": {
    vercel: {
      say: "Inline next to the field, and focus the first one on submit.",
      opt: 0,
    },
    anthropic: { say: "Say what went wrong and how to fix it." },
  },
  destructive: {
    vercel: { say: "A confirmation or an undo window. Never immediate." },
  },
  search: {
    vercel: { say: "Put filters in the URL so results can be shared." },
  },
  hero: {
    anthropic: {
      say: "Open with the most characteristic thing in the subject's world. Big number, small label and stats is the default.",
    },
  },
  "section-breaks": {
    anthropic: {
      say: "Numbered markers only when the content really is a sequence.",
    },
  },
  breakpoints: {
    wcag: {
      say: "Content reflows at 320px wide with no sideways scrolling (1.4.10).",
    },
  },
  gutters: {
    emil: { say: "viewport-fit=cover, then pad with env(safe-area-inset-*)." },
    vercel: { say: "Full-bleed layouts need safe-area insets for notches." },
  },
  case: {
    vercel: {
      say: "Their written guidelines say Title Case for headings and buttons. Their own homepage uses Title Case on the big heading and sentence case on buttons.",
      opt: 1,
    },
    anthropic: { say: "Sentence case, plain verbs, no filler.", opt: 0 },
  },
  dashes: {
    anthropic: {
      say: "Labels built as 'WORD — fragment' with a spaced em dash are template chrome.",
    },
  },
  eyebrows: {
    anthropic: {
      say: "A tracked all-caps label above every heading is template chrome.",
      opt: 0,
    },
  },
  "cta-labels": {
    vercel: { say: "Specific: 'Save API Key', not 'Continue'.", opt: 0 },
    anthropic: {
      say: "'Save changes', not 'Submit'. An action keeps its name through the flow.",
      opt: 0,
    },
  },
  "error-voice": {
    vercel: {
      say: "Include the fix or next step, not just the problem.",
      opt: 0,
    },
    anthropic: { say: "Errors don't apologise and are never vague.", opt: 0 },
  },
  "meta-separators": {
    anthropic: {
      say: "Details joined with middle dots (A · B · C) is template chrome.",
      opt: 0,
    },
  },
  voice: {
    vercel: { say: "Second person. Avoid first person.", opt: 2 },
    anthropic: {
      say: "In the interface's voice rather than a person's.",
      opt: 2,
    },
  },
  "living-gradient": {
    wcag: {
      say: "Moving content over 5 seconds needs a way to pause, stop or hide it (2.2.2).",
    },
    vercel: { say: "Muted decorative loops stop under reduced motion." },
  },
  marquee: {
    wcag: {
      say: "Moving content over 5 seconds needs a way to pause, stop or hide it (2.2.2).",
    },
    vercel: {
      say: "Autoplaying motion over 5 seconds needs pause, stop or hide controls.",
    },
  },
  intro: {
    anthropic: {
      say: "One page-load sequence or one reveal, not effects scattered everywhere.",
    },
  },
  vitals: {
    cwv: {
      say: "Good means LCP 2.5s or less, INP 200ms or less, CLS 0.1 or less, for 75% of visits.",
      d: { lcp: 2.5, inp: 200, cls: 0.1 },
    },
  },
  rendering: {
    vercel: {
      say: "Stream with Suspense boundaries and avoid request waterfalls.",
    },
  },
  javascript: {
    vercel: {
      say: "Import directly rather than through barrel files, dynamic-import heavy components, load analytics after hydration.",
    },
  },
  "font-budget": { vercel: { say: "Preload the critical fonts." } },
  images: {
    vercel: {
      say: "Explicit width and height, lazy below the fold, high fetch priority for the hero image.",
    },
  },
  "layout-shift": {
    vercel: { say: "Explicit image dimensions so nothing shifts.", opt: 0 },
    cwv: { say: "CLS of 0.1 or less.", opt: 0 },
  },
  "third-party": {
    vercel: { say: "Load analytics and logging after hydration." },
  },
  video: {
    vercel: {
      say: "Muted, looping video instead of animated GIFs, with a still fallback.",
    },
  },
  "animation-cost": {
    emil: {
      say: "Transform and opacity. Design for 8ms frames on 120Hz screens. CSS or WAAPI when the page is busy. Write to style, not React state. will-change only once you see a problem.",
    },
    vercel: { say: "Transform and opacity only, and never transition: all." },
  },
  perceived: {
    vercel: {
      say: "Preload on hover or focus, so the next view is ready before the click.",
    },
  },
  "long-pages": {
    vercel: {
      say: "Virtualise lists over 50 items, or use content-visibility: auto.",
    },
  },
  contrast: {
    wcag: {
      say: "AA: 4.5:1 for body, 3:1 for large text and interface parts. AAA: 7:1.",
      opt: 0,
    },
  },
  targets: {
    wcag: {
      say: "At least 24×24px (2.5.8, AA). 44×44px is the enhanced level (2.5.5, AAA).",
      d: { t: 24 },
    },
  },
  keyboard: {
    vercel: {
      say: "Keyboard handlers on everything interactive, a skip link, and keyboard alternatives to gestures.",
    },
    wcag: {
      say: "Everything works from a keyboard (2.1.1), with no trap (2.1.2).",
    },
  },
  "worst-case": {
    emil: {
      say: "The realistic worst case for every value, behind a Demo data / Worst case toggle, never nonsense data.",
      opt: 2,
    },
    vercel: { say: "Plan for short, average and very long inputs.", opt: 2 },
  },
  "mobile-native": {
    emil: {
      say: "No tap highlight, touch-action: manipulation, dvh for app shells and svh for heroes, overscroll control, safe areas, a theme-color per scheme, and test on a real phone.",
    },
    vercel: {
      say: "touch-action: manipulation, a deliberate tap highlight, autoFocus never on mobile.",
    },
  },
  language: {
    vercel: {
      say: 'Intl for dates and numbers, language from Accept-Language not IP, translate="no" on brand names.',
    },
    emil: {
      say: "Non-Latin text and translated labels are worst cases to test.",
    },
  },
  semantics: {
    vercel: {
      say: "Semantic HTML before ARIA, a proper heading order, and a skip link.",
    },
    wcag: {
      say: "Structure and relationships are in the markup, not only the visuals (1.3.1).",
    },
  },
  boldness: {
    anthropic: {
      say: "Spend your boldness in one place and keep everything around it quiet.",
      opt: 0,
    },
  },
  "anti-defaults": {
    anthropic: {
      say: "Their list: warm cream with a clay accent, near-black with one acid accent, broadsheet hairlines, the SaaS-card kit, eyebrows, middle dots, mono labels, arrows on links.",
    },
  },
  consistency: {
    anthropic: {
      say: "An action keeps the same name through the whole flow.",
      opt: 0,
    },
  },
  "review-habits": {
    anthropic: {
      say: "Plan, review the plan against the brief, build, then critique from screenshots.",
    },
    emil: {
      say: "Review the next day, play motion in slow motion or frame by frame, and feed it the worst realistic data before calling it done.",
    },
  },
};
for (const [id, srcs] of Object.entries(REFS_MORE))
  REFS[id] = Object.assign(REFS[id] || {}, srcs);
