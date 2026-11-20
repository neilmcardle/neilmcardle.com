import { AVIS } from "./avis/chapters";
import { CASES } from "./cases";
import { COVERLY } from "./coverly/chapters";
import { DOODLEWIRE } from "./doodlewire/chapters";
import { MAKEEBOOK } from "./makeebook/chapters";
import { PERFORMANCE_UI } from "./performance-ui/chapters";
import { STUDIO } from "./studio/chapters";
import type { Chapter } from "./Story";

export type Project = {
  id: string;
  title: string;
  href: string;
  overview: string;
  when: string;
  chapters: Chapter[];
};

const make = (
  id: string,
  title: string,
  chapters: Chapter[],
): [string, Project] => [
  id,
  {
    id,
    title,
    href: `/work/${id}`,
    overview: CASES[id].overview,
    when: CASES[id].when,
    chapters,
  },
];

export const PROJECTS: Record<string, Project> = Object.fromEntries([
  make("avis", "Avis checkout", AVIS),
  make("makeebook", "Makeebook", MAKEEBOOK),
  make("coverly", "Coverly", COVERLY),
  make("performance-ui", "Performance UI", PERFORMANCE_UI),
  make("doodlewire", "DoodleWire", DOODLEWIRE),
  make("studio", "The studio", STUDIO),
]);
