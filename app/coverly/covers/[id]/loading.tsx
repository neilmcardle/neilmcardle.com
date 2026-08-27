export default function CoverLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex gap-2">
        <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-8 w-28 animate-pulse rounded-full bg-muted" />
      </div>

      <div className="flex flex-col gap-8 md:flex-row md:gap-10">
        <div className="w-full max-w-xs shrink-0">
          <div className="aspect-[2/3] w-full animate-pulse rounded-2xl bg-muted" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="h-7 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="mt-1.5 h-4 w-2/5 animate-pulse rounded bg-muted" />

          <dl className="mt-5 grid max-w-lg grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="h-2.5 w-14 animate-pulse rounded bg-muted" />
                <div className="mt-1.5 h-4 w-20 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </dl>

          <div className="mt-5">
            <div className="mb-2 h-3 w-14 animate-pulse rounded bg-muted" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-9 animate-pulse rounded-md bg-muted"
                />
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <div className="h-9 w-36 animate-pulse rounded-[0.625rem] bg-muted" />
            <div className="h-9 w-20 animate-pulse rounded-[0.625rem] bg-muted" />
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="mb-4 h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[2/3] w-full animate-pulse rounded-lg bg-muted" />
              <div className="mt-1.5 h-3 w-4/5 animate-pulse rounded bg-muted" />
              <div className="mt-1 h-3 w-3/5 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
