// Painting data for the /paintings page and the homepage band.
//
// Drop images into /public/paintings/<slug>.jpg (or .png) and reference
// them by the same path here. Use the largest source you have. Next/Image
// resizes for the layout. The two sold paintings are featured up top in
// the order they appear in this array. New work goes at the end of the
// list; mark `featured: true` to surface it on the homepage band.

export type PaintingStatus = 'sold' | 'available' | 'commission';

export interface Painting {
  slug: string;
  title: string;
  /** Year the painting was made. */
  year: number;
  /** Year the painting was acquired by a collector. Only set when status === 'sold'. */
  acquiredYear?: number;
  medium: string;
  /** Free-text size, e.g. "60 × 80 cm" */
  dimensions: string;
  status: PaintingStatus;
  /** Free-text collector line, e.g. "Private collector, Berlin". Optional. */
  collector?: string;
  /**
   * Description as an array of paragraphs. Prefix a paragraph with "> "
   * to render it as a blockquote (useful for citing source text).
   */
  description: string[];
  /** Path under /public, e.g. "/paintings/your-slug.jpg". Portrait or landscape both fine. */
  image: string;
  /** Image aspect to reserve the right space before load. Defaults to portrait 4/5. */
  aspect?: '4/5' | '1/1' | '5/4' | '3/4' | '4/3';
  /** Shown in the homepage band. Keep to 2 to start. */
  featured?: boolean;
}

export const PAINTINGS: Painting[] = [
  {
    slug: 'from-the-tree',
    title: 'From the Tree',
    year: 2016,
    acquiredYear: 2026,
    medium: 'Oil on canvas',
    dimensions: '23 × 30 cm',
    status: 'sold',
    collector: 'Private collector',
    description: [
      'From the Tree is an oil painting inspired by the New Testament text Acts 13:29. There Luke describes what happened to Jesus immediately after His death on the cross:',
      '> When they had carried out all that was written concerning Him, they took Him down from the cross and laid Him in a tomb.',
      'But, God raised Him from the dead.',
    ],
    image: '/paintings/bonsai-tree.jpg',
    aspect: '4/5',
    featured: true,
  },
  {
    slug: 'the-hour-at-hand',
    title: 'The Hour at Hand',
    year: 2015,
    acquiredYear: 2026,
    medium: 'Oil on canvas',
    dimensions: '23 × 30 cm',
    status: 'sold',
    collector: 'Private collector',
    description: [
      'The Hour at Hand is an oil painting based on the New Testament text Matthew 26:45. There Matthew describes how, after praying, Jesus approached the sleeping disciples in the Garden of Gethsemane:',
      '> Then He came to the disciples and said to them, "Are you still sleeping and resting? Behold, the hour is at hand and the Son of Man is being betrayed into the hands of sinners."',
      "The hour of Jesus' betrayal had come.",
    ],
    image: '/paintings/hourglass.jpg',
    aspect: '4/5',
    featured: true,
  },
];

export const SAATCHI_URL = 'https://www.saatchiart.com/en-gb/neilmcardle';
