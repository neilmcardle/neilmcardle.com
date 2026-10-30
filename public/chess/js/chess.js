(function (root) {
  "use strict";

  const FILES = "abcdefgh";
  const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const WK = 1,
    WQ = 2,
    BK = 4,
    BQ = 8;

  const sqName = (sq) => FILES[sq & 7] + (8 - (sq >> 3));
  const sqIndex = (name) =>
    /^[a-h][1-8]$/.test(name)
      ? (8 - +name[1]) * 8 + FILES.indexOf(name[0])
      : -1;
  const colorOf = (p) => (p === p.toUpperCase() ? "w" : "b");
  const other = (c) => (c === "w" ? "b" : "w");

  const KNIGHT = [],
    KING = [],
    RAYS = [[], [], [], [], [], [], [], []];
  const ROOK_DIRS = [0, 1, 2, 3],
    BISHOP_DIRS = [4, 5, 6, 7],
    QUEEN_DIRS = [0, 1, 2, 3, 4, 5, 6, 7];

  const CASTLE_MASK = new Array(64).fill(15);
  CASTLE_MASK[60] = 15 & ~(WK | WQ);
  CASTLE_MASK[4] = 15 & ~(BK | BQ);
  CASTLE_MASK[63] = 15 & ~WK;
  CASTLE_MASK[56] = 15 & ~WQ;
  CASTLE_MASK[7] = 15 & ~BK;
  CASTLE_MASK[0] = 15 & ~BQ;

  (function precompute() {
    const dirs = [
      [-1, 0],
      [1, 0],
      [0, 1],
      [0, -1],
      [-1, 1],
      [-1, -1],
      [1, 1],
      [1, -1],
    ];
    const jumps = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];
    const on = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
    for (let sq = 0; sq < 64; sq++) {
      const r = sq >> 3,
        c = sq & 7;
      KNIGHT.push(
        jumps
          .filter(([dr, dc]) => on(r + dr, c + dc))
          .map(([dr, dc]) => (r + dr) * 8 + c + dc),
      );
      KING.push(
        dirs
          .filter(([dr, dc]) => on(r + dr, c + dc))
          .map(([dr, dc]) => (r + dr) * 8 + c + dc),
      );
      dirs.forEach(([dr, dc], d) => {
        const ray = [];
        for (let rr = r + dr, cc = c + dc; on(rr, cc); rr += dr, cc += dc)
          ray.push(rr * 8 + cc);
        RAYS[d].push(ray);
      });
    }
  })();

  const normSan = (s) =>
    String(s)
      .trim()
      .replace(/[+#?!]+$/g, "")
      .replace(/0-0-0/g, "O-O-O")
      .replace(/0-0/g, "O-O")
      .replace(/e\.p\.$/, "")
      .replace("=", "");

  class Chess {
    constructor(fen) {
      this.load(fen || START_FEN);
    }

    load(fen) {
      const parts = String(fen).trim().split(/\s+/);
      const rows = (parts[0] || "").split("/");
      if (rows.length !== 8)
        throw new Error("Invalid FEN (need 8 ranks): " + fen);
      const board = new Array(64).fill(null);
      for (let r = 0; r < 8; r++) {
        let c = 0;
        for (const ch of rows[r]) {
          if (/[1-8]/.test(ch)) c += +ch;
          else if (/[pnbrqkPNBRQK]/.test(ch)) {
            if (c > 7) break;
            board[r * 8 + c++] = ch;
          } else throw new Error('Invalid FEN character "' + ch + '": ' + fen);
        }
        if (c !== 8)
          throw new Error("Invalid FEN rank " + (8 - r) + ": " + fen);
      }
      this.board = board;
      this.turn = parts[1] === "b" ? "b" : "w";
      const cs = parts[2] || "-";
      let castling = 0;
      if (cs.includes("K") && board[60] === "K" && board[63] === "R")
        castling |= WK;
      if (cs.includes("Q") && board[60] === "K" && board[56] === "R")
        castling |= WQ;
      if (cs.includes("k") && board[4] === "k" && board[7] === "r")
        castling |= BK;
      if (cs.includes("q") && board[4] === "k" && board[0] === "r")
        castling |= BQ;
      this.castling = castling;
      this.ep = parts[3] && parts[3] !== "-" ? sqIndex(parts[3]) : -1;
      this.halfmove = parseInt(parts[4], 10) || 0;
      this.fullmove = parseInt(parts[5], 10) || 1;
      this.kings = { w: board.indexOf("K"), b: board.indexOf("k") };
      this.history = [];
      this.startFen = this.fen();
      this.repetitions = { [this._key()]: 1 };
      return this;
    }

    clone() {
      const c = new Chess(this.startFen);
      for (const h of this.history) c.move(h.san);
      return c;
    }

    fen() {
      let s = "";
      for (let r = 0; r < 8; r++) {
        let empty = 0;
        for (let c = 0; c < 8; c++) {
          const p = this.board[r * 8 + c];
          if (!p) empty++;
          else {
            if (empty) {
              s += empty;
              empty = 0;
            }
            s += p;
          }
        }
        if (empty) s += empty;
        if (r < 7) s += "/";
      }
      let cs = "";
      if (this.castling & WK) cs += "K";
      if (this.castling & WQ) cs += "Q";
      if (this.castling & BK) cs += "k";
      if (this.castling & BQ) cs += "q";
      return `${s} ${this.turn} ${cs || "-"} ${this.ep >= 0 ? sqName(this.ep) : "-"} ${this.halfmove} ${this.fullmove}`;
    }

    _key() {
      return this.fen().split(" ").slice(0, 4).join(" ");
    }

    get(square) {
      const i = typeof square === "number" ? square : sqIndex(square);
      return i >= 0 ? this.board[i] : null;
    }

    attacked(sq, by) {
      if (sq < 0) return false;
      const b = this.board,
        r = sq >> 3,
        c = sq & 7;
      if (by === "w") {
        if (
          r < 7 &&
          ((c > 0 && b[sq + 7] === "P") || (c < 7 && b[sq + 9] === "P"))
        )
          return true;
      } else if (
        r > 0 &&
        ((c > 0 && b[sq - 9] === "p") || (c < 7 && b[sq - 7] === "p"))
      )
        return true;
      const N = by === "w" ? "N" : "n",
        K = by === "w" ? "K" : "k";
      const R = by === "w" ? "R" : "r",
        B = by === "w" ? "B" : "b",
        Q = by === "w" ? "Q" : "q";
      for (const t of KNIGHT[sq]) if (b[t] === N) return true;
      for (const t of KING[sq]) if (b[t] === K) return true;
      for (let d = 0; d < 8; d++) {
        const ray = RAYS[d][sq];
        for (let i = 0; i < ray.length; i++) {
          const p = b[ray[i]];
          if (!p) continue;
          if (p === Q || (d < 4 ? p === R : p === B)) return true;
          break;
        }
      }
      return false;
    }

    inCheck(color) {
      color = color || this.turn;
      return this.attacked(this.kings[color], other(color));
    }

    _pseudo(capturesOnly) {
      const moves = [],
        b = this.board,
        us = this.turn,
        them = other(us);
      const add = (from, to, piece, captured, flags, promotion) =>
        moves.push({
          from,
          to,
          piece,
          captured: captured || null,
          flags: flags || "",
          promotion: promotion || null,
        });
      for (let sq = 0; sq < 64; sq++) {
        const p = b[sq];
        if (!p || colorOf(p) !== us) continue;
        const t = p.toLowerCase();
        if (t === "p") {
          const fwd = us === "w" ? -8 : 8,
            startRow = us === "w" ? 6 : 1,
            lastRow = us === "w" ? 0 : 7;
          const one = sq + fwd,
            c = sq & 7;
          if (one < 0 || one > 63) continue;
          const pawnMove = (to, captured) => {
            if (to >> 3 === lastRow)
              for (const pr of "qrbn") add(sq, to, p, captured, "", pr);
            else add(sq, to, p, captured, "");
          };
          if (!b[one]) {
            if (!capturesOnly || one >> 3 === lastRow) pawnMove(one, null);
            if (!capturesOnly && sq >> 3 === startRow && !b[one + fwd])
              add(sq, one + fwd, p, null, "b");
          }
          for (const dc of [-1, 1]) {
            if (c + dc < 0 || c + dc > 7) continue;
            const to = one + dc,
              q = b[to];
            if (q && colorOf(q) === them) pawnMove(to, q);
            else if (to === this.ep && !q)
              add(sq, to, p, us === "w" ? "p" : "P", "e");
          }
          continue;
        }
        if (t === "n" || t === "k") {
          for (const to of (t === "n" ? KNIGHT : KING)[sq]) {
            const q = b[to];
            if (!q) {
              if (!capturesOnly) add(sq, to, p);
            } else if (colorOf(q) === them) add(sq, to, p, q);
          }
          if (t === "k" && !capturesOnly) this._castles(sq, p, add);
          continue;
        }
        const dirs =
          t === "r" ? ROOK_DIRS : t === "b" ? BISHOP_DIRS : QUEEN_DIRS;
        for (const d of dirs) {
          for (const to of RAYS[d][sq]) {
            const q = b[to];
            if (!q) {
              if (!capturesOnly) add(sq, to, p);
              continue;
            }
            if (colorOf(q) === them) add(sq, to, p, q);
            break;
          }
        }
      }
      return moves;
    }

    _castles(sq, p, add) {
      const b = this.board;
      if (p === "K" && sq === 60) {
        if (
          this.castling & WK &&
          !b[61] &&
          !b[62] &&
          b[63] === "R" &&
          !this.attacked(60, "b") &&
          !this.attacked(61, "b") &&
          !this.attacked(62, "b")
        )
          add(60, 62, p, null, "k");
        if (
          this.castling & WQ &&
          !b[59] &&
          !b[58] &&
          !b[57] &&
          b[56] === "R" &&
          !this.attacked(60, "b") &&
          !this.attacked(59, "b") &&
          !this.attacked(58, "b")
        )
          add(60, 58, p, null, "q");
      } else if (p === "k" && sq === 4) {
        if (
          this.castling & BK &&
          !b[5] &&
          !b[6] &&
          b[7] === "r" &&
          !this.attacked(4, "w") &&
          !this.attacked(5, "w") &&
          !this.attacked(6, "w")
        )
          add(4, 6, p, null, "k");
        if (
          this.castling & BQ &&
          !b[3] &&
          !b[2] &&
          !b[1] &&
          b[0] === "r" &&
          !this.attacked(4, "w") &&
          !this.attacked(3, "w") &&
          !this.attacked(2, "w")
        )
          add(4, 2, p, null, "q");
      }
    }

    _make(m) {
      const b = this.board,
        us = this.turn;
      this.history.push({
        move: m,
        castling: this.castling,
        ep: this.ep,
        halfmove: this.halfmove,
        fullmove: this.fullmove,
        san: null,
      });
      b[m.to] = m.promotion
        ? us === "w"
          ? m.promotion.toUpperCase()
          : m.promotion
        : m.piece;
      b[m.from] = null;
      if (m.flags === "e") b[us === "w" ? m.to + 8 : m.to - 8] = null;
      else if (m.flags === "k") {
        b[m.to - 1] = b[m.to + 1];
        b[m.to + 1] = null;
      } else if (m.flags === "q") {
        b[m.to + 1] = b[m.to - 2];
        b[m.to - 2] = null;
      }
      if (m.piece === "K") this.kings.w = m.to;
      else if (m.piece === "k") this.kings.b = m.to;
      this.castling &= CASTLE_MASK[m.from] & CASTLE_MASK[m.to];
      this.ep = m.flags === "b" ? (m.from + m.to) >> 1 : -1;
      this.halfmove =
        m.captured || m.piece === "P" || m.piece === "p"
          ? 0
          : this.halfmove + 1;
      if (us === "b") this.fullmove++;
      this.turn = other(us);
    }

    _undo() {
      const h = this.history.pop();
      if (!h) return null;
      const m = h.move,
        b = this.board;
      this.turn = other(this.turn);
      const us = this.turn;
      b[m.from] = m.piece;
      if (m.flags === "e") {
        b[m.to] = null;
        b[us === "w" ? m.to + 8 : m.to - 8] = m.captured;
      } else b[m.to] = m.captured;
      if (m.flags === "k") {
        b[m.to + 1] = b[m.to - 1];
        b[m.to - 1] = null;
      } else if (m.flags === "q") {
        b[m.to - 2] = b[m.to + 1];
        b[m.to + 1] = null;
      }
      if (m.piece === "K") this.kings.w = m.from;
      else if (m.piece === "k") this.kings.b = m.from;
      this.castling = h.castling;
      this.ep = h.ep;
      this.halfmove = h.halfmove;
      this.fullmove = h.fullmove;
      return h;
    }

    _legal() {
      const out = [],
        us = this.turn;
      for (const m of this._pseudo(false)) {
        this._make(m);
        if (!this.inCheck(us)) out.push(m);
        this._undo();
      }
      return out;
    }

    moves(opts) {
      const legal = this._legal();
      const from = opts && opts.square ? sqIndex(opts.square) : -1;
      return legal
        .filter((m) => from < 0 || m.from === from)
        .map((m) => this._describe(m, this._san(m, legal)));
    }

    _sanBase(m, legal) {
      if (m.flags === "k") return "O-O";
      if (m.flags === "q") return "O-O-O";
      const P = m.piece.toUpperCase();
      if (P === "P") {
        return (
          (m.captured ? FILES[m.from & 7] + "x" : "") +
          sqName(m.to) +
          (m.promotion ? "=" + m.promotion.toUpperCase() : "")
        );
      }
      let s = P;
      const rivals = legal.filter(
        (o) => o.piece === m.piece && o.to === m.to && o.from !== m.from,
      );
      if (rivals.length) {
        const sameFile = rivals.some((o) => (o.from & 7) === (m.from & 7));
        const sameRank = rivals.some((o) => o.from >> 3 === m.from >> 3);
        if (!sameFile) s += FILES[m.from & 7];
        else if (!sameRank) s += sqName(m.from)[1];
        else s += sqName(m.from);
      }
      return s + (m.captured ? "x" : "") + sqName(m.to);
    }

    _san(m, legal) {
      let s = this._sanBase(m, legal || this._legal());
      this._make(m);
      if (this.inCheck()) s += this._legal().length ? "+" : "#";
      this._undo();
      return s;
    }

    _describe(m, san) {
      return {
        from: sqName(m.from),
        to: sqName(m.to),
        piece: m.piece.toLowerCase(),
        color: colorOf(m.piece),
        captured: m.captured ? m.captured.toLowerCase() : null,
        promotion: m.promotion,
        flags: m.flags,
        san,
        uci: sqName(m.from) + sqName(m.to) + (m.promotion || ""),
      };
    }

    _find(input, legal) {
      legal = legal || this._legal();
      let from, to, promo;
      if (typeof input === "object" && input) {
        from = sqIndex(input.from);
        to = sqIndex(input.to);
        promo = input.promotion;
      } else {
        const s = String(input).trim();
        const u = /^([a-h][1-8])-?([a-h][1-8])([qrbnQRBN])?$/.exec(s);
        if (u) {
          from = sqIndex(u[1]);
          to = sqIndex(u[2]);
          promo = u[3];
        } else {
          const want = normSan(s);
          return (
            legal.find((m) => normSan(this._sanBase(m, legal)) === want) ||
            legal.find(
              (m) => normSan("P" + this._sanBase(m, legal)) === want,
            ) ||
            null
          );
        }
      }
      promo = promo ? promo.toLowerCase() : "q";
      return (
        legal.find(
          (m) =>
            m.from === from &&
            m.to === to &&
            (!m.promotion || m.promotion === promo),
        ) || null
      );
    }

    move(input) {
      const legal = this._legal();
      const m = this._find(input, legal);
      if (!m) return null;
      const san = this._san(m, legal);
      this._make(m);
      this.history[this.history.length - 1].san = san;
      const k = this._key();
      this.repetitions[k] = (this.repetitions[k] || 0) + 1;
      return this._describe(m, san);
    }

    undo() {
      if (!this.history.length) return null;
      const k = this._key();
      if (this.repetitions[k]) this.repetitions[k]--;
      const h = this._undo();
      return this._describe(h.move, h.san);
    }

    sanHistory() {
      return this.history.map((h) => h.san);
    }
    lastMove() {
      const h = this.history[this.history.length - 1];
      return h ? this._describe(h.move, h.san) : null;
    }

    isCheckmate() {
      return this.inCheck() && this._legal().length === 0;
    }
    isStalemate() {
      return !this.inCheck() && this._legal().length === 0;
    }
    isThreefold() {
      return (this.repetitions[this._key()] || 0) >= 3;
    }
    isInsufficientMaterial() {
      const pieces = this.board
        .map((p, i) => [p, i])
        .filter(([p]) => p && p.toLowerCase() !== "k");
      if (pieces.length === 0) return true;
      if (pieces.length === 1 && "nbNB".includes(pieces[0][0])) return true;
      if (pieces.every(([p]) => p.toLowerCase() === "b")) {
        const colors = new Set(pieces.map(([, i]) => ((i >> 3) + (i & 7)) % 2));
        return colors.size === 1;
      }
      return false;
    }

    gameOver() {
      if (this._legal().length === 0)
        return this.inCheck() ? "checkmate" : "stalemate";
      if (this.halfmove >= 100) return "fifty-move rule";
      if (this.isThreefold()) return "threefold repetition";
      if (this.isInsufficientMaterial()) return "insufficient material";
      return null;
    }

    result() {
      const over = this.gameOver();
      if (!over) return "*";
      if (over === "checkmate") return this.turn === "w" ? "0-1" : "1-0";
      return "1/2-1/2";
    }

    pgn(headers) {
      const lines = [];
      const h = Object.assign({}, headers || {});
      if (this.startFen !== START_FEN) {
        h.SetUp = "1";
        h.FEN = this.startFen;
      }
      h.Result = h.Result || this.result();
      for (const k of Object.keys(h))
        lines.push(`[${k} "${String(h[k]).replace(/"/g, "'")}"]`);
      const start = new Chess(this.startFen);
      let n = start.fullmove,
        white = start.turn === "w",
        body = "";
      this.sanHistory().forEach((san, i) => {
        if (white) body += `${n}. `;
        else if (i === 0) body += `${n}... `;
        body += san + " ";
        if (!white) n++;
        white = !white;
      });
      return (
        (lines.length ? lines.join("\n") + "\n\n" : "") +
        (body + h.Result).trim()
      );
    }

    loadPgn(text) {
      const headers = {};
      String(text).replace(/\[(\w+)\s+"([^"]*)"\]/g, (_, k, v) => {
        headers[k] = v;
        return "";
      });
      let body = String(text)
        .replace(/\[[^\]]*\]/g, " ")
        .replace(/\{[^}]*\}/g, " ")
        .replace(/;[^\n]*/g, " ");
      let prev;
      do {
        prev = body;
        body = body.replace(/\([^()]*\)/g, " ");
      } while (body !== prev);
      body = body
        .replace(/\$\d+/g, " ")
        .replace(/\d+\.(\.\.)?/g, " ")
        .replace(/(1-0|0-1|1\/2-1\/2|\*)\s*$/, " ");
      this.load(headers.FEN || START_FEN);
      for (const tok of body.split(/\s+/).filter(Boolean)) {
        if (!this.move(tok))
          throw new Error(
            `Illegal move in PGN: "${tok}" (after ${this.sanHistory().join(" ") || "start"})`,
          );
      }
      this.headers = headers;
      return this;
    }
  }

  Chess.START_FEN = START_FEN;
  Chess.sqName = sqName;
  Chess.sqIndex = sqIndex;
  Chess.normSan = normSan;

  root.Chess = Chess;
  if (typeof module !== "undefined" && module.exports)
    module.exports = { Chess };
})(typeof globalThis !== "undefined" ? globalThis : this);
