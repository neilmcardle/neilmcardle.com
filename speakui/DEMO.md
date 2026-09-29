# speakui — demo script

For talking through live. **Bold** is roughly what to say; the rest is stage direction and backup.

Everything here is checked against the code. Nothing in it overstates what the tool does.

---

## 0. Before you go live

- Dev server running: `npm run dev -- --port 3020`
- Voice set up in **the browser you'll actually share** — the model is stored per browser, so Chrome and Chrome Canary are separate 1.25 GB downloads.
- Check the microphone works before you start: talk at the input meter in **System Settings → Sound → Input**. If that meter is flat, the problem is below the browser and no browser setting will fix it.
- Decide up front: **do not** demo "describe the whole thing and let it draft" — that path needs an `ANTHROPIC_API_KEY` that isn't set, and it silently falls back to a pattern.
- Open the **Decisions** panel. It's the most interesting thing on screen and the whole credibility argument.

---

## 1. The hook (15 seconds)

> **"This is a UI built by talking to it. But the interesting part isn't that it works — it's that the model never writes any UI. It can't. I'll show you."**

Don't oversell here. The payoff is the Decisions panel, not the canvas.

---

## 2. The one-sentence flow

> **"Speech is transcribed on my machine. My words plus a description of the current design go to Jev as a batch of multiple-choice questions. Jev picks answers. Plain code turns those picks into edits to a JSON design, and React renders it."**

If someone wants the longer version:

| Step                              | Where it runs                                | What it does                         |
| --------------------------------- | -------------------------------------------- | ------------------------------------ |
| Transcription                     | **Your machine** — Parakeet TDT 0.6B, WebGPU | Audio never leaves the computer      |
| Clause splitting, text extraction | Your machine, plain regex                    | Pulls out literal dictated words     |
| The typed questions               | Your machine                                 | ~20 questions built from the catalog |
| **Jev**                           | TypeSafe API                                 | Picks one option per question        |
| Applying the answers              | Your machine, plain code                     | Builds the design object             |
| Render                            | React                                        | —                                    |

The only thing that leaves the machine is the text of the instruction. Not audio.

---

## 3. Build something (the live bit)

**If you want the finished hero instantly** — say **"Pull the hero section"** and the whole personal hero loads in one go. Good for showing the end state before building one by hand. "Load", "bring in", "give me the" and "use the" all work too.

Otherwise start empty, on purpose:

> **"Start a hero section."**

Point at the Decisions panel: it says **Empty hero section**. Say why —

> **"It gave me a canvas, not a design. If I'd wanted a ready-made one I'd have to ask for a template by name. I changed that yesterday because the tool kept building things I hadn't asked for."**

Then build it up, one instruction at a time. These are reliable:

- **"Add a headline that says Designer in London."**
- **"Add a line of text underneath that says I design and build tools for people who make things."**
- **"Add a Work, About and Contact menu in the top right."**
- **"Make the background an animated shader."**
- **"Make the accent teal."**
- **"Switch to a dark theme."**

Every one of these was run against live Jev in this exact order before this script was written. They work.

The shader is a good moment — it's the real WebGL glow field from neilmcardle.com, running live.

**Dictate the words wherever you can.** "Add a headline" on its own gets catalog placeholder copy, which to a viewer looks exactly like the model writing text — the one impression you don't want to give. Saying "that says …" both avoids it and demonstrates the regex extraction.

**Avoid the word "tagline."** It's a listed synonym for _headline_, so you'll get a second big heading, not a supporting line. The word is genuinely ambiguous — "Think different" is a tagline and it's the big one — so it hasn't been redefined. Say "a line of text underneath" instead.

**If a command misfires:** don't hide it. Open the step in the Decisions panel and read out where it went wrong. That's the demo, not a bug in the demo.

---

## 4. The payoff: the Decisions panel

Open any entry and walk one down.

> **"Every step says who decided it. Ochre is the model. Everything else is ordinary code — the parser, the pointer, plain logic. And it shows the model's confidence, so you can see when it was sure and when it was guessing."**

Then land it:

> **"About twenty questions per sentence, three hundred milliseconds, a quarter of a hundredth of a cent. A whole session of a hundred and fifty edits cost me four pence."**

_(Real numbers: ~387ms average, $0.00025 per edit, 153 calls = $0.041.)_

---

## 5. Tommy's question: does Jev create UI?

The question has a false choice in it — "create, or template?" — and the honest answer is neither.

> **"No, and it can't. Jev's API has exactly three answer shapes: a choice from a list I supply, a number between zero and one, or a score on a rubric I define. There's no free-text field. It's not that we told it not to write UI — there's nowhere for UI to come back in."**

Then the second half:

> **"And it isn't a template either. The design is assembled element by element from a catalog of nineteen component types. Ready-made patterns exist, but only load if you actually ask for one — 'pull the hero section', 'use the login pattern'. Say 'start a hero section' and you get an empty one."**

And the bit people don't expect:

> **"The words I dictate — 'a button that says Place order' — are pulled out by a regular expression, not by a model. That's why they come back exactly as I said them instead of paraphrased."**

**One line if you only get one:**

> **"The model chooses; the code builds."**

### If he pushes further

- **"So it's just classification?"** — Yes, essentially. ~20 typed classifications per sentence, answered in one round trip. The claim isn't that this is clever AI; it's that this is the right _shape_ for a design tool, because a classifier can't invent a component that doesn't exist.
- **"Why not just use an LLM?"** — Cost and latency, but mainly validity. A text model can return markup for a component your design system doesn't have. This one can only pick from what's there.
- **"What about the things it can't do?"** — It refuses instead of approximating. Ask for a shader in card mode and it tells you that needs a hero section. That refusal is a feature and it's visible in the panel.

---

## 6. Credit

Say this early rather than letting it be asked:

> **"The approach is Jonathan Moore's — he published a gist and a video showing that the model should choose and code should edit. No repo, no SDK, so none of his code is in this. The implementation is mine, and so is everything past his card demo: hero sections, the shader background, the export, and the Decisions panel."**

Accurate and generous. It costs nothing and it's the truth.

---

## 7. Don't claim

- **Don't** say it drafts a whole design from a description. Built, never once run — no API key.
- **Don't** say the voice model is small. It's 1.25 GB, one-time, per browser.
- **Don't** call Jev an LLM on air. It's a typed classifier; someone will correct you.
- **Don't** promise multi-element edits. "Move the whole icon bar" currently moves one icon — known, not yet fixed.

---

## 8. If the mic dies mid-demo

Switch to the **Typing** toggle in the composer and carry on — the engine is identical, only the input changes. Say so plainly:

> **"Mic's dropped — same pipeline, I'll type instead."**

Nobody minds. Fumbling silently is what loses a room.
