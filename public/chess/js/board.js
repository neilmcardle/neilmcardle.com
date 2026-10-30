(function (root) {
  "use strict";
  const Chess = root.Chess;
  const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
  const SVGNS = "http://www.w3.org/2000/svg";

  class Board {
    constructor(el, opts) {
      this.el = el;
      this.opts = opts || {};
      this.orientation = "w";
      this.movable = null;
      this.chess = null;
      this.selected = null;
      this.arrows = [];
      this.marks = [];
      this.hintSquare = null;
      this.flash = null;
      el.classList.add("board-wrap");
      el.innerHTML = "";
      this.grid = document.createElement("div");
      this.grid.className = "board";
      this.svg = document.createElementNS(SVGNS, "svg");
      this.svg.setAttribute("viewBox", "0 0 8 8");
      this.svg.classList.add("arrows");
      el.append(this.grid, this.svg);
      this.squares = [];
      for (let i = 0; i < 64; i++) {
        const d = document.createElement("div");
        d.className = "sq";
        this.grid.appendChild(d);
        this.squares.push(d);
      }
      this.grid.addEventListener("pointerdown", (e) => this._down(e));
      this.grid.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    set(chess, opts) {
      opts = opts || {};
      this.chess = chess;
      if (opts.orientation) this.orientation = opts.orientation;
      this.movable = opts.movable === undefined ? this.movable : opts.movable;
      this.selected = null;
      this.hintSquare = null;
      this.render();
    }

    setOrientation(o) {
      this.orientation = o;
      this.render();
    }
    flip() {
      this.setOrientation(this.orientation === "w" ? "b" : "w");
    }
    setArrows(list) {
      this.arrows = (list || []).map((a) =>
        typeof a === "string" ? { from: a.slice(0, 2), to: a.slice(2, 4) } : a,
      );
      this._drawArrows();
    }
    setMarks(list) {
      this.marks = list || [];
      this.render();
    }
    setHint(square) {
      this.hintSquare = square;
      this.render();
    }
    flashSquare(square, kind) {
      this.flash = { square, kind };
      this.render();
      clearTimeout(this._flashT);
      this._flashT = setTimeout(() => {
        this.flash = null;
        this.render();
      }, 700);
    }

    _idx(v) {
      return this.orientation === "w" ? v : 63 - v;
    }

    render() {
      const ch = this.chess;
      const last = ch && ch.lastMove();
      const checkSq = ch && ch.inCheck() ? ch.kings[ch.turn] : -1;
      const targets =
        this.selected && ch
          ? ch.moves({ square: this.selected }).map((m) => m.to)
          : [];
      for (let v = 0; v < 64; v++) {
        const i = this._idx(v),
          name = Chess.sqName(i),
          d = this.squares[v];
        const r = i >> 3,
          c = i & 7;
        const p = ch ? ch.board[i] : null;
        let cls = "sq " + ((r + c) % 2 ? "dark" : "light");
        if (last && (last.from === name || last.to === name)) cls += " last";
        if (this.selected === name) cls += " selected";
        if (i === checkSq) cls += " check";
        if (this.marks.includes(name)) cls += " mark";
        if (this.hintSquare === name) cls += " hint";
        if (this.flash && this.flash.square === name)
          cls += " flash-" + this.flash.kind;
        if (targets.includes(name)) cls += p ? " target capture" : " target";
        d.className = cls;
        d.dataset.square = name;
        let html = "";
        if (p)
          html += `<span class="piece ${p === p.toUpperCase() ? "white" : "black"}">${GLYPH[p.toLowerCase()]}︎</span>`;
        const vr = v >> 3,
          vc = v & 7;
        if (vc === 0) html += `<span class="coord rank">${name[1]}</span>`;
        if (vr === 7) html += `<span class="coord file">${name[0]}</span>`;
        d.innerHTML = html;
      }
      this._drawArrows();
    }

    _center(name) {
      const i = Chess.sqIndex(name);
      const v = this.orientation === "w" ? i : 63 - i;
      return [(v & 7) + 0.5, (v >> 3) + 0.5];
    }

    _drawArrows() {
      const svg = this.svg;
      svg.innerHTML = "";
      const defs = document.createElementNS(SVGNS, "defs");
      defs.innerHTML = ["green", "red", "blue"]
        .map(
          (c) =>
            `<marker id="ah-${c}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto"><path class="head ${c}" d="M0,0 L10,5 L0,10 z"/></marker>`,
        )
        .join("");
      svg.appendChild(defs);
      for (const a of this.arrows) {
        if (Chess.sqIndex(a.from) < 0 || Chess.sqIndex(a.to) < 0) continue;
        const [x1, y1] = this._center(a.from),
          [x2, y2] = this._center(a.to);
        const len = Math.hypot(x2 - x1, y2 - y1),
          k = (len - 0.35) / len;
        const line = document.createElementNS(SVGNS, "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x1 + (x2 - x1) * k);
        line.setAttribute("y2", y1 + (y2 - y1) * k);
        const color = ["green", "red", "blue"].includes(a.color)
          ? a.color
          : "green";
        line.setAttribute("class", "arrow " + color);
        line.setAttribute("marker-end", `url(#ah-${color})`);
        svg.appendChild(line);
      }
    }

    _squareAt(x, y) {
      const rect = this.grid.getBoundingClientRect();
      const c = Math.floor(((x - rect.left) / rect.width) * 8),
        r = Math.floor(((y - rect.top) / rect.height) * 8);
      if (c < 0 || c > 7 || r < 0 || r > 7) return null;
      return Chess.sqName(this._idx(r * 8 + c));
    }

    _canMove(name) {
      const ch = this.chess;
      if (!ch || !this.movable) return false;
      const p = ch.get(name);
      if (!p) return false;
      const color = p === p.toUpperCase() ? "w" : "b";
      return (
        color === ch.turn && (this.movable === "both" || this.movable === color)
      );
    }

    _down(e) {
      if (e.button !== 0) return;
      const name = this._squareAt(e.clientX, e.clientY);
      if (!name) return;
      if (this.opts.onSquare) this.opts.onSquare(name);
      if (this.selected && this.selected !== name && !this._canMove(name)) {
        this._tryMove(this.selected, name);
        return;
      }
      if (!this._canMove(name)) {
        this.selected = null;
        this.render();
        return;
      }
      const wasSelected = this.selected === name;
      this.selected = name;
      this.render();
      this._startDrag(e, name, wasSelected);
    }

    _startDrag(e, from, wasSelected) {
      const pieceEl = this.squares
        .find((s) => s.dataset.square === from)
        .querySelector(".piece");
      if (!pieceEl) return;
      const ghost = pieceEl.cloneNode(true);
      ghost.classList.add("ghost");
      document.body.appendChild(ghost);
      const sz = this.grid.clientWidth / 8;
      ghost.style.fontSize = getComputedStyle(pieceEl).fontSize;
      ghost.style.width = ghost.style.height = sz + "px";
      let moved = false;
      const place = (ev) => {
        ghost.style.left = ev.clientX - sz / 2 + "px";
        ghost.style.top = ev.clientY - sz / 2 + "px";
      };
      place(e);
      pieceEl.style.opacity = "0.35";
      const move = (ev) => {
        moved = true;
        place(ev);
      };
      const up = (ev) => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        ghost.remove();
        pieceEl.style.opacity = "";
        const to = this._squareAt(ev.clientX, ev.clientY);
        if (to && to !== from) this._tryMove(from, to);
        else if (!moved && wasSelected) {
          this.selected = null;
          this.render();
        }
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    }

    _tryMove(from, to) {
      const ch = this.chess;
      const options = ch.moves({ square: from }).filter((m) => m.to === to);
      this.selected = null;
      if (!options.length) {
        this.render();
        return;
      }
      if (options.length > 1 && options[0].promotion) {
        this.render();
        this._promote(
          to,
          ch.turn,
          (piece) =>
            this.opts.onMove &&
            this.opts.onMove({ from, to, promotion: piece }),
        );
        return;
      }
      if (this.opts.onMove)
        this.opts.onMove({
          from,
          to,
          promotion: options[0].promotion || undefined,
        });
    }

    _promote(to, color, done) {
      const box = document.createElement("div");
      box.className = "promo";
      for (const t of ["q", "r", "b", "n"]) {
        const btn = document.createElement("button");
        btn.className = "piece " + (color === "w" ? "white" : "black");
        btn.textContent = GLYPH[t] + "︎";
        btn.title = { q: "Queen", r: "Rook", b: "Bishop", n: "Knight" }[t];
        btn.onclick = (e) => {
          e.stopPropagation();
          box.remove();
          done(t);
        };
        box.appendChild(btn);
      }
      box.addEventListener("pointerdown", (e) => {
        if (e.target === box) {
          box.remove();
          this.render();
        }
      });
      this.el.appendChild(box);
    }
  }

  root.Board = Board;
})(typeof globalThis !== "undefined" ? globalThis : this);
