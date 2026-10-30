(function (root) {
  "use strict";
  const Chess = root.Chess || require("./chess.js").Chess;

  const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  const MATE = 100000;

  const PST = {
    p: [
      0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30,
      30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5,
      -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0,
      0, 0, 0,
    ],
    n: [
      -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40,
      -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0,
      15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5,
      0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50,
    ],
    b: [
      -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10,
      0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10,
      10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10,
      -20, -10, -10, -10, -10, -10, -10, -20,
    ],
    r: [
      0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0,
      0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0,
      0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0,
    ],
    q: [
      -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0,
      5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5,
      -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5,
      -5, -10, -10, -20,
    ],
    k: [
      -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40,
      -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40,
      -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20,
      -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20,
    ],
    kEnd: [
      -50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20,
      -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10,
      -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10,
      -30, -30, -30, 0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30,
      -50,
    ],
  };

  const centerDist = (sq) =>
    Math.max(3 - (sq >> 3), (sq >> 3) - 4) +
    Math.max(3 - (sq & 7), (sq & 7) - 4);
  const kingDist = (a, b) =>
    Math.max(Math.abs((a >> 3) - (b >> 3)), Math.abs((a & 7) - (b & 7)));

  function evaluate(ch) {
    const b = ch.board;
    let score = 0,
      npm = 0,
      matW = 0,
      matB = 0,
      bW = 0,
      bB = 0;
    for (let sq = 0; sq < 64; sq++) {
      const p = b[sq];
      if (!p) continue;
      const t = p.toLowerCase();
      if (t !== "p" && t !== "k") npm += VAL[t];
      if (p === t) {
        matB += VAL[t];
        if (t === "b") bB++;
      } else {
        matW += VAL[t];
        if (t === "b") bW++;
      }
    }
    const endgame = npm <= 1600;
    for (let sq = 0; sq < 64; sq++) {
      const p = b[sq];
      if (!p) continue;
      const t = p.toLowerCase(),
        white = p !== t,
        idx = white ? sq : sq ^ 56;
      const table = t === "k" ? (endgame ? PST.kEnd : PST.k) : PST[t];
      const v = VAL[t] + table[idx];
      score += white ? v : -v;
    }
    if (bW >= 2) score += 30;
    if (bB >= 2) score -= 30;

    const diff = matW - matB;
    if (
      endgame &&
      Math.abs(diff) >= 300 &&
      ch.kings.w >= 0 &&
      ch.kings.b >= 0
    ) {
      const winner = diff > 0 ? 1 : -1;
      const loserK = diff > 0 ? ch.kings.b : ch.kings.w;
      score +=
        winner *
        (10 * centerDist(loserK) +
          4 * (14 - 2 * kingDist(ch.kings.w, ch.kings.b)));
    }
    return ch.turn === "w" ? score : -score;
  }

  const sameMove = (a, b) =>
    a && b && a.from === b.from && a.to === b.to && a.promotion === b.promotion;

  const LEVELS = [
    null,
    { name: "Newcomer", depth: 1, time: 300, noise: 350 },
    { name: "Beginner", depth: 1, time: 300, noise: 180 },
    { name: "Casual", depth: 2, time: 400, noise: 110 },
    { name: "Improver", depth: 2, time: 500, noise: 50 },
    { name: "Club", depth: 3, time: 700, noise: 20 },
    { name: "Strong club", depth: 64, time: 1000, noise: 0 },
    { name: "Expert", depth: 64, time: 2000, noise: 0 },
    { name: "Maximum", depth: 64, time: 4000, noise: 0 },
  ];

  function search(fen, opts) {
    opts = opts || {};
    const ch = new Chess(fen);
    const maxDepth = opts.depth || 64,
      timeLimit = opts.time || 1000,
      noise = opts.noise || 0;
    const start = Date.now();
    let nodes = 0,
      stop = false;
    const killers = [],
      pvTable = [],
      pvLen = [];
    let prevPv = [];

    const timeUp = () => {
      if ((++nodes & 1023) === 0 && Date.now() - start > timeLimit) stop = true;
      return stop;
    };

    function order(moves, ply) {
      const pvMove = prevPv[ply],
        killer = killers[ply];
      for (const m of moves) {
        let s = 0;
        if (sameMove(m, pvMove)) s = 1e7;
        else if (m.captured)
          s =
            1e6 +
            10 * VAL[m.captured.toLowerCase()] -
            VAL[m.piece.toLowerCase()];
        else if (m.promotion) s = 9e5 + VAL[m.promotion];
        else if (sameMove(m, killer)) s = 8e5;
        m._s = s;
      }
      return moves.sort((a, b) => b._s - a._s);
    }

    function quiesce(alpha, beta, ply) {
      if (timeUp()) return 0;
      const stand = evaluate(ch);
      if (stand >= beta) return beta;
      if (stand > alpha) alpha = stand;
      if (ply > 40) return stand;
      const us = ch.turn;
      for (const m of order(ch._pseudo(true), 64)) {
        ch._make(m);
        if (ch.inCheck(us)) {
          ch._undo();
          continue;
        }
        const s = -quiesce(-beta, -alpha, ply + 1);
        ch._undo();
        if (stop) return 0;
        if (s >= beta) return beta;
        if (s > alpha) alpha = s;
      }
      return alpha;
    }

    function negamax(depth, alpha, beta, ply) {
      pvLen[ply] = ply;
      if (ply > 0 && ch.halfmove >= 100) return 0;
      const us = ch.turn,
        inCheck = ch.inCheck(us);
      if (inCheck && ply < 30) depth++;
      if (depth <= 0) return quiesce(alpha, beta, ply);
      if (timeUp()) return 0;
      let legal = 0;
      for (const m of order(ch._pseudo(false), ply)) {
        ch._make(m);
        if (ch.inCheck(us)) {
          ch._undo();
          continue;
        }
        legal++;
        const s = -negamax(depth - 1, -beta, -alpha, ply + 1);
        ch._undo();
        if (stop) return 0;
        if (s > alpha) {
          alpha = s;
          pvTable[ply] = pvTable[ply] || [];
          pvTable[ply][ply] = m;
          for (let i = ply + 1; i < pvLen[ply + 1]; i++)
            pvTable[ply][i] = pvTable[ply + 1][i];
          pvLen[ply] = Math.max(pvLen[ply + 1], ply + 1);
          if (s >= beta) {
            if (!m.captured) killers[ply] = m;
            return beta;
          }
        }
      }
      if (!legal) return inCheck ? -MATE + ply : 0;
      return alpha;
    }

    const rootLegal = ch._legal();
    if (!rootLegal.length)
      return {
        move: null,
        san: null,
        score: ch.inCheck() ? -MATE : 0,
        pv: [],
        depth: 0,
        nodes: 0,
      };

    let best = rootLegal[0],
      bestScore = 0,
      depthDone = 0,
      pv = [best];

    if (noise > 0) {
      const d = Math.min(maxDepth, 3);
      let top = -Infinity;
      for (const m of rootLegal) {
        ch._make(m);
        const s = -negamax(d - 1, -MATE - 1, MATE + 1, 1);
        ch._undo();
        const noisy = s + (Math.random() * 2 - 1) * noise;
        if (noisy > top) {
          top = noisy;
          best = m;
          bestScore = s;
        }
      }
      pv = [best];
      depthDone = d;
    } else {
      for (let d = 1; d <= maxDepth; d++) {
        const s = negamax(d, -MATE - 1, MATE + 1, 0);
        if (stop && d > 1) break;
        if (pvLen[0] > 0 && pvTable[0] && pvTable[0][0]) {
          pv = pvTable[0].slice(0, pvLen[0]);
          best = pv[0];
          bestScore = s;
          depthDone = d;
        }
        prevPv = pv;
        if (
          stop ||
          Math.abs(s) > MATE - 200 ||
          Date.now() - start > timeLimit * 0.55
        )
          break;
      }
    }

    const replay = new Chess(fen),
      sanPv = [];
    for (const m of pv) {
      const r = replay.move({
        from: Chess.sqName(m.from),
        to: Chess.sqName(m.to),
        promotion: m.promotion,
      });
      if (!r) break;
      sanPv.push(r.san);
    }
    return {
      move: {
        from: Chess.sqName(best.from),
        to: Chess.sqName(best.to),
        promotion: best.promotion,
      },
      uci:
        Chess.sqName(best.from) +
        Chess.sqName(best.to) +
        (best.promotion || ""),
      san: sanPv[0],
      score: bestScore,
      pv: sanPv,
      depth: depthDone,
      nodes,
      ms: Date.now() - start,
    };
  }

  function formatScore(score, turn) {
    const s = turn === "w" ? score : -score;
    if (Math.abs(s) > MATE - 500) {
      const plies = MATE - Math.abs(s);
      return (s > 0 ? "#" : "#-") + Math.ceil(plies / 2);
    }
    return (s >= 0 ? "+" : "") + (s / 100).toFixed(2);
  }

  const api = {
    search,
    evaluate: (fen) => evaluate(new Chess(fen)),
    formatScore,
    LEVELS,
    MATE,
  };
  root.CPEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
