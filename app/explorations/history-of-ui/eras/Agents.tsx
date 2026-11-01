"use client";

import { useEffect, useRef, useState } from "react";
import { Fit, useScale } from "../lib";
import s from "./agents.module.css";

type Page = "orders" | "order" | "return" | "done";
type Step = { label: string; state: "doing" | "done" | "waiting" };
type Phase = "idle" | "running" | "approval" | "finished" | "stopped";

const REASONS = [
  "Choose a reason",
  "Doesn't fit",
  "Changed my mind",
  "Arrived damaged",
];
const URL: Record<Page, string> = {
  orders: "northwind.shop/account/orders",
  order: "northwind.shop/account/orders/48213",
  return: "northwind.shop/returns/new?order=48213",
  done: "northwind.shop/returns/RT-48213",
};

class Stopped extends Error {}

type Shared = {
  page: Page;
  reason: number;
  dropdown: boolean;
  refund: "card" | "credit" | null;
  drop: "post" | "courier" | null;
  note: string;
  cursor: { x: number; y: number };
  pressing: boolean;
  focus: string | null;
};

const START: Shared = {
  page: "orders",
  reason: 0,
  dropdown: false,
  refund: null,
  drop: null,
  note: "",
  cursor: { x: 560, y: 380 },
  pressing: false,
  focus: null,
};

function Site({
  st,
  siteRef,
}: {
  st: Shared;
  siteRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className={s.browser}>
      <div className={s.chrome}>
        <span className={s.dots} aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className={s.url}>{URL[st.page]}</span>
      </div>
      <div ref={siteRef} className={s.site}>
        <div className={s.shopBar}>
          <b>Northwind</b>
          <span>Account</span>
        </div>
        {st.page === "orders" && (
          <div className={s.pageBody}>
            <h3>Your orders</h3>
            {[
              {
                id: "boots",
                name: "Leather boots",
                meta: "Size 9 · Delivered 25 October",
                price: "£89.00",
              },
              {
                id: "scarf",
                name: "Wool scarf",
                meta: "Delivered 12 October",
                price: "£24.00",
              },
              {
                id: "socks",
                name: "Running socks, 3 pack",
                meta: "Delivered 2 October",
                price: "£12.00",
              },
            ].map((o) => (
              <div key={o.id} className={s.orderRow}>
                <span className={s.thumb} data-kind={o.id} aria-hidden />
                <span className={s.orderText}>
                  <b>{o.name}</b>
                  <small>{o.meta}</small>
                </span>
                <span className={s.price}>{o.price}</span>
                <span
                  className={s.btn}
                  data-target={o.id === "boots" ? "view" : undefined}
                >
                  View order
                </span>
              </div>
            ))}
          </div>
        )}
        {st.page === "order" && (
          <div className={s.pageBody}>
            <h3>Order 48213</h3>
            <div className={s.orderRow}>
              <span className={s.thumb} data-kind="boots" aria-hidden />
              <span className={s.orderText}>
                <b>Leather boots</b>
                <small>Size 9 · Delivered 25 October · £89.00</small>
              </span>
            </div>
            <p className={s.fine}>
              You can return unworn items within 30 days of delivery.
            </p>
            <div className={s.actions}>
              <span className={s.btn}>Track package</span>
              <span className={s.btn} data-primary data-target="return">
                Return item
              </span>
            </div>
          </div>
        )}
        {st.page === "return" && (
          <div className={s.pageBody}>
            <h3>Return Leather boots</h3>
            <div className={s.form}>
              <label>Reason</label>
              <div
                className={s.select}
                data-target="reason"
                data-focus={st.focus === "reason" || undefined}
              >
                {REASONS[st.reason]}
                <span aria-hidden>▾</span>
                {st.dropdown && (
                  <div className={s.options}>
                    {REASONS.slice(1).map((r, i) => (
                      <div
                        key={r}
                        data-target={`reason-${i + 1}`}
                        data-on={st.reason === i + 1 || undefined}
                      >
                        {r}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <label>Refund to</label>
              <div className={s.radios}>
                <span
                  data-target="card"
                  data-on={st.refund === "card" || undefined}
                >
                  Original payment method
                </span>
                <span data-on={st.refund === "credit" || undefined}>
                  Store credit
                </span>
              </div>
              <label>Send it back</label>
              <div className={s.radios}>
                <span
                  data-target="post"
                  data-on={st.drop === "post" || undefined}
                >
                  Post office, free
                </span>
                <span data-on={st.drop === "courier" || undefined}>
                  Courier pickup, £3
                </span>
              </div>
              <label>Anything else?</label>
              <div
                className={s.textarea}
                data-target="note"
                data-focus={st.focus === "note" || undefined}
              >
                {st.note}
                {st.focus === "note" && (
                  <span className={s.caret} aria-hidden />
                )}
              </div>
            </div>
            <div className={s.actions}>
              <span className={s.btn} data-primary data-target="submit">
                Submit return
              </span>
            </div>
          </div>
        )}
        {st.page === "done" && (
          <div className={s.pageBody}>
            <h3>Return started</h3>
            <p className={s.fine}>
              Reference RT-48213. Take the parcel and this code to any post
              office by 15 November.
            </p>
            <div className={s.qr} aria-hidden />
          </div>
        )}
      </div>
      <div
        className={s.agentCursor}
        style={{ left: st.cursor.x, top: st.cursor.y }}
        data-press={st.pressing || undefined}
        aria-hidden
      >
        <svg viewBox="0 0 20 20">
          <path d="M3 2l13 7-6 1.5L7.5 17z" />
        </svg>
        <span>Agent</span>
      </div>
    </div>
  );
}

function ScaleProbe({ onScale }: { onScale: (n: number) => void }) {
  const scale = useScale();
  useEffect(() => {
    onScale(scale);
  }, [scale, onScale]);
  return null;
}

export default function Agents() {
  const [st, setSt] = useState<Shared>(START);
  const [phase, setPhase] = useState<Phase>("idle");
  const [steps, setSteps] = useState<Step[]>([]);
  const siteRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const run = useRef(0);
  const approve = useRef<(() => void) | null>(null);
  const live = useRef<Shared>(START);

  const set = (patch: Partial<Shared>) => {
    live.current = { ...live.current, ...patch };
    setSt(live.current);
  };

  useEffect(
    () => () => {
      run.current++;
    },
    [],
  );

  const start = async () => {
    const id = ++run.current;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const k = reduce ? 0.2 : 1;
    const wait = (ms: number) =>
      new Promise<void>((res, rej) =>
        window.setTimeout(
          () => (run.current === id ? res() : rej(new Stopped())),
          ms * k,
        ),
      );
    const say = (label: string) =>
      setSteps((ss) => [
        ...ss.map((x) => ({ ...x, state: "done" as const })),
        { label, state: "doing" },
      ]);
    const point = async (target: string) => {
      await wait(60);
      const site = siteRef.current;
      const el = site?.querySelector<HTMLElement>(`[data-target="${target}"]`);
      if (!site || !el) return;
      const sr = site.parentElement!.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const sc = scaleRef.current || 1;
      set({
        cursor: {
          x: (er.left - sr.left + er.width * 0.55) / sc,
          y: (er.top - sr.top + er.height * 0.6) / sc,
        },
      });
      await wait(650);
    };
    const click = async () => {
      set({ pressing: true });
      await wait(160);
      set({ pressing: false });
      await wait(200);
    };

    live.current = START;
    setSt(START);
    setSteps([]);
    setPhase("running");
    try {
      say("Opening your orders");
      await wait(700);
      say("Found the leather boots from 25 October");
      await point("view");
      await click();
      set({ page: "order" });
      await wait(600);
      say("Starting a return");
      await point("return");
      await click();
      set({ page: "return" });
      await wait(600);
      say("Reason: they don't fit");
      await point("reason");
      await click();
      set({ dropdown: true, focus: "reason" });
      await wait(350);
      await point("reason-1");
      await click();
      set({ reason: 1, dropdown: false, focus: null });
      say("Refund to your original payment method");
      await point("card");
      await click();
      set({ refund: "card" });
      say("Free drop-off at a post office");
      await point("post");
      await click();
      set({ drop: "post" });
      say("Adding a note for the shop");
      await point("note");
      await click();
      set({ focus: "note" });
      const note = "Half a size too small. Unworn, in the box.";
      for (let i = 1; i <= note.length; i++) {
        set({ note: note.slice(0, i) });
        await wait(28);
      }
      set({ focus: null });
      await point("submit");
      setSteps((ss) => [
        ...ss.map((x) => ({ ...x, state: "done" as const })),
        {
          label: "Submitting can't be undone, so I'm asking first",
          state: "waiting",
        },
      ]);
      setPhase("approval");
      await new Promise<void>((res, rej) => {
        approve.current = () =>
          run.current === id ? res() : rej(new Stopped());
      });
      approve.current = null;
      setPhase("running");
      say("Submitting the return");
      await click();
      set({ page: "done" });
      await wait(700);
      setSteps((ss) => [
        ...ss.map((x) => ({ ...x, state: "done" as const })),
        {
          label: "Done. Take the parcel to any post office by 15 November.",
          state: "done",
        },
      ]);
      set({ cursor: { x: 560, y: 380 } });
      setPhase("finished");
    } catch (e) {
      if (!(e instanceof Stopped)) throw e;
    }
  };

  const stop = () => {
    run.current++;
    approve.current = null;
    setPhase("stopped");
    setSteps((ss) => [
      ...ss.map((x) => ({ ...x, state: "done" as const })),
      { label: "Stopped. Nothing was submitted.", state: "done" },
    ]);
  };

  return (
    <div className={s.wrap}>
      <div className={s.stage} data-dim={phase === "approval" || undefined}>
        <Fit width={600} height={420}>
          <ScaleProbe
            onScale={(n) => {
              scaleRef.current = n;
            }}
          />
          <Site st={st} siteRef={siteRef} />
        </Fit>
        {phase === "idle" && (
          <button type="button" className={s.cover} onClick={start}>
            <span>Return the boots I bought last week</span>
            <small>Start the agent</small>
          </button>
        )}
      </div>
      <aside className={s.panel} aria-live="polite">
        <div className={s.task}>
          <small>Task</small>
          <p>Return the boots I bought last week. They&apos;re too small.</p>
        </div>
        <ol className={s.steps}>
          {steps.map((x, i) => (
            <li key={i} data-state={x.state}>
              <span className={s.mark} aria-hidden />
              {x.label}
            </li>
          ))}
        </ol>
        {phase === "approval" && (
          <div className={s.approval}>
            <p>
              Submit a return for <b>Leather boots, £89</b>? The refund goes to
              your original payment method.
            </p>
            <div className={s.approvalBtns}>
              <button
                type="button"
                data-primary
                onClick={() => approve.current?.()}
              >
                Approve
              </button>
              <button type="button" onClick={stop}>
                Don&apos;t submit
              </button>
            </div>
          </div>
        )}
        <div className={s.controls}>
          {phase === "running" && (
            <button type="button" onClick={stop}>
              Stop
            </button>
          )}
          {(phase === "finished" || phase === "stopped") && (
            <button type="button" onClick={start}>
              Run it again
            </button>
          )}
          {phase === "idle" && (
            <button type="button" data-primary onClick={start}>
              Start
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
