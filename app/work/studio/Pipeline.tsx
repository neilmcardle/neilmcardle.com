import styles from "./outlines.module.css";

const STEPS = [
  {
    name: "Trace",
    line: "Masks traced into 236 points. Faithful to pixels, not to objects.",
  },
  {
    name: "Draw",
    line: "I drag, add and remove nodes in our own editor, by eye.",
  },
  {
    name: "Save",
    line: "One file for the site, one for the game, each in its own format.",
  },
  {
    name: "Read",
    line: "Hover, clicks, depth and Claude all use the shapes I drew.",
  },
];

export default function Pipeline() {
  return (
    <ol className={styles.pipeline}>
      {STEPS.map((step, index) => (
        <li key={step.name}>
          <span className={styles.step}>{index + 1}</span>
          <strong>{step.name}</strong>
          <span>{step.line}</span>
        </li>
      ))}
    </ol>
  );
}
