import Gallery from "@/app/_home/Gallery";

const SHOTS = [
  "Share doodle love",
  "Create wireframes",
  "Edit doodles",
  "Add multiple pages",
  "Align doodles to the layout",
  "Snap doodles to the grid",
  "Correct your doodles",
];

const ITEMS = SHOTS.map((caption, i) => ({
  src: `/doodlewire/appstore/${i + 1}.jpg`,
  alt: `DoodleWire screenshot: ${caption}`,
  width: 828,
  height: 1792,
}));

export default function DoodleWireShots() {
  return (
    <Gallery
      items={ITEMS}
      preview={2}
      icon="phone"
      label="View screenshots"
      name="DoodleWire screenshots"
    />
  );
}
