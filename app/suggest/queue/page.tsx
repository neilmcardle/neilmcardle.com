import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import Shell from "../../_signature/Shell";
import Header from "../../_signature/Header";
import shell from "../../_signature/signature.module.css";
import { db, suggestions, type Suggestion } from "@/lib/db";
import { MONTHLY_CAP_PENCE, monthSpend, pence } from "@/lib/suggest/budget";
import { isOwner } from "@/lib/suggest/owner";
import { build, lock, markLive, reject, stop, unlock } from "./actions";
import styles from "../suggest.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Suggestions · Neil McArdle",
  robots: { index: false, follow: false },
};

const GROUPS: { title: string; statuses: Suggestion["status"][] }[] = [
  { title: "New", statuses: ["new"] },
  { title: "Building", statuses: ["building"] },
  { title: "Ready to check", statuses: ["ready"] },
  { title: "Failed", statuses: ["failed"] },
  { title: "Live", statuses: ["live"] },
  { title: "Rejected", statuses: ["rejected"] },
];

const money = (value: number) => `${value.toFixed(1)}p`;

function Unlock({ error }: { error: "" | "1" | "wait" }) {
  return (
    <form action={unlock} className={styles.unlock}>
      <div className={styles.field}>
        <label htmlFor="sq-password">Password</label>
        <input
          id="sq-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "sq-error" : undefined}
        />
        {error ? (
          <p id="sq-error" className={styles.fieldError}>
            {error === "wait"
              ? "Too many tries. Wait 15 minutes, then try again."
              : "That password didn’t match."}
          </p>
        ) : null}
      </div>
      <button className={styles.cta} type="submit">
        Open the queue
      </button>
    </form>
  );
}

function Actions({ item, canBuild }: { item: Suggestion; canBuild: boolean }) {
  const id = item.id;
  return (
    <div className={styles.actions}>
      {item.status === "new" || item.status === "failed" ? (
        <form action={build.bind(null, id)}>
          <button className={styles.button} type="submit" disabled={!canBuild}>
            {item.status === "failed" ? "Build again" : "Build"}
          </button>
        </form>
      ) : null}
      {item.status === "ready" ? (
        <>
          {item.prUrl ? (
            <a
              className={`${styles.ghost} ${styles.ghostLink}`}
              href={item.prUrl}
            >
              Pull request
            </a>
          ) : null}
          <form action={markLive.bind(null, id)}>
            <button className={styles.button} type="submit">
              Merged, show it
            </button>
          </form>
        </>
      ) : null}
      {item.status === "building" ? (
        <form action={stop.bind(null, id)}>
          <button className={styles.ghost} type="submit">
            Mark as stopped
          </button>
        </form>
      ) : null}
      {item.status === "new" ||
      item.status === "failed" ||
      item.status === "ready" ? (
        <form action={reject.bind(null, id)}>
          <button className={styles.ghost} type="submit">
            Reject
          </button>
        </form>
      ) : null}
    </div>
  );
}

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; cap?: string }>;
}) {
  const params = await searchParams;
  const owner = await isOwner();

  if (!owner) {
    return (
      <Shell>
        <Header contact="/#contact" />
        <main className={`${shell.wrap} ${styles.queue}`}>
          <div className={styles.queueHead}>
            <h1 className={styles.queueTitle}>Suggestions</h1>
          </div>
          <Unlock
            error={
              params.error === "1" || params.error === "wait"
                ? params.error
                : ""
            }
          />
        </main>
      </Shell>
    );
  }

  const rows = await db
    .select()
    .from(suggestions)
    .orderBy(desc(suggestions.createdAt))
    .limit(300);
  const budget = await monthSpend();

  return (
    <Shell>
      <Header contact="/#contact" />
      <main className={`${shell.wrap} ${styles.queue}`}>
        <div className={styles.queueHead}>
          <h1 className={styles.queueTitle}>Suggestions</h1>
          <p className={styles.spend}>
            {money(budget.spentPence)} spent
            {budget.reservedPence
              ? `, ${money(budget.reservedPence)} held for running builds`
              : ""}{" "}
            of {MONTHLY_CAP_PENCE}p this month
          </p>
          <form action={lock}>
            <button className={styles.ghost} type="submit">
              Lock
            </button>
          </form>
        </div>

        {params.cap === "1" || !budget.canBuild ? (
          <p className={styles.notice} role="status">
            This month&rsquo;s 50p is used up. Builds open again on the 1st.
          </p>
        ) : null}

        {GROUPS.map((group) => {
          const items = rows.filter((row) =>
            group.statuses.includes(row.status),
          );
          if (!items.length) return null;
          return (
            <section key={group.title} className={styles.group}>
              <h2 className={styles.groupTitle}>
                {group.title} ({items.length})
              </h2>
              <ul className={styles.items}>
                {items.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <div>
                      <p className={styles.request}>{item.request}</p>
                      <p className={styles.itemNote}>
                        {item.createdAt.toLocaleDateString("en-GB")}
                        {item.costMicroUsd
                          ? ` · ${money(pence(item.costMicroUsd))}`
                          : ""}
                        {item.note ? ` · ${item.note}` : ""}
                      </p>
                    </div>
                    <Actions item={item} canBuild={budget.canBuild} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {rows.length ? null : <p className={styles.empty}>Nothing yet.</p>}
      </main>
    </Shell>
  );
}
