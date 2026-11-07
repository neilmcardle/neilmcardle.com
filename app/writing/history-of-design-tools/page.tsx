import type { Metadata } from "next";
import Article, { UNLISTED } from "../_article/Article";
import { share } from "../../shared-metadata";

const title = "A History of Design Tools, 1963–2026 · Neil McArdle";
const description =
  "Sixty years of design tools, from Sketchpad to the prompt, told by where the work lives.";

export const metadata: Metadata = {
  title,
  description,
  robots: UNLISTED,
  ...share({ title, description, path: "/writing/history-of-design-tools" }),
};

const at = (name: string, width: number, height: number) => [
  `/writing/history-of-design-tools/${name}.png`,
  { width, height },
];

const SIZES = Object.fromEntries([
  at("sketchpad-1963", 756, 548),
  at("macpaint-2", 450, 337),
  at("pagemaker-7", 325, 237),
  at("illustrator-10", 358, 278),
  at("photoshop-2023", 724, 407),
  at("fireworks-cs6", 429, 232),
  at("figma", 576, 312),
  at("freehand", 370, 270),
  at("dreamweaver-2020", 411, 243),
  at("adobe-xd", 2624, 1622),
]);

export default function Page() {
  return (
    <Article
      path="app/writing/history-of-design-tools/content.md"
      sizes={SIZES}
    />
  );
}
