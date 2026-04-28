import VectorDrawingPad from "./components/vector-drawing-pad";
import styles from "./vector-paint.module.css";

export default function VectorPaintPage() {
  return (
    <div className={styles.root}>
      <VectorDrawingPad />
    </div>
  );
}
