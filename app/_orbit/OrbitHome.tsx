import {
  AllWork,
  Covers,
  Demo,
  ExplorationCard,
  Paintings,
  Showcase,
} from "@/app/_home/Home";
import { WORKS, type Work } from "@/app/_home/data";
import { SHOWCASE } from "@/app/_home/showcase";
import Orbit, { type OrbitItem } from "./Orbit";
import ToolPanel from "./ToolPanel";

const work = (title: string) =>
  WORKS.find((item) => item.title === title) as Work;

const COVER_SRCS = [
  "/home/covers/pastor-of-kilsyth.jpg",
  "/home/covers/brownlow-north.jpg",
  "/home/covers/childs-story-bible.jpg",
];

const WHAT = {
  vectorPaint:
    "A drawing app for children, and a way for parents to keep the good ones.",
  iconAnimator: "Animate SVG icons with CSS keyframes.",
  promptr: "A place to refine your prompts.",
};

const ITEMS: OrbitItem[] = [
  {
    id: "makeebook",
    caption: SHOWCASE.makeebook.what,
    name: "makeebook",
    group: "Products",
    mark: "makeebook",
    preview: { kind: "screen", src: "/home/orbit/makeebook.jpg" },
  },
  {
    id: "speakui",
    caption: "SpeakUI Demo on Dive Radio",
    name: "SpeakUI",
    group: "Demo",
    mark: "speakui",
    preview: {
      kind: "image",
      src: "/home/dive-radio-jit.jpg",
      width: 1280,
      height: 720,
    },
  },
  {
    id: "coverly",
    caption: SHOWCASE.Coverly.what,
    name: "Coverly",
    group: "Products",
    mark: "coverly",
    preview: { kind: "screen", src: "/home/orbit/coverly.jpg" },
  },
  {
    id: "spark",
    caption: SHOWCASE.Spark.what,
    name: "Spark",
    group: "Products",
    mark: "spark",
    preview: { kind: "screen", src: "/home/orbit/spark-screen.jpg" },
  },
  {
    id: "doodlewire",
    caption: SHOWCASE.DoodleWire.what,
    name: "DoodleWire",
    group: "Products",
    mark: "doodlewire",
    preview: {
      kind: "phones",
      srcs: ["/doodlewire/appstore/2.jpg", "/doodlewire/appstore/1.jpg"],
    },
  },
  {
    id: "podium",
    caption: SHOWCASE.Podium.what,
    name: "Podium",
    group: "Products",
    mark: "podium",
    preview: {
      kind: "image",
      src: "/home/podium/keyart.jpg",
      width: 1600,
      height: 1280,
      logo: "/home/podium/logo.png",
    },
  },
  {
    id: "book-covers",
    caption: "Covers for new editions of three classic books.",
    name: "Book covers",
    group: "Client work",
    mark: "book",
    preview: { kind: "covers", srcs: COVER_SRCS },
  },
  {
    id: "paintings",
    caption: "Oil paintings, 2015 and 2016.",
    name: "Paintings",
    group: "Paintings",
    mark: "frame",
    preview: {
      kind: "paintings",
      srcs: ["/paintings/bonsai-tree.jpg", "/paintings/hourglass.jpg"],
    },
  },
  {
    id: "vector-paint",
    caption: WHAT.vectorPaint,
    name: "Vector Paint",
    group: "Tools",
    mark: "vectorPaint",
    preview: { kind: "screen", src: "/home/orbit/vector-paint.jpg" },
  },
  {
    id: "icon-animator",
    caption: WHAT.iconAnimator,
    name: "Icon Animator",
    group: "Tools",
    mark: "iconAnimator",
    preview: { kind: "screen", src: "/home/orbit/icon-animator.jpg" },
  },
  {
    id: "promptr",
    caption: WHAT.promptr,
    name: "Promptr",
    group: "Tools",
    mark: "promptr",
    preview: { kind: "screen", src: "/home/orbit/promptr.jpg" },
  },
  {
    id: "n-particles",
    caption: "The N mark, drawn in particles that scatter and reform.",
    name: "N particles",
    group: "Explorations",
    mark: "n",
    preview: { kind: "screen", src: "/home/orbit/n-particles-formed.jpg" },
  },
];

const PANELS = {
  makeebook: <Showcase work={work("makeebook")} />,
  coverly: <Showcase work={work("Coverly")} />,
  doodlewire: <Showcase work={work("DoodleWire")} />,
  spark: <Showcase work={work("Spark")} />,
  podium: <Showcase work={work("Podium")} />,
  speakui: <Demo />,
  "vector-paint": (
    <ToolPanel
      work={work("Vector Paint")}
      what={WHAT.vectorPaint}
      image="/home/orbit/vector-paint.jpg"
    />
  ),
  "icon-animator": (
    <ToolPanel
      work={work("Icon Animator")}
      what={WHAT.iconAnimator}
      image="/home/orbit/icon-animator.jpg"
    />
  ),
  promptr: (
    <ToolPanel
      work={work("Promptr")}
      what={WHAT.promptr}
      image="/home/orbit/promptr.jpg"
    />
  ),
  "n-particles": <ExplorationCard work={work("N particles")} />,
  "book-covers": <Covers />,
  paintings: <Paintings />,
};

export default function OrbitHome() {
  return <Orbit items={ITEMS} panels={PANELS} all={<AllWork />} />;
}
