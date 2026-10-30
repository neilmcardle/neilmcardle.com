(function () {
  "use strict";
  const Chess = window.Chess,
    Engine = window.CPEngine,
    Board = window.Board;
  const CURRICULUM = window.CP_CURRICULUM || [];
  const PUZZLES = [].concat(
    window.CP_PUZZLES || [],
    window.CP_PUZZLES_EXTRA || [],
  );
  const app = document.getElementById("app");

  const STORE_KEY = "chess-path.v1";
  const defaults = () => ({
    onboarded: false,
    startStage: null,
    done: {},
    puzzle: { rating: 800, seen: {}, streak: 0, best: 0, theme: "" },
    play: { level: 3, color: "w", side: "w", pgn: "", recorded: false },
    stats: { w: 0, l: 0, d: 0 },
  });
  function loadState() {
    const d = defaults();
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (s)
        for (const k of Object.keys(d))
          d[k] =
            typeof d[k] === "object" && d[k] && !Array.isArray(d[k])
              ? Object.assign(d[k], s[k])
              : k in s
                ? s[k]
                : d[k];
    } catch (e) {
      /* storage unavailable: run without persistence */
    }
    return d;
  }
  let state = loadState();
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "html") el.innerHTML = v;
      else if (k === "class") el.className = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat())
      if (kid != null && kid !== false)
        el.append(kid.nodeType ? kid : String(kid));
    return el;
  }
  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const inline = (s) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, "$1<em>$2</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(
        /\[([^\]]+)\]\((https?:[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>',
      );
  function md(src) {
    if (!String(src || "").trim()) return "";
    return String(src)
      .trim()
      .split(/\n\s*\n/)
      .map((block) => {
        const lines = block.split("\n");
        if (lines.every((l) => /^\s*-\s+/.test(l)))
          return (
            "<ul>" +
            lines
              .map((l) => "<li>" + inline(l.replace(/^\s*-\s+/, "")) + "</li>")
              .join("") +
            "</ul>"
          );
        if (lines.every((l) => /^\s*\d+\.\s+/.test(l)))
          return (
            "<ol>" +
            lines
              .map(
                (l) => "<li>" + inline(l.replace(/^\s*\d+\.\s+/, "")) + "</li>",
              )
              .join("") +
            "</ol>"
          );
        if (/^#{1,3}\s/.test(block))
          return "<h3>" + inline(block.replace(/^#+\s/, "")) + "</h3>";
        return "<p>" + lines.map(inline).join("<br>") + "</p>";
      })
      .join("");
  }
  const sideName = (c) => (c === "w" ? "White" : "Black");
  const otherSide = (c) => (c === "w" ? "b" : "w");

  function moveTokens(moves) {
    if (Array.isArray(moves)) return moves;
    return String(moves)
      .replace(/\d+\.(\.\.)?/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  }

  function positionOf(item) {
    const c = new Chess(item.fen || Chess.START_FEN);
    if (item.line) for (const t of moveTokens(item.line)) c.move(t);
    return c;
  }

  function matches(ch, played, expected) {
    if (Chess.normSan(played.san) === Chess.normSan(expected)) return true;
    if (played.uci === expected || played.uci === expected + "q") return true;
    return /#$/.test(expected) && ch.isCheckmate();
  }

  let teardown = [];
  const later = (fn, ms) => {
    const t = setTimeout(fn, ms);
    teardown.push(() => clearTimeout(t));
    return t;
  };
  const onKey = (fn) => {
    window.addEventListener("keydown", fn);
    teardown.push(() => window.removeEventListener("keydown", fn));
  };

  const think = (fn) => {
    let started = false;
    const run = () => {
      if (!started) {
        started = true;
        later(fn, 0);
      }
    };
    later(() => {
      requestAnimationFrame(run);
      later(run, 120);
    }, 30);
  };

  function studyLayout() {
    const boardEl = h("div", { class: "board-host" });
    const panel = h("div", { class: "panel" });
    const wrap = h(
      "div",
      { class: "study" },
      h("div", { class: "board-col" }, boardEl),
      panel,
    );
    app.replaceChildren(wrap);
    return { boardEl, panel };
  }

  const LESSONS = [];
  CURRICULUM.forEach((stage, si) =>
    stage.lessons.forEach((lesson, li) =>
      LESSONS.push({ stage, lesson, si, li }),
    ),
  );
  const findLesson = (id) => LESSONS.find((x) => x.lesson.id === id);
  function nextLesson() {
    const startIdx = Math.max(
      0,
      LESSONS.findIndex((x) => x.stage.id === state.startStage),
    );
    return (
      LESSONS.slice(startIdx).find((x) => !state.done[x.lesson.id]) ||
      LESSONS.find((x) => !state.done[x.lesson.id]) ||
      null
    );
  }

  function route() {
    closeModals();
    teardown.forEach((f) => f());
    teardown = [];
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    const view = parts[0] || "learn";
    document
      .querySelectorAll(".nav a")
      .forEach((a) =>
        a.classList.toggle(
          "active",
          a.dataset.view === (view === "lesson" ? "learn" : view),
        ),
      );
    window.scrollTo(0, 0);
    if (view === "lesson") viewLesson(decodeURIComponent(parts[1] || ""));
    else if (view === "puzzles") viewPuzzles();
    else if (view === "play") viewPlay();
    else if (view === "analyze") viewAnalyze();
    else viewLearn();
  }

  function viewLearn() {
    const next = nextLesson();
    const total = LESSONS.length,
      done = LESSONS.filter((x) => state.done[x.lesson.id]).length;
    const hero = h(
      "section",
      { class: "hero" },
      h(
        "div",
        {},
        h(
          "h1",
          { class: "two-tone" },
          "From your first move to grandmaster ideas. ",
          h(
            "span",
            { class: "dim" },
            "Lessons, puzzles and a sparring partner, all running on your device.",
          ),
        ),
        h(
          "div",
          { class: "hero-actions" },
          next
            ? h(
                "a",
                { class: "btn primary", href: "#/lesson/" + next.lesson.id },
                (done ? "Continue: " : "Start: ") + next.lesson.title,
                arrow(),
              )
            : h(
                "span",
                { class: "badge" },
                "Every lesson complete. Keep going with puzzles and games.",
              ),
          h("a", { class: "btn", href: "#/puzzles" }, "Puzzles"),
          h("a", { class: "btn", href: "#/play" }, "Play the computer"),
        ),
        h(
          "div",
          { class: "stats" },
          stat(done + " / " + total, "lessons"),
          stat(Math.round(state.puzzle.rating), "puzzle rating"),
          stat(
            `${state.stats.w}–${state.stats.d}–${state.stats.l}`,
            h(
              "span",
              { title: "Games won, drawn and lost" },
              h("span", { class: "wide-only" }, "games "),
              "W–D–L",
            ),
          ),
        ),
      ),
      shapeBand(),
    );
    const list = h("div", { class: "stages" });
    CURRICULUM.forEach((stage, si) => {
      const lessons = stage.lessons;
      const n = lessons.filter((l) => state.done[l.id]).length;
      const open =
        (next && next.stage === stage) || state.startStage === stage.id;
      const det = h(
        "details",
        {
          class: "stage" + (n === lessons.length ? " complete" : ""),
          open,
          style: stageHue(si),
        },
        h(
          "summary",
          {},
          h("span", { class: "stage-num" }, String(si + 1).padStart(2, "0")),
          h(
            "span",
            { class: "stage-title" },
            h("strong", {}, stage.title),
            h("small", {}, stage.level),
            next && next.stage === stage
              ? h(
                  "span",
                  { class: "tag", style: "color: var(--hue)" },
                  "Up next",
                )
              : null,
          ),
          h(
            "span",
            { class: "stage-progress" },
            h(
              "span",
              { class: "meter", "aria-hidden": "true" },
              h("i", {
                style: `width: ${Math.round((n / lessons.length) * 100)}%`,
              }),
            ),
            `${n}/${lessons.length}`,
          ),
        ),
        h("p", { class: "stage-blurb" }, stage.blurb),
        h(
          "ol",
          { class: "lessons" },
          lessons.map((l) =>
            h(
              "li",
              { class: state.done[l.id] ? "done" : "" },
              h(
                "a",
                { href: "#/lesson/" + l.id },
                h("span", { class: "tick" }, state.done[l.id] ? "✓" : ""),
                h(
                  "span",
                  {},
                  l.title,
                  l.summary ? h("small", {}, l.summary) : null,
                ),
              ),
            ),
          ),
        ),
      );
      list.appendChild(det);
    });
    app.replaceChildren(
      hero,
      h("h2", { class: "section-title" }, "The path"),
      list,
    );
  }
  const stat = (v, label) =>
    h(
      "div",
      { class: "stat" },
      h("strong", {}, String(v)),
      h("span", {}, label),
    );
  const arrow = () =>
    h("span", { class: "arrow-end", "aria-hidden": "true" }, "→");

  const stageHue = (si) => `--hue: var(--hue-${Math.min(si, 6)})`;

  let bandAnimated = false;
  function shapeBand() {
    let seed = 1858;
    const rand = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const hues = [
      "jade",
      "teal",
      "ocean",
      "azure",
      "cobalt",
      "blue",
      "violet",
      "purple",
      "magenta",
    ];
    const pick = (weights) => {
      let r = rand() * weights.reduce((a, [, w]) => a + w, 0);
      for (const [k, w] of weights) {
        if ((r -= w) < 0) return k;
      }
      return weights[0][0];
    };
    const kinds = [
      ["empty", 20],
      ["square", 14],
      ["quarter", 26],
      ["half", 10],
      ["ring", 10],
      ["triangle", 14],
      ["circle", 6],
    ];
    let body = "";
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const d = r + c,
          kind = pick(kinds);
        if (kind === "empty") continue;
        const jitter = rand() < 0.25 ? (rand() < 0.5 ? -1 : 1) : 0;
        const hue =
          hues[
            Math.max(
              0,
              Math.min(
                hues.length - 1,
                Math.round((d * (hues.length - 1)) / 14) + jitter,
              ),
            )
          ];
        const o = Math.floor(rand() * 4);
        const corners = [
          [c, r],
          [c + 1, r],
          [c + 1, r + 1],
          [c, r + 1],
        ];
        let shape;
        if (kind === "square")
          shape = `<rect x="${c}" y="${r}" width="1" height="1"/>`;
        else if (kind === "circle")
          shape = `<circle cx="${c + 0.5}" cy="${r + 0.5}" r="0.5"/>`;
        else if (kind === "ring")
          shape = `<path fill-rule="evenodd" d="M${c} ${r + 0.5}a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0ZM${c + 0.28} ${r + 0.5}a.22 .22 0 1 0 .44 0a.22 .22 0 1 0 -.44 0Z"/>`;
        else if (kind === "triangle") {
          const [a, b, e] = [
            corners[o],
            corners[(o + 1) % 4],
            corners[(o + 3) % 4],
          ];
          shape = `<polygon points="${a} ${b} ${e}"/>`;
        } else if (kind === "quarter") {
          const [cx, cy] = corners[o],
            [ax, ay] = corners[(o + 1) % 4],
            [bx, by] = corners[(o + 3) % 4];
          shape = `<path d="M${cx} ${cy}L${ax} ${ay}A1 1 0 0 1 ${bx} ${by}Z"/>`;
        } else {
          const [ax, ay] = corners[o],
            [bx, by] = corners[(o + 1) % 4];
          shape = `<path d="M${ax} ${ay}A.5 .5 0 0 0 ${bx} ${by}Z"/>`;
        }
        body += `<g class="shape" style="fill: var(--s-${hue}); --d: ${d}">${shape}</g>`;
      }
    }
    const el = h("div", {
      class: "band" + (bandAnimated ? "" : " animate"),
      "aria-hidden": "true",
    });
    el.innerHTML = `<svg viewBox="0 0 8 8" preserveAspectRatio="xMidYMin slice">${body}</svg>`;
    bandAnimated = true;
    return el;
  }

  function viewLesson(id) {
    const entry = findLesson(id);
    if (!entry) {
      app.replaceChildren(
        h(
          "p",
          {},
          "Lesson not found. ",
          h("a", { href: "#/" }, "Back to the path"),
        ),
      );
      return;
    }
    const { stage, lesson } = entry;
    const { boardEl, panel } = studyLayout();
    const handlers = {};
    const board = new Board(boardEl, {
      onMove: (m) => handlers.move && handlers.move(m),
      onSquare: (s) => handlers.square && handlers.square(s),
    });
    let stepIdx = 0,
      stepTeardown = [];

    panel.setAttribute("style", stageHue(entry.si));
    const crumbs = h(
      "div",
      { class: "crumbs" },
      h("a", { href: "#/" }, "Path"),
      h("span", { "aria-hidden": "true" }, "/"),
      h(
        "span",
        { class: "tag", style: "color: var(--hue)" },
        `Stage ${entry.si + 1}`,
      ),
      stage.title,
    );
    const title = h(
      "h2",
      { class: "two-tone" },
      lesson.title + (lesson.summary ? ". " : ""),
      lesson.summary ? h("span", { class: "dim" }, lesson.summary + ".") : null,
    );
    const dots = h("div", { class: "dots" });
    const body = h("div", { class: "prose" });
    const feedback = h("div", { class: "feedback" });
    const tools = h("div", { class: "tools" });
    const nav = h("div", { class: "stepnav" });
    panel.append(crumbs, title, dots, body, feedback, tools, nav);

    const say = (text, kind) => {
      feedback.className = "feedback " + (kind || "");
      feedback.innerHTML = text ? md(text) : "";
    };
    const stepLater = (fn, ms) => {
      const t = setTimeout(fn, ms);
      stepTeardown.push(() => clearTimeout(t));
    };
    teardown.push(() => stepTeardown.forEach((f) => f()));

    function renderStep() {
      stepTeardown.forEach((f) => f());
      stepTeardown = [];
      handlers.move = handlers.square = null;
      const step = lesson.steps[stepIdx];
      dots.replaceChildren(
        ...lesson.steps.map((_, i) =>
          h("span", {
            class: i === stepIdx ? "on" : i < stepIdx ? "past" : "",
          }),
        ),
      );
      body.innerHTML = md(step.text);
      say("");
      tools.replaceChildren();
      board.setArrows([]);
      board.marks = [];
      const runner =
        {
          text: stepText,
          find: stepFind,
          move: stepMove,
          play: stepPlay,
          game: stepGame,
        }[step.type] || stepText;
      runner(step);
      const last = stepIdx === lesson.steps.length - 1;
      nav.replaceChildren(
        stepIdx > 0
          ? h(
              "button",
              {
                class: "btn",
                onclick: () => {
                  stepIdx--;
                  renderStep();
                },
              },
              "← Back",
            )
          : h("span"),
        h(
          "span",
          { class: "muted" },
          `${stepIdx + 1} / ${lesson.steps.length}`,
        ),
        last
          ? h(
              "button",
              { class: "btn primary", onclick: finish },
              "Finish lesson",
              arrow(),
            )
          : h(
              "button",
              {
                class: "btn primary",
                onclick: () => {
                  stepIdx++;
                  renderStep();
                },
              },
              "Next",
              arrow(),
            ),
      );
    }

    function finish() {
      state.done[lesson.id] = true;
      save();
      const nxt = nextLesson();
      location.hash = nxt ? "#/lesson/" + nxt.lesson.id : "#/";
    }

    function stepText(step) {
      const ch = positionOf(step);
      board.set(ch, { movable: null, orientation: step.orientation || "w" });
      board.setMarks(step.marks || []);
      board.setArrows(step.arrows || []);
    }

    function stepFind(step) {
      board.set(positionOf(step), {
        movable: null,
        orientation: step.orientation || "w",
      });
      const found = [];
      handlers.square = (sq) => {
        if (step.squares.includes(sq)) {
          if (!found.includes(sq)) found.push(sq);
          board.setMarks(found.slice());
          board.flashSquare(sq, "good");
          if (found.length === step.squares.length)
            say(step.success || "Well done!", "good");
        } else {
          board.flashSquare(sq, "bad");
          say(`That's **${sq}**. Try again.`, "bad");
        }
      };
    }

    function stepMove(step) {
      let ch, idx;
      const userColor = positionOf(step).turn;
      const reset = () => {
        ch = positionOf(step);
        idx = 0;
        board.set(ch, {
          movable: userColor,
          orientation: step.orientation || userColor,
        });
        board.setArrows(step.arrows || []);
        board.setMarks(step.marks || []);
      };
      reset();
      const prompt = `**${sideName(userColor)} to move.**`;
      say(prompt);
      const solved = () => {
        board.set(ch, { movable: null });
        say(step.success || "Correct!", "good");
      };
      handlers.move = (m) => {
        if (idx >= step.solution.length) return;
        const played = ch.move(m);
        if (!played) return;
        const ok =
          matches(ch, played, step.solution[idx]) ||
          (idx === 0 &&
            (step.accept || []).some(
              (a) => Chess.normSan(a) === Chess.normSan(played.san),
            ));
        if (!ok) {
          board.set(ch, { movable: null });
          board.flashSquare(played.to, "bad");
          say(
            step.wrong || `**${played.san}** isn't it. Have another look.`,
            "bad",
          );
          stepLater(() => {
            ch.undo();
            board.set(ch, { movable: userColor });
          }, 650);
          return;
        }
        idx++;
        board.set(ch, { movable: null });
        board.flashSquare(played.to, "good");
        if (idx >= step.solution.length || (step.accept || []).length) {
          solved();
          return;
        }
        say(`**${played.san}**, good. Now the reply…`, "good");
        stepLater(() => {
          ch.move(step.solution[idx++]);
          if (idx >= step.solution.length) solved();
          else {
            board.set(ch, { movable: userColor });
            say(`${prompt} Keep going.`);
          }
        }, 550);
      };
      tools.replaceChildren(
        h(
          "button",
          {
            class: "btn small",
            onclick: () => {
              const exp = new Chess(ch.fen())._find(step.solution[idx]);
              if (exp) board.setHint(Chess.sqName(exp.from));
              if (step.hint) say(step.hint);
            },
          },
          "Hint",
        ),
        h(
          "button",
          {
            class: "btn small",
            onclick: () => {
              board.set(ch, { movable: null });
              const play = () => {
                if (idx >= step.solution.length) {
                  say(step.success || "That was the solution.", "good");
                  return;
                }
                ch.move(step.solution[idx++]);
                board.set(ch, { movable: null });
                stepLater(play, 650);
              };
              play();
            },
          },
          "Show answer",
        ),
        h(
          "button",
          {
            class: "btn small",
            onclick: () => {
              stepTeardown.forEach((f) => f());
              reset();
              say(prompt);
            },
          },
          "Reset",
        ),
      );
    }

    function stepPlay(step) {
      let ch, userMoves, over;
      const user = step.user || positionOf(step).turn;
      const level = Engine.LEVELS[step.level || 7];
      const goalText =
        {
          mate: "Checkmate the computer.",
          promote: "Promote a pawn safely.",
          hold: `Hold the position for ${step.movesToHold || 15} moves.`,
          win: "Win the game.",
        }[step.goal] || "";
      const materialOf = (c, side) =>
        c.board.reduce(
          (s, p) =>
            p && (p === p.toUpperCase() ? "w" : "b") === side
              ? s + { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }[p.toLowerCase()]
              : s,
          0,
        );
      const balance = (c) =>
        materialOf(c, user) - materialOf(c, otherSide(user));
      let startBalance;
      const reset = () => {
        stepTeardown.forEach((f) => f());
        stepTeardown = [];
        ch = positionOf(step);
        userMoves = 0;
        over = false;
        startBalance = balance(ch);
        board.set(ch, {
          movable: ch.turn === user ? user : null,
          orientation: user,
        });
        say(`**You play ${sideName(user)}.** ${goalText}`);
        if (ch.turn !== user) stepLater(engineMove, 400);
      };
      const end = (msg, good) => {
        over = true;
        board.set(ch, { movable: null });
        say(msg, good ? "good" : "bad");
      };
      function check(lastMove, byUser) {
        const result = ch.gameOver();
        if (result === "checkmate") {
          const userWon = ch.turn !== user;
          if (userWon)
            end(
              step.success || "Checkmate. Well played!",
              ["mate", "win"].includes(step.goal),
            );
          else
            end("You were checkmated. Press **Restart** and try again.", false);
          return true;
        }
        if (result) {
          end(
            step.goal === "hold"
              ? step.success || `Draw by ${result}. You held it!`
              : `Draw by ${result}. That doesn't reach the goal; try again.`,
            step.goal === "hold",
          );
          return true;
        }
        if (
          byUser &&
          step.goal === "promote" &&
          lastMove.promotion &&
          !ch.attacked(Chess.sqIndex(lastMove.to), ch.turn)
        ) {
          end(step.success || "Promoted safely. The rest is technique!", true);
          return true;
        }
        if (byUser && step.goal === "hold") {
          if (balance(ch) < startBalance - 2) {
            end(
              "You have lost material and the position. Restart and try again.",
              false,
            );
            return true;
          }
          if (userMoves >= (step.movesToHold || 15)) {
            end(
              step.success || "You held the position. That is the technique.",
              true,
            );
            return true;
          }
        }
        return false;
      }
      function engineMove() {
        if (over) return;
        say("Computer is thinking…");
        stepLater(() => {
          const r = Engine.search(ch.fen(), level);
          if (!r.move) return;
          const m = ch.move(r.move);
          board.set(ch, { movable: user });
          if (!check(m, false))
            say(`Computer played **${m.san}**. ${goalText}`);
        }, 60);
      }
      handlers.move = (m) => {
        if (over || ch.turn !== user) return;
        const played = ch.move(m);
        if (!played) return;
        userMoves++;
        board.set(ch, { movable: null });
        if (!check(played, true)) engineMove();
      };
      tools.replaceChildren(
        h(
          "button",
          {
            class: "btn small",
            onclick: () => {
              if (over || ch.turn !== user) return;
              say("Thinking about a hint…");
              stepLater(() => {
                const r = Engine.search(ch.fen(), { time: 1200 });
                board.setArrows(r.move ? [r.uci] : []);
                say(`Try **${r.san}**.`);
              }, 40);
            },
          },
          "Hint",
        ),
        h(
          "button",
          {
            class: "btn small",
            onclick: () => {
              if (over || ch.history.length < 2 || ch.turn !== user) return;
              ch.undo();
              ch.undo();
              userMoves = Math.max(0, userMoves - 1);
              board.set(ch, { movable: user });
              say("Took back your last move.");
            },
          },
          "Take back",
        ),
        h("button", { class: "btn small", onclick: reset }, "Restart"),
      );
      reset();
    }

    function stepGame(step) {
      const full = new Chess().loadPgn(step.pgn);
      const sans = full.sanHistory(),
        start = full.startFen;
      let ply = 0;
      const notesEl = h("div", { class: "game-note" });
      const moveList = h("div", { class: "movelist" });
      const show = () => {
        const c = new Chess(start);
        for (let i = 0; i < ply; i++) c.move(sans[i]);
        board.set(c, { movable: null, orientation: step.orientation || "w" });
        const note = (step.notes || {})[ply];
        notesEl.innerHTML = note ? md(note) : ply === 0 ? "" : "";
        renderMoveList(moveList, sans, ply, new Chess(start), (p) => {
          ply = p;
          show();
        });
      };
      tools.replaceChildren(
        h(
          "div",
          { class: "game-controls" },
          h(
            "button",
            {
              class: "btn small",
              onclick: () => {
                ply = 0;
                show();
              },
            },
            "⏮",
          ),
          h(
            "button",
            {
              class: "btn small",
              onclick: () => {
                ply = Math.max(0, ply - 1);
                show();
              },
            },
            "◀",
          ),
          h(
            "button",
            {
              class: "btn small primary",
              onclick: () => {
                ply = Math.min(sans.length, ply + 1);
                show();
              },
            },
            "▶",
          ),
          h(
            "button",
            {
              class: "btn small",
              onclick: () => {
                ply = sans.length;
                show();
              },
            },
            "⏭",
          ),
        ),
        notesEl,
        moveList,
      );
      onKeyStep((e) => {
        if (e.key === "ArrowRight") {
          ply = Math.min(sans.length, ply + 1);
          show();
        }
        if (e.key === "ArrowLeft") {
          ply = Math.max(0, ply - 1);
          show();
        }
      });
      show();
    }
    function onKeyStep(fn) {
      window.addEventListener("keydown", fn);
      stepTeardown.push(() => window.removeEventListener("keydown", fn));
    }

    renderStep();
  }

  function renderMoveList(el, sans, ply, startChess, jump) {
    el.replaceChildren();
    let n = startChess.fullmove,
      white = startChess.turn === "w";
    sans.forEach((san, i) => {
      if (white || i === 0)
        el.append(h("span", { class: "num" }, n + (white ? "." : "…")));
      el.append(
        h(
          "button",
          {
            class: "mv" + (i + 1 === ply ? " cur" : ""),
            onclick: () => jump(i + 1),
          },
          san,
        ),
      );
      if (!white) n++;
      white = !white;
    });

    const cur = el.querySelector(".cur");
    if (cur) {
      const r = cur.getBoundingClientRect(),
        box = el.getBoundingClientRect();
      if (r.top < box.top) el.scrollTop += r.top - box.top - 8;
      else if (r.bottom > box.bottom) el.scrollTop += r.bottom - box.bottom + 8;
    }
  }

  function viewPuzzles() {
    const { boardEl, panel } = studyLayout();
    let ch, puzzle, idx, failed, finished, line;
    const board = new Board(boardEl, { onMove: (m) => onMove(m) });
    const themes = [...new Set(PUZZLES.flatMap((p) => p.themes || []))].sort();
    const ratingEl = h("strong", {});
    const streakEl = h("span", { class: "muted" });
    const title = h("h2", { class: "two-tone" });
    const meta = h("div", { class: "muted small" });
    const feedback = h("div", { class: "feedback" });
    const themeSel = h(
      "select",
      {
        onchange: (e) => {
          state.puzzle.theme = e.target.value;
          save();
          next();
        },
      },
      h("option", { value: "" }, "All themes"),
      themes.map((t) =>
        h(
          "option",
          { value: t, selected: state.puzzle.theme === t },
          prettyTheme(t),
        ),
      ),
    );
    panel.append(
      h(
        "div",
        { class: "row spread" },
        h("div", {}, "Your puzzle rating ", ratingEl, " ", streakEl),
        themeSel,
      ),
      title,
      meta,
      feedback,
      h(
        "div",
        { class: "tools" },
        h(
          "button",
          {
            class: "btn small",
            onclick: () => {
              const exp = new Chess(ch.fen())._find(line[idx]);
              if (exp) board.setHint(Chess.sqName(exp.from));
              if (!failed) fail();
            },
          },
          "Hint",
        ),
        h("button", { class: "btn small", onclick: showSolution }, "Solution"),
        h(
          "button",
          { class: "btn small primary", onclick: next },
          "Next puzzle",
          arrow(),
        ),
      ),
      h(
        "p",
        { class: "muted small" },
        `${PUZZLES.length} puzzles loaded. Your first try on each one moves your rating; misses come back later for review.`,
      ),
    );

    const say = (t, k) => {
      feedback.className = "feedback " + (k || "");
      feedback.innerHTML = md(t);
    };
    const updateHeader = () => {
      ratingEl.textContent = Math.round(state.puzzle.rating);
      streakEl.textContent =
        state.puzzle.streak > 1 ? `· streak ${state.puzzle.streak}` : "";
    };

    function pick() {
      const pool = PUZZLES.filter(
        (p) =>
          !state.puzzle.theme || (p.themes || []).includes(state.puzzle.theme),
      );
      if (!pool.length) return null;
      const r = state.puzzle.rating;
      const unseen = pool.filter((p) => !state.puzzle.seen[p.id]);
      const missed = pool.filter(
        (p) => state.puzzle.seen[p.id] && !state.puzzle.seen[p.id].ok,
      );
      const src = unseen.length ? unseen : missed.length ? missed : pool;
      const near = src
        .slice()
        .sort((a, b) => Math.abs(a.rating - r) - Math.abs(b.rating - r))
        .slice(0, 6);
      const choice = near[Math.floor(Math.random() * near.length)];
      return choice === puzzle && near.length > 1
        ? near.find((p) => p !== puzzle)
        : choice;
    }

    function rate(score) {
      const seen = state.puzzle.seen[puzzle.id];
      if (seen && seen.rated) return 0;
      const exp =
        1 / (1 + Math.pow(10, (puzzle.rating - state.puzzle.rating) / 400));
      const delta = 28 * (score - exp);
      state.puzzle.rating = Math.max(100, state.puzzle.rating + delta);
      state.puzzle.seen[puzzle.id] = { ok: !!score, rated: true };
      save();
      return delta;
    }
    function fail() {
      failed = true;
      const d = rate(0);
      state.puzzle.streak = 0;
      if (d) meta.textContent = `Rating ${d.toFixed(0)}`;
      updateHeader();
    }

    function next() {
      puzzle = pick();
      if (!puzzle) {
        title.textContent = "No puzzles for this theme.";
        return;
      }
      ch = positionOf(puzzle);
      idx = 0;
      failed = false;
      finished = false;
      if (puzzle.pre) ch.move(puzzle.pre);
      line = moveTokens(puzzle.moves);
      board.set(ch, { movable: ch.turn, orientation: ch.turn });
      board.setArrows([]);
      const goal =
        puzzle.goal ||
        (line.length > 1
          ? `Find the best line, ${Math.ceil(line.length / 2)} moves deep`
          : "Find the best move");
      title.replaceChildren(
        (puzzle.title || `${sideName(ch.turn)} to move`) + ". ",
        h("span", { class: "dim" }, goal + "."),
      );
      meta.textContent = "";
      say(puzzle.pre ? `Opponent just played **${ch.lastMove().san}**.` : "");
      updateHeader();
    }

    function solvedIt() {
      finished = true;
      board.set(ch, { movable: null });
      let msg = "Solved!";
      if (!failed) {
        const d = rate(1);
        state.puzzle.streak++;
        state.puzzle.best = Math.max(state.puzzle.best, state.puzzle.streak);
        save();
        if (d) msg += ` Rating +${d.toFixed(0)}.`;
      } else if (!state.puzzle.seen[puzzle.id].ok)
        msg += " It goes into your review pile.";
      say(
        `${msg} Puzzle rated **${puzzle.rating}** · ${(puzzle.themes || []).map(prettyTheme).join(", ")}${puzzle.note ? "\n\n" + puzzle.note : ""}`,
        "good",
      );
      updateHeader();
    }

    function onMove(m) {
      if (finished) return;
      const played = ch.move(m);
      if (!played) return;
      if (!matches(ch, played, line[idx])) {
        board.set(ch, { movable: null });
        board.flashSquare(played.to, "bad");
        if (!failed) fail();
        say(
          `**${played.san}** isn't the answer. Try again, or press Solution.`,
          "bad",
        );
        later(() => {
          ch.undo();
          board.set(ch, { movable: ch.turn });
        }, 650);
        return;
      }
      idx++;
      board.set(ch, { movable: null });
      board.flashSquare(played.to, "good");
      if (idx >= line.length || ch.isCheckmate()) {
        solvedIt();
        return;
      }
      say(`**${played.san}**, correct. Keep going.`, "good");
      later(() => {
        ch.move(line[idx++]);
        if (idx >= line.length) solvedIt();
        else board.set(ch, { movable: ch.turn });
      }, 500);
    }

    function showSolution() {
      if (finished) return;
      if (!failed) fail();
      finished = true;
      const step = () => {
        if (idx >= line.length) {
          say(
            `Solution shown. Puzzle rated **${puzzle.rating}** · ${(puzzle.themes || []).map(prettyTheme).join(", ")}${puzzle.note ? "\n\n" + puzzle.note : ""}`,
          );
          return;
        }
        ch.move(line[idx++]);
        board.set(ch, { movable: null });
        later(step, 650);
      };
      step();
    }
    next();
  }
  const prettyTheme = (t) =>
    t
      .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
      .replace(/-/g, " ")
      .replace(/^./, (c) => c.toUpperCase());

  function viewPlay() {
    const { boardEl, panel } = studyLayout();
    let ch = new Chess();
    try {
      if (state.play.pgn) ch.loadPgn(state.play.pgn);
    } catch (e) {
      ch = new Chess();
    }
    const board = new Board(boardEl, { onMove: (m) => userMove(m) });
    const status = h("div", { class: "feedback" });
    const moveList = h("div", { class: "movelist" });
    const levelSel = h(
      "select",
      {
        onchange: (e) => {
          state.play.level = +e.target.value;
          save();
        },
      },
      Engine.LEVELS.slice(1).map((l, i) =>
        h(
          "option",
          { value: i + 1, selected: state.play.level === i + 1 },
          `${i + 1} · ${l.name}`,
        ),
      ),
    );
    const colorSel = h(
      "select",
      {
        onchange: (e) => {
          state.play.color = e.target.value;
          save();
        },
      },
      [
        ["w", "White"],
        ["b", "Black"],
        ["r", "Random"],
      ].map(([v, t]) =>
        h("option", { value: v, selected: state.play.color === v }, t),
      ),
    );
    let thinking = false;

    panel.append(
      h(
        "h2",
        { class: "two-tone" },
        "Play the computer. ",
        h(
          "span",
          { class: "dim" },
          "Pick a strength and a colour, then play a full game.",
        ),
      ),
      h(
        "div",
        { class: "form-row" },
        h("label", {}, "Strength", levelSel),
        h("label", {}, "You play", colorSel),
        h("button", { class: "btn primary", onclick: newGame }, "New game"),
      ),
      status,
      h(
        "div",
        { class: "tools" },
        h("button", { class: "btn small", onclick: takeback }, "Take back"),
        h("button", { class: "btn small", onclick: hint }, "Hint"),
        h(
          "button",
          { class: "btn small", onclick: () => board.flip() },
          "Flip",
        ),
        h("button", { class: "btn small", onclick: resign }, "Resign"),
        h(
          "button",
          {
            class: "btn small",
            onclick: () => {
              sessionStorageSet("analyze", ch.pgn());
              location.hash = "#/analyze";
            },
          },
          "Analyse game",
        ),
      ),
      moveList,
      h(
        "p",
        { class: "muted small" },
        "Level 8 is roughly a strong club player. For deeper analysis, use “Analyse game” here or paste the PGN into a full engine like Stockfish.",
      ),
    );

    function sync() {
      state.play.pgn = ch.pgn();
      save();
      board.set(ch, {
        movable:
          thinking || ch.gameOver() || state.play.over ? null : state.play.side,
        orientation: board.orientation,
      });
      renderMoveList(
        moveList,
        ch.sanHistory(),
        ch.history.length,
        new Chess(ch.startFen),
        () => {},
      );
      const over = ch.gameOver();
      if (over || state.play.over) {
        const res = state.play.over || ch.result();
        let msg;
        if (state.play.over === "resigned")
          msg = "You resigned. On to the next one.";
        else if (over === "checkmate")
          msg =
            ch.turn === state.play.side
              ? "Checkmate. The computer wins this one."
              : "Checkmate. You win!";
        else msg = `Draw by ${over}.`;
        status.className =
          "feedback " + (msg.includes("You win") ? "good" : "");
        status.innerHTML = md(`**${msg}** Press New game to play again.`);
        if (!state.play.recorded) {
          state.play.recorded = true;
          if (
            res === "resigned" ||
            (over === "checkmate" && ch.turn === state.play.side)
          )
            state.stats.l++;
          else if (over === "checkmate") state.stats.w++;
          else state.stats.d++;
          save();
        }
      } else {
        status.className = "feedback";
        status.innerHTML = md(
          thinking
            ? "Computer is thinking…"
            : ch.turn === state.play.side
              ? `Your move${ch.inCheck() ? ": you are in check!" : "."}`
              : "",
        );
      }
    }

    function newGame() {
      ch = new Chess();
      state.play.side =
        state.play.color === "r"
          ? Math.random() < 0.5
            ? "w"
            : "b"
          : state.play.color;
      state.play.over = null;
      state.play.recorded = false;
      board.setOrientation(state.play.side);
      board.setArrows([]);
      sync();
      if (ch.turn !== state.play.side) engineMove();
    }
    function userMove(m) {
      if (thinking || ch.turn !== state.play.side || state.play.over) return;
      if (!ch.move(m)) return;
      board.setArrows([]);
      sync();
      if (!ch.gameOver()) engineMove();
    }
    function engineMove() {
      thinking = true;
      sync();
      think(() => {
        const r = Engine.search(ch.fen(), Engine.LEVELS[state.play.level]);
        if (r.move) ch.move(r.move);
        thinking = false;
        sync();
      });
    }
    function takeback() {
      if (thinking || state.play.over) return;
      ch.undo();
      if (ch.turn !== state.play.side) ch.undo();
      state.play.recorded = false;
      sync();
    }
    function hint() {
      if (thinking || ch.gameOver() || ch.turn !== state.play.side) return;
      status.innerHTML = md("Looking for a good move…");
      think(() => {
        const r = Engine.search(ch.fen(), { time: 1200 });
        board.setArrows(r.move ? [r.uci] : []);
        status.innerHTML = md(`Consider **${r.san}**.`);
      });
    }
    function resign() {
      if (ch.gameOver() || state.play.over || !ch.history.length) return;
      state.play.over = "resigned";
      sync();
    }

    board.setOrientation(state.play.side);
    sync();
    if (!ch.gameOver() && !state.play.over && ch.turn !== state.play.side)
      engineMove();
  }

  function sessionStorageSet(k, v) {
    try {
      sessionStorage.setItem("chess-path." + k, v);
    } catch (e) {
      window["__cp_" + k] = v;
    }
  }
  function sessionStorageTake(k) {
    let v = null;
    try {
      v = sessionStorage.getItem("chess-path." + k);
      sessionStorage.removeItem("chess-path." + k);
    } catch (e) {
      v = window["__cp_" + k];
      window["__cp_" + k] = null;
    }
    return v;
  }

  function viewAnalyze() {
    const { boardEl, panel } = studyLayout();
    let startFen = Chess.START_FEN,
      sans = [],
      ply = 0,
      ch = new Chess();
    const incoming = sessionStorageTake("analyze");
    if (incoming) {
      try {
        const g = new Chess().loadPgn(incoming);
        startFen = g.startFen;
        sans = g.sanHistory();
        ply = sans.length;
      } catch (e) {
        /* ignore */
      }
    }
    const board = new Board(boardEl, {
      onMove: (m) => {
        const c = current();
        const played = c.move(m);
        if (!played) return;
        if (sans[ply] !== played.san)
          sans = sans.slice(0, ply).concat(played.san);
        ply++;
        show();
      },
    });
    const evalEl = h("div", { class: "eval" });
    const moveList = h("div", { class: "movelist" });
    const fenInput = h("input", {
      type: "text",
      spellcheck: "false",
      "aria-label": "FEN",
    });
    const pgnInput = h("textarea", {
      rows: 3,
      placeholder: "Paste a PGN or a list of moves…",
      spellcheck: "false",
    });
    const autoBox = h("input", { type: "checkbox", onchange: () => show() });

    function current() {
      const c = new Chess(startFen);
      for (let i = 0; i < ply; i++) c.move(sans[i]);
      return c;
    }
    function show() {
      ch = current();
      board.set(ch, { movable: "both" });
      board.setArrows([]);
      fenInput.value = ch.fen();
      renderMoveList(moveList, sans, ply, new Chess(startFen), (p) => {
        ply = p;
        show();
      });
      const over = ch.gameOver();
      evalEl.innerHTML = over ? md(`**Game over:** ${over}.`) : "";
      if (autoBox.checked && !over) analyse();
    }
    function analyse() {
      const fen = ch.fen();
      evalEl.innerHTML = md("Analysing…");
      think(() => {
        if (fen !== ch.fen()) return;
        const r = Engine.search(fen, { time: 1500 });
        if (!r.move) return;
        board.setArrows([r.uci]);
        evalEl.innerHTML = `<div class="score">${Engine.formatScore(r.score, ch.turn)}</div><div class="pv">depth ${r.depth} · ${esc(r.pv.join(" "))}</div>`;
      });
    }

    panel.append(
      h(
        "h2",
        { class: "two-tone" },
        "Analysis board. ",
        h(
          "span",
          { class: "dim" },
          "Move for both sides, try ideas, then ask the engine.",
        ),
      ),
      h(
        "p",
        { class: "muted small" },
        "Use ← and → to step through the moves.",
      ),
      h(
        "div",
        { class: "tools" },
        h(
          "button",
          {
            class: "btn small",
            onclick: () => {
              ply = 0;
              show();
            },
          },
          "⏮",
        ),
        h(
          "button",
          {
            class: "btn small",
            onclick: () => {
              ply = Math.max(0, ply - 1);
              show();
            },
          },
          "◀",
        ),
        h(
          "button",
          {
            class: "btn small",
            onclick: () => {
              ply = Math.min(sans.length, ply + 1);
              show();
            },
          },
          "▶",
        ),
        h(
          "button",
          {
            class: "btn small",
            onclick: () => {
              ply = sans.length;
              show();
            },
          },
          "⏭",
        ),
        h(
          "button",
          { class: "btn small", onclick: () => board.flip() },
          "Flip",
        ),
        h(
          "button",
          { class: "btn small primary", onclick: analyse },
          "Evaluate",
        ),
        h("label", { class: "check" }, autoBox, "auto"),
      ),
      evalEl,
      moveList,
      h(
        "details",
        { class: "io" },
        h("summary", {}, "Load / export a position"),
        h("label", {}, "FEN", fenInput),
        h(
          "div",
          { class: "tools" },
          h(
            "button",
            {
              class: "btn small",
              onclick: () => {
                try {
                  new Chess(fenInput.value);
                  startFen = fenInput.value.trim();
                  sans = [];
                  ply = 0;
                  show();
                } catch (e) {
                  alert(e.message);
                }
              },
            },
            "Load FEN",
          ),
          h(
            "button",
            { class: "btn small", onclick: () => copy(ch.fen()) },
            "Copy FEN",
          ),
          h(
            "button",
            {
              class: "btn small",
              onclick: () => {
                startFen = Chess.START_FEN;
                sans = [];
                ply = 0;
                show();
              },
            },
            "Reset",
          ),
        ),
        pgnInput,
        h(
          "div",
          { class: "tools" },
          h(
            "button",
            {
              class: "btn small",
              onclick: () => {
                try {
                  const g = new Chess().loadPgn(pgnInput.value);
                  startFen = g.startFen;
                  sans = g.sanHistory();
                  ply = sans.length;
                  show();
                } catch (e) {
                  alert(e.message);
                }
              },
            },
            "Load PGN",
          ),
          h(
            "button",
            {
              class: "btn small",
              onclick: () => {
                const c = new Chess(startFen);
                sans.forEach((s) => c.move(s));
                copy(c.pgn());
              },
            },
            "Copy PGN",
          ),
        ),
      ),
    );
    onKey((e) => {
      if (/input|textarea|select/i.test(document.activeElement.tagName)) return;
      if (e.key === "ArrowLeft") {
        ply = Math.max(0, ply - 1);
        show();
      }
      if (e.key === "ArrowRight") {
        ply = Math.min(sans.length, ply + 1);
        show();
      }
    });
    show();
  }
  function copy(text) {
    (navigator.clipboard
      ? navigator.clipboard.writeText(text)
      : Promise.reject()
    ).catch(() => prompt("Copy:", text));
  }

  const openModals = new Set();
  function modal(content) {
    const returnFocus = document.activeElement;
    const onEsc = (e) => {
      if (e.key === "Escape") close();
    };
    const close = () => {
      if (!openModals.delete(close)) return;
      back.remove();
      window.removeEventListener("keydown", onEsc);
      if (returnFocus && returnFocus.isConnected) returnFocus.focus();
    };
    const box = h(
      "div",
      { class: "modal", role: "dialog", "aria-modal": "true", tabindex: "-1" },
      content(close),
    );
    const back = h(
      "div",
      {
        class: "modal-back",
        onclick: (e) => {
          if (e.target === back) close();
        },
      },
      box,
    );
    document.body.appendChild(back);
    window.addEventListener("keydown", onEsc);
    openModals.add(close);
    box.focus();
    return close;
  }
  const closeModals = () => [...openModals].forEach((close) => close());

  function onboarding() {
    const choose = (stageId) => {
      state.onboarded = true;
      state.startStage = stageId;
      const ratings = {
        rules: 500,
        beginner: 700,
        improver: 1000,
        club: 1300,
        advanced: 1700,
        expert: 2000,
        gm: 2200,
      };
      if (stageId && !Object.keys(state.puzzle.seen).length)
        state.puzzle.rating = ratings[stageId] || 800;
      save();
      location.hash = "#/";
      route();
    };
    modal((close) => [
      h(
        "h2",
        { class: "two-tone" },
        "Welcome to Chess Path. ",
        h(
          "span",
          { class: "dim" },
          "Where should we start? You can jump anywhere later.",
        ),
      ),
      h(
        "div",
        { class: "choices" },
        [
          ["rules", "I’ve never played", "Learn how the pieces move"],
          ["beginner", "I know the rules", "Start winning games"],
          ["improver", "I play casually", "Sharpen tactics"],
          ["club", "I’m a club player", "Strategy and endgames"],
          ["advanced", "I’m rated 1700+", "Advanced and master material"],
        ].map(([id, t, s]) =>
          h(
            "button",
            {
              class: "choice",
              onclick: () => {
                close();
                choose(id);
              },
            },
            h("strong", {}, t),
            h("span", {}, s),
          ),
        ),
      ),
      h(
        "button",
        {
          class: "linkish",
          onclick: () => {
            close();
            choose(null);
          },
        },
        "Skip",
      ),
    ]);
  }

  function settings() {
    modal((close) => [
      h(
        "h2",
        { class: "two-tone" },
        "Your progress. ",
        h(
          "span",
          { class: "dim" },
          "Saved in this browser only. Export it to back it up or move to another device.",
        ),
      ),
      h(
        "div",
        { class: "tools" },
        h(
          "button",
          {
            class: "btn",
            onclick: () => {
              const a = h("a", {
                href: URL.createObjectURL(
                  new Blob([JSON.stringify(state, null, 2)], {
                    type: "application/json",
                  }),
                ),
                download: "chess-path-progress.json",
              });
              document.body.appendChild(a);
              a.click();
              a.remove();
            },
          },
          "Export",
        ),
        h(
          "label",
          { class: "btn" },
          "Import",
          h("input", {
            type: "file",
            accept: "application/json",
            hidden: true,
            onchange: (e) => {
              const f = e.target.files[0];
              if (!f) return;
              f.text().then((t) => {
                try {
                  localStorage.setItem(
                    STORE_KEY,
                    JSON.stringify(JSON.parse(t)),
                  );
                } catch (err) {
                  alert("Could not read that file.");
                  return;
                }
                state = loadState();
                close();
                route();
              });
            },
          }),
        ),
        h(
          "button",
          {
            class: "btn",
            onclick: () => {
              close();
              onboarding();
            },
          },
          "Change starting level",
        ),
        h(
          "button",
          {
            class: "btn danger",
            onclick: () => {
              if (confirm("Erase all progress in this browser?")) {
                state = defaults();
                state.onboarded = true;
                save();
                close();
                route();
              }
            },
          },
          "Reset",
        ),
      ),
      h(
        "div",
        { class: "modal-actions" },
        h("button", { class: "btn primary", onclick: close }, "Done"),
      ),
    ]);
  }

  document.getElementById("settings-btn").addEventListener("click", settings);
  window.addEventListener("hashchange", route);
  route();
  if (!state.onboarded) onboarding();
})();
