import { continueRender, delayRender } from "remotion";

const HREF =
  "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=block";

const FAMILIES = [
  '600 80px "Geist"',
  '400 30px "Geist"',
  '500 60px "Geist Mono"',
];

if (
  typeof document !== "undefined" &&
  !document.getElementById("history-fonts")
) {
  const handle = delayRender("Loading history fonts");
  const link = document.createElement("link");
  link.id = "history-fonts";
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
