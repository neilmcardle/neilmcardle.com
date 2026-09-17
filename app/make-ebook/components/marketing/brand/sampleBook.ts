export type Chapter = {
  n: number;
  word: string;
  title: string;
  status: "complete" | "draft";
  body: string[];
};

export const BOOK = {
  title: "The Rainy City",
  author: "Elena Marsh",
  chapterCount: 44,
  wordCount: "128,430",
};

export const CHAPTERS: Chapter[] = [
  {
    n: 36,
    word: "Thirty-Six",
    title: "The letter, again",
    status: "complete",
    body: [
      "The letter had been in her coat pocket for eleven days, folded into quarters and then folded again, until the creases were softer than the paper. She did not need to read it. She knew the last line the way she knew her own address.",
      "Decide by the end of the month, it said. Either the book is finished, or it is not, and you will have to live with whichever one you choose.",
    ],
  },
  {
    n: 37,
    word: "Thirty-Seven",
    title: "Pages, stacked",
    status: "complete",
    body: [
      "By March the manuscript had outgrown the desk. It lived in three stacks on the floor of the spare room, each one held down by a stone she had carried back from the beach, as if the pages might leave without her.",
      "She walked between the stacks in the evenings with a pencil behind her ear and did not write anything at all.",
    ],
  },
  {
    n: 38,
    word: "Thirty-Eight",
    title: "Small grammars",
    status: "draft",
    body: [
      "Her mother had kept a list of words she refused to use. Nice. Lovely. Very. The list was pinned inside the kitchen cupboard, next to the tea, where it could be consulted twice a day.",
    ],
  },
  {
    n: 39,
    word: "Thirty-Nine",
    title: "Pewter",
    status: "draft",
    body: [
      "From the train the estuary was the colour of pewter, and the old iron columns of the pier went down into it without a sound. She pressed her forehead to the glass and counted them, the way she had as a child.",
      "Nine columns. There had always been nine.",
    ],
  },
  {
    n: 40,
    word: "Forty",
    title: "The Rainy City",
    status: "draft",
    body: [
      "Rain had been falling on the city since before she woke, the soft kind that does not so much fall as arrive, settling on the windows and the wet slate roofs until every surface carried a little of the sky.",
      "Elena walked the length of the pier with her collar up and the manuscript held flat against her chest, its pages still warm from the bag. The water below was the colour of pewter, and the old iron columns went down into it without a sound.",
      "At the end of the pier she stopped and let the rain find her face. Somewhere behind her a gull cried once and gave up. She had come here to decide something, and the city, patient as ever, was waiting for her to say it aloud.",
      "She took the letter from her pocket, unfolded it one last time, and let the wind have it.",
    ],
  },
  {
    n: 41,
    word: "Forty-One",
    title: "Twelve hundred words",
    status: "draft",
    body: [
      "The next morning she wrote twelve hundred words before breakfast, and none of them were about the rain.",
    ],
  },
];

export const ACTIVE_CHAPTER = 4;

export function countWords(text: string) {
  const words = text.trim().match(/\S+/g);
  return words ? words.length : 0;
}
