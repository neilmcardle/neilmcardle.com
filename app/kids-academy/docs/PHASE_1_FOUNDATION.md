# PHASE_1_FOUNDATION.md — Project Setup and Core Architecture

Build the structural foundation that everything else runs on. No interactive learning tools yet — just the skeleton, design system, and routing architecture.

This phase reflects the **soft-launch scope**: Kids Academy lives at `neilmcardle.com/kids-academy`, no auth, no payments, no email capture, no database. Progress persists per-device via `localStorage`. See `CLAUDE.md` for the full scope context.

---

## Step 1 — No new project setup

Kids Academy lives inside the existing `neilmcardle.com` Next.js app. Do **not** run `create-next-app`. Do **not** install Clerk, Stripe, Supabase, or Resend. The host repo already has Next.js 16, React 18, TypeScript, Tailwind, Framer Motion, and Lucide React — that is the full Phase 1 toolset.

The only "setup" is creating folders and files under `app/kids-academy/`.

---

## Step 2 — Design system (Tailwind tokens, namespaced)

Extend the host repo's `tailwind.config.ts` with `ka-*` tokens. Namespacing prevents collision with the makeEbook tokens already in the same config.

```ts
// tailwind.config.ts (extend.colors)
ka: {
  brand:   { 50: '#EEF2FF', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA' },
  year1:   { DEFAULT: '#F97316', light: '#FED7AA' },
  year2:   { DEFAULT: '#EAB308', light: '#FEF08A' },
  year3:   { DEFAULT: '#22C55E', light: '#BBF7D0' },
  year4:   { DEFAULT: '#3B82F6', light: '#BFDBFE' },
  year5:   { DEFAULT: '#A855F7', light: '#E9D5FF' },
  year6:   { DEFAULT: '#EF4444', light: '#FEE2E2' },
  science: { DEFAULT: '#0EA5E9', light: '#E0F2FE' },
  maths:   { DEFAULT: '#F59E0B', light: '#FEF3C7' },
  english: { DEFAULT: '#EC4899', light: '#FCE7F3' },
}
```

### Typography

Nunito (display) and Inter (body) are loaded via `next/font` inside the kids-academy layout only, exposed as `--font-ka-display` and `--font-ka-body` CSS variables. The host repo's existing `--font-inter` already covers Inter for the rest of the site, so we do not duplicate it.

OpenDyslexic is loaded as a webfont and applied when a child profile sets `accessibility.dyslexicFont = true`.

### Spacing

```ts
// tailwind.config.ts (extend.spacing)
'ka-touch':    '44px',
'ka-touch-lg': '56px',
```

### Border radius

The host repo already exposes `lg`/`md`/`sm`. No additional radius tokens are needed.

---

## Step 3 — Layouts

### `app/kids-academy/layout.tsx`
- Loads Nunito + Inter via `next/font/google`
- Sets metadata for `/kids-academy`
- Renders children inside a wrapper that exposes the font CSS variables
- No auth provider, no theme provider — kids-academy is light-mode only and does not use the host's auth context

### `app/kids-academy/learn/layout.tsx`
- Renders the learn-mode chrome: small header with logo + topic breadcrumb, and an exit link back to the curriculum map
- A session progress bar component (initially a thin placeholder; real wiring lands in Phase 2)
- No PIN gate, since no parent vs child mode exists yet

### `ClientFooterWrapper`
Add `/kids-academy` to the exclusion list in `components/ClientFooterWrapper.tsx`. The personal portfolio footer should not render on the kids-academy surface.

---

## Step 4 — Routing structure

```
app/kids-academy/
├── page.tsx                          # Landing
├── curriculum/page.tsx               # Year × subject map
├── learn/
│   ├── layout.tsx                    # Learn-mode chrome
│   └── [year]/[subject]/[topic]/
│       └── page.tsx                  # Dynamic tool loader
└── layout.tsx                        # Root layout for /kids-academy
```

The dynamic tool route reads `year`, `subject`, `topic` from params, resolves the curriculum entry, and dynamically imports the matching tool component:

```ts
const Tool = (
  await import(
    `@/app/kids-academy/components/interactive/${subject}/year-${year}/${topic}`
  )
).default
```

The page wires `onProgress` and `onComplete` to `setProgress()` from `lib/progress.ts`, and renders `<CelebrationAnimation />` when the tool reports completion.

---

## Step 5 — No middleware

Phase 1 has no auth, so no Clerk middleware is needed. The host repo's existing `middleware.ts` does not need changes — `/kids-academy` is publicly accessible.

---

## Step 6 — No database

Progress lives in `localStorage` under the key `ka_progress`. Schema is owned by `app/kids-academy/lib/progress.ts`:

```ts
type ToolProgress = {
  status: 'not_started' | 'in_progress' | 'completed'
  percentage: number
  timeSpentSeconds: number
  lastAccessed: string         // ISO date
  completedAt?: string
}

type ProgressMap = Record<string, ToolProgress>
```

Helpers exposed:
- `getProgress(toolId)` — returns a `ToolProgress`, defaulting to `not_started`
- `setProgress(toolId, patch)` — partial update, merges with existing
- `getAllProgress()` — full map (for the curriculum grid)
- `resetProgress(toolId?)` — wipe one or all

All reads/writes are SSR-guarded (`typeof window === 'undefined'`). When accounts arrive, this module's implementation swaps to a remote backend; tools remain unchanged.

---

## Step 7 — Core shared components

Build these before any learning tools, all under `app/kids-academy/components/`:

### `<YearGroupBadge year={3} />`
Coloured pill showing year group. Uses `ka-year{n}` tokens.

### `<SubjectIcon subject="science" />`
Icon + label for each subject. Uses `ka-{subject}` tokens. Icons via Lucide React.

### `<ToolCard topic={...} />`
Card used in topic listings. Shows: subject icon, topic name, estimated time, completion status. Tap navigates to `/kids-academy/learn/year-{n}/{subject}/{topic}`. "Coming soon" state when `topic.status === 'planned'`.

### `<ProgressRing percentage={...} />`
Circular SVG progress indicator for topic completion percentage.

### `<LoadingSkeleton variant="..." />`
Animated skeleton for tool loading state. Must approximate the layout of the tool being loaded — not a generic spinner.

### `<CelebrationAnimation />`
Framer Motion confetti/star burst shown on topic completion. Joyful but not overwhelming.

### `<StuckButton />`
The "I'm stuck" button in learn mode. In Phase 1 it shows a friendly encouragement message via a small popover. Will become the AI hint trigger in Phase 11.

---

## Step 8 — Curriculum data

Curriculum metadata lives in JSON under `content/curriculum/`, one file per year group. Year 3 is populated in Phase 2; other years are empty stubs in Phase 1.

```ts
// types/curriculum.ts
export type Subject = 'science' | 'maths' | 'english' | 'history' | 'geography'
export type YearGroup = 1 | 2 | 3 | 4 | 5 | 6

export type CurriculumTopic = {
  id: string                          // "y3-science-light"
  yearGroup: YearGroup
  subject: Subject
  topic: string                       // "light-and-shadows"
  title: string
  ncObjectives: string[]
  estimatedMinutes: number
  status: 'planned' | 'built'
}
```

`lib/curriculum.ts` exposes pure functions over the JSON (`getTopic`, `listByYear`, `listBySubject`).

---

## Step 9 — Landing page

One screen, no fluff:
- Headline (e.g. *"Interactive learning, made for the UK National Curriculum."*)
- One paragraph on what it is and what's different about it
- A single button into the curriculum map
- A small "soft-launch — building in the open" note that matches the rest of `neilmcardle.com`'s tone

No email capture, no testimonials, no pricing teaser, no sign-in CTA.

---

## Phase 1 completion criteria

- [ ] `/kids-academy`, `/kids-academy/curriculum`, and `/kids-academy/learn/year-{n}/{subject}/{topic}` all render
- [ ] Tailwind tokens applied under `ka-*` namespace; no makeEbook regressions
- [ ] All shared components render in isolation with sensible defaults
- [ ] Year 3 curriculum JSON stub exists; other year groups empty stubs
- [ ] `lib/progress.ts` reads and writes `ka_progress`; survives SSR
- [ ] Dynamic tool loader works against a dummy "Hello World" tool component (`onProgress` fires, `onComplete` triggers the celebration)
- [ ] Mobile responsive at 375px, 768px, 1280px
- [ ] No imports from `app/make-ebook/`, `app/icon-animator/`, or top-level `components/` (other than the one ClientFooterWrapper edit)
- [ ] No new dependencies installed
