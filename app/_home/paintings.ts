export type PaintingStatus = "sold" | "available" | "commission";

export interface Painting {
  slug: string;
  title: string;

  year: number;

  acquiredYear?: number;
  medium: string;
  reference: string;

  dimensions: string;
  status: PaintingStatus;

  collector?: string;

  description: string[];

  image: string;

  aspect?: "4/5" | "1/1" | "5/4" | "3/4" | "4/3";

  featured?: boolean;
}

export const PAINTINGS: Painting[] = [
  {
    slug: "from-the-tree",
    title: "From the Tree",
    year: 2016,
    acquiredYear: 2026,
    medium: "Oil on canvas",
    reference: "Acts 13:29",
    dimensions: "23 × 30 cm",
    status: "sold",
    collector: "Private collector",
    description: [
      "From the Tree is an oil painting inspired by the New Testament text Acts 13:29. There Luke describes what happened to Jesus immediately after His death on the cross:",
      "> When they had carried out all that was written concerning Him, they took Him down from the cross and laid Him in a tomb.",
      "But, God raised Him from the dead.",
    ],
    image: "/paintings/bonsai-tree.jpg",
    aspect: "4/5",
    featured: true,
  },
  {
    slug: "the-hour-at-hand",
    title: "The Hour at Hand",
    year: 2015,
    acquiredYear: 2026,
    medium: "Oil on canvas",
    reference: "Matthew 26:45",
    dimensions: "23 × 30 cm",
    status: "sold",
    collector: "Private collector",
    description: [
      "The Hour at Hand is an oil painting based on the New Testament text Matthew 26:45. There Matthew describes how, after praying, Jesus approached the sleeping disciples in the Garden of Gethsemane:",
      '> Then He came to the disciples and said to them, "Are you still sleeping and resting? Behold, the hour is at hand and the Son of Man is being betrayed into the hands of sinners."',
      "The hour of Jesus' betrayal had come.",
    ],
    image: "/paintings/hourglass.jpg",
    aspect: "4/5",
    featured: true,
  },
];

export const SAATCHI_URL = "https://www.saatchiart.com/en-gb/neilmcardle";
