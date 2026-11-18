import Image from "next/image";
import type { Chapter } from "../Story";
import styles from "../story.module.css";

function Screen({ name, alt }: { name: string; alt: string }) {
  return (
    <div className={styles.phone}>
      <Image
        data-zoom=""
        src={`/work/doodlewire/screen-${name}.png`}
        alt={alt}
        width={635}
        height={1100}
        sizes="(max-width: 700px) 60vw, 320px"
      />
    </div>
  );
}

export const DOODLEWIRE: Chapter[] = [
  {
    label: "The problem",
    body: "Interface ideas arrive away from the desk, in a meeting or on the train. Figma, FigJam and the AI tools are all on the laptop. What's in your pocket is a phone and about ninety seconds, so I scoped DoodleWire to capturing an idea and handing it on, not building the screen.",
    visual: (
      <Screen
        name="share"
        alt="DoodleWire handing a finished wireframe to the iPhone share sheet"
      />
    ),
  },
  {
    label: "Decision 1",
    title: "I kept it rough on purpose",
    body: "I made drawings snap into plain wireframe shapes: grey bars for text, a box with a cross for an image, a filled pill for a button.",
    instead:
      "polished interface components. A rough sketch is safe to share early, because everyone can tell it's an idea, not a decision. Polished parts drew feedback on the wrong things.",
    visual: (
      <Screen
        name="wireframe"
        alt="A sign-in screen in DoodleWire, drawn as plain wireframe shapes: an image box, grey text bars, two fields and a filled button"
      />
    ),
  },
  {
    label: "Decision 2",
    title: "I cut recognition to eight shapes",
    body: "I cut the element types from thirteen to eight, keeping only shapes different enough to read reliably. The same drawing now gives the same result on every device.",
    instead:
      "keeping thirteen types that shapes alone couldn't separate. Telling them apart needed training, an onboarding flow and stored samples, and it still guessed wrong.",
    visual: (
      <Screen
        name="types"
        alt="An element selected in DoodleWire, with the strip of element types to switch it to"
      />
    ),
  },
  {
    label: "Decision 3",
    title: "I replaced code export with Copy for AI",
    body: "I made a sketch copy as a plain description of its elements, positions and sizes, ready to paste into Claude, v0 or Figma Make for a real screen. It also shares as an image or a single HTML file.",
    instead:
      "exporting code. Nobody reads code on a phone, and an AI tool writes better code from a clear description than any template.",
    visual: (
      <Screen
        name="copy-for-ai"
        alt="The DoodleWire share options: Share image, Copy for AI and Copy HTML"
      />
    ),
  },
  {
    label: "Decision 4",
    title: "I made the learning visible",
    body: "When a shape could be read two ways, a small card asks which you meant. I limited what it learns to three size thresholds that move a little at a time, and the app says when one moves.",
    instead:
      "a trained model learning quietly in the background. With eight clear shapes, most mistakes are about intent, and three visible numbers capture that more honestly.",
    visual: (
      <Screen
        name="did-you-mean"
        alt="DoodleWire asking Did you mean, with Button, Box and Something else as answers"
      />
    ),
  },
  {
    label: "What I led",
    body: "I designed and built DoodleWire, then rebuilt it for version 2.0, cutting the tools, modes and code export that 1.1 had gathered until the app was a third of its size.",
  },
];
