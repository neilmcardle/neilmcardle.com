import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";

const here = dirname(fileURLToPath(import.meta.url));

const manuscript = [
  "The Lighthouse Keeper",
  "",
  "Chapter 1: The Storm",
  "",
  "The wind came off the sea in long grey ropes.",
  "",
  "Agnes lit the lamp before the light had quite gone.",
  "",
  "Chapter 2: The Calm",
  "",
  "By morning the water lay flat as slate.",
  "",
].join("\n");

const doc = new Document({
  creator: "makeEbook tests",
  title: "Harbour Lights",
  sections: [
    {
      children: [
        new Paragraph({
          text: "Chapter One: Harbour",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun("Gulls argued over the fishing boats at dawn."),
          ],
        }),
        new Paragraph({
          text: "Chapter Two: Tide",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun("The tide turned just after the bells rang noon."),
          ],
        }),
      ],
    },
  ],
});

await writeFile(join(here, "manuscript.txt"), manuscript, "utf8");
await writeFile(join(here, "manuscript.docx"), await Packer.toBuffer(doc));
