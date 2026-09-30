export interface FinishedBuild {
  title: string;
  checks: string[];
  html: string;
  css: string;
  js?: string;
  note?: string;
  height?: number;
}

export const BUILDS: Record<string, FinishedBuild> = {
  "type-specimen": {
    title: "Type specimen page",
    height: 460,
    checks: [
      "One h1 on the page, and headings that step down in order without skipping a level",
      "Every input has a label connected with for and id, so clicking the words focuses the field",
      "Navigation sits in a nav element, and the list is a ul of links",
      'The SVG uses fill="currentColor", so it takes its colour from the text around it',
      "Landmarks are used for structure: header, nav, main, aside, footer",
    ],
    note: "Everything here is structure. The only styling is type, spacing and a couple of rules, which is the point of the exercise.",
    html: `<header>
  <h1>Berkeley Mono Specimen</h1>
  <nav>
    <ul>
      <li><a href="#scale">Scale</a></li>
      <li><a href="#controls">Controls</a></li>
      <li><a href="#notes">Notes</a></li>
    </ul>
  </nav>
</header>

<main>
  <section id="scale">
    <h2>The scale</h2>
    <h3>A third level heading</h3>
    <p>Body text sits at the base size. A specimen page exists to show how the sizes behave next to each other, so keep real sentences in it rather than filler.</p>
    <p>A second paragraph shows the space between blocks of text, which is as much a part of the specimen as the sizes.</p>
  </section>

  <section id="controls">
    <h2>Controls</h2>
    <form>
      <label for="name">Your name</label>
      <input id="name" name="name" type="text" placeholder="Ada Lovelace" />

      <label for="size">Preferred size</label>
      <select id="size" name="size">
        <option>Small</option>
        <option selected>Regular</option>
        <option>Large</option>
      </select>

      <button type="button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/>
        </svg>
        Save preference
      </button>
    </form>
  </section>

  <aside id="notes">
    <h2>Notes</h2>
    <p>An aside holds content related to the page but not part of its main thread.</p>
  </aside>
</main>

<footer>
  <p>Set in Georgia. Written by hand.</p>
</footer>`,
    css: `body {
  font-family: Georgia, serif;
  line-height: 1.6;
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px;
  color: #333;
}

header {
  border-bottom: 1px solid #ccc;
  padding-bottom: 16px;
  margin-bottom: 32px;
}

h1 { font-size: 40px; line-height: 1.15; margin: 0 0 12px; }
h2 { font-size: 24px; margin: 32px 0 8px; }
h3 { font-size: 18px; margin: 20px 0 8px; }
p  { margin: 0 0 12px; }

nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 24px;
}

a { color: #0066cc; text-decoration: none; }
a:hover { text-decoration: underline; }

form {
  display: grid;
  gap: 6px;
  max-width: 320px;
}

label { font-size: 14px; }

input, select {
  font: inherit;
  padding: 6px 8px;
  border: 1px solid #bbb;
  border-radius: 4px;
}

button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-self: start;
  margin-top: 12px;
  padding: 8px 14px;
  border: 1px solid #333;
  border-radius: 4px;
  background: #333;
  color: #fff;
  font: inherit;
  font-size: 15px;
  cursor: pointer;
}

aside {
  margin-top: 32px;
  padding-left: 16px;
  border-left: 3px solid #ddd;
}

footer {
  margin-top: 40px;
  padding-top: 16px;
  border-top: 1px solid #ccc;
  font-size: 14px;
  color: #666;
}`,
  },

  "pricing-card": {
    title: "Pricing card, with one transition",
    height: 460,
    checks: [
      "The badge is 12px, uppercase, medium weight and muted",
      "The amount is 48px, the currency 18px and the billing period 14px, all sitting on one baseline",
      "Features are 14px and line up with their markers, not with the text above them",
      "Hover deepens the shadow and lifts the card by 4px over 200ms, and nothing else moves",
      "The transition is switched off under prefers-reduced-motion",
    ],
    note: "Hover the card to see the only piece of motion in it. The measurements are the work here, not the markup.",
    html: `<article class="card">
  <p class="badge">Most popular</p>
  <h2 class="headline">Studio</h2>
  <p class="price">
    <span class="currency">$</span><span class="amount">24</span><span class="period">/month</span>
  </p>
  <ul class="features">
    <li>Unlimited projects</li>
    <li>Version history</li>
    <li>Shared component library</li>
    <li>Priority support</li>
  </ul>
  <button class="cta" type="button">Start free trial</button>
</article>`,
    css: `body {
  display: grid;
  place-items: center;
  min-height: 100%;
  background: #f5f5f4;
}

.card {
  width: 320px;
  padding: 28px 24px;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition:
    box-shadow 200ms ease-out,
    transform 200ms ease-out;
}

.card:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.badge {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #78716c;
}

.headline {
  margin: 0 0 16px;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  color: #1c1917;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin: 0 0 20px;
  color: #1c1917;
}

.currency { font-size: 18px; font-weight: 600; }
.amount { font-size: 48px; font-weight: 700; line-height: 1; }
.period { font-size: 14px; color: #78716c; margin-left: 4px; }

.features {
  margin: 0 0 24px;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
  font-size: 14px;
  color: #44403c;
}

.features li {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr);
  gap: 8px;
}

.features li::before {
  content: "";
  width: 6px;
  height: 6px;
  margin-top: 7px;
  border-radius: 999px;
  background: #0f766e;
}

.cta {
  width: 100%;
  padding: 12px;
  border: 0;
  border-radius: 8px;
  background: #0f766e;
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
}`,
  },

  "live-search": {
    title: "Live search filter",
    height: 380,
    checks: [
      "Typing filters as you go, with no button to press",
      "The comparison is case insensitive and ignores spaces either side of what was typed",
      "The empty message shows only when nothing matched, and is hidden otherwise",
      "The list is rebuilt from the array each time rather than items being hidden with CSS",
      "The input has a label, and the results are announced when the count changes",
    ],
    note: "Try emptying the field, typing a capital letter, and typing a space before a name.",
    html: `<label for="search">Search users</label>
<input id="search" type="search" placeholder="Try a name" />
<ul id="results" aria-live="polite"></ul>
<p id="empty" hidden>No users found</p>`,
    css: `body { max-width: 360px; }

label { display: block; margin-bottom: 6px; font-size: 14px; }

input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #bbb;
  border-radius: 6px;
  font: inherit;
}

ul { margin: 16px 0 0; padding-left: 20px; }
li { margin-bottom: 6px; }

#empty { margin-top: 16px; color: #78716c; }`,
    js: `const users = [
  { id: 1, name: "Ada Lovelace" },
  { id: 2, name: "Grace Hopper" },
  { id: 3, name: "Alan Turing" },
  { id: 4, name: "Katherine Johnson" },
];

const input = document.querySelector("#search");
const list = document.querySelector("#results");
const empty = document.querySelector("#empty");

function render(query) {
  const term = query.trim().toLowerCase();
  const matches = users.filter((user) =>
    user.name.toLowerCase().includes(term),
  );

  list.innerHTML = matches.map((user) => "<li>" + user.name + "</li>").join("");
  empty.hidden = matches.length > 0;
}

input.addEventListener("input", (event) => render(event.target.value));
render("");`,
  },
};
