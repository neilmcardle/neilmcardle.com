export type Role = {
  id: string;
  company: string;
  title: string;
  when: string;
  href?: string;
  note: string;
};

export const EXPERIENCE: Role[] = [
  {
    id: "mobbin",
    company: "Mobbin",
    title: "App capture specialist",
    when: "’26 – now",
    href: "https://mobbin.com",
    note: "I capture and document the flows and patterns of leading iOS and Android apps for Mobbin’s library.",
  },
  {
    id: "avis",
    company: "Avis",
    title: "Senior product designer",
    when: "’21 – now",
    href: "/work/avis",
    note: "I took the Avis checkout from five steps to three, now live on avis.com, working with a product manager, a data analyst and engineers. I also led an audit of a 250-component design system shared by two brands across iOS, Android and web.",
  },
  {
    id: "banner",
    company: "The Banner of Truth",
    title: "Digital product specialist",
    when: "’19 – ’21",
    note: "I worked on a small publishing team, building ebooks in HTML, CSS and JavaScript and designing book covers.",
  },
  {
    id: "neil",
    company: "neilmcardle.com",
    title: "Owner",
    when: "’14 – now",
    note: "My studio, where I design and build products of my own, from the first sketch to the code that ships.",
  },
];

export const PROJECTS = [
  { title: "Makeebook", href: "https://makeebook.ink", show: "makeebook.ink" },
  {
    title: "Coverly",
    href: "https://neilmcardle.com/coverly",
    show: "neilmcardle.com/coverly",
  },
  {
    title: "DoodleWire",
    href: "https://apps.apple.com/us/app/doodlewire/id6771274835",
    show: "App Store",
  },
  {
    title: "Performance UI",
    href: "https://github.com/neilmcardle/skills",
    show: "github.com/neilmcardle/skills",
  },
];

export const EDUCATION = [
  {
    school: "Loughborough University",
    course: "BSc Social Psychology",
    when: "’10 – ’13",
  },
  {
    school: "Loughborough University",
    course: "BA Fine Art Painting",
    when: "’04 – ’07",
  },
];

export const CV_PDF = "/cv/neil-mcardle-cv.pdf";
