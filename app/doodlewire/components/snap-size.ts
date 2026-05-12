import type { ElementType, WfElement } from "./wireframe-canvas";

type Bbox = WfElement["bbox"];

// Snap a recognised doodle bbox to a standard, well-proportioned size for
// its component type. Anchored top-left for flowable elements, centred at
// the doodle's centroid for icon-like fixed-size elements.
export function snapToStandard(type: ElementType, bbox: Bbox): Bbox {
  const cx = bbox.x + bbox.w / 2;
  const cy = bbox.y + bbox.h / 2;
  const drawnMaxDim = Math.max(bbox.w, bbox.h);

  function centred(w: number, h: number): Bbox {
    return { x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w, h };
  }

  // Centred element whose size tracks the user's drawing within a range.
  // Square aspect: the larger of width or height drives the side. Use
  // for icon-buttons, avatars, checkboxes, etc.
  function centredSquare(min: number, max: number): Bbox {
    const side = Math.round(clamp(drawnMaxDim, min, max));
    return { x: Math.round(cx - side / 2), y: Math.round(cy - side / 2), w: side, h: side };
  }

  function flow(w: number, h: number): Bbox {
    return { x: Math.round(bbox.x), y: Math.round(bbox.y), w, h };
  }

  function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v));
  }

  switch (type) {
    case "button":
      return flow(clamp(Math.round(bbox.w), 96, 240), 40);
    case "input":
      return flow(clamp(Math.round(bbox.w), 180, 360), 40);
    case "textarea":
      return flow(clamp(Math.round(bbox.w), 220, 480), clamp(Math.round(bbox.h), 80, 240));
    case "checkbox":
      return centredSquare(16, 24);
    case "radio":
      return centredSquare(16, 24);
    case "toggle": {
      const w = Math.round(clamp(bbox.w, 36, 56));
      const h = Math.round(clamp(w * 0.55, 20, 32));
      return { x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w, h };
    }
    case "heading":
      return flow(clamp(Math.round(bbox.w), 160, 560), 44);
    case "paragraph":
      return flow(clamp(Math.round(bbox.w), 240, 520), clamp(Math.round(bbox.h), 56, 200));
    case "image":
      return flow(clamp(Math.round(bbox.w), 120, 480), clamp(Math.round(bbox.h), 90, 360));
    case "container":
      return flow(Math.max(160, Math.round(bbox.w)), Math.max(120, Math.round(bbox.h)));
    case "card":
      return flow(clamp(Math.round(bbox.w), 280, 480), clamp(Math.round(bbox.h), 160, 320));
    case "divider":
      return flow(clamp(Math.round(bbox.w), 120, 480), 2);
    case "nav":
      return flow(clamp(Math.round(bbox.w), 280, 720), 48);
    case "avatar":
      return centredSquare(32, 64);
    case "icon":
      return centredSquare(20, 32);
    case "link":
      return flow(clamp(Math.round(bbox.w), 60, 220), 24);
    case "badge":
      return flow(clamp(Math.round(bbox.w), 48, 160), 22);
    case "dropdown":
      return flow(clamp(Math.round(bbox.w), 160, 320), 40);
    case "menu":
      return centredSquare(40, 64);
    default:
      return bbox;
  }
}
