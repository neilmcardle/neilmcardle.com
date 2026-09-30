export type Cover = {
  title: string;
  author: string;
  year: number;
  original: number;
  image: string;
  width: number;
  height: number;
  illustrated?: boolean;
};

export const COVERS: Cover[] = [
  {
    title: "The Pastor of Kilsyth",
    author: "Islay Burns",
    year: 2019,
    original: 1860,
    image: "/home/covers/pastor-of-kilsyth.jpg",
    width: 1004,
    height: 1500,
  },
  {
    title: "Brownlow North",
    author: "K. Moody Stuart",
    year: 2020,
    original: 1878,
    image: "/home/covers/brownlow-north.jpg",
    width: 1004,
    height: 1500,
  },
  {
    title: "The Child’s Story Bible",
    author: "Catherine F. Vos",
    year: 2021,
    original: 1935,
    image: "/home/covers/childs-story-bible.jpg",
    width: 798,
    height: 1200,
    illustrated: true,
  },
];
