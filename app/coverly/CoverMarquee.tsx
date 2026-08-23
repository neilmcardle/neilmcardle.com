import styles from "./coverly.module.css";

export type Cover = { src: string; title: string };

const COLS = 5;

const COL_STYLE = [
  { dir: "up", duration: 260, delay: -40 },
  { dir: "down", duration: 224, delay: -110 },
  { dir: "up", duration: 300, delay: -175 },
  { dir: "down", duration: 244, delay: -70 },
  { dir: "up", duration: 280, delay: -140 },
] as const;

export function CoverMarquee({ covers }: { covers: Cover[] }) {
  if (covers.length === 0) return null;

  const columns: Cover[][] = Array.from({ length: COLS }, () => []);
  covers.forEach((c, i) => columns[i % COLS].push(c));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`${styles.field} absolute left-1/2 top-1/2 flex gap-2`}>
        {columns.map((col, i) => {
          const { dir, duration, delay } = COL_STYLE[i % COL_STYLE.length];
          const loop = [...col, ...col, ...col];
          return (
            <div
              key={i}
              className={`${styles.col} ${dir === "up" ? styles.up : styles.down} flex w-[120px] flex-col`}
              style={{
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
              }}
            >
              {loop.map((c, j) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${i}-${j}`}
                  src={c.src}
                  alt={c.title}
                  loading="lazy"

                  className="mb-2 aspect-[2/3] w-full rounded-lg object-cover shadow-xl ring-1 ring-white/10"
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
