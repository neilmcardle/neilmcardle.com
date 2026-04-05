export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  category: string;
  keywords: string[];
  content: string; // HTML content
}

export const posts: BlogPost[] = [
  {
    slug: 'how-to-write-an-ebook',
    title: 'How to Write an Ebook: Complete Beginner\'s Guide [2026]',
    description: 'Learn how to write, format, and publish your first ebook step by step. From outline to published EPUB — everything a beginner needs to know.',
    date: '2026-04-05',
    readingTime: '12 min read',
    category: 'Getting Started',
    keywords: ['how to write an ebook', 'ebook writing guide', 'write ebook', 'ebook for beginners'],
    content: `
      <p class="lead">Writing an ebook has never been more accessible. Whether you're a first-time author or an experienced writer exploring self-publishing, this guide walks you through every step — from idea to published EPUB.</p>

      <h2>1. Choose Your Topic</h2>
      <p>The best ebook topics sit at the intersection of what you know, what you're passionate about, and what readers are searching for. Start by listing 10 topics you could write about confidently, then research which ones have an audience.</p>
      <p>Don't overthink this step. Your first ebook doesn't need to be your magnum opus — it needs to be useful to a specific reader.</p>

      <h2>2. Outline Your Chapters</h2>
      <p>An outline is the skeleton of your ebook. Break your topic into 8–15 chapters, each covering one distinct idea. Think of each chapter as answering one question your reader has.</p>
      <p>A simple structure works best:</p>
      <ul>
        <li><strong>Introduction</strong> — Set expectations and hook the reader</li>
        <li><strong>Chapters 1–3</strong> — Foundation concepts</li>
        <li><strong>Chapters 4–8</strong> — Core content and actionable advice</li>
        <li><strong>Chapters 9–10</strong> — Advanced tips or case studies</li>
        <li><strong>Conclusion</strong> — Recap and next steps</li>
      </ul>

      <h2>3. Write Your First Draft</h2>
      <p>The first draft is about getting words on the page — not perfection. Set a daily word count goal (500–1,000 words is realistic) and write consistently. Most ebooks are 10,000–30,000 words, so at 500 words per day, you'll have a draft in 3–8 weeks.</p>
      <p>Use a distraction-free writing tool that lets you focus on one chapter at a time. Drag-and-drop chapter management helps you reorganise as your ideas evolve.</p>

      <h2>4. Edit and Polish</h2>
      <p>Editing is where good writing becomes great. Do at least three passes:</p>
      <ol>
        <li><strong>Structural edit</strong> — Does the flow make sense? Are chapters in the right order?</li>
        <li><strong>Line edit</strong> — Tighten sentences, cut filler, improve clarity</li>
        <li><strong>Proofread</strong> — Catch typos, grammar issues, and formatting inconsistencies</li>
      </ol>
      <p>AI-powered manuscript analysis tools can help catch inconsistencies across chapters — like a character's eye colour changing or contradictory advice.</p>

      <h2>5. Format for Publishing</h2>
      <p>Your ebook needs to be in EPUB format for most platforms (Amazon KDP, Apple Books, Kobo, Google Play Books). EPUB is the universal standard for ebooks — it's responsive, accessible, and works on every e-reader.</p>
      <p>Good formatting means:</p>
      <ul>
        <li>A working table of contents</li>
        <li>Consistent typography (font, spacing, margins)</li>
        <li>Proper chapter breaks</li>
        <li>A professional cover image</li>
        <li>Correct metadata (title, author, language, description)</li>
      </ul>

      <h2>6. Design Your Cover</h2>
      <p>Readers absolutely judge books by their covers. Your cover needs to:</p>
      <ul>
        <li>Be legible at thumbnail size (this is how most readers first see it)</li>
        <li>Communicate the genre or topic at a glance</li>
        <li>Look professional — amateur covers kill sales</li>
      </ul>
      <p>If design isn't your strength, invest in a professional cover. It's the single highest-ROI investment for a self-published ebook.</p>

      <h2>7. Export and Publish</h2>
      <p>Once your manuscript is polished and formatted, export it as an EPUB file. Upload to your chosen platforms:</p>
      <ul>
        <li><strong>Amazon KDP</strong> — The largest ebook marketplace (70% royalty on $2.99–$9.99 titles)</li>
        <li><strong>Apple Books</strong> — Strong in premium/non-fiction categories</li>
        <li><strong>Kobo</strong> — Popular internationally, especially in Canada and Europe</li>
        <li><strong>Google Play Books</strong> — Growing marketplace with global reach</li>
      </ul>
      <p>You can publish on all of these simultaneously — there's no exclusivity requirement unless you opt into Amazon's KDP Select programme.</p>

      <h2>8. Launch and Market</h2>
      <p>Publishing is only the beginning. Promote your ebook through:</p>
      <ul>
        <li>Your email list (start building one now if you haven't)</li>
        <li>Social media — share excerpts, behind-the-scenes, and launch updates</li>
        <li>Writing communities — r/selfpublish, writing Facebook groups, author forums</li>
        <li>A launch price promotion — temporarily pricing at $0.99 drives initial reviews</li>
      </ul>

      <h2>Start Writing Today</h2>
      <p>The hardest part of writing an ebook is starting. You don't need expensive software or a publishing deal — just a tool that gets out of your way and lets you write.</p>
      <p>makeEbook is a free, browser-based ebook editor that lets you write, organise chapters, and export professional EPUB files in minutes. No installation, no learning curve — just open your browser and start writing.</p>
    `,
  },
  {
    slug: 'best-ebook-creation-tools',
    title: 'Best Ebook Creation Tools [2026]: Detailed Comparison',
    description: 'Compare the top ebook creation tools for self-publishing authors. Scrivener vs Atticus vs Vellum vs makeEbook — features, pricing, and which is right for you.',
    date: '2026-04-05',
    readingTime: '10 min read',
    category: 'Tools & Comparisons',
    keywords: ['best ebook creation tools', 'ebook writing software', 'ebook creator', 'Scrivener alternative'],
    content: `
      <p class="lead">Choosing the right ebook creation tool can make the difference between a frustrating process and a smooth path to publication. Here's an honest comparison of the best options in 2026.</p>

      <h2>What to Look For in an Ebook Tool</h2>
      <p>Before comparing specific tools, here's what actually matters:</p>
      <ul>
        <li><strong>EPUB export quality</strong> — Does it produce clean, valid EPUB files?</li>
        <li><strong>Ease of use</strong> — How steep is the learning curve?</li>
        <li><strong>Chapter management</strong> — Can you easily organise and reorder content?</li>
        <li><strong>Typography control</strong> — Can you customise fonts, spacing, and styling?</li>
        <li><strong>Price</strong> — One-time vs subscription, and what's included in free tiers?</li>
        <li><strong>Platform</strong> — Desktop, browser, or both?</li>
      </ul>

      <h2>Scrivener</h2>
      <p><strong>Best for:</strong> Writers who want a comprehensive, desktop-based writing environment.</p>
      <p>Scrivener is the veteran of the writing software world. It's incredibly powerful — research folders, corkboard view, detailed compile settings — but that power comes with complexity. Most new users spend weeks learning the interface before they're productive.</p>
      <ul>
        <li><strong>Price:</strong> $49 one-time (Mac/Windows)</li>
        <li><strong>EPUB export:</strong> Yes, via Compile (complex setup)</li>
        <li><strong>Platform:</strong> Desktop only (Mac, Windows, iOS)</li>
        <li><strong>Learning curve:</strong> Steep</li>
      </ul>
      <p><strong>Verdict:</strong> Excellent for experienced writers who need deep organisation features. Overkill for most ebook projects.</p>

      <h2>Atticus</h2>
      <p><strong>Best for:</strong> Authors who want formatting and writing in one tool.</p>
      <p>Atticus positions itself as the all-in-one solution — write and format in the same app. It has a clean interface and produces good-looking output. The main drawback is price: $225 for the base tier is a significant investment for a first-time author.</p>
      <ul>
        <li><strong>Price:</strong> $225–$375 one-time</li>
        <li><strong>EPUB export:</strong> Yes</li>
        <li><strong>Platform:</strong> Browser-based (with desktop app)</li>
        <li><strong>Learning curve:</strong> Moderate</li>
      </ul>
      <p><strong>Verdict:</strong> Solid choice if you're willing to invest upfront. The price is hard to justify for beginners.</p>

      <h2>Vellum</h2>
      <p><strong>Best for:</strong> Mac users who want stunning, design-forward ebooks.</p>
      <p>Vellum produces arguably the best-looking ebooks of any tool. The typography and layout options are beautiful. The catch: it's Mac only, and it's not cheap.</p>
      <ul>
        <li><strong>Price:</strong> $199 one-time (ebooks only), $249 (ebooks + print)</li>
        <li><strong>EPUB export:</strong> Yes (excellent quality)</li>
        <li><strong>Platform:</strong> Mac only</li>
        <li><strong>Learning curve:</strong> Low-moderate</li>
      </ul>
      <p><strong>Verdict:</strong> If you're on Mac and willing to pay, Vellum is hard to beat for pure output quality. But it's not accessible to Windows/Linux users or budget-conscious authors.</p>

      <h2>Reedsy Book Editor</h2>
      <p><strong>Best for:</strong> Authors who want a free, no-frills web editor.</p>
      <p>Reedsy's editor is free and browser-based. It's simple and produces clean output. The limitations: no AI features, limited typography options, and it's part of the broader Reedsy marketplace (which may or may not be useful to you).</p>
      <ul>
        <li><strong>Price:</strong> Free</li>
        <li><strong>EPUB export:</strong> Yes</li>
        <li><strong>Platform:</strong> Browser</li>
        <li><strong>Learning curve:</strong> Low</li>
      </ul>
      <p><strong>Verdict:</strong> Good free option, but limited features for authors who want more control.</p>

      <h2>makeEbook</h2>
      <p><strong>Best for:</strong> Authors who want a simple, modern tool with AI features and free EPUB export.</p>
      <p>makeEbook is a browser-based ebook editor that focuses on simplicity without sacrificing professional output. The free tier includes full EPUB and PDF export — something most competitors charge for. The Pro tier adds AI-powered manuscript analysis (Book Mind), cloud sync, and version history.</p>
      <ul>
        <li><strong>Price:</strong> Free (full export), $9/month Pro, $149 Lifetime</li>
        <li><strong>EPUB export:</strong> Yes (free tier)</li>
        <li><strong>Platform:</strong> Browser (works offline as PWA)</li>
        <li><strong>Learning curve:</strong> Very low</li>
        <li><strong>Unique features:</strong> AI manuscript analysis, offline PWA, multi-language/RTL support</li>
      </ul>
      <p><strong>Verdict:</strong> The best option for beginners and authors who want to start writing immediately without a financial commitment. The AI features in the Pro tier add genuine value for manuscript polishing.</p>

      <h2>Comparison Table</h2>
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Scrivener</th>
            <th>Atticus</th>
            <th>Vellum</th>
            <th>Reedsy</th>
            <th>makeEbook</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Free EPUB export</td><td>No</td><td>No</td><td>No</td><td>Yes</td><td>Yes</td></tr>
          <tr><td>Browser-based</td><td>No</td><td>Yes</td><td>No</td><td>Yes</td><td>Yes</td></tr>
          <tr><td>Works offline</td><td>Yes</td><td>No</td><td>Yes</td><td>No</td><td>Yes</td></tr>
          <tr><td>AI features</td><td>No</td><td>No</td><td>No</td><td>No</td><td>Yes</td></tr>
          <tr><td>Starting price</td><td>$49</td><td>$225</td><td>$199</td><td>Free</td><td>Free</td></tr>
          <tr><td>Learning curve</td><td>Steep</td><td>Moderate</td><td>Low-mod</td><td>Low</td><td>Very low</td></tr>
        </tbody>
      </table>

      <h2>Our Recommendation</h2>
      <p>If you're just starting out, don't spend hundreds of dollars on software before you've written your first chapter. Start with a free tool that produces professional output, and upgrade later if you need advanced features.</p>
      <p>makeEbook lets you start writing in seconds — no download, no signup required for the free tier. Write your book, export a professional EPUB, and publish to Amazon KDP, Apple Books, or any platform.</p>
    `,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find(p => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
