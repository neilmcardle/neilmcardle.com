// The curated prompt library — Promptr's starter set.
//
// Hand-written prompts that score well on the rubric and showcase each
// category. The library is a TS const, not a CMS or DB, so it's edited
// in one place and shipped with the rest of the code. Adding a prompt
// is a one-line change; no ops, no approval queue, no moderation.
//
// Each entry has a one-sentence description (the "why this works" hook
// that shows on the library card) and the full prompt body. Prompts
// should read like something an experienced professional would actually
// send, not like a generic template with [FILL IN] placeholders.

export type LibraryCategory =
  | "writing"
  | "analysis"
  | "research"
  | "code"
  | "brainstorm"
  | "meta";

export interface LibraryPrompt {
  id: string;
  category: LibraryCategory;
  title: string;
  description: string;
  prompt: string;
}

export const CATEGORY_LABELS: Record<LibraryCategory, string> = {
  writing:    "Writing",
  analysis:   "Analysis",
  research:   "Research",
  code:       "Code",
  brainstorm: "Brainstorm",
  meta:       "Meta",
};

export const LIBRARY: LibraryPrompt[] = [
  // ─── Writing ─────────────────────────────────────────────────────────
  {
    id: "w-long-form",
    category: "writing",
    title: "Long-form blog draft",
    description: "Audience, tone, and structure all named. Produces a real first draft, not a placeholder.",
    prompt: `You are a literary essayist drafting a 1,200-word blog post.

Topic: [replace with your topic]
Audience: thoughtful generalists who read Hacker News or The Atlantic. Not beginners, not experts.
Tone: warm, specific, confident. No corporate SaaS mush. No em dashes.
Structure: open with one concrete scene or detail, not a thesis. Build the argument through examples. End on a line someone would quote.

Avoid: generic intros ("In today's fast-paced world"), bulleted listicles, rhetorical questions.

Write the full draft. Do not outline first.`,
  },
  {
    id: "w-tight-email",
    category: "writing",
    title: "Tight professional email",
    description: "Strips away throat-clearing and produces something you can send without editing.",
    prompt: `Write an email under 120 words.

Context: [replace with the situation]
Recipient: [who they are, what they know already]
My goal: [the single thing I want them to do after reading]
Tone: warm but direct. No "I hope this finds you well". No "please let me know if you have any questions".

End with a specific ask on its own line. Use one sentence per paragraph where possible.`,
  },
  {
    id: "w-brand-voice",
    category: "writing",
    title: "Writing in a fixed brand voice",
    description: "Uses an example to calibrate the model faster than any adjective stack could.",
    prompt: `Write three product descriptions in our brand voice.

Here is one we already love and want you to match:
"Cold-brewed for twelve hours, poured into a jar that survived three moves. Coffee for people who take their weekends seriously."

Rules from that example: one concrete detail, one implied user, one short closer. Between 20 and 35 words. No superlatives ("best", "premium", "world-class"). No adjective stacks.

Products to write about:
1. [product one]
2. [product two]
3. [product three]`,
  },
  {
    id: "w-copy-edit",
    category: "writing",
    title: "Copy edit pass",
    description: "Asks for specific, actionable edits rather than a rewrite.",
    prompt: `You are a sharp copy editor. I will give you a draft. I do not want a rewrite. I want a list of edits, each one pointing to a specific line or phrase.

For each edit, give me:
1. The original sentence (quoted).
2. Your suggested fix.
3. One short sentence explaining why.

Focus on: unnecessary words, vague nouns, passive voice, cliché, tone drift. Skip typos unless they change meaning.

Draft:
[paste your draft]`,
  },
  {
    id: "w-newsletter-intro",
    category: "writing",
    title: "Newsletter opening paragraph",
    description: "Forces a specific, human opening instead of the standard roundup pattern.",
    prompt: `Write the opening paragraph of a newsletter issue.

The newsletter: [name and one-line description]
This issue's theme: [one phrase]
The reader: a subscriber who already knows the newsletter and its voice.

Open with a specific scene, observation, or question — not a summary of what's in this issue. Do not say "this week" or "in today's issue". Between 60 and 90 words. Last line should land like a door closing.`,
  },

  // ─── Analysis ────────────────────────────────────────────────────────
  {
    id: "a-swot",
    category: "analysis",
    title: "Honest SWOT analysis",
    description: "Constrains the model to specific, non-generic entries and forces trade-off thinking.",
    prompt: `Write a SWOT analysis for [subject].

Rules:
- Three entries per quadrant. No more, no less.
- Each entry is one sentence and names something specific. No generic bullets like "strong brand" or "market competition".
- After the grid, write three sentences: the one strength worth defending, the one weakness worth fixing, and the trade-off between them.

Format as a markdown table with headers: Strengths / Weaknesses / Opportunities / Threats.`,
  },
  {
    id: "a-decision-matrix",
    category: "analysis",
    title: "Decision matrix with weights",
    description: "Forces the model to commit to explicit weights instead of hand-waving about importance.",
    prompt: `Help me decide between these options: [option A], [option B], [option C].

Step 1: Propose 5 criteria I should weigh. For each, say in one sentence why it matters in this decision. Assign each a weight from 1–5 summing to 15.

Step 2: Score each option against each criterion from 1–5 with a one-sentence justification per cell.

Step 3: Compute weighted totals. Rank the options. Name the ranking winner.

Step 4: In two sentences, tell me the one reason I might still pick a lower-ranked option.`,
  },
  {
    id: "a-argument-map",
    category: "analysis",
    title: "Argument map",
    description: "Extracts the load-bearing claims from a piece of writing, separating fact from inference.",
    prompt: `Read this argument and map it.

[paste the argument]

Return a markdown outline with three sections:
1. **Main claim** — one sentence, the thing the author ultimately wants you to believe.
2. **Supporting points** — a numbered list. Under each, note whether it's a fact (verifiable), an inference (reasoning from facts), or an assumption (asserted without support).
3. **Weakest link** — one sentence naming the point that, if false, would collapse the main claim.

Be direct. Do not pad.`,
  },
  {
    id: "a-pros-cons",
    category: "analysis",
    title: "Pros and cons, ranked and weighted",
    description: "Asks for magnitudes, not just lists — the difference between a decision aid and a dump.",
    prompt: `Give me pros and cons for [decision].

Rules:
- Three pros, three cons. No more.
- Each item has a magnitude: **Major**, **Moderate**, or **Minor**.
- Rank within each list, biggest magnitude first.
- After the lists, write one sentence: if I had to pick based only on this, what would I do and why.

Do not hedge at the end. Commit to the recommendation.`,
  },

  // ─── Research ────────────────────────────────────────────────────────
  {
    id: "r-literature-scan",
    category: "research",
    title: "Literature scan",
    description: "Asks for sources with specific shapes, flagging which claims are contested.",
    prompt: `Give me a literature scan on [topic].

Structure:
1. Three foundational works, one sentence each on what they claim.
2. Three recent works (last five years), one sentence each on what they add or challenge.
3. One ongoing debate in the field, named in two sentences — what's at stake, who's on each side.
4. One common misconception that the literature has actually settled.

Flag any claim where the evidence is weak or contested. Do not pretend consensus where none exists.`,
  },
  {
    id: "r-competitive",
    category: "research",
    title: "Competitive landscape",
    description: "Forces named competitors and a positioning axis instead of a generic feature comparison.",
    prompt: `Map the competitive landscape for [product / category].

Return:
1. Three to five named competitors (real ones, not archetypes).
2. A positioning axis — name two dimensions that actually separate the players (e.g. "depth of analytics" vs "ease of setup"). Place each competitor on the grid.
3. The gap in the grid. One sentence on what an entrant could own that nobody currently does.

If there is no real gap, say so. Do not manufacture one.`,
  },
  {
    id: "r-expert-interview",
    category: "research",
    title: "Expert interview prep",
    description: "Prepares specific, research-grounded questions rather than a generic script.",
    prompt: `I'm interviewing [expert name or role] about [topic]. I have 30 minutes.

Give me:
1. Five questions I should prepare. Each one specific enough that only someone with real experience could answer. No "what's your advice for young people".
2. For each question, note the one follow-up I should be ready to ask if the answer is short.
3. One question I should NOT ask because it wastes their time.

Order the questions from easiest rapport-builder to hardest insight-yielding.`,
  },
  {
    id: "r-topic-primer",
    category: "research",
    title: "Topic primer in 10 minutes",
    description: "Gets you from zero to literate on a new subject without the fluff.",
    prompt: `I know nothing about [topic]. Get me to literate in 10 minutes of reading.

Cover:
1. The one-sentence "what is this, really".
2. Three terms of art I'll see everywhere, defined in plain English.
3. The current debate or open problem, in two sentences.
4. One thing most outsiders get wrong.
5. A concrete example that a smart novice can picture.

Total length: 300–400 words. No bullet padding. No "in conclusion".`,
  },

  // ─── Code ────────────────────────────────────────────────────────────
  {
    id: "c-code-review",
    category: "code",
    title: "Senior code review",
    description: "Asks for actionable, ranked feedback in a reviewable shape.",
    prompt: `You are a senior engineer doing a code review. Here is a change:

[paste diff or code]

Return a review in three sections:
1. **Blocking issues** — things that must change before merge. One per bullet, each with a suggested fix. If there are none, say so clearly.
2. **Suggestions** — things you would do differently but wouldn't block on. One per bullet.
3. **Noted** — one sentence on anything that's fine but worth knowing about later.

Be direct. Do not sandwich criticism in compliments. Skip style nits unless they actually hurt readability.`,
  },
  {
    id: "c-refactor-plan",
    category: "code",
    title: "Refactor plan",
    description: "Produces a sequenced plan with atomic steps rather than a wish list.",
    prompt: `I want to refactor this code. Help me make a plan.

Current state: [paste code or describe]
Goal: [describe the end state]
Constraints: tests must pass after every commit; no single step changes more than ~200 lines.

Return:
1. A numbered list of steps. Each step is independently committable and names the files touched.
2. After each step, one sentence on what's verifiable (a test that should pass, a behavior that should still work).
3. One risk I should watch for that your plan doesn't directly address.

Do not write the code. Just the plan.`,
  },
  {
    id: "c-debug-narrative",
    category: "code",
    title: "Debug narrative",
    description: "Forces structured root-cause thinking instead of a grab-bag of guesses.",
    prompt: `I'm debugging this: [paste error, repro steps, context].

Walk through your reasoning in this shape:
1. **What the error is saying**, translated into plain English.
2. **Three candidate causes**, ordered from most to least likely, with a one-sentence reason for each.
3. **The cheapest test** I can run right now to distinguish between them.
4. **The fix** for whichever cause you think is most likely.

If you aren't sure, say so. Don't pretend confidence you don't have.`,
  },

  // ─── Brainstorm ──────────────────────────────────────────────────────
  {
    id: "b-lateral",
    category: "brainstorm",
    title: "Lateral thinking jolt",
    description: "Uses constraint inversion to break the habit of obvious ideas.",
    prompt: `Brainstorm ideas for [problem].

First, list three obvious ideas anyone would think of. Do not dwell on them.

Then, list three non-obvious ideas, each one arriving from a different direction:
- One from an adjacent industry that would feel strange here.
- One that starts by assuming the opposite of what I'm assuming.
- One that would only work if the constraint I take most seriously didn't exist.

For each non-obvious idea, one sentence on what it costs and one sentence on what it unlocks.`,
  },
  {
    id: "b-first-principles",
    category: "brainstorm",
    title: "First principles rebuild",
    description: "Strips an idea back to its atoms so you can redesign it instead of iterating on legacy decisions.",
    prompt: `Take [concept, product, process] and rebuild it from first principles.

1. What is the actual job this thing is doing? Not what it looks like today. What problem is it solving in the world?
2. What are the irreducible parts of that job? Three to five atoms, each one a thing you can't break down further without changing the problem.
3. What is the simplest arrangement of those atoms that solves the job? Describe it in three sentences.
4. How does that simplest arrangement differ from the current version? Where is the current version carrying weight it doesn't need to?`,
  },
  {
    id: "b-constraint-inversion",
    category: "brainstorm",
    title: "Constraint inversion",
    description: "Generates unexpected ideas by flipping the constraints you usually take for granted.",
    prompt: `For [project / decision], list the three constraints I'm currently taking for granted. Things I haven't even been thinking of as choices — budget, time, team size, tech stack, audience, format.

Now invert each one. For each inversion, write two sentences: what becomes possible when that constraint flips, and what new constraint appears in its place.

End with one sentence naming the most interesting inversion to actually consider.`,
  },

  // ─── Meta ────────────────────────────────────────────────────────────
  {
    id: "m-prompt-critique",
    category: "meta",
    title: "Critique this prompt",
    description: "Asks the model to be a prompt critic, which produces better meta-feedback than asking for generic feedback.",
    prompt: `You are a prompt critic. I will give you a prompt someone else wrote. Tell me what's wrong with it.

For each issue, name the rubric dimension it hits (clarity, specificity, role, constraints, output format, examples) and give a one-sentence fix.

End with a rewritten version that addresses everything you flagged. Keep the rewritten version shorter than the original if possible.

Prompt to critique:
[paste the prompt]`,
  },
  {
    id: "m-prompt-rewriter",
    category: "meta",
    title: "Rewrite my prompt tighter",
    description: "A minimal wrapper that gets you a better version of any prompt you already have.",
    prompt: `Rewrite this prompt to be tighter and more specific without changing its goal.

Rules:
- Keep the intent and tone of the original exactly.
- Cut filler words and redundant framing.
- Add any missing specifics: audience, tone, format, constraints, examples.
- Do not add new requirements the original didn't imply.

Return only the rewritten prompt. No commentary.

Original:
[paste the prompt]`,
  },
  {
    id: "m-persona-generator",
    category: "meta",
    title: "Generate a persona for a role prompt",
    description: "Turns a vague role brief into a specific persona the model can actually embody.",
    prompt: `I want to give a language model a persona to adopt. The role is: [describe the role in one sentence].

Generate a persona description I can drop into a system prompt. Include:
- Who they are (name, profession, one distinctive credential or experience).
- How they talk (one sentence on voice, one on what they avoid).
- What they care about (two specific things).
- What they would refuse to do (one thing).

Return the persona as a single paragraph under 120 words, ready to paste.`,
  },
];
