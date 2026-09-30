export interface SandboxExample {
  title: string;
  html: string;
  css: string;
  caption?: string;
  height?: number;
}

export const SANDBOXES: Record<string, SandboxExample> = {
  "flex-toolbar": {
    title: "Try it: the toolbar",
    caption:
      "Change justify-content to flex-start, center or space-around. Change align-items to flex-start. Add flex-direction: column and watch the two swap jobs.",
    height: 300,
    html: `<div class="toolbar">
  <strong>Chapter one</strong>
  <button>Save</button>
  <button>Publish</button>
</div>`,
    css: `.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;

  padding: 12px 16px;
  border: 1px solid #d8d8d4;
  border-radius: 8px;
  background: #fff;
}`,
  },
  "flex-sidebar": {
    title: "Try it: the sidebar recipe",
    caption:
      "Change the 240px to 320px, or give .main a flex of 2. The main column always takes whatever is left.",
    height: 300,
    html: `<div class="page">
  <aside class="sidebar">sidebar</aside>
  <main class="main">main column</main>
</div>`,
    css: `.page {
  display: flex;
  gap: 16px;
}

.sidebar {
  flex: 0 0 240px;
}

.main {
  flex: 1;
}

.sidebar, .main {
  padding: 24px 16px;
  border-radius: 8px;
  background: #e7e7e3;
}`,
  },
  "line-height": {
    title: "Try it: number against length",
    caption:
      "Change 1.6 to 1.6rem on the body. The paragraph does not move at all, because 16 times 1.6 was already 25.6px. The heading inherits that same 25.6px instead of working out its own 51.2px, and its two lines collide.",
    height: 320,
    html: `<h1>A heading long enough to wrap onto a second line</h1>
<p>A paragraph at the base size, so you can watch what happens to it while the heading changes.</p>`,
    css: `body {
  line-height: 1.6;
  max-width: 340px;
}

h1 {
  font-size: 32px;
  margin: 0 0 16px;
}

p {
  font-size: 16px;
  margin: 0;
}`,
  },
  "grid-gallery": {
    title: "Try it: the gallery",
    caption:
      "Swap 1fr 1fr 1fr for 240px 1fr, or for repeat(auto-fill, minmax(140px, 1fr)) and resize the window.",
    height: 320,
    html: `<div class="gallery">
  <div class="tile">1</div>
  <div class="tile">2</div>
  <div class="tile">3</div>
  <div class="tile">4</div>
  <div class="tile">5</div>
  <div class="tile">6</div>
</div>`,
    css: `.gallery {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.tile {
  padding: 28px 0;
  border-radius: 8px;
  background: #e7e7e3;
  text-align: center;
}`,
  },
};
