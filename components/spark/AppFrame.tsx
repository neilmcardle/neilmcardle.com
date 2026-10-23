"use client";

export function AppFrame({
  src,
  title,
  note,
  height = 560,
}: {
  src: string;
  title: string;
  note?: string;
  height?: number;
}) {
  return (
    <section className="spark-sandbox spark-appframe my-10">
      <div className="mb-2.5 flex items-center gap-3">
        <span className="spark-eyebrow shrink-0 text-[var(--spark-phosphor)]">
          The real thing
        </span>
        <span aria-hidden className="h-px flex-1 bg-[var(--spark-rule)]" />
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="spark-quiet min-h-[32px] text-[12px]"
        >
          Open in a tab
        </a>
      </div>

      {note && (
        <p className="mb-3 border-l-2 border-[var(--spark-phosphor)] bg-[var(--spark-phosphor-tint)] px-4 py-3 text-[14.5px] leading-[1.6] text-[var(--spark-text)]">
          {note}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-[var(--spark-rule)] bg-[var(--spark-ink)]">
        <div className="flex items-center justify-between border-b border-[var(--spark-rule)] px-3 py-1.5">
          <span className="spark-eyebrow text-[var(--spark-faint)]">
            {title}
          </span>
          <span className="spark-eyebrow text-[var(--spark-faint)]">
            running
          </span>
        </div>
        <iframe
          title={title}
          src={src}
          className="w-full border-0 bg-white"
          style={{ height }}
        />
      </div>
    </section>
  );
}
