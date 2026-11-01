"use client";

import { useEffect, useRef, useState } from "react";
import { Fit } from "../lib";
import s from "./bevels.module.css";

type Dialog = "save" | "shutdown" | null;

function useClock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date()
          .toLocaleTimeString("en-GB", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
          .toUpperCase(),
      );
    tick();
    const id = window.setInterval(tick, 10000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function Warn() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="32"
      height="32"
      shapeRendering="crispEdges"
      aria-hidden
    >
      <path
        d="M16 2 L30 29 H2 Z"
        fill="#ffd400"
        stroke="#000"
        strokeWidth="1.5"
      />
      <rect x="14.5" y="10" width="3" height="11" fill="#000" />
      <rect x="14.5" y="23" width="3" height="3" fill="#000" />
    </svg>
  );
}

function Screen() {
  const clock = useClock();
  const [open, setOpen] = useState(true);
  const [min, setMin] = useState(false);
  const [max, setMax] = useState(false);
  const [text, setText] = useState(
    "Things to do\n\n- Upgrade to 8MB of RAM\n- Learn where the Start button is\n- Find out what the right mouse button does",
  );
  const [dirty, setDirty] = useState(true);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [start, setStart] = useState(false);
  const [programs, setPrograms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [off, setOff] = useState(false);
  const firstBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (dialog) firstBtn.current?.focus();
  }, [dialog]);

  const closeNotes = () => {
    setOpen(false);
    setMin(false);
    setMax(false);
  };

  const answer = (a: "yes" | "no" | "cancel") => {
    if (dialog === "save") {
      setDialog(null);
      if (a === "cancel") return;
      if (a === "yes") {
        setBusy(true);
        window.setTimeout(() => {
          setBusy(false);
          setDirty(false);
          closeNotes();
        }, 900);
        return;
      }
      setText("");
      setDirty(false);
      closeNotes();
      return;
    }
    if (dialog === "shutdown") {
      setDialog(null);
      if (a === "yes") {
        setBusy(true);
        window.setTimeout(() => {
          setBusy(false);
          setOff(true);
        }, 1200);
      }
    }
  };

  const launchNotes = () => {
    setStart(false);
    setPrograms(false);
    if (!open) {
      setOpen(true);
      if (!text) {
        setText("");
        setDirty(false);
      }
    }
    setMin(false);
  };

  const onDialogKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      answer(dialog === "save" ? "cancel" : "no");
    }
    if (e.key === "Tab") {
      const btns = Array.from(
        (e.currentTarget as HTMLElement).querySelectorAll("button"),
      );
      const i = btns.indexOf(document.activeElement as HTMLButtonElement);
      e.preventDefault();
      btns[(i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
    }
    const k = e.key.toLowerCase();
    if (k === "y") answer("yes");
    if (k === "n") answer("no");
  };

  if (off) {
    return (
      <button type="button" className={s.off} onClick={() => setOff(false)}>
        <span>It&apos;s now safe to turn off your computer.</span>
        <small>Click to switch it back on</small>
      </button>
    );
  }

  return (
    <div
      className={s.screen}
      data-busy={busy || undefined}
      onPointerDown={(e) => {
        if (!(e.target as HTMLElement).closest("[data-start]")) {
          setStart(false);
          setPrograms(false);
        }
      }}
    >
      <div className={s.icons}>
        <button
          type="button"
          className={s.deskIcon}
          onDoubleClick={launchNotes}
          onPointerUp={(e) => e.pointerType === "touch" && launchNotes()}
          onKeyDown={(e) => e.key === "Enter" && launchNotes()}
        >
          <span className={s.noteIcon} aria-hidden />
          <span>Notes</span>
        </button>
        <button type="button" className={s.deskIcon} disabled>
          <span className={s.binIcon} aria-hidden />
          <span>Bin</span>
        </button>
      </div>

      {open && !min && (
        <section
          className={s.win}
          data-max={max || undefined}
          aria-label="Notes"
        >
          <header className={s.title} onDoubleClick={() => setMax((m) => !m)}>
            <span className={s.titleIcon} aria-hidden />
            <span className={s.titleText}>
              {dirty ? "Untitled" : "Things to do.txt"} - Notes
            </span>
            <span className={s.titleBtns}>
              <button
                type="button"
                className={s.tb}
                aria-label="Minimise"
                onClick={() => setMin(true)}
              >
                <i className={s.gMin} />
              </button>
              <button
                type="button"
                className={s.tb}
                aria-label={max ? "Restore" : "Maximise"}
                onClick={() => setMax((m) => !m)}
              >
                <i className={max ? s.gRestore : s.gMax} />
              </button>
              <button
                type="button"
                className={s.tb}
                aria-label="Close"
                onClick={() => (dirty ? setDialog("save") : closeNotes())}
              >
                <i className={s.gClose} />
              </button>
            </span>
          </header>
          <div className={s.menu} aria-hidden>
            <span>
              <u>F</u>ile
            </span>
            <span>
              <u>E</u>dit
            </span>
            <span>
              <u>S</u>earch
            </span>
            <span>
              <u>H</u>elp
            </span>
          </div>
          <textarea
            className={s.edit}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setDirty(true);
            }}
            aria-label="Note text"
            spellCheck={false}
          />
        </section>
      )}

      {dialog && (
        <div className={s.modalLayer}>
          <div
            className={s.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="w95-dlg"
            onKeyDown={onDialogKey}
          >
            <header className={s.title}>
              <span className={s.titleText} id="w95-dlg">
                {dialog === "save" ? "Notes" : "Shut Down"}
              </span>
              <span className={s.titleBtns}>
                <button
                  type="button"
                  className={s.tb}
                  aria-label="Close"
                  onClick={() => answer(dialog === "save" ? "cancel" : "no")}
                >
                  <i className={s.gClose} />
                </button>
              </span>
            </header>
            <div className={s.dlgBody}>
              <Warn />
              <p>
                {dialog === "save"
                  ? "The text in the Untitled file has changed. Do you want to save the changes?"
                  : "Are you sure you want to shut down the computer?"}
              </p>
            </div>
            <div className={s.dlgBtns}>
              <button
                ref={firstBtn}
                type="button"
                className={s.push}
                onClick={() => answer("yes")}
              >
                <u>Y</u>es
              </button>
              <button
                type="button"
                className={s.push}
                onClick={() => answer("no")}
              >
                <u>N</u>o
              </button>
              {dialog === "save" && (
                <button
                  type="button"
                  className={s.push}
                  onClick={() => answer("cancel")}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {start && (
        <div className={s.startMenu} data-start role="menu">
          <div className={s.banner} aria-hidden>
            <span>
              <b>Desktop</b>95
            </span>
          </div>
          <div className={s.startItems}>
            <div
              className={s.subWrap}
              onPointerEnter={() => setPrograms(true)}
              onPointerLeave={() => setPrograms(false)}
            >
              <button
                type="button"
                role="menuitem"
                className={s.startItem}
                onClick={() => setPrograms((p) => !p)}
              >
                <span className={s.smIcon} data-k="programs" aria-hidden />
                <span>
                  <u>P</u>rograms
                </span>
                <span className={s.arrow}>▸</span>
              </button>
              {programs && (
                <div className={s.sub} role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    className={s.startItem}
                    onClick={launchNotes}
                  >
                    <span className={s.noteIcon} data-small aria-hidden />
                    Notes
                  </button>
                </div>
              )}
            </div>
            {["Documents", "Settings", "Find", "Help", "Run..."].map((l) => (
              <button
                key={l}
                type="button"
                role="menuitem"
                className={s.startItem}
                disabled
              >
                <span className={s.smIcon} data-k={l} aria-hidden />
                <span>{l}</span>
                {["Documents", "Settings", "Find"].includes(l) && (
                  <span className={s.arrow}>▸</span>
                )}
              </button>
            ))}
            <div className={s.sep} />
            <button
              type="button"
              role="menuitem"
              className={s.startItem}
              onClick={() => {
                setStart(false);
                setDialog("shutdown");
              }}
            >
              <span className={s.smIcon} data-k="shut" aria-hidden />
              <span>
                Sh<u>u</u>t Down...
              </span>
            </button>
          </div>
        </div>
      )}

      <footer className={s.taskbar}>
        <button
          type="button"
          className={s.startBtn}
          data-start
          aria-pressed={start}
          onClick={() => {
            setStart((v) => !v);
            setPrograms(false);
          }}
        >
          <span className={s.flag} aria-hidden />
          Start
        </button>
        {open && (
          <button
            type="button"
            className={s.task}
            aria-pressed={!min}
            onClick={() => setMin((m) => !m)}
          >
            <span className={s.titleIcon} aria-hidden />
            {dirty ? "Untitled" : "Things to do.txt"} - Notes
          </button>
        )}
        <span className={s.tray}>{clock}</span>
      </footer>
    </div>
  );
}

export default function Bevels() {
  return (
    <div className={s.outer}>
      <div className={s.monitor}>
        <Fit width={640} height={440}>
          <Screen />
        </Fit>
      </div>
    </div>
  );
}
