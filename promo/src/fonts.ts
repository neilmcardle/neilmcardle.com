import { continueRender, delayRender } from "remotion";

const HREF =
  "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400&family=Mona+Sans:wght@400;500&display=block";

const FAMILIES = [
  '700 80px "Archivo"',
  '400 40px "Inter"',
  '400 26px "JetBrains Mono"',
  '400 26px "Mona Sans"',
];

if (
  typeof document !== "undefined" &&
  !document.getElementById("promo-fonts")
) {
  const handle = delayRender("Loading fonts");
  const link = document.createElement("link");
  link.id = "promo-fonts";
  link.rel = "stylesheet";
  link.href = HREF;
  link.onload = () => {
    Promise.all(FAMILIES.map((font) => document.fonts.load(font)))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  };
  link.onerror = () => continueRender(handle);
  document.head.appendChild(link);
}
