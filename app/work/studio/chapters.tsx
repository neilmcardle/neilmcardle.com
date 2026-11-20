import Image from "next/image";
import type { Chapter } from "../Story";
import styles from "../story.module.css";
import OutlineFigure from "./OutlineFigure";
import Pipeline from "./Pipeline";

const shot = (
  name: string,
  alt: string,
  width: number,
  height: number,
  zoom = true,
) => (
  <Image
    data-zoom={zoom ? "" : undefined}
    className={styles.film}
    src={`/work/studio/${name}.jpg`}
    alt={alt}
    width={width}
    height={height}
    sizes={height > width ? "280px" : "(max-width: 1120px) 100vw, 1072px"}
    style={
      height > width
        ? { maxWidth: 280, marginInline: "auto" }
        : height > width * 0.8
          ? { maxWidth: 560, marginInline: "auto" }
          : undefined
    }
  />
);

export const STUDIO: Chapter[] = [
  {
    label: "The problem",
    body: "I audited my own site as a hiring manager would. On a 1440 by 900 laptop the painting filled the screen and my name started below the fold. The first screen showed a room, a mute button and nothing that said who I am.",
    visual: shot(
      "before",
      "The studio filling a laptop screen, with no name in view",
      1440,
      900,
    ),
    prompt: { text: "audit my site now", date: "Nov 19" },
  },
  {
    label: "Decision 1",
    title: "I put my name above my own head",
    body: "My logo and name sit small above the character, the way a game shows the player's name, and fade the first time he walks. On phones, tapping an object outlines it and names it, like a real point-and-click game.",
    visual: shot(
      "name-tag",
      "The N logo and name above the character on a phone",
      416,
      726,
    ),
    prompt: {
      text: "For my name Put it and my logo in small above the character's name, when he moves for the first time fade it away. On mobile remove the scrolling info text in the hero. On mobile if an item is tapped in the hero a tooltip with that item's name should show like a true point an click game, highlighting the item that has been found and is clickable",
      date: "Nov 19",
      reply:
        "Added the name tag, removed the hint line and gave taps an outline with a label.",
    },
  },
  {
    label: "Decision 2",
    title: "I moved my introduction onto the painting",
    body: "The empty wall on the left became a dark card with my name and a short introduction, on screens wide enough to hold it. It fades as soon as I walk towards it, so it never hides the objects behind it for long.",
    visual: shot(
      "intro-card",
      "A dark introduction card on the wall of the studio",
      654,
      700,
    ),
    prompt: {
      text: "on desktop in this space on the left, we can have the personal summary as a dark card with large name as title and the paragraphs about me in it",
      date: "Nov 19",
    },
  },
  {
    label: "Decision 3",
    title: "I made everything findable by pointing",
    body: "On desktop, hovering an object draws a glowing outline around its real shape with its name above it. The outline is drawn just behind me when I stand in front of it, so it never sits on my jacket.",
    visual: shot(
      "hover",
      "The laptop outlined in yellow with its name above",
      500,
      320,
    ),
    prompt: {
      text: "on desktop if I hover on something it should highlight",
      date: "Nov 19",
    },
  },
  {
    label: "Decision 4",
    title: "I built a tool to fix the outlines by hand",
    body: "The outlines were traced automatically and some were wrong. Rather than describe every fix, I asked for an editor: drag the nodes, add and remove them, save. I then went through every object myself, and my corrected shapes became the data the game uses.",
    visual: shot(
      "outline-editor",
      "The outline editor open over the studio, with nodes on each object",
      1440,
      900,
      false,
    ),
    prompt: {
      text: "is there a way for me to move the nodes of your highlights to better highlight the items?",
      date: "Nov 19",
      reply: "Neil: “Build the editor”",
    },
  },
  {
    label: "Up close 1",
    title: "The trace gave me a start, not an answer",
    body: "Every outline began as an automatic trace of a mask. It was faithful to pixels, not to objects: 236 points across the room, 90 on the press alone, the desk in two pieces and no coat at all. Pick an object to zoom in, and switch between the trace and my pass.",
    visual: <OutlineFigure start="before" />,
    instead:
      "describing each fix in words. Most fixes were a few pixels, and a sentence per node would have taken longer than moving it.",
  },
  {
    label: "Up close 2",
    title: "I drew instead of describing",
    body: "In our own selection tool I dragged nodes onto the real edges, double-clicked to add them and Option-clicked to remove them. The easel went from 16 points to 5, the desk became one shape, and the coat got its first outline. When the tool got in my way, I said so in one line and it changed on the spot.",
    visual: <OutlineFigure start="after" />,
    prompt: {
      text: "there's a set of 3 nodes I can't delete in a triangle",
      date: "Nov 19",
      reply:
        "Option-clicking a corner of a three-node shape now removes the whole shape.",
    },
  },
  {
    label: "Up close 3",
    title: "Save turned my drawing into data",
    body: "Save writes the shapes to the site and to the game. From then on the hover outlines, the click areas and the depth sorting all use what I drew, and Claude reads that file instead of my description. The saved file is now the master copy, so the trace only runs for new objects.",
    visual: <Pipeline />,
    prompt: {
      text: "done",
      date: "Nov 19",
      reply: "Read both files back. The site and the game match.",
    },
  },
  {
    label: "Decision 5",
    title: "I rebuilt the drawer from the painting itself",
    body: "The open drawer was cut from a different repaint, so it never sat right in its slot. After two fitted versions still looked pasted on, the drawer was rebuilt from this painting's own closed front, pulled forward, with only the toys borrowed.",
    visual: shot(
      "drawer",
      "The drawer before and after being rebuilt from the painting's own front",
      1300,
      512,
    ),
    prompt: {
      text: "this drawer is worse",
      date: "Nov 19",
      reply:
        "Built the drawer from the painting's own front instead of warping the repaint.",
    },
  },
  {
    label: "Decision 6",
    title: "I turned the card into a profile",
    body: "I modelled the card on Tom Johnson's sidebar: one sentence about me, contact links, then my experience, work, writing and playground, with a CV to download.",
    visual: shot(
      "profile-card",
      "The profile card with experience, work, writing and playground",
      1200,
      1131,
    ),
    prompt: {
      text: "on my social profile card in the hero I want this the layout, and the structure,",
      date: "Nov 19",
    },
  },
  {
    label: "Decision 7",
    title: "I let the work open where you are",
    body: "Picking a project turns the card into that project, so the work is on screen at once. Expanding it goes full screen with a chapter index, these notes and a lightbox. The scene behind pauses while it's open.",
    visual: shot(
      "project-panel",
      "A case study open inside the profile card over the studio",
      1440,
      900,
    ),
    prompt: {
      text: "it appears the reason tomjohn uses a side panel is so that the panel can immediately show the project work, then be expanded if needed to the full screen. On full screen users fan hover the images on the interactive timelines and see prompts that made the artifcat pop up on the right and then expanded the image to see it in more detail. things autoplay if they are moving images.",
      date: "Nov 20",
    },
  },
  {
    label: "What I led",
    body: "Every change started from me looking at the running page and saying what felt wrong. Claude Code found the cause, built the fix and checked it at desktop and phone sizes. The judgement was mine each time.",
  },
];
