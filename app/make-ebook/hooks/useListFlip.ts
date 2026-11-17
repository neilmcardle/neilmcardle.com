import { useLayoutEffect, useRef, type RefObject } from "react";
import { EASE_OUT, reducedMotion } from "../utils/motion";

const MOVE_MS = 240;

export function useListFlip(
  listRef: RefObject<HTMLElement | null>,
  ids: readonly string[],
) {
  const last = useRef<Map<string, number>>(new Map());
  const key = ids.join("|");

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const rows = [...list.querySelectorAll<HTMLElement>("[data-flip-id]")];
    const now = new Map(
      rows.map((row) => [row.dataset.flipId ?? "", row.offsetTop]),
    );
    const before = last.current;
    last.current = now;
    if (!before.size || reducedMotion()) return;
    const shared = [...now.keys()].some((id) => before.has(id));
    if (!shared) return;
    for (const row of rows) {
      const id = row.dataset.flipId ?? "";
      const was = before.get(id);
      const is = now.get(id) ?? 0;
      if (was === undefined) {
        row.animate(
          [
            { opacity: 0, transform: "translateY(-4px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: MOVE_MS, easing: EASE_OUT },
        );
      } else if (was !== is) {
        row.animate(
          [{ transform: `translateY(${was - is}px)` }, { transform: "none" }],
          { duration: MOVE_MS, easing: EASE_OUT },
        );
      }
    }
  }, [listRef, key]);
}
