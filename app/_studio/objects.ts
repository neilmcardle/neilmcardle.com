export type StudioObject = {
  id: string;
  name: string;
  line: string;
  work: {
    title: string;
    summary: string;
    href: string;
    links?: { label: string; href: string }[];
  } | null;
};

export const SITE = "";

export const STUDIO_OBJECTS: StudioObject[] = [
  {
    id: "press",
    name: "Proof press",
    line: "Every cover gets proofed on this before it's signed off. Coverly is where I look at three thousand others first.",
    work: {
      title: "Coverly",
      summary:
        "Over 3,000 thriller covers, tagged so designers can find their comps.",
      href: `${SITE}/work/coverly`,
    },
  },
  {
    id: "print-makeebook",
    name: "makeEbook print",
    line: "Every mark gets printed and pegged up for a day before I trust it.",
    work: {
      title: "makeEbook",
      summary:
        "Write a book and get an ebook that opens properly on any reader.",
      href: `${SITE}/work/makeebook`,
    },
  },
  {
    id: "print-coverly",
    name: "Coverly print",
    line: "Four petals, one booth. It had to read at the size of a thumbnail.",
    work: {
      title: "Coverly",
      summary:
        "Over 3,000 thriller covers, tagged so designers can find their comps.",
      href: `${SITE}/work/coverly`,
    },
  },
  {
    id: "print-doodlewire",
    name: "DoodleWire print",
    line: "A screen and a scribble. That's the whole app, really.",
    work: {
      title: "DoodleWire",
      summary: "Turn rough sketches into wireframes on your phone.",
      href: `${SITE}/work/doodlewire`,
    },
  },
  {
    id: "laptop",
    name: "Laptop",
    line: "This is where the day job lives. The Avis checkout, five steps down to three, and my work for Mobbin.",
    work: {
      title: "Avis and Mobbin",
      summary:
        "The Avis checkout, from five steps to three, live on avis.com. And contract design work for Mobbin.",
      href: `${SITE}/work/avis`,
    },
  },
  {
    id: "drawer",
    name: "Drawer",
    line: "Small things I made to see what would happen. Most of them still work.",
    work: {
      title: "The playground",
      summary: "Small experiments and explorations.",
      href: `${SITE}/playground`,
    },
  },
  {
    id: "phone",
    name: "Phone",
    line: "I sketch apps on this before they deserve a proper screen.",
    work: {
      title: "DoodleWire",
      summary: "Turn rough sketches into wireframes on your phone.",
      href: `${SITE}/work/doodlewire`,
    },
  },
  {
    id: "post",
    name: "Letters",
    line: "Letters I haven't opened yet. Yours could be one of them.",
    work: {
      title: "Tell me more.",
      summary: "Write to me about work, ideas or anything you've seen here.",
      href: `${SITE}/#contact`,
    },
  },
  {
    id: "coat",
    name: "Grey coat",
    line: "I'll put my coat on and go explore outside once I've built the village.",
    work: null,
  },
  {
    id: "easel",
    name: "Easel",
    line: "One of mine. I trained as a painter before I ever designed a screen.",
    work: null,
  },
];
