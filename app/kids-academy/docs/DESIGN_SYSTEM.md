# DESIGN_SYSTEM.md — Kids Academy Design Language

This document defines every visual and interaction decision for the product. Claude Code must follow these when building any component.

---

## Core principles

**1. The tool is the teacher.**
No instruction walls. No "Read this first" screens. Children learn by doing. Every tool starts immediately with an interactive element, not an explanation.

**2. Delight without distraction.**
Animations and sounds should reward progress, not demand attention. No autoplay sounds. No flashing elements. No pop-ups mid-task.

**3. Clarity over cleverness.**
Icons must be immediately obvious. Labels must be short. Navigation must be predictable. A 5-year-old with no adult present must be able to operate the app.

**4. Failure is safe.**
Wrong answers get gentle feedback, never red X marks or alarming sounds. A soft shake and a friendly "Not quite — try again!" is the model. Progress is never lost. The child can always go back.

**5. Parents trust, children play.**
The parent dashboard is professional and data-rich. The child UI is warm, large, and joyful. These are completely different design contexts.

---

## Typography

### Fonts
- **Headings:** Nunito (rounded, friendly, high legibility for children)
- **Body / UI:** Inter (clean, neutral, excellent at small sizes)
- **Dyslexic mode:** OpenDyslexic (activated per child profile)

### Scale (child-facing UI)
| Use | Size | Weight | Font |
|---|---|---|---|
| Tool title | 28px | 800 | Nunito |
| Section heading | 22px | 700 | Nunito |
| Instruction text | 18px | 400 | Inter |
| Button labels | 18px | 600 | Nunito |
| Hint/secondary text | 16px | 400 | Inter |
| Badge/pill text | 13px | 600 | Nunito |

**Minimum font size in child-facing UI: 16px. No exceptions.**

### Scale (parent dashboard)
Standard web typography applies: 14px body, 12px secondary, headings 18–28px.

---

## Colour usage

### Year group colour coding
Each year group has a consistent colour identity across the entire app. A Year 3 child always sees green; Year 5 always sees purple. This helps children identify "their" section.

- Year 1: Orange `#F97316`
- Year 2: Amber `#EAB308`
- Year 3: Emerald `#22C55E`
- Year 4: Blue `#3B82F6`
- Year 5: Purple `#A855F7`
- Year 6: Rose `#EF4444`

### Subject colour coding
- Science: Sky blue `#0EA5E9`
- Maths: Amber `#F59E0B`
- English: Pink `#EC4899`
- History: Violet `#8B5CF6`
- Geography: Teal `#10B981`

### Feedback colours
- Correct/success: `#22C55E` (green) with white text
- Incorrect/try again: `#F59E0B` (amber) — never red, never alarming
- Neutral/info: `#3B82F6` (blue)

### Background
- Child learning areas: `#FAFAF9` (warm off-white — easier on eyes than pure white)
- Cards/panels: `#FFFFFF`
- Parent dashboard: `#F8FAFC`

---

## Spacing

Use an 8px base grid. All spacing values are multiples of 8px.

Key values:
- `8px` — tight internal component spacing
- `16px` — standard internal padding
- `24px` — between related elements
- `32px` — between sections
- `48px` — major section breaks

---

## Interactive elements

### Touch targets
**Minimum 44×44px for all tappable elements.** Prefer 56px for primary actions in child UI.

Invisible hit-area expansion is acceptable — a small icon can have a larger invisible tap zone.

### Buttons

**Primary action (child UI):**
- Background: year group colour or subject colour
- Text: white
- Border radius: 16px (pill-ish)
- Padding: 16px 32px
- Font: Nunito 18px 600
- Hover: 5% darker background
- Active: scale(0.97)

**Secondary action:**
- Background: white
- Border: 2px solid current colour
- Text: current colour
- Same sizing as primary

**Icon buttons:**
- 48×48px minimum
- Border radius: 12px
- Background: light tint of subject colour

### Drag interactions

All draggable elements must:
- Show a grab cursor on hover (desktop)
- Scale up slightly (1.05×) when picked up
- Drop targets highlight when a draggable is held over them
- Invalid drop zones give a gentle shake animation
- Valid drops trigger a satisfying "place" animation (slight bounce)

Use `@use-gesture/react` for consistent touch + mouse drag behaviour.

### Sliders

- Track height: 8px
- Thumb size: 32×32px (large enough to tap easily)
- Track colour: light grey, filled portion in subject colour
- Thumb: white with subject-colour border, subtle shadow
- Min/max labels beneath track

---

## Animation

Use Framer Motion for all animations.

### Principles
- Animations should feel physical and satisfying, not arbitrary
- Default duration: 200–300ms for micro-interactions, 400–600ms for transitions
- Ease: `easeOut` for things appearing, `easeIn` for disappearing, `spring` for physical objects

### Standard animations

**Correct answer:**
```typescript
// Green flash + scale
animate={{ scale: [1, 1.1, 1], backgroundColor: ['#fff', '#dcfce7', '#fff'] }}
transition={{ duration: 0.4 }}
```

**Wrong answer:**
```typescript
// Amber shake
animate={{ x: [0, -8, 8, -8, 8, 0] }}
transition={{ duration: 0.4 }}
```

**Completion celebration:**
- Confetti burst from centre of screen
- Star particles float up
- "Well done!" text bounces in with spring
- Duration: 2 seconds, then auto-dismiss

**Page transitions (between tool steps):**
- Slide in from right (forward), slide in from left (back)
- Duration: 300ms easeOut

**Drag object pickup:**
```typescript
whileDrag={{ scale: 1.05, zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
```

---

## Iconography

Use [Lucide React](https://lucide.dev/) for all UI icons (already a common Next.js dependency).

For child-facing decorative icons (animals, objects, subjects), use simple SVG illustrations — consistent flat design style, 2–3 colours per illustration, rounded shapes.

Do not use emoji in place of proper UI icons — they render inconsistently across devices.

---

## Child mode header

Fixed at top, height 64px.

```
[Logo mark] [Topic breadcrumb: Science > Light and Shadows] [Spacer] [Progress dots] [I'm stuck] [Menu icon]
```

The menu icon opens a bottom sheet with: "Go home" (returns to year group topics), "I need a break" (pause session), "Back to parent" (PIN entry).

No browser URL bar should be visible in child mode — encourage parents to use the iOS/Android home screen shortcut or full-screen PWA mode.

---

## Mascot — Archie the Owl

Archie is the Kids Academy mascot. He appears in:
- The hint system ("I'm stuck" flow)
- Empty states ("No tools completed yet — let's start!")
- Celebration moments
- Error states ("Hmm, something went wrong — let's try again!")

Archie design direction:
- Simple flat illustration
- Round, friendly, large eyes
- Wears a small mortarboard hat
- Neutral colour (doesn't conflict with year/subject colours)
- 3–4 expression variants: happy, thinking, encouraging, celebrating

Archie should feel like a consistent, trustworthy friend — not a pushy cartoon character. He appears when needed, not constantly.

---

## Accessibility

### Required for every component
- All interactive elements have `aria-label` or `aria-describedby`
- Focus states visible (3px outline in brand colour)
- Keyboard navigation fully functional (Tab, Enter, Space, arrow keys)
- All images have `alt` text
- Colour is never the only indicator of state (always accompanied by icon or label)
- Screen reader announcements for dynamic content changes (`aria-live`)

### Dyslexic font mode
When enabled on a child profile:
- Replace Nunito + Inter with OpenDyslexic across entire child UI
- Increase letter-spacing to 0.12em
- Increase line-height to 1.8
- Increase word-spacing to 0.16em

### Reduced motion
Respect `prefers-reduced-motion`. When active:
- Skip celebration animations (show text only)
- Remove slide transitions (instant)
- Keep progress animations but reduce duration to 100ms

---

## Loading states

**Never use a spinner.** Use skeletons that match the layout of the loading content.

For tool loading:
```
[Skeleton: tool title bar — full width, 28px tall]
[Skeleton: main interaction area — 80% width, 300px tall]
[Skeleton: info panel — 60% width, 80px tall]
```

Animate skeletons with a shimmer: left-to-right gradient sweep, 1.5s loop.

---

## Error states

Network errors: Archie appears with "Hmm, I couldn't load that. Try again?" + retry button.

Progress save failures: silent retry (don't alarm the child). Log to error monitoring. After 3 failures, show parent dashboard notice.

Invalid routes: friendly 404 with Archie: "Hmm, I can't find that page! Let's go back home." + home button.

---

## PWA configuration

The app should be installable as a PWA on iOS and Android (home screen shortcut that launches full-screen).

`manifest.json` configuration:
```json
{
  "name": "Kids Academy",
  "short_name": "Kids Academy",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAFAF9",
  "theme_color": "#6366F1",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

This is important for the child experience — full-screen removes browser chrome and reduces the chance of a child navigating away.
