# speakui

Speak a UI into existence. Describe a card or a hero section, point at any part of it and say what to change, and it changes in well under a second.

It's a rebuild of the approach Jonathan Moore described ([gist](https://gist.github.com/jonathanmoore/fd5299164669d173c182821e47767b70)): the AI never writes UI. It answers multiple-choice questions about your request, and ordinary code makes the edit.

```
your voice ──► Parakeet (in the browser) ──► transcript
                                                │
             current design + pointer target ───┤
                                                ▼
                               one Jev call, ~15 typed questions per instruction
                                                │
                     parser pulls out literal text ("to say Place order")
                                                ▼
                         plain code edits the design data ──► React renders shadcn
```

## Run it

1. Create an API key at [console.typesafe.ai](https://console.typesafe.ai) → API Keys.
2. Copy `.env.example` to `.env.local` and paste the key after `TYPESAFE_API_KEY=`. Keys are only read by the local server; the browser never sees them.
   Optionally add an `ANTHROPIC_API_KEY` too, which enables drafting a whole design from a description (see Drafting below).
3. Install and start:

```bash
npm install
```

```bash
npm run dev -- --port 3020
```

4. Open http://localhost:3020 in **Chrome** (WebGPU makes voice much faster).

Typing works straight away. Voice needs a one-time setup, offered on first visit (see Voice below).

## Using it

- **Start:** click an example, or type/say “create an invite a teammate card”.
- **Point:** hover anything and say “make **this** full width”. Click to lock a target so you can move the mouse away; Esc clears it.
- **Talk in sentences:** “add an email field and a send button, then make it full width” is split into three instructions and handled in one Jev call.
- **Say text explicitly:** “change the button **to say** Place order”, “add a checkbox **that says** I agree to the terms”, “placeholder **to** name at company dot com” (becomes `name@company.com`).
- **Export** copies the card as a React + shadcn component.

| Key          | Action                           |
| ------------ | -------------------------------- |
| `P`          | Pointer mode on/off              |
| `L`          | Lock / unlock the current target |
| `Esc`        | Clear target                     |
| `M`          | Microphone on/off                |
| `D`          | Decisions panel                  |
| `/`          | Focus the instruction box        |
| `⌘Z` / `⇧⌘Z` | Undo / redo                      |

## Two modes

**Card**: a single card, form or dialog (header, body, footer).

**Hero**: a full-width hero section, with a background effect and named slots: nav left and right, a main stack, an actions row, a "trusted by" logo row, a media area and a bottom edge for a scroll cue or a dock of icons.

Switch with the Card / Hero toggle, or just say it: "start a hero section", "build me a login card".

## What it can do

**Card components:** heading, text, input, text area, dropdown, checkbox, switch, button, badge, divider.

**Hero components:** logo, nav links, eyebrow, headline (with one word emphasised), subheadline, buttons, email field, badge, avatar, image, client logos, icons from a 42-icon set, scroll cue.

**Edits:** add (one or several at once: "links for Work, About and Contact"), remove, move, change text or placeholder, replace a whole set ("replace the client logos with Avis, Mobbin and Banner of Truth"), restyle (full width, button style, size, icon, emphasis, input type, required), convert between similar components, check/uncheck, and undo/redo/clear.

**Whole-design changes:** accent colour, and then per mode: spacing, width and footer alignment for cards; background effect (aurora, mesh, glow, dots, grid, plain), light/dark, layout (centred, left, split), height and background strength for heroes.

**Starting patterns:** invite, login, sign-up, settings, feedback, checkout cards; personal, launch, split and waitlist heroes.

**Tested phrasing (22 Sep 2026, real Jev):** 46 of 46 passed across three suites: Moore's card demo sequence (13), looser card phrasing (16), and hero editing plus refusals (17). I wrote those tests and fixed the code against them, so expect your own phrasing to find new gaps. When it does, the Decisions panel shows which step went wrong.

## Drafting from a description

Say a whole thing at once ("a dark personal hero with my name, a tagline, a trusted-by row and a dock of social icons") and Claude drafts it as a first version. Every edit after that goes back through Jev and plain code.

- **Needs `ANTHROPIC_API_KEY`.** Without it, speakui starts from the closest built-in pattern and says so in the Decisions panel.
- **Model:** Claude Opus 5 at low effort, about 5–10s and **2–6¢ per draft**. Change it with `COMPOSE_MODEL`.
- **Only the catalog:** the draft has to match a schema built from the same components Jev chooses from, and code drops anything off-catalog before it renders.
- **Never during live preview.** Drafting only runs when you finish speaking, so talking doesn't cost a draft per half-second.

## What it can't do (on purpose)

- **Invent components.** Jev can only choose from the catalog in `lib/design/catalog.ts`. That's what keeps output valid. Ask for a video, a carousel or a pricing table and it refuses rather than approximating.
- **Write copy for you.** “Make the headline friendlier” won't work, because Jev can't generate text. You have to say the words.
- **Nested layouts.** One card, or one hero section. No columns of cards, no nesting, no second section below.
- **Your real assets.** Avatars and client logos are placeholders; there's no upload yet.
- **Correct mishearings.** If speech recognition hears “scend”, you get a button labelled “Scend”. The transcript stays visible so you can re-say or type a fix.

## Cost

Jev is **$0.042 per million input tokens**; output is free (checked 22 Sep 2026). Measured on 22 Sep 2026 against real Jev:

| Request                                         | Input tokens | Cost              | Jev time    |
| ----------------------------------------------- | ------------ | ----------------- | ----------- |
| One instruction (“make this an outline button”) | ~2,700–3,500 | ~$0.00012–0.00015 | ~230–350 ms |
| Two or three instructions in one sentence       | ~6,000       | ~$0.00025         | ~270–300 ms |

Token counts grow slowly with the number of components on the card. For comparison, Moore's demo showed about $0.00045 and 500–700 ms per call, because it asked about 60 questions per call against this app's 15 per instruction.

- **Typed:** one call per instruction.
- **Voice with Live preview on:** a call about every half second while you talk, so usually 2–6 calls per instruction. The final call is skipped when the last preview already matches what you said. Turn Live preview off to get exactly one call per instruction.

The top bar shows each call's time, question count and cost. The Decisions panel footer shows the session total, including preview calls.

## Voice

Speech-to-text is NVIDIA Parakeet TDT 0.6B v2 (English), running in the browser via [parakeet.js](https://github.com/ysdede/parakeet.js). Audio never leaves your machine; only the text of each instruction goes to Jev.

**Setup is a deliberate first step, never a side effect of your first command.** On first visit a setup card:

1. Checks the browser and shows the real download size and speed mode before anything downloads:
   - **GPU (Chrome/Edge):** 1.25 GB, replies in well under a second
   - **CPU (Firefox/Safari on Mac):** 661 MB, about 1–3s after you stop talking. The card says so and suggests Chrome.
2. Downloads with progress, speed and time left. You can type while it runs.
3. Warms the model up.
4. Asks for the microphone and runs a sound test that shows what it heard.

**Details:**

- **"Just type for now"** skips setup. The Microphone button reopens it later.
- **Return visits** check the browser's cache first. If the model is there, it loads quietly with no network. If the cache was cleared, the setup card comes back rather than re-downloading silently.
- **Downloads can't resume.** The encoder is one large file, so reloading mid-download restarts it. The page asks before you reload.
- **Each browser keeps its own copy.**
- **Pause about 1.1s** to commit an instruction. Each committed instruction is one undo step.
- **Thinking pauses are safe.** A fragment that ends mid-sentence ("…needs to have a", "and then at the bottom") is held and joined to what you say next, instead of being acted on.
- English only. Strong accents and similar-sounding words will sometimes be misheard.

## Project layout

```
lib/design/     the design model: types, catalog (both modes), icons, templates, pure edit ops, JSX export
lib/engine/     parse.ts (plain-code text extraction), questions.ts (the Jev question pack),
                apply.ts (answers → edits, with a trail), compose.ts (draft schema),
                evaluate.ts (orchestration)
lib/voice/      mic capture + pause detection, Parakeet web worker
app/api/evaluate/route.ts   server-side proxy holding the TypeSafe key
app/api/compose/route.ts    drafting from a description, holding the Anthropic key
components/editor/          canvas, card and hero renderers, pointer overlay, composer,
                            voice setup, Decisions panel, top bar
stores/editor.ts            design history, pointer target, decision log, usage
```

See [DECISIONS.md](./DECISIONS.md) for why it's built this way.
