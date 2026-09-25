import styles from "./home.module.css";

export default function TileControls({
  label,
  playing,
  onPlay,
  sound,
}: {
  label: string;
  playing: boolean;
  onPlay: () => void;
  sound?: { on: boolean; onToggle: () => void };
}) {
  return (
    <div
      className={styles.mbControls}
      data-pinned={!playing || sound?.on ? "true" : undefined}
    >
      {sound ? (
        <button
          type="button"
          className={styles.mbControl}
          onClick={sound.onToggle}
          aria-pressed={sound.on}
          aria-label={`${label} sound`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 6h2.5L8 3v10L4.5 10H2z" fill="currentColor" />
            {sound.on ? (
              <path
                d="M10.5 5.5a3.5 3.5 0 010 5M12.5 3.5a6.5 6.5 0 010 9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M10.5 6l3 4M13.5 6l-3 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      ) : null}
      <button
        type="button"
        className={styles.mbControl}
        onClick={onPlay}
        aria-label={playing ? `Pause ${label}` : `Play ${label}`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          {playing ? (
            <path
              d="M3.5 2.5h2.25v9H3.5zM8.25 2.5h2.25v9H8.25z"
              fill="currentColor"
            />
          ) : (
            <path
              d="M4 2.4v9.2a.5.5 0 00.76.43l7.2-4.6a.5.5 0 000-.86l-7.2-4.6A.5.5 0 004 2.4z"
              fill="currentColor"
            />
          )}
        </svg>
      </button>
    </div>
  );
}
