import { useLayoutEffect, type RefObject } from "react";

export function useSlidingPill(
  groupRef: RefObject<HTMLElement | null>,
  activeIndex: number,
) {
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const place = () => {
      const items = group.querySelectorAll<HTMLElement>("[data-pill-item]");
      const item = items[activeIndex];
      if (!item) {
        group.style.setProperty("--pill-o", "0");
        return;
      }
      const inner = group.clientWidth;
      const pad = parseFloat(getComputedStyle(group).paddingLeft) || 0;
      group.style.setProperty("--pill-o", "1");
      group.style.setProperty("--pill-l", `${item.offsetLeft - pad}px`);
      group.style.setProperty(
        "--pill-r",
        `${inner - pad - (item.offsetLeft + item.offsetWidth)}px`,
      );
    };
    place();
    if (!group.dataset.pillReady) {
      requestAnimationFrame(() => {
        group.dataset.pillReady = "1";
      });
    }
    const observer = new ResizeObserver(place);
    observer.observe(group);
    return () => observer.disconnect();
  }, [groupRef, activeIndex]);
}
