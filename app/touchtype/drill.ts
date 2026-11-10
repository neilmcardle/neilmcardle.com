export type Result = {
  wpm: number;
  acc: number;
  errors: number;
  ms: number;
  chars: number;
};

export type Drill = {
  itemIdx: number;
  charIdx: number;
  keystrokes: number;
  errors: number;
  doneChars: number;
  drillStart: number | null;
  result: Result | null;
};

export type KeyOutcome =
  "ignored" | "wrong" | "right" | "nextItem" | "finished";

export const freshDrill: Drill = {
  itemIdx: 0,
  charIdx: 0,
  keystrokes: 0,
  errors: 0,
  doneChars: 0,
  drillStart: null,
  result: null,
};

export function speed(chars: number, ms: number) {
  if (ms < 1000) return 0;
  return Math.round(chars / 5 / (ms / 60000));
}

export function accuracy(keystrokes: number, errors: number) {
  if (keystrokes === 0) return 100;
  return Math.round(((keystrokes - errors) / keystrokes) * 100);
}

export function pressKey(
  drill: Drill,
  key: string,
  at: number,
  items: readonly string[],
): { drill: Drill; outcome: KeyOutcome } {
  const text = items[drill.itemIdx] ?? "";
  const expected = drill.result ? undefined : text[drill.charIdx];
  if (expected === undefined) return { drill, outcome: "ignored" };
  const start = drill.drillStart ?? at;
  const keystrokes = drill.keystrokes + 1;
  if (key.toLowerCase() !== expected.toLowerCase()) {
    return {
      drill: {
        ...drill,
        drillStart: start,
        keystrokes,
        errors: drill.errors + 1,
      },
      outcome: "wrong",
    };
  }
  const next = drill.charIdx + 1;
  if (next < text.length) {
    return {
      drill: { ...drill, drillStart: start, keystrokes, charIdx: next },
      outcome: "right",
    };
  }
  const doneChars = drill.doneChars + text.length;
  if (drill.itemIdx + 1 < items.length) {
    return {
      drill: {
        ...drill,
        drillStart: start,
        keystrokes,
        doneChars,
        itemIdx: drill.itemIdx + 1,
        charIdx: 0,
      },
      outcome: "nextItem",
    };
  }
  const ms = at - start;
  return {
    drill: {
      ...drill,
      keystrokes,
      doneChars,
      charIdx: next,
      drillStart: null,
      result: {
        wpm: speed(doneChars, ms),
        acc: accuracy(keystrokes, drill.errors),
        errors: drill.errors,
        ms,
        chars: doneChars,
      },
    },
    outcome: "finished",
  };
}
