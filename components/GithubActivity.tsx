// Server component. Pulls the last year of GitHub contributions from a
// no-auth public proxy and renders them as a contribution heatmap in the
// site's soft-UI / gold palette. Fails closed: if the proxy is unreachable
// the section renders nothing rather than breaking the page.

const GITHUB_USER = "neilmcardle";

interface Day {
  date: string;
  count: number;
  level: number;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Gold ramp matching --gold / --gold-bright. Index 0 is the empty recessed
// cell; 1-4 climb from a muted gold to the bright highlight stop.
const LEVEL_COLORS = [
  "rgba(255,255,255,0.055)",
  "rgba(216,180,106,0.28)",
  "rgba(216,180,106,0.52)",
  "rgba(216,180,106,0.8)",
  "#f0d091",
];

const CELL = 11;
const GAP = 3;

async function getContributions(): Promise<Day[] | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`,
      { next: { revalidate: 21600 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { contributions?: Day[] };
    if (!data?.contributions?.length) return null;
    return data.contributions;
  } catch {
    return null;
  }
}

export default async function GithubActivity() {
  const days = await getContributions();
  if (!days) return null;

  const total = days.reduce((sum, d) => sum + d.count, 0);

  // Pad the first column with nulls so row 0 is always a Sunday.
  const firstWeekday = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const cells: (Day | null)[] = [...Array(firstWeekday).fill(null), ...days];
  const weeks: (Day | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  // One month label per column where that month first appears.
  let lastMonth = -1;
  const monthLabels = weeks.map((week) => {
    const first = week.find((d): d is Day => d !== null);
    if (!first) return "";
    const m = new Date(`${first.date}T00:00:00Z`).getUTCMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      return MONTHS[m];
    }
    return "";
  });

  const mono = { fontFamily: "var(--font-jetbrains-mono)" };

  return (
    <div className="soft-card rounded-[1.5rem] p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <span
          className="text-tan"
          style={{ ...mono, fontSize: "0.75rem", letterSpacing: "0.13em", textTransform: "uppercase" }}
        >
          GitHub activity
        </span>
        <span className="text-tan" style={{ ...mono, fontSize: "0.75rem" }}>
          <span className="text-cream">{total.toLocaleString()}</span> contributions
        </span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-block min-w-full">
          {/* Month labels — fixed-width columns so they align with the grid;
              text overflows to the right over the empty sibling columns. */}
          <div className="flex" style={{ gap: GAP, marginBottom: 6 }}>
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="text-tan whitespace-nowrap"
                style={{ width: CELL, flex: "0 0 auto", ...mono, fontSize: "0.625rem", letterSpacing: "0.02em" }}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex" style={{ gap: GAP }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={
                      day
                        ? `${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`
                        : undefined
                    }
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 3,
                      backgroundColor: day ? LEVEL_COLORS[day.level] ?? LEVEL_COLORS[0] : "transparent",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 mt-5">
        <span className="text-tan" style={{ ...mono, fontSize: "0.625rem" }}>Less</span>
        {LEVEL_COLORS.map((c, i) => (
          <div key={i} style={{ width: CELL, height: CELL, borderRadius: 3, backgroundColor: c }} />
        ))}
        <span className="text-tan" style={{ ...mono, fontSize: "0.625rem" }}>More</span>
      </div>
    </div>
  );
}
