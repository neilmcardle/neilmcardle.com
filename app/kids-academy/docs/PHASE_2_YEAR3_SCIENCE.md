# PHASE_2_YEAR3_SCIENCE.md — Year 3 Science Interactive Tools

This is the pilot content phase. Build all five Year 3 science tools to production quality. These are the flagship tools that prove the product concept and will be used in early marketing.

Reference `docs/CURRICULUM.md` for NC objectives for each topic.

---

## Tool 1 — Light and Shadows (`y3-science-light`)

**Component path:** `components/interactive/science/y3/light-shadows.tsx`

### What to build

A shadow simulator rendered on HTML Canvas. The child can:
- Drag a "light source" (glowing yellow circle) around the canvas
- Drag a solid "object" (simple opaque shape — circle, square, triangle — selectable)
- Watch the shadow update in real time as they move either element
- See the shadow grow/shrink/stretch as the light source moves closer/further or to the side
- Toggle between 2–3 different object shapes
- A "what's happening?" panel at the bottom shows a simple explanation that updates contextually

### Technical approach

Use Canvas 2D API for the shadow rendering. Shadow direction and length calculated from the vector between light source and object centre.

```typescript
// Shadow rendering logic (pseudocode)
const shadowDirection = {
  x: object.x - light.x,
  y: object.y - light.y,
}
const distance = Math.hypot(shadowDirection.x, shadowDirection.y)
const shadowLength = (canvasHeight / distance) * SHADOW_SCALE_FACTOR
// Project shadow polygon behind object relative to light position
```

### Guided discovery moments

After the child moves the light source 3 times, trigger a gentle prompt: "Try moving the torch really close to the ball — what happens to the shadow?"

After they complete 5 interactions, show: "You've discovered that shadows are bigger when the light is closer! This is what happens when the sun is low in the sky in winter."

### Completion criteria
- Child has moved the light source at least 8 times
- Child has changed the object shape at least once
- "What's happening?" panel has been shown all 3 contextual states

---

## Tool 2 — Forces and Magnets (`y3-science-forces`)

**Component path:** `components/interactive/science/y3/forces-magnets.tsx`

### What to build

Three mini-interactions in one tool, navigated by a simple tab row at the top:

**Tab 1: Magnet Poles**
Two magnets on screen. Each can be flipped (N/S). Child drags them toward each other.
- N→S: animate attraction (magnets snap together with satisfying animation)
- N→N or S→S: animate repulsion (magnets push apart, show force lines)
- Poles shown as coloured ends: Red = N (North), Blue = S (South)
- Below the magnets: "North and South attract. Same poles repel."

**Tab 2: Magnetic Materials Sorter**
10 illustrated objects appear one at a time (paperclip, wooden spoon, coin, iron nail, plastic ruler, key, rubber, tin can, glass bottle, steel fork).
Child drags each to one of two buckets: "Attracted to magnet" / "Not attracted".
Show a satisfying tick/cross animation after each. Running score at top.
After all 10: show results with simple explanation of what makes something magnetic.

**Tab 3: Surfaces and Friction**
A toy car on a track. Child selects the surface material (carpet, wood, ice, sandpaper).
Press "push" and the car travels — further on smoother surfaces (less friction), shorter on rough.
Visual shows the car decelerating at different rates. Simple bar chart builds up showing distance per surface after each test.

### Technical approach
- All state managed with `useState` and `useReducer`
- No canvas needed — use pure CSS/SVG with Framer Motion animations
- Drag interactions: `@use-gesture/react` or HTML5 drag API
- Sound effects optional but delightful: soft "click" on snap, "whoosh" on repulsion

### Completion criteria
- All three tabs visited
- Magnetic sorter completed (all 10 objects sorted)
- At least 3 different surfaces tested

---

## Tool 3 — Rocks and Soil (`y3-science-rocks`)

**Component path:** `components/interactive/science/y3/rocks-soil.tsx`

### What to build

Three sections, presented as steps (not tabs — linear progression):

**Step 1: Rock Classification**
8 illustrated rocks shown. Child drags each into one of three labelled trays:
- Igneous (formed from cooled magma — often crystalline, interlocked grains)
- Sedimentary (layers pressed together — visible bands or fossils)
- Metamorphic (changed by heat/pressure — often wavy layers, very hard)

Visual clue cards available on tap — showing texture descriptions in simple language.
After sorting, reveal correct answers with brief explanations.

Rock illustrations: granite, basalt, limestone, sandstone, chalk, marble, slate, obsidian.
Keep illustrations simple — flat design, clear texture differences.

**Step 2: Fossil Formation**
Animated sequence with 5 frames. Child taps "next" to progress through:
1. "An ammonite dies and sinks to the sea floor"
2. "Layers of sand and mud cover the shell over thousands of years"
3. "The layers press down hard — they turn to rock"
4. "Minerals slowly replace the shell — turning it to stone"
5. "Millions of years later — the rock erodes and a fossil appears!"

Each frame is a simple illustrated scene with accompanying text. Add a subtle animation between frames.

**Step 3: Soil Explorer**
Cross-section diagram of soil layers (topsoil, subsoil, bedrock, rock).
Child taps each layer to reveal: what it is, what's in it (worms, roots, gravel, rock fragments), why it matters.
A simple "soil is made from..." sentence at the end with a word-fill interaction.

### Completion criteria
- Rock classification attempted (minimum 6 of 8 correct)
- Fossil formation sequence completed
- All 4 soil layers explored

---

## Tool 4 — Plants (`y3-science-plants`)

**Component path:** `components/interactive/science/y3/plants.tsx`

### What to build

**Part 1: Plant Parts Explorer**
Illustrated cross-section of a flowering plant (roots, stem, leaves, flower, fruit/seed).
Child taps each part — a panel slides up showing:
- Name of the part
- What it does (in simple language)
- A real-world analogy ("The roots are like straws — they suck up water from the soil")

After exploring all 5 parts, a short "match it" game: tap the correct part when a function description is shown.

**Part 2: What Plants Need (Growth Simulator)**
A seed is shown in a pot. Three sliders:
- 💧 Water (none → just right → flood)
- ☀️ Light (darkness → just right → scorching)  
- 🌱 Nutrients (poor soil → rich soil)

As sliders adjust, the plant grows, wilts, or stays healthy with simple animations.
Pre-set "try this" prompts appear: "What happens if you give it no water?" / "Can a plant grow in complete darkness?"

Target: child adjusts all three sliders and observes at least 3 different outcomes.

**Part 3: Flower Life Cycle**
Circular diagram showing: seed → germination → seedling → flowering plant → pollination → seed formation → seed dispersal → seed.
Child taps each stage to learn about it. Arrow animations show the cycle direction.
A simple ordering game at the end: drag the stages into the correct order.

### Completion criteria
- All plant parts explored and match game completed (4/5 correct)
- Growth simulator: at least 3 different slider combinations tried
- Life cycle ordering game completed (5/7 correct minimum)

---

## Tool 5 — Animals Including Humans (`y3-science-animals`)

**Component path:** `components/interactive/science/y3/animals-humans.tsx`

### What to build

**Part 1: The Human Skeleton**
Interactive front-view illustration of a human skeleton.
Child taps a bone (or group) — highlighted and named:
- Skull, ribs, spine, pelvis, humerus, radius/ulna, femur, tibia/fibula, patella

Panel shows: name, what it protects or does, a fun fact.
After all bones explored, a "fill in the skeleton" quiz — bones disappear and child taps the correct blank when prompted.

Keep the illustration age-appropriate — friendly, educational, not clinical.

**Part 2: Nutrition and Food Groups**
Food items appear one at a time (illustrated cards):
- Apple, chicken, bread, butter, milk, carrot, fish, pasta, cheese, broccoli, egg, orange
Child sorts each into: Carbohydrates / Proteins / Dairy / Fruits and Vegetables / Fats
After sorting: "We need all food groups! Some more than others. A balanced plate..." → animated plate diagram fills up showing proportions.

**Part 3: Muscles Explorer**
A simple outline of a human body showing 6 major muscle groups (biceps, triceps, quadriceps, hamstrings, abs, back muscles).
Child taps each — animation shows the muscle contracting, paired bone moves.
Simple explanation: "Your bicep pulls your arm up. Your tricep straightens it again. They work in pairs!"

### Completion criteria
- Skeleton quiz attempted (minimum score 6/9)
- All 12 food items sorted
- All 6 muscle groups explored

---

## Shared interactive tool wrapper

All five tools use a shared wrapper component:

```typescript
// components/interactive/ToolWrapper.tsx
interface ToolWrapperProps {
  toolId: string
  childName: string
  onProgress: (pct: number) => void
  onComplete: () => void
  children: React.ReactNode
}
```

The wrapper provides:
- Tool title and NC objective summary (collapsible, for curious children)
- Progress indicator (breadcrumb-style: Part 1 → Part 2 → Part 3)
- "I'm stuck" button (Phase 7 will wire this to Claude API)
- Celebration on completion
- Auto-saves progress to Supabase on each step completion

---

## Testing checklist for Phase 2

For each tool, confirm:
- [ ] Renders correctly on iPad (768px) — primary device for this product
- [ ] Renders correctly on mobile (375px)
- [ ] Renders correctly on desktop (1280px)
- [ ] All drag interactions work with both touch and mouse
- [ ] Completion triggers celebration animation
- [ ] Progress is saved to Supabase after each step
- [ ] All NC objectives are addressed somewhere in the tool
- [ ] No text smaller than 16px in child-facing UI
- [ ] All interactive targets are at least 44px
- [ ] Works without JavaScript for static content (progressive enhancement)
