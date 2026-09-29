# Decisions

Why speakui is built the way it is. Written 22 Sep 2026, after a failed June attempt (“voicewire”) and a close read of Jonathan Moore’s gist and demo.

## 1. The model chooses; code edits

**Decision:** Jev never produces UI or text. It answers typed questions (“which action?”, “which element?”, “which section?”), and deterministic functions in `lib/design/ops.ts` make the change.

**Why:** The June attempt asked an LLM (Claude Sonnet) to interpret a sketch and return an element. That was slow (2–4s) and free-form, and it failed silently. With multiple choice, every answer is valid by construction: Jev can't return a component that doesn't exist, so the design can't break. It's also why an edit takes about 0.5s instead of several seconds.

**Trade-off:** It can't invent anything outside the catalog, and it can't write copy. That's accepted. The catalog _is_ the design system.

## 2. Literal text is extracted by a parser, not a model

**Decision:** `lib/engine/parse.ts` pulls dictated text out with patterns: “to say …”, “that says …”, “called …”, “placeholder …”, quoted text, “an _email_ field”, “a title _Invite a teammate_”.

**Why:** Jev can't generate strings, and this is the kind of job regexes do well. The panel labels these steps **Parser** so it's clear no model was involved.

**Known edges:** “Save and exit” inside dictated text stays one clause (the splitter only breaks where the next words start a new instruction). Spoken emails (“name at company dot com”) are rebuilt. Speech-recognition errors pass straight through, as they do in Moore’s demo (“Scend”).

## 3. One batched call per request, one question pack per clause

**Decision:** “Add an email field and a send button, then make it full width” is split into three clauses. Each gets the same 15 questions, and all 45 go to Jev in **one** request.

**Why:** Jev evaluates questions in parallel, so extra questions cost tokens but barely any time. Asking every question every time (even ones that don't apply to the action) keeps the pack fixed and simple. Code only reads the answers the chosen action needs.

**Measured:** About 2.7–3.5k input tokens for one instruction (~$0.00012–0.00015) and about 6k for a three-part sentence, with Jev answering in about 230–350 ms. Moore's demo showed about 60 questions per call, ~$0.00045 and 500–700 ms, so this pack is deliberately leaner.

## 4. “This” resolves through a fixed order, visible in the panel

**Decision:** Target resolution in `apply.ts` tries, in order:

1. Something added **earlier in the same sentence** (“add a button and make _it_ full width”)
2. The **whole card**, if Jev is at least 50% sure the request is about the card
3. The **pointer**, unless the words name a different kind of component or another element's text
4. **Jev's** pick, if at least 35% confident
5. The **most recently added** element
6. The **only** element of the named kind

**Why:** Pointing is the most reliable signal a person gives, but “it” in the same sentence almost always means what was just added. Each step is recorded with its source (Pointer / Jev / Recent / Code), so a wrong target is explainable rather than mysterious.

### What real testing changed

The first live run passed 11 of 13 on Moore's sequence and 14 of 16 on looser phrasing. The fixes:

- **Pointer beats Jev unless you name something else.** Pointing at a checkbox and saying “update the text to say…” changed the _button_, because Jev guessed (79%) and my order let the guess win when you didn't say “this”. Now the pointer wins unless the words name a different kind of component or another element's text.
- **Filler words are only filler at the start.** “Remember me checkbox” had become “Remember”.
- **Implicit text stops at location words.** “A dropdown for country below the email” had been labelled “Country below the email”.
- **No colour change without a colour word.** “Make it a switch instead” produced an unrelated accent change, because type conversion didn't exist and Jev picked the nearest option. Now colour changes need a colour word, and there's a real “convert” option for compatible kinds.

The last one is the general risk of this design: **when a request falls outside the catalog, Jev still picks the closest option.** Guards in code, and a “none” option it's willing to choose, are what stop near-misses from becoming wrong edits.

## 5. Do nothing rather than guess

**Decision:** If Jev is less than 40% sure of the action, or says the words aren't a design instruction (“um, so yeah”), nothing changes and the panel says why.

**Why:** In voice UI, a wrong edit costs more than no edit. You have to notice it, then undo it. Filler and half-sentences are common while speaking.

## 6. Preview while speaking, commit on pause

**Decision:** Partial transcripts (about every 450ms) are evaluated and shown as a dashed preview. A 750ms pause commits once. If the last preview matches the final words, it's reused, with no extra call.

**Why:** Seeing the change form while you talk is what makes it feel instant. Keeping preview separate from committed state means half a sentence never leaves junk behind, and each spoken instruction is exactly one undo step.

**Cost control:** Previews cost calls. There's a “Live preview” toggle, and the session cost includes preview calls so the number isn't flattering.

## 7. Local speech, cloud decisions

**Decision:** Parakeet TDT 0.6B v2 runs in a Web Worker via parakeet.js (WebGPU, with CPU fallback). Only text goes to Jev, through a local server route that holds the key.

**Why:** Privacy (audio never leaves the machine), no per-minute speech cost, and no network round trip for audio.

**Setup is its own step (changed 22 Sep 2026):** The first version downloaded the model when you first pressed the mic. In practice the progress bar read like _your speech uploading_, and nothing responded for minutes. Now a first-run card states the size and speed mode before anything downloads, you choose to start it, you can type meanwhile, and a sound test ends setup. The model also now lives separately from the microphone, so turning the mic off and on no longer reloads it. If loading on the GPU fails, the app offers CPU mode as a choice instead of silently starting a second download.

**Honest cost:** A one-time **1.26 GB** download on WebGPU (the fp16 encoder; the int8 one isn't supported on WebGPU), or about 660 MB on CPU. That's a lot for a first run. The browser's built-in Web Speech API would need no download, but it sends audio to Google. That's a reasonable option to add later as an explicit choice.

## 8. Design state is flat and boring

**Decision:** One card, header/body/footer, a flat ordered element list. Order within a section is relative order in the list.

**Why:** It matches Moore's demo structure (“Body · item 2”), keeps every edit a small pure function, and keeps the list of target options short enough for Jev to pick reliably. Nesting is the obvious next step and the obvious place accuracy would drop.

## 9. The Decisions panel is the point

**Decision:** Every request is broken into numbered steps, each tagged **Jev**, **Parser**, **Pointer**, **Recent** or **Code**, with Jev's confidence where relevant, plus time, tokens and cost.

**Why:** Most AI demos hide how much of the “intelligence” is ordinary code. Showing it makes the system debuggable, and for a portfolio piece it's the most interesting thing to show: where the model earns its place and where it doesn't.

## 10. The chrome borrows two of my own systems, in light mode

**Decision:** The app's look comes from the light theme of neilmcardle.com (from its code in `components/home/`, not its outdated DESIGN.md), with the structure of makeEbook's studio:

- **From neilmcardle.com:** warm paper `#fbf9f3`, ink `#14120e`, muted `#6b6254`, the ink dot-matrix texture, frosted glass sheets and a glass dock, Inter with tight tracking.
- **Sentence case only.** The site uses uppercase eyebrows; speakui does not (changed 22 Sep 2026 on Neil's instruction). Hierarchy comes from size, weight and muted colour. The design being edited can use any case it likes: that's the user's choice, not the tool's.
- **From makeEbook:** pill controls (28px, Inter 12/500), the segmented control with an inverted active item, hairline dividers, JetBrains Mono for numbers.
- **One accent, ochre `#86621b`:** focus rings, the live preview outline, the change flash, and the **Jev** tag in the Decisions panel. That way the model's decisions are the only warm thing in the panel, and everything code decided is ink.
- **The pointer target is ink,** not a colour, so it never clashes with whatever accent the design being edited uses.
- **The design being edited is isolated.** It sits in `.design-scope`, which restores stock shadcn tokens, so your design never inherits the tool's paper and ink.

**Rejected:** makeEbook's Finish Acid `#deea53`. It's built for dark grounds, and on paper it either needs dark text on a yellow fill or disappears as a focus ring.

## 11. Listening holds unfinished sentences

**Decision:** The pause that commits an instruction is 1.1s, and a fragment that ends mid-thought ("…needs to have a", "and then at the bottom", a bare "A") is held and joined to whatever is said next.

**Why:** The first real voice session failed this way. Describing a page out loud, with thinking pauses, was chopped into seven fragments, each treated as a complete instruction: "menu in the top right" added a dropdown, "and then at the bottom" moved a heading. Short commands tolerate a short pause; descriptions don't.

**How:** `looksUnfinished()` in `parse.ts` is a word test, not a model call: trailing articles, conjunctions, prepositions, or a bare location phrase. The composer says "Waiting for the rest…" so the hold is visible, and typing or pressing Apply releases it.

## 12. Refuse rather than approximate

**Decision:** Every clause carries a Jev question: can this be done with only these parts? Below 0.3, nothing changes and the panel says why. In card mode, a plain-code check also refuses when the words name a hero-only component.

**Why:** The same session asked for a menu, a hero and a chevron in a card. Jev can only choose from the catalog, so it chose the nearest things and built nonsense. A model that must pick will always pick; the guard has to be code, plus a "none of these" option it is willing to take.

**Result:** "Add a menu in the top right" in card mode now answers "That needs a hero section", which is both true and useful.

## 13. Hero mode: same model, new vocabulary

**Decision:** Cards and heroes share one design model, one edit engine and one Decisions panel. A hero is a mode with its own slots (nav left/right, main, actions, proof, media, bottom), its own components, and background settings.

**Why:** The alternative, a second engine for heroes, would double the surface for pointer targeting, undo, refusal and the panel. Making the catalog mode-aware was smaller, and everything already tested for cards kept working (29 of 29 after the change).

**Trade-offs:**

- **Backgrounds are presets with dials,** not open-ended visuals: aurora, mesh, glow, dots, grid, plain, each with accent, light/dark and a 1-5 strength. Voice is good at choosing and tuning; it can't speak a shader into existence.
- **Icons are a curated set of 42,** matched by what people say ("lightning" → zap). A full icon library would be thousands of options; the catalog principle says a smaller vocabulary picks more reliably.
- **Avatars, images and client logos are placeholders.** Voice can't create images. Uploads are the obvious next step.

## 14. Drafting is Claude's only job

**Decision:** Describing a whole design in one go goes to Claude Opus 5, which returns a draft constrained to the catalog's schema. Every edit afterwards goes back through Jev and plain code.

**Why:** Jev can't compose; it picks from options. A first draft from a free description is exactly the job a text model is good at, and it's needed once per design, not once per edit.

**Rules that keep it honest:**

- **Drafting never runs during live preview.** Partial speech would otherwise cost a few cents every half-second. Previews say "will draft when you pause"; the draft happens once, on commit.
- **The draft is validated in code.** Anything outside the catalog is dropped before it renders, and the panel reports how many parts were dropped and what the model says it couldn't build.
- **It degrades without a key.** No `ANTHROPIC_API_KEY` means the nearest built-in pattern, and the panel says drafting isn't set up rather than failing silently, as the June version did.

**Cost:** about 2-6¢ per draft against $0.0002 per Jev edit, so drafting is 100-300x the cost of an edit. That ratio is the reason it's once per design, not the default path.

## 15. No startup check may block the app

**Decision:** The two checks that run before voice is usable — "does this browser have a GPU adapter?" and "is the model already in this browser's cache?" — each have a timeout (4s and 6s) and a fallback answer. The setup card also shows a way forward if it is still checking after 8 seconds.

**Why:** Both questions go to browser subsystems that can stall indefinitely: a wedged GPU process, or an IndexedDB the browser will not open because another tab holds it. Neither had a timeout, and neither was wrapped in error handling, so a single stall left the card reading "Checking this browser…" for as long as the tab stayed open, with no button on it. Voice was unreachable, and nothing said why.

**What makes the fallbacks safe:** guessing "no GPU" costs speed, not correctness. Guessing "nothing cached" costs a moment, because the download step reads the same cache and finds the files already there — it doesn't re-download a gigabyte. A hang, by contrast, costs the whole feature. So neither answer is worth waiting for.

**Wider rule:** anything between the person and the thing they came to do gets a timeout and a visible exit. A spinner with no escape is a bug, not a loading state.

## 16. A diagnostic names a test, not a list of suspects

**Rule:** when nothing is heard, speakui names one check — the input meter in macOS's own Sound settings — and says what each outcome means. It does not list possible causes.

**Why:** a list of plausible causes can be entirely wrong; a test that splits the problem in half cannot. If that meter doesn't move, no browser setting will help, and the message says so.

## 17. The shader is borrowed whole, not reimplemented

**Decision:** The animated hero background is `glowShader.ts` from neilmcardle.com, copied in unchanged as `lib/design/glow-shader.ts` and exposed as the `shader` background. It has no imports — self-contained WebGL2 — so it travels as one file, which is also how it exports: beside the hero component, never inlined into it.

**Why:** It's already written, already tuned, and it's the actual benchmark — the hero speakui was asked to match. Reimplementing it would have produced something worse and called it new.

**What it must never do:** break the hero. No WebGL2 means `createGlowShader` throws, which is caught and swaps the container over to a CSS gradient in place. The component holds no React state at all: markup is identical on server and client, so there's nothing to mismatch on hydration, and theme, pausing and the fallback are applied straight to the DOM. It pauses on a hidden tab.

**Measured:** 120fps with the shader running full-bleed, no main-thread cost. Not yet measured: whether it competes with the voice model, which uses WebGPU on the same hardware. The component takes a `paused` prop for exactly that, unused so far.

## 18. Literal words about backgrounds belong in code

**Decision:** `backgroundNamedIn()` matches spoken background names in plain code, before Jev is asked. Phrases that ask for _nothing_ ("plain", "flat", "no effect") and phrases that ask for _motion_ ("animate it") are decided by regex, as template names already are.

**Why, with numbers:** a probe of 9 phrases from 2 starting states scored 14/18 before this. The failures had a shape: Jev handles named effects well ("aurora", "a grid", "a mesh gradient") but sticks to the current value when the request doesn't name a replacement — "use a plain background" worked from a grid and failed from the shader. Asking a model to choose between options it can see is the right job for it; recognising the word "plain" is not. After the change, 18/18.

**A related fix at a different layer:** "remove the background effect" failed for a different reason — Jev classified it as removing a _component_, which is a fair reading, so the background code never ran. The background isn't a component, so a removal naming it is redirected to setting it solid.

## 19. Literal words belong to the parser, not the model

**Rule:** anything the request states outright is resolved in code before Jev is consulted — the colour after "to" (`colourNamedIn`), the background (`backgroundNamedIn`), a named pattern (`templateNamedIn`), and a component named by noun. Jev is asked only when the words leave a genuine choice.

**Why:** a model asked to choose between options it can see is doing the right job. Recognising the word "plain", or telling a colour that identifies a thing from the colour being requested, is grammar, and grammar is deterministic.

**Related guard:** a removal whose request is plural ("delete them") but resolves to a single unnamed element refuses instead of guessing. A wrong guess when adding is an annoyance; a wrong guess when deleting destroys work.

## 20. Asking for a canvas gives you a canvas

**Decision:** speakui builds something only when you name what goes in it, or name a pattern as a pattern. Otherwise it hands you an empty canvas. "Start a hero section" → an empty hero. "Start from the personal hero template" → the pattern. "A hero with a headline and two buttons" → a draft.

**Why:** three separate paths all ended in a filled canvas, and none of them were asked for. `templateNamedIn` matched bare adjectives, so "personal", "launch", "split" or "waitlist" anywhere in a sentence built a whole pattern in code before Jev was consulted. The word "hero" appeared inside the template option Jev chooses from, biasing it further. And with no `ANTHROPIC_API_KEY`, describing something fell back to the nearest pattern. Meanwhile there was no command at all for "give me an empty hero" — `clear` emptied the canvas but kept the mode. Building from scratch wasn't discouraged, it was unreachable.

**The rule in one line:** a template now requires a pattern word — template, pattern, preset, starter, example, "like the". Naming a ready-made thing should be a deliberate act, because a canvas that fills itself the moment you say a word takes the authorship away from the person speaking.

**What it costs:** "make me an invite card" no longer drafts an invite card — it gives you a card. Purpose without parts is not enough. That's the price of predictability, and the empty-state examples now teach the three forms instead.

**Tested:** 10 live cases across the three intents (blank / template / draft), all passing. The hero suite's opening step used to encode the old intent and now says "start from the personal hero template" — the test changed because the product changed, which is worth saying out loud rather than quietly editing.

## 21. Hovering is not pointing

**Decision:** the pointer feeds the engine only when you click to lock onto something. Hover still highlights, and the chip now says "Click to target" rather than "Target".

**Why:** the target was `locked ?? hover`, so a cursor resting anywhere counted as pointing. In a real session it twice overrode what was said out loud — once renaming the logo when the request named three other elements by name. Pointing is what makes voice editing bearable: saying "make this bigger" beats describing "the third icon in the dock". But it has to be an act of intent. Ambient hover gave all the ambiguity of pointing with none of the intent, and it silently outranked the words.

## 22. Don't split a clause inside dictated words

**Rule:** once the clause splitter is inside dictated text, a bare "and" is part of that text, not a boundary. "That says I design and build tools" is one instruction even though "build" is a verb the splitter otherwise cuts on. A deliberate boundary — "and then", "then", a full stop — still splits.

**Why it matters beyond correctness:** splitting mid-quote produces truncated text _and_ a spurious extra element carrying catalog placeholder copy. In a tool whose claim is that the model never writes text, placeholder copy appearing on screen reads as exactly that.

## 23. Asking for a pattern shouldn't depend on the model's confidence

**What broke:** decision 20 made templates require a "pattern word", and the list was too narrow — `template`, `pattern`, `preset`, `example`, `like the`. Nobody speaks that way. "Pull the hero section" matched nothing, fell through the gate, and produced an empty canvas. A fix for one complaint created the opposite complaint two days later.

**Two fixes, at different layers:**

- **Vocabulary.** The gate now recognises how people actually ask for a ready-made thing: pull, load, populate, bring in, give me the, show me the, use the, the usual. And "the hero section", naming no particular pattern, resolves to the personal hero — reachable only once a retrieval word is present, so "start a hero section" still gives you an empty one.
- **Confidence.** "Populate the hero section" came back from Jev at 39%, just under the 40% bar, and worked or didn't depending on the run. Worse, the same sentence arrived as `template` on one run and `compose` on another. So when the words name a pattern outright, code decides and the model's confidence is not consulted at all. It's restricted to the two actions meaning "make something new", so an edit like "pull the logo left" can't be hijacked.

**What caught it:** not the offline probe, which passed. The app caught it, because Jev returned a different action there. **A probe that stubs one path tests that path, not the product** — the same lesson as running the demo script rather than writing it.

**The tension this leaves, stated honestly:** decisions 20 and 23 pull against each other. 20 says don't build what wasn't asked for; 23 says make it easy to ask. The line between them is a list of verbs, which means it will be wrong again for some phrasing nobody has tried yet. The mitigation isn't a cleverer regex — it's that the Decisions panel shows which rule fired, so a wrong answer is legible instead of mysterious.

## 24. A live preview may edit, never replace

**Rule:** previews run on half-finished speech, so they may show incremental edits but must never replace or empty the canvas. `EvalContext.preview` marks them; loading a pattern and clearing the canvas are both deferred to the commit, which reports what _will_ happen instead of doing it.

**Corollary:** emptying the canvas requires an explicit ask — a creation verb and the name of a canvas. A vague half-sentence gets a question back, not a wiped canvas.

**Why:** speculative execution on a half-heard instruction is only safe when every operation is small and reversible.

## 25. Most of the latency was a constant I chose

**The measurement that started this.** People reacting to the demo were reacting to speed, so it was worth knowing where the time actually goes. After you stop speaking: 1,100ms waiting to be sure you've stopped, ~250ms transcribing, ~350ms in Jev. **Two-thirds of the delay was `endSilenceMs = 1100`, a number I picked — not the model, not the network.**

**Two changes, both free:**

- **Adaptive endpointing.** A pause now triggers a transcription at 180ms, and its text decides how long to wait: a sentence that already reads as complete ends at ~420ms, one that looks unfinished still gets the full 1.1s. `looksUnfinished()` already existed for holding fragments; this is the same judgement used earlier.
- **Stop transcribing the same audio twice.** That endpoint check has already transcribed every word. Re-running it on commit cost ~250ms to produce the same string, so the final reuses it when it covers all the speech.

**Measured, not assumed:** ~1,700ms → **~730ms**, and under 400ms of that is the pause.

**The test is the interesting part.** The obvious version stubs the model to return the full sentence every time — and passes, while proving nothing. The risk being introduced is _truncation_: reusing a partial that arrived before the last words. So the stub transcribes only the audio it was handed, which makes an early partial come back short. The suite drives the real frame loop in real time and asserts both the timing and that no word was lost. A test that can't fail the way the change can break is decoration.

**The judgement call:** ending 700ms sooner means occasionally cutting someone off who was mid-thought. The unfinished-fragment check is what makes that acceptable, and it's why the long wait was kept rather than lowered for everyone.

## 26. Reuse an answer only when it is complete

**Rule:** when the commit needs a decision the preview is already fetching for exactly those words, it waits for that request rather than cancelling it and asking again. But it reuses a result only if nothing was held back — `deferredCompose` or `deferred` on the result means the preview described future work, and committing it would mean that work never happens.

**Why the flag is structural:** the deferral is marked on the outcome, not detected by matching the summary text. A string check would work today and break the first time the wording changed.

## 27. Saved builds, so the canvas can start empty

**The complaint:** "there should be nothing on the canvas", then "I can't seem to wipe the canvas on hard refresh", then "this canvas has a template I can't remove". Three reports of the same thing. The editor persisted exactly one design, so a reload always restored it.

**Why not simply one or the other.** Always persisting means never getting a clean slate; never persisting means an accidental reload costs the work. Saved builds avoid the trade rather than picking a side.

That dissolves it rather than trading it. **The canvas starts empty on every load, because nothing is lost by doing so.**

**What a build is:** the design, its undo history, and the decisions that produced it — every instruction, what Jev picked, the confidences, the cost. Loading one restores _how it was made_, not just what it became. That matters here more than in most tools, because the decisions log is the thing that makes this defensible rather than magic.

**How it behaves:** saved automatically after every logged change, updating the same build rather than spawning one per edit (the id is minted on first save). An empty canvas is never saved, so the list holds builds and not the moments between them. Capped at 24 builds, 12 undo steps and 40 decisions each, so browser storage doesn't grow without limit. Pressing New saves the current canvas before clearing it.

**What still persists across reloads:** only preferences — pointer mode, panel open, live preview — and the voice model, which lives in IndexedDB and is expensive to re-fetch.

**The general shape of the mistake:** implicit storage of exactly one thing. It can't be cleared and it can't be retrieved, and both complaints have the same root. Either make it ephemeral or make it a real, listable collection. One invisible saved item is the worst point on that scale.

## What was dropped from the June attempt

Everything. It was a drawing tool (sketch + speak → one guessed element) with no way to edit existing UI, no API key configured (so it always returned “unknown”), and 3-second fixed voice chunks that often weren't transcribed in time. The June files were moved to the macOS Trash on 22 Sep 2026 (folder `voicewire-june-…`), not deleted.

## 28. A demo people can see, not use

**Decision:** the deployed build is rate-limited hard enough that it can't cost real money. Ten edits per visitor, then the composer freezes with what you built still on screen. Off by default, so local development is never limited.

**Why the numbers aren't scary.** A real session — 153 edits — cost 4.1p. That's about **$0.00027 an edit**, so 3,700 edits to the dollar. Ten thousand people seeing a post, 2% trying it, twenty edits each comes to about a dollar. Per-use cost was never the risk; one person scripting the endpoint overnight was.

**Three layers, only one load-bearing.** A cookie quota stops honest overuse and is trivially cleared. A per-IP burst limit breaks up hammering, and leaks across serverless instances, which is fine for what it's for. The monthly ceiling is the one that actually holds, because it caps the whole deployment whatever anyone does.

**The design consequence worth noting:** requiring a 1.25 GB speech model before anyone can look at the thing is absurd for a demo. Typing exercises the same engine, the same Decisions panel, the same latency — everything but the microphone. So voice is an opt-in download and the demo works without it. The thing people need to _see_ is the decision trail, and that costs nothing to show.

**Freeze rather than block.** When the allowance runs out the canvas keeps what they made and the panel keeps the record of how it was made. A demo that ends by erasing your work argues against itself.
