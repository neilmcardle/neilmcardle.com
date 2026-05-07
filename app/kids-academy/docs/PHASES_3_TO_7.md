# PHASE_3_YEAR3_MATHS_ENGLISH.md — Year 3 Maths and English Tools

Reference `docs/CURRICULUM.md` for full NC objectives per topic.

---

## Maths Tool 1 — Times Tables Trainer (`y3-maths-multiplication`)

**Component path:** `components/interactive/maths/y3/times-tables.tsx`

### What to build

A game-style trainer focused on the Year 3 tables: **3s, 4s, and 8s** (the statutory requirement).

**Mode 1: Learn**
Visual array builder. Child selects a table (e.g. 4×). Rows of objects (stars, apples, rockets) appear as they tap "add another row". Counter shows the running total. Child can see 4×1=4, 4×2=8 etc building up visually.

**Mode 2: Practice**
Question appears (e.g. "4 × 7 = ?"). Large number pad. Child inputs answer.
- Correct: green flash, satisfying sound, streak counter increments
- Wrong: gentle shake, correct answer shown briefly, try again
- Speed bonus: if answered within 3 seconds, a small "Quick!" badge appears

Streak system: 5 correct = bronze, 10 = silver, 20 = gold. Streak resets on wrong answer.

**Mode 3: Challenge**
Mixed questions from all three tables. Timed: 60 seconds, how many can they get? Score saved and shown against previous best.

### Completion criteria
- Learn mode: all facts 1–12 for at least one table shown
- Practice mode: 10 questions answered
- Challenge mode: completed once

---

## Maths Tool 2 — Column Addition & Subtraction (`y3-maths-addition-subtraction`)

**Component path:** `components/interactive/maths/y3/column-method.tsx`

### What to build

A step-by-step animated column method tool.

Child is shown a calculation (e.g. 347 + 256). The calculation is displayed in column format.
They work through it digit by digit, right to left:
- Tap the ones column → enter the ones answer → if carrying, tap the carry digit into the tens column
- Continue for tens, then hundreds
- Final answer revealed with animation

The tool scaffolds the carry — if the child gets ones correct but forgets to carry, a gentle highlight shows "Don't forget to carry the 1!"

Levels:
1. No carrying/borrowing (e.g. 213 + 145)
2. Carrying in ones column (e.g. 127 + 135)
3. Carrying in multiple columns (e.g. 374 + 258)
4. Subtraction with borrowing

Generate questions procedurally — not a fixed set.

### Completion criteria
- At least 5 questions completed across at least 2 difficulty levels

---

## Maths Tool 3 — Place Value Explorer (`y3-maths-place-value`)

**Component path:** `components/interactive/maths/y3/place-value.tsx`

### What to build

**Part 1: Block Builder**
Three columns: Hundreds | Tens | Ones. Child drags blocks into columns.
- Hundreds: large yellow block (worth 100)
- Tens: medium blue rod (worth 10)
- Ones: small green cube (worth 1)

As they add blocks, a digital display shows the number. Tap "what number is this?" to be quizzed.

Auto-exchange: if 10 ones are added, animate them combining into a tens rod.

**Part 2: Number Comparator**
Two numbers shown. Child selects <, =, or > between them. Scales animation tips to show which is heavier/larger. Progress through 15 comparisons.

**Part 3: 10/100 More or Less**
A number is shown. Four buttons: +10, -10, +100, -100. Child presses buttons to reach a target number. 10 rounds.

### Completion criteria
- Block builder: built at least 5 different numbers
- Comparator: 12/15 correct
- More/Less: 8/10 rounds completed

---

## English Tool 1 — Prefixes and Suffixes (`y3-english-prefixes-suffixes`)

**Component path:** `components/interactive/english/y3/word-builder.tsx`

### What to build

**Part 1: Word Builder**
A root word sits in the centre of the screen (e.g. "happy").
Prefix tiles on the left: un-, dis-, mis-, re-, pre-
Suffix tiles on the right: -ful, -less, -ness, -ly, -tion

Child drags a tile onto the root word. The word morphs with a satisfying animation. The new word and its definition appear.

Not all combinations are valid — if an invalid combination is tried, gentle feedback: "Unhappy is a real word — but 'mishappy' isn't! Try another."

Cycles through 8 root words: happy, kind, agree, appear, spell, place, view, lead.

**Part 2: Definition Game**
A definition is shown (e.g. "to do something again"). Child selects the correct word from 3 options. 12 questions covering all taught prefixes/suffixes.

**Part 3: Spot the Prefix/Suffix**
A sentence is shown with a prefixed/suffixed word highlighted. Child taps to identify: "Is this a prefix or suffix?" then: "What does it mean?"

### Completion criteria
- Word builder: 6/8 root words completed
- Definition game: 9/12 correct
- Spot it: 8/10 correct

---

## English Tool 2 — Grammar: Punctuation (`y3-english-grammar`)

**Component path:** `components/interactive/english/y3/punctuation.tsx`

### What to build

Three focused mini-tools:

**Apostrophes for possession**
A sentence with a gap: "That is ___ book." (Tom / Tom's)
Child selects the correct form. 10 questions, escalating from singular to plural possession.

**Inverted commas (speech marks)**
A short passage appears. Parts of the text are highlighted. Child taps whether each highlighted part is "speech" or "not speech", then places opening/closing speech marks by tapping their position in the sentence.

**Conjunctions**
A pair of short sentences. Child selects a conjunction to join them (and, but, because, when, although, while). Sees the resulting combined sentence. Encouraged to try different conjunctions and observe how the meaning changes.

### Completion criteria
- Apostrophes: 8/10 correct
- Speech marks: 6/8 correct
- Conjunctions: 5 different conjunctions used successfully

---

# PHASE_4_AUTH_PROGRESS.md — Authentication, Child Profiles, and Progress Tracking

---

## Parent onboarding flow

After sign-up (Clerk), direct parent to onboarding:

1. **Welcome screen** — "Let's set up Kids Academy for your family"
2. **Add first child** — name, year group (1–6), choose avatar emoji from grid of 20
3. **Accessibility options** — dyslexic font toggle, larger text toggle
4. **Confirmation** — "All set! Tap [child's name] to start learning."

Parent can add up to 5 children per subscription (implement limit in middleware).

---

## Child selection screen

After parent logs in, they see a grid of child profile cards. Each card:
- Large avatar emoji
- Child's name
- Year group badge
- Last activity: "Played yesterday" / "2 days ago"
- Completion ring showing overall progress

Tapping a card:
- In free tier: goes directly to child mode
- In Phase 5 (paid): checks subscription status first

---

## Child mode activation

When a child profile is selected:
- Set a `childSession` cookie with the child's ID
- Render the child mode UI (simplified header, no parent nav)
- Store session start time

"Return to parent" button requires a 4-digit PIN (set during child profile creation). This prevents children navigating away accidentally.

---

## Progress tracking implementation

### Client-side progress hook

```typescript
// lib/hooks/useProgress.ts
export function useProgress(toolId: string, childId: string) {
  const updateProgress = async (percentage: number) => {
    // Optimistic update to local state
    // Debounced write to Supabase (every 10 seconds or on unmount)
    await supabase
      .from('topic_progress')
      .upsert({
        child_id: childId,
        tool_id: toolId,
        completion_percentage: percentage,
        status: percentage >= 100 ? 'completed' : 'in_progress',
        last_accessed_at: new Date().toISOString(),
      })
  }
  return { updateProgress }
}
```

### Progress visualisation in parent dashboard

Per child, show:
- Curriculum map grid (Year group × Subjects × Topics) — coloured by status
  - Grey: not started
  - Yellow: in progress
  - Green: completed
- Time spent this week (bar chart, days of week)
- Recent activity feed: "Completed Light and Shadows · Yesterday"
- Strengths summary: subjects with highest completion rates

---

# PHASE_5_PAYMENTS.md — Stripe Subscription

---

## Pricing model

**Free tier:**
- 1 child profile
- Access to 3 tools per subject (locked rotation, changes monthly)
- No progress saving beyond session
- Watermarked/branded "Free preview" label on tools

**Family Plan — £7.99/month or £59.99/year (save 37%)**
- Up to 5 child profiles
- Full access to all tools, all year groups
- Progress tracking and parent reports
- New tools added monthly

**School Plan — Contact for pricing**
- Class management
- Teacher dashboard
- Bulk child accounts
- GDPR data processing agreement

---

## Stripe implementation

Use Stripe Checkout for initial subscription. Stripe Customer Portal for management.

```typescript
// app/api/stripe/create-checkout/route.ts
// Creates a Stripe Checkout session for the Family Plan
// Redirects to /dashboard on success
// Stores stripe_customer_id in Supabase against clerk_user_id
```

Gate content in the dynamic tool route:
```typescript
// app/learn/[year]/[subject]/[topic]/page.tsx
const subscription = await getSubscriptionStatus(userId)
const toolMeta = getCurriculumData(year, subject, topic)

if (!subscription.active && !toolMeta.isFreePreview) {
  redirect('/pricing?reason=tool-locked')
}
```

Show a tasteful paywall for locked tools: preview the tool's thumbnail/description + "Unlock all tools from £7.99/month" CTA.

---

# PHASE_6_FULL_CURRICULUM.md — Full Year 1–6 Rollout

---

## Rollout order

After Year 3 is complete and the product is launched, build remaining year groups in this order:

1. **Year 4** — Electricity (circuit builder), Sound, Living Things, States of Matter
2. **Year 5** — Earth and Space (solar system orrery), Forces (gravity, friction), Properties of Materials
3. **Year 2** — Living Things, Plants, Uses of Everyday Materials, Animals
4. **Year 1** — Plants, Animals, Everyday Materials, Seasonal Changes
5. **Year 6** — Evolution, Classification, Light, Electricity (advanced), Humans

For Maths: build Year 4 fractions, decimals, and geometry tools next, as they share patterns with Year 3 maths tools and can reuse components.

---

## Component reuse strategy

Many tools share underlying interactive patterns. Extract these into shared components:

- **`<DragSorter>`** — drag items into labelled buckets (used in: rock classification, food groups, material sorter, habitat builder, living/dead sorter)
- **`<AnimatedDiagram>`** — tappable labelled diagram with slide-up info panel (used in: skeleton, plant parts, soil layers, flower life cycle)
- **`<StepSequence>`** — linear sequence of illustrated frames with Next button (used in: fossil formation, rock cycle, water cycle, life cycles)
- **`<SliderSimulator>`** — one or more sliders that affect an animated outcome (used in: plant growth, shadow size, sound pitch/volume, friction)
- **`<QuizRound>`** — standard question/answer pattern with feedback animations (used across all tools)

Building these well in Phase 2 pays dividends across all subsequent phases.

---

# PHASE_7_AI_FEATURES.md — Claude AI Hint System

---

## The "I'm stuck" system

When a child taps "I'm stuck", an API call goes to Claude with:
- The tool they're on (`y3-science-light`)
- Their current step/state
- What they've tried so far (tracked in component state)
- Their year group

Claude responds with a contextual hint — not the answer, but a nudge in the right direction.

```typescript
// app/api/hint/route.ts
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: Request) {
  const { toolId, currentStep, attemptsData, yearGroup } = await req.json()
  
  const client = new Anthropic()
  
  const systemPrompt = `You are a friendly, encouraging teaching assistant for a ${yearGroup === 1 ? 'Year 1' : `Year ${yearGroup}`} child (aged ${5 + yearGroup}–${6 + yearGroup}). 
  
  You are helping them with: ${toolId}.
  
  Rules:
  - Never give the answer directly. Give a gentle hint that helps them think.
  - Use simple language appropriate for a ${5 + yearGroup}-year-old.
  - Be warm, encouraging, and patient.
  - Keep responses under 40 words.
  - End with a question that prompts them to try again.
  - If they seem very stuck, give a more direct hint but still not the answer.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 150,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `The child is on step ${currentStep}. They have tried: ${JSON.stringify(attemptsData)}. Give them a helpful hint.`
    }]
  })

  return Response.json({ 
    hint: message.content[0].type === 'text' ? message.content[0].text : '' 
  })
}
```

### Hint UI

The hint appears in a friendly speech-bubble panel with a cartoon owl mascot. Owl name: **Archie**. Archie appears only when hints are requested — not persistently, to avoid distraction.

Rate limit: 3 hints per tool session. After 3, Archie says: "You've nearly got it! Give it one more try on your own — I believe in you! 🦉"

---

## Adaptive explanations (future)

In a later iteration, Claude can generate age-appropriate explanations of any concept a child asks about. A child in Year 3 tapping "but WHY does the shadow get bigger?" could get a Claude-generated explanation appropriate for their age — not a Wikipedia answer.

This requires careful prompt engineering and a robust content safety layer. Design this feature for a post-launch phase.

---

## AI safety for children

Any Claude API route used in child-facing features must:
- Use a system prompt that strictly limits topic to educational content
- Set `max_tokens` conservatively (150–300)
- Filter responses through a simple content check before displaying
- Never expose the raw API response without sanitisation
- Log all AI interactions with child ID for parental review (parent dashboard)
- Include a parent notification when a child uses the hint system more than 5 times in a session (may indicate they need additional support)
