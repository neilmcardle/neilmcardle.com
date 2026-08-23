export function scrollContainer(from: HTMLElement): HTMLElement | Window {
  let node = from.parentElement;

  while (node) {
    const overflow = getComputedStyle(node).overflowY;
    if (
      (overflow === "auto" || overflow === "scroll") &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
    node = node.parentElement;
  }

  return window;
}
