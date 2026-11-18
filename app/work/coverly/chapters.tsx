import Image from "next/image";
import type { Chapter } from "../Story";
import styles from "../story.module.css";

export const COVERLY: Chapter[] = [
  {
    label: "The problem",
    body: "Before a cover meeting, designers gather comparison designs in the same genre. They gather bookshop photos and saved screenshots, which can be organised manually but not searched by details like ‘a dark domestic thriller with a figure and no face’.",
  },
  {
    label: "Decision 1",
    title: "I tagged covers the way briefs read",
    body: "I built the tag set from how briefs are written: sub-genre, art style, typography, people, layout, publisher, colour and tone. The filters combine, so domestic and red narrows 3,079 covers to 267.",
    instead:
      "searching by title and author, which only finds covers you already know about.",
    visual: (
      <Image
        data-zoom=""
        className={styles.film}
        src="/work/coverly/browse-filtered.jpg"
        alt="Coverly's browse grid filtered to domestic thrillers with red covers, narrowing 3,079 covers to 267"
        width={1800}
        height={1125}
        sizes="(max-width: 1120px) 100vw, 1072px"
      />
    ),
  },
  {
    label: "Decision 2",
    title: "I kept the search open",
    body: "I made a cover open in place, with its tags, its five main colours and similar covers, so one good comp leads to the next. I added boards so a designer can take a set to the meeting.",
    instead:
      "a separate page for each cover, which breaks the search every time you look closer.",
    visual: (
      <Image
        data-zoom=""
        className={styles.film}
        src="/work/coverly/cover-detail.jpg"
        alt="A cover opened in Coverly, showing its sub-genre, art style, typography, people, layout and tone tags, its five colours and a row of similar covers"
        width={1800}
        height={1006}
        sizes="(max-width: 1120px) 100vw, 1072px"
      />
    ),
  },
  {
    label: "Decision 3",
    title: "I kept the brand out of the way",
    body: "I took the idea from print, where proofs are judged in a grey viewing booth so colour reads true. I set every cover on neutral grey, with black type and one red action per view, so the covers carry all the colour.",
    instead:
      "a colourful or dark interface, which competes with the covers and shifts how their colours read.",
  },
  {
    label: "What I led",
    body: "I designed and built Coverly using Figma and Claude Code. I tagged every cover myself and manually reviewed the edge cases.",
  },
];
