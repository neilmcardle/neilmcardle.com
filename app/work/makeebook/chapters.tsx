import Image from "next/image";
import { media } from "@/lib/media";
import {
  FocusCard,
  RewriteDemo,
} from "../../make-ebook/components/marketing/brand/demos";
import { StudioDemo } from "../../make-ebook/components/marketing/brand/StudioDemo";
import cases from "../case.module.css";
import type { Chapter } from "../Story";
import styles from "../story.module.css";

export const MAKEEBOOK: Chapter[] = [
  {
    label: "The problem",
    body: "Writers want a space free from distraction, and help only when they ask for it. Book Mind can read a whole manuscript, so the question was when it should speak. Keeping it quiet until asked serves writers better than prompting them to engage.",
    visual: (
      <video
        className={styles.film}
        src={media("/home/makeebook-promo.mp4")}
        poster="/home/makeebook-promo-logo.jpg"
        aria-label="makeebook product film"
        controls
        playsInline
        preload="none"
      />
    ),
  },
  {
    label: "Decision 1",
    title: "AI only when the writer asks",
    body: "Book Mind makes a call only when the writer starts one. Nothing runs on save, on load or in the background.",
    instead:
      "suggestions that appear on their own while you write, interrupting the space writers come for.",
    visual: (
      <div className={cases.demo}>
        <FocusCard />
      </div>
    ),
  },
  {
    label: "Decision 2",
    title: "Rewrites as options, not edits",
    body: "A rewrite comes back as takes to compare, Tighter, Plainer or Warmer. The writer's text stays until they pick Use this take, or Keep mine.",
    instead:
      "rewriting the text in place. Writers couldn't tell what had been overwritten, so changes stay out of the manuscript until the writer confirms them.",
    visual: (
      <div className={cases.demo}>
        <RewriteDemo compact />
      </div>
    ),
  },
  {
    label: "Decision 3",
    title: "Answers from the whole book",
    body: "Book Mind reads every chapter, so a question about the ending is answered with the whole story in view.",
    instead:
      "reading only the open chapter. Without the whole book in view, misunderstandings creep in.",
    visual: <StudioDemo />,
  },
  {
    label: "Decision 4",
    title: "A window beside the writing",
    body: "On desktop, Book Mind opens in a small floating window at the bottom right, and the chapter stays in view.",
    instead:
      "a full panel or a separate page. Book Mind is a writing assistant built on an existing model, not a model of its own, so presenting it as simple help when you need it is more honest.",
    visual: (
      <Image
        className={styles.film}
        src="/work/makeebook/editor.jpg"
        alt="The makeebook editor with a chapter open and Book Mind answering a question about the ending"
        width={2400}
        height={1350}
        sizes="(max-width: 1120px) 100vw, 1072px"
      />
    ),
  },
  {
    label: "How it will be measured",
    body: "Not measured yet. We plan to count how often writers use each Book Mind action, and for how long, without reading what they write, then refine it around what they need.",
  },
  {
    label: "What I led",
    body: "I designed and built makeebook through many rounds of iteration, using Figma and Claude Code.",
  },
];
