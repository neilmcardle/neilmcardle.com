import { SECTION_ORDER } from "./catalog";
import { modeOf, type Design, type Element, type Section } from "./types";

export type Placement = "end" | "start" | "before" | "after";

export function findElement(
  design: Design,
  id: string | null | undefined,
): Element | undefined {
  return id ? design.elements.find((e) => e.id === id) : undefined;
}

export function sectionOf(design: Design, section: Section): Element[] {
  return design.elements.filter((e) => e.section === section);
}

export function insertElement(
  design: Design,
  el: Element,
  placement: Placement = "end",
  anchorId?: string | null,
): Design {
  const list = design.elements.filter((e) => e.id !== el.id);
  const anchor = anchorId ? list.find((e) => e.id === anchorId) : undefined;

  let index: number;
  if (anchor && (placement === "before" || placement === "after")) {
    el = { ...el, section: anchor.section };
    const i = list.indexOf(anchor);
    index = placement === "before" ? i : i + 1;
  } else {
    const inSection = list.filter((e) => e.section === el.section);
    if (placement === "start" && inSection.length) {
      index = list.indexOf(inSection[0]);
    } else if (inSection.length) {
      index = list.indexOf(inSection[inSection.length - 1]) + 1;
    } else {
      const order: Section[] = SECTION_ORDER[modeOf(design)];
      const after = order.slice(order.indexOf(el.section) + 1);
      const next = list.findIndex((e) => after.includes(e.section));
      index = next === -1 ? list.length : next;
    }
  }

  const elements = [...list.slice(0, index), el, ...list.slice(index)];
  return { ...design, elements };
}

export function removeElement(design: Design, id: string): Design {
  return { ...design, elements: design.elements.filter((e) => e.id !== id) };
}

export function updateElement(
  design: Design,
  id: string,
  patch: Partial<Element>,
): Design {
  return {
    ...design,
    elements: design.elements.map((e) =>
      e.id === id ? { ...e, ...patch, id: e.id, kind: e.kind } : e,
    ),
  };
}

export function moveElement(
  design: Design,
  id: string,
  section: Section,
  placement: Placement,
  anchorId?: string | null,
): Design {
  const el = findElement(design, id);
  if (!el) return design;
  return insertElement(
    design,
    { ...el, section },
    placement,
    anchorId === id ? null : anchorId,
  );
}

export function changedIds(before: Design, after: Design): string[] {
  const prev = new Map(before.elements.map((e) => [e.id, JSON.stringify(e)]));
  const common = (list: Element[]) =>
    list
      .map((e) => e.id)
      .filter((id) => prev.has(id) && after.elements.some((a) => a.id === id));
  const beforeOrder = common(before.elements);
  const afterOrder = common(after.elements);
  const predecessor = (order: string[], id: string) =>
    order[order.indexOf(id) - 1];

  return after.elements
    .filter((e) => {
      const was = prev.get(e.id);
      if (was === undefined || was !== JSON.stringify(e)) return true;
      return predecessor(beforeOrder, e.id) !== predecessor(afterOrder, e.id);
    })
    .map((e) => e.id);
}
