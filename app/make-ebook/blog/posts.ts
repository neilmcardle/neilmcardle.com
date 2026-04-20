export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** ISO date string for when the post was first published. */
  date: string;
  /**
   * ISO date string for the last meaningful update. Used by the byline
   * ("Updated April 2026") and the Article JSON-LD `dateModified` field.
   * Defaults to `date` when omitted.
   */
  updatedDate?: string;
  readingTime: string;
  category: string;
  keywords: string[];
  content: string; // HTML content
  /**
   * Optional FAQ section. Renders as visible HTML at the end of the post
   * and emits FAQPage JSON-LD for rich results on "People Also Ask" queries.
   */
  faqs?: { q: string; a: string }[];
  /**
   * Optional hero illustration. Path relative to /public, e.g.
   * "/blog/how-to-write-an-ebook.png". Renders above the post header and
   * overrides the default OG card image for richer social previews.
   * When absent, the default site social image is used.
   */
  image?: string;
  /** Alt text for the hero illustration. */
  imageAlt?: string;
}

export const posts: BlogPost[] = [
  {
    slug: 'how-to-write-an-ebook',
    title: 'How to Write an Ebook: Complete Beginner\'s Guide',
    description: 'Learn how to write, format, and publish your first ebook step by step. From outline to published EPUB, everything a beginner needs to know.',
    date: '2026-04-05',
    updatedDate: '2026-04-20',
    readingTime: '14 min read',
    category: 'Getting Started',
    keywords: [
      'how to write an ebook',
      'ebook writing guide',
      'write ebook',
      'ebook for beginners',
      'self-publishing guide',
      'EPUB formatting',
    ],
    // image: '/blog/how-to-write-an-ebook.png',
    // imageAlt: 'Ink drawing of a fountain pen mid-stroke with a single ink blot forming below the nib.',
    content: `
      <p class="lead">Writing an ebook has never been more accessible. Whether you're a first-time author or an experienced writer exploring self-publishing, this guide walks you through every step, from idea to published EPUB.</p>

      <h2>1. Choose Your Topic</h2>
      <p>The best ebook topics sit at the intersection of what you know, what you're passionate about, and what readers are searching for. Start by listing 10 topics you could write about confidently, then research which ones have an audience.</p>
      <p>Don't overthink this step. Your first ebook doesn't need to be your magnum opus. It needs to be useful to a specific reader.</p>
      <h3>Finding your angle</h3>
      <p>Run your shortlist through three questions: Who specifically is this for? What transformation does it promise? Why are you the right person to write it? If you can answer all three in one sentence, the topic is ready.</p>

      <h2>2. Outline Your Chapters</h2>
      <p>An outline is the skeleton of your ebook. Break your topic into 8 to 15 chapters, each covering one distinct idea. Think of each chapter as answering one question your reader has.</p>
      <p>A simple structure works best:</p>
      <ul>
        <li><strong>Introduction.</strong> Set expectations and hook the reader.</li>
        <li><strong>Chapters 1 to 3.</strong> Foundation concepts.</li>
        <li><strong>Chapters 4 to 8.</strong> Core content and actionable advice.</li>
        <li><strong>Chapters 9 to 10.</strong> Advanced tips or case studies.</li>
        <li><strong>Conclusion.</strong> Recap and next steps.</li>
      </ul>

      <h2>3. Write Your First Draft</h2>
      <p>The first draft is about getting words on the page, not perfection. Set a daily word count goal of 500 to 1,000 words and write consistently. Most ebooks are 10,000 to 30,000 words, so at 500 words per day you'll have a draft in 3 to 8 weeks.</p>
      <h3>A writing tool that stays out of your way</h3>
      <p>Use a distraction-free writing tool that lets you focus on one chapter at a time. Drag-and-drop chapter management helps you reorganise as your ideas evolve. <a href="/make-ebook">makeEbook</a> is built around this: a clean editor, chapter list on the side, and no menus clamouring for your attention.</p>

      <h2>4. Edit and Polish Your Manuscript</h2>
      <p>Editing is where good writing becomes great. Do at least three passes:</p>
      <ol>
        <li><strong>Structural edit.</strong> Does the flow make sense? Are chapters in the right order?</li>
        <li><strong>Line edit.</strong> Tighten sentences, cut filler, improve clarity.</li>
        <li><strong>Proofread.</strong> Catch typos, grammar issues, and formatting inconsistencies.</li>
      </ol>
      <p>AI-powered manuscript analysis tools can help catch inconsistencies across chapters, like a character's eye colour changing or contradictory advice. Book Mind, makeEbook's editorial assistant, reads your entire manuscript and surfaces issues a human editor would flag.</p>

      <h2>5. Format Your Ebook for EPUB Publishing</h2>
      <p>Your ebook needs to be in EPUB format for most platforms (Amazon KDP, Apple Books, Kobo, Google Play Books). EPUB is the universal standard for ebooks. It's responsive, accessible, and works on every e-reader.</p>
      <p>Good EPUB formatting means:</p>
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
        <li>Look professional. Amateur covers kill sales.</li>
      </ul>
      <p>If design isn't your strength, invest in a professional cover. It's the single highest-ROI investment for a self-published ebook.</p>

      <h2>7. Export and Publish to Kindle, Apple Books, and Kobo</h2>
      <p>Once your manuscript is polished and formatted, export it as an EPUB file. Upload to your chosen platforms:</p>
      <ul>
        <li><strong>Amazon KDP.</strong> The largest ebook marketplace (70% royalty on $2.99 to $9.99 titles).</li>
        <li><strong>Apple Books.</strong> Strong in premium and non-fiction categories.</li>
        <li><strong>Kobo.</strong> Popular internationally, especially in Canada and Europe.</li>
        <li><strong>Google Play Books.</strong> Growing marketplace with global reach.</li>
      </ul>
      <p>You can publish on all of these simultaneously. There's no exclusivity requirement unless you opt into Amazon's KDP Select programme.</p>
      <p>Picking the right ebook creation tool is half the battle here. Our <a href="/make-ebook/blog/best-ebook-creation-tools">detailed comparison of the best ebook creation tools</a> walks through Scrivener, Vellum, Atticus, and makeEbook side by side.</p>

      <h2>8. Launch and Market Your Ebook</h2>
      <p>Publishing is only the beginning. Promote your ebook through:</p>
      <ul>
        <li>Your email list (start building one now if you haven't)</li>
        <li>Social media: share excerpts, behind-the-scenes, and launch updates</li>
        <li>Writing communities: r/selfpublish, writing Facebook groups, author forums</li>
        <li>A launch price promotion: temporarily pricing at $0.99 drives initial reviews</li>
      </ul>

      <h2>Common Mistakes to Avoid</h2>
      <p>The same pitfalls trip up most first-time authors. Knowing them in advance is half the battle.</p>
      <ul>
        <li><strong>Starting without an outline.</strong> Writing blind sounds romantic but almost always stalls by chapter four. Spend a day on structure before day one of the draft.</li>
        <li><strong>Skipping the second edit.</strong> One pass catches the obvious. The second pass is where the book actually improves.</li>
        <li><strong>Ignoring EPUB validation.</strong> A file that "looks fine" can still be rejected by Amazon KDP. Use a tool that validates on export.</li>
        <li><strong>Underinvesting in the cover.</strong> You'll spend months writing the book. Spend a weekend (or a hundred dollars) on a cover that does it justice.</li>
        <li><strong>Publishing before proofreading.</strong> Early reviews are permanent. Typos in the first chapter show up in Look Inside and kill conversions.</li>
      </ul>

      <h2>Start Writing Today</h2>
      <p>The hardest part of writing an ebook is starting. You don't need expensive software or a publishing deal. You need a tool that gets out of your way and lets you write.</p>
      <p><a href="/make-ebook">makeEbook</a> is a free, browser-based ebook editor that lets you write, organise chapters, and export professional EPUB files in minutes. No installation, no learning curve. Open your browser and start writing.</p>
    `,
    faqs: [
      {
        q: 'How long does it take to write an ebook?',
        a: 'Most first-time authors finish a draft in 2 to 3 months writing 500 words a day. A 20,000-word ebook takes about 40 writing days at that pace. Editing adds another 4 to 6 weeks.',
      },
      {
        q: 'How many words should an ebook be?',
        a: 'Most non-fiction ebooks land between 15,000 and 40,000 words. Fiction ebooks typically run 50,000 to 90,000 words. Shorter ebooks (under 10,000 words) work for tight, focused guides but are hard to price competitively.',
      },
      {
        q: 'Do I need an editor to self-publish an ebook?',
        a: 'A professional editor is a strong investment if the budget allows, especially for fiction. If not, do three self-edit passes (structural, line, proofread) and pair them with AI manuscript analysis to catch inconsistencies a single pair of eyes will miss.',
      },
      {
        q: 'What format does Amazon KDP require?',
        a: 'Amazon KDP accepts EPUB as the preferred format for ebooks. KDP also accepts .docx, but EPUB gives you proper chapter structure, working navigation, and predictable typography on Kindle devices.',
      },
      {
        q: 'Can I write an ebook without expensive design software?',
        a: 'Yes. A browser-based editor like makeEbook handles writing, chapter management, and EPUB export at no cost. For the cover, free tools like Canva cover the basics, though a professional cover is worth the investment for serious releases.',
      },
    ],
  },
  {
    slug: 'best-ebook-creation-tools',
    title: 'The Best Ebook Creation Tools: A Detailed Comparison',
    description: 'Compare the top ebook creation tools for self-publishing authors. Scrivener, Atticus, Vellum, and makeEbook. Features, pricing, and which is right for you.',
    date: '2026-04-05',
    updatedDate: '2026-04-20',
    readingTime: '12 min read',
    category: 'Tools & Comparisons',
    keywords: [
      'best ebook creation tools',
      'ebook writing software',
      'ebook creator',
      'Scrivener alternative',
      'free ebook software',
      'Vellum vs Atticus',
    ],
    // image: '/blog/best-ebook-creation-tools.png',
    // imageAlt: 'Ink drawing of five writing implements arranged in a row: quill, typewriter, fountain pen, stylus, pencil.',
    content: `
      <p class="lead">Choosing the right ebook creation tool can make the difference between a frustrating process and a smooth path to publication. Here's an honest comparison of the best options available today.</p>

      <h2>Quick Picks</h2>
      <p>If you want the short answer:</p>
      <ul>
        <li><strong>Best free option:</strong> <a href="/make-ebook">makeEbook</a>. Full EPUB export on the free tier.</li>
        <li><strong>Best for beginners:</strong> <a href="/make-ebook">makeEbook</a>. Browser-based, zero learning curve, no install.</li>
        <li><strong>Best for Mac users who want beautiful output:</strong> Vellum.</li>
        <li><strong>Best for power users and long-form non-fiction:</strong> Scrivener.</li>
        <li><strong>Best all-in-one paid tool:</strong> Atticus.</li>
      </ul>
      <p>Below, each tool is reviewed in depth with pricing, strengths, and trade-offs.</p>

      <h2>What to Look For in an Ebook Tool</h2>
      <p>Before comparing specific tools, here's what actually matters:</p>
      <ul>
        <li><strong>EPUB export quality.</strong> Does it produce clean, valid EPUB files?</li>
        <li><strong>Ease of use.</strong> How steep is the learning curve?</li>
        <li><strong>Chapter management.</strong> Can you easily organise and reorder content?</li>
        <li><strong>Typography control.</strong> Can you customise fonts, spacing, and styling?</li>
        <li><strong>Price.</strong> One-time vs subscription, and what's included in free tiers?</li>
        <li><strong>Platform.</strong> Desktop, browser, or both?</li>
      </ul>

      <h2>Scrivener</h2>
      <p><strong>Best for:</strong> Writers who want a comprehensive, desktop-based writing environment.</p>
      <p><a href="https://www.literatureandlatte.com/scrivener/overview" rel="nofollow noopener" target="_blank">Scrivener</a> is the veteran of the writing software world. It's incredibly powerful, with research folders, corkboard view, and detailed compile settings. That power comes with complexity. Most new users spend weeks learning the interface before they're productive.</p>
      <ul>
        <li><strong>Price:</strong> $49 one-time (Mac or Windows).</li>
        <li><strong>EPUB export:</strong> Yes, via Compile (complex setup).</li>
        <li><strong>Platform:</strong> Desktop only (Mac, Windows, iOS).</li>
        <li><strong>Learning curve:</strong> Steep.</li>
      </ul>
      <p><strong>Verdict:</strong> Excellent for experienced writers who need deep organisation features. Overkill for most ebook projects.</p>

      <h2>Atticus</h2>
      <p><strong>Best for:</strong> Authors who want formatting and writing in one tool.</p>
      <p><a href="https://www.atticus.io" rel="nofollow noopener" target="_blank">Atticus</a> positions itself as the all-in-one solution. Write and format in the same app. It has a clean interface and produces good-looking output. The main drawback is price. $225 for the base tier is a significant investment for a first-time author.</p>
      <ul>
        <li><strong>Price:</strong> $225 to $375 one-time.</li>
        <li><strong>EPUB export:</strong> Yes.</li>
        <li><strong>Platform:</strong> Browser-based (with desktop app).</li>
        <li><strong>Learning curve:</strong> Moderate.</li>
      </ul>
      <p><strong>Verdict:</strong> Solid choice if you're willing to invest upfront. The price is hard to justify for beginners.</p>

      <h2>Vellum</h2>
      <p><strong>Best for:</strong> Mac users who want stunning, design-forward ebooks.</p>
      <p><a href="https://vellum.pub" rel="nofollow noopener" target="_blank">Vellum</a> produces arguably the best-looking ebooks of any tool. The typography and layout options are beautiful. The catch: it's Mac only, and it's not cheap.</p>
      <ul>
        <li><strong>Price:</strong> $199 one-time (ebooks only), $249 (ebooks and print).</li>
        <li><strong>EPUB export:</strong> Yes (excellent quality).</li>
        <li><strong>Platform:</strong> Mac only.</li>
        <li><strong>Learning curve:</strong> Low to moderate.</li>
      </ul>
      <p><strong>Verdict:</strong> If you're on Mac and willing to pay, Vellum is hard to beat for pure output quality. It's not accessible to Windows or Linux users, or to budget-conscious authors.</p>

      <h2>Reedsy Book Editor</h2>
      <p><strong>Best for:</strong> Authors who want a free, no-frills web editor.</p>
      <p><a href="https://reedsy.com/write-a-book" rel="nofollow noopener" target="_blank">Reedsy's editor</a> is free and browser-based. It's simple and produces clean output. The limitations: no AI features, limited typography options, and it's part of the broader Reedsy marketplace (which may or may not be useful to you).</p>
      <ul>
        <li><strong>Price:</strong> Free.</li>
        <li><strong>EPUB export:</strong> Yes.</li>
        <li><strong>Platform:</strong> Browser.</li>
        <li><strong>Learning curve:</strong> Low.</li>
      </ul>
      <p><strong>Verdict:</strong> Good free option, but limited features for authors who want more control.</p>

      <h2>makeEbook</h2>
      <p><strong>Best for:</strong> Authors who want a simple, modern tool with AI features and free EPUB export.</p>
      <p><a href="/make-ebook">makeEbook</a> is a browser-based ebook editor that focuses on simplicity without sacrificing professional output. The free tier includes full EPUB and PDF export, which most competitors charge for. The Pro tier adds AI-powered manuscript analysis (Book Mind), cloud sync, and version history.</p>
      <ul>
        <li><strong>Price:</strong> Free (full export), $9 per month Pro, $149 lifetime.</li>
        <li><strong>EPUB export:</strong> Yes (free tier).</li>
        <li><strong>Platform:</strong> Browser (works offline as a PWA).</li>
        <li><strong>Learning curve:</strong> Very low.</li>
        <li><strong>Unique features:</strong> AI manuscript analysis, offline PWA, multi-language and RTL support, Amazon KDP pre-flight checks.</li>
      </ul>
      <p><strong>Verdict:</strong> The best option for beginners and authors who want to start writing immediately without a financial commitment. The AI features in the Pro tier add genuine value for manuscript polishing.</p>

      <h2>Looking for a Free Scrivener Alternative?</h2>
      <p>Scrivener's $49 price tag isn't the real barrier. The steeper cost is the time it takes to learn. If you want organised chapter management, drag-and-drop reordering, and EPUB export without the learning curve, <a href="/make-ebook">makeEbook</a> is the closest free Scrivener alternative for most self-publishing authors. Browser-based, no install, and the free tier exports a store-ready EPUB.</p>
      <p>Reedsy Book Editor is the other free option worth considering, though its feature set is thinner and it's tied to the Reedsy marketplace.</p>

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
          <tr><td>PDF export</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
          <tr><td>Browser-based</td><td>No</td><td>Yes</td><td>No</td><td>Yes</td><td>Yes</td></tr>
          <tr><td>Works offline</td><td>Yes</td><td>No</td><td>Yes</td><td>No</td><td>Yes</td></tr>
          <tr><td>Cloud sync</td><td>Paid add-on</td><td>Yes</td><td>No</td><td>Yes</td><td>Pro tier</td></tr>
          <tr><td>AI manuscript analysis</td><td>No</td><td>No</td><td>No</td><td>No</td><td>Yes (Pro)</td></tr>
          <tr><td>Mobile-friendly</td><td>iOS app</td><td>Limited</td><td>No</td><td>Yes</td><td>Yes</td></tr>
          <tr><td>KDP pre-flight checks</td><td>No</td><td>No</td><td>No</td><td>No</td><td>Yes (Pro)</td></tr>
          <tr><td>Starting price</td><td>$49</td><td>$225</td><td>$199</td><td>Free</td><td>Free</td></tr>
          <tr><td>Learning curve</td><td>Steep</td><td>Moderate</td><td>Low to moderate</td><td>Low</td><td>Very low</td></tr>
        </tbody>
      </table>

      <h2>Our Recommendation</h2>
      <p>If you're just starting out, don't spend hundreds of dollars on software before you've written your first chapter. Start with a free tool that produces professional output, and upgrade later if you need advanced features.</p>
      <p><a href="/make-ebook">makeEbook</a> lets you start writing in seconds. No download, no signup required for the free tier. Write your book, export a professional EPUB, and publish to Amazon KDP, Apple Books, or any platform.</p>
      <p>If you haven't started your manuscript yet, our <a href="/make-ebook/blog/how-to-write-an-ebook">complete beginner's guide to writing an ebook</a> walks you through the entire process, from outline to published EPUB.</p>
    `,
    faqs: [
      {
        q: "What's the best free Scrivener alternative?",
        a: 'For most self-publishing authors, makeEbook is the closest free alternative. Browser-based, drag-and-drop chapter management, and EPUB export on the free tier. Reedsy Book Editor is the other free option, but its features are thinner and it ties you to the Reedsy marketplace.',
      },
      {
        q: 'Which ebook software is best for beginners?',
        a: 'Beginners do best with a browser-based tool that exports a professional EPUB without configuration. makeEbook and Reedsy Book Editor are the two best free options. Scrivener is powerful but the learning curve costs most beginners weeks of productivity.',
      },
      {
        q: 'Is Vellum worth the price?',
        a: "Vellum produces arguably the best-looking ebooks of any tool. It's worth the $199 if you're on a Mac and plan to publish multiple titles. It's not worth it if you're on Windows or Linux (Vellum is Mac only) or publishing a single book.",
      },
      {
        q: 'Can I write an ebook entirely in the browser?',
        a: "Yes. Browser-based tools like makeEbook, Atticus, and Reedsy Book Editor handle everything from writing through EPUB export in the browser. makeEbook also runs offline as a PWA, so you can write on a flight and sync when you're back online.",
      },
      {
        q: 'Do I need to pay for EPUB export?',
        a: 'No. makeEbook and Reedsy Book Editor both offer free EPUB export. Scrivener, Atticus, and Vellum require a paid license for the app, though their EPUB export is included in that license. If keeping costs low matters, start with a free tool.',
      },
    ],
  },
  {
    slug: 'free-scrivener-alternatives',
    title: 'Free Scrivener Alternatives: 5 Best Writing Tools for Self-Publishers',
    description: 'The best Scrivener alternatives for self-publishing authors in 2026. Free and paid tools compared on features, ease of use, and EPUB export.',
    date: '2026-04-20',
    updatedDate: '2026-04-20',
    readingTime: '11 min read',
    category: 'Tools & Comparisons',
    keywords: [
      'Scrivener alternative',
      'Scrivener alternative free',
      'free Scrivener alternative',
      'best Scrivener alternatives',
      'alternatives to Scrivener',
      'Scrivener alternative for Mac',
      'Scrivener alternative for Windows',
    ],
    // image: '/blog/free-scrivener-alternatives.png',
    // imageAlt: 'Ink drawing of a single key resting next to an open notebook.',
    content: `
      <p class="lead">Scrivener is a classic, but it isn't right for everyone. If you're hunting for a simpler, cheaper, or browser-based Scrivener alternative, here are the five best options in 2026, including two that are completely free.</p>

      <h2>Quick Picks</h2>
      <ul>
        <li><strong>Best free Scrivener alternative:</strong> <a href="/make-ebook">makeEbook</a>. Browser-based, zero learning curve, free EPUB export.</li>
        <li><strong>Best for Mac users who want beautiful output:</strong> Vellum.</li>
        <li><strong>Best paid all-in-one:</strong> Atticus.</li>
        <li><strong>Best free marketplace-integrated option:</strong> Reedsy Book Editor.</li>
        <li><strong>Best free DIY workflow:</strong> Google Docs paired with Kindle Create.</li>
      </ul>

      <h2>Why Writers Look for Scrivener Alternatives</h2>
      <p>Scrivener is powerful, but three recurring pain points push people to look elsewhere:</p>
      <ul>
        <li><strong>The learning curve.</strong> Research folders, corkboards, metadata panels, and Compile settings take weeks to master. Most authors want to write, not configure.</li>
        <li><strong>Desktop-only.</strong> Scrivener runs on Mac, Windows, and iOS, but not in the browser. If you switch machines often or write on a Chromebook, that's a hard limit.</li>
        <li><strong>EPUB export is clunky.</strong> Scrivener can export EPUB through Compile, but getting a clean, KDP-ready file takes trial and error. Dedicated ebook tools make this painless.</li>
      </ul>
      <p>None of these are deal-breakers on their own. Together, they drive a steady stream of search traffic looking for something simpler.</p>

      <h2>What Makes a Good Scrivener Alternative</h2>
      <p>When evaluating alternatives, keep the features you actually use in Scrivener and drop the ones you don't:</p>
      <ul>
        <li><strong>Chapter management.</strong> Scrivener's binder is the thing most migrants miss. Look for drag-and-drop chapter reordering.</li>
        <li><strong>Distraction-free writing.</strong> A clean editor that doesn't drown you in panels and panes.</li>
        <li><strong>EPUB export.</strong> Ideally one click, not a 20-option dialogue box.</li>
        <li><strong>Works on your machine.</strong> Mac, Windows, Linux, Chromebook, phone. The more platforms it runs on, the less you worry about it.</li>
        <li><strong>Price that matches your needs.</strong> If you're writing one ebook, free is fine. If you're writing ten, a lifetime license is worth the investment.</li>
      </ul>

      <h2>1. makeEbook: Best Free Scrivener Alternative</h2>
      <p><a href="/make-ebook">makeEbook</a> is browser-based, free, and built specifically for self-publishing authors. The free tier handles writing, chapter management, and EPUB export without asking for a credit card. The Pro tier adds AI manuscript analysis (Book Mind), cloud sync, and Amazon KDP pre-flight checks.</p>
      <ul>
        <li><strong>Price:</strong> Free. Pro is $9 per month or $149 lifetime.</li>
        <li><strong>Platform:</strong> Browser (works offline as a PWA).</li>
        <li><strong>EPUB export:</strong> Yes, on the free tier.</li>
        <li><strong>Learning curve:</strong> Very low.</li>
      </ul>
      <p><strong>Who it's for:</strong> Writers who want Scrivener's organisation without the install or learning curve. Especially strong if you switch between machines or want to write on any device with a browser.</p>

      <h2>2. Reedsy Book Editor: Best for Marketplace Integration</h2>
      <p><a href="https://reedsy.com/write-a-book" rel="nofollow noopener" target="_blank">Reedsy Book Editor</a> is another free, browser-based option. It produces clean EPUB output and is tied to the Reedsy marketplace, which is useful if you plan to hire editors or cover designers through them.</p>
      <ul>
        <li><strong>Price:</strong> Free.</li>
        <li><strong>Platform:</strong> Browser (no offline mode).</li>
        <li><strong>EPUB export:</strong> Yes.</li>
        <li><strong>Learning curve:</strong> Low.</li>
      </ul>
      <p><strong>Who it's for:</strong> Writers who want a free tool and plan to buy professional services from the Reedsy marketplace. The tight integration is genuinely useful if you go that route.</p>

      <h2>3. Atticus: Best Paid All-in-One</h2>
      <p><a href="https://www.atticus.io" rel="nofollow noopener" target="_blank">Atticus</a> is a paid, browser-based tool that combines writing and formatting in one app. Clean interface, good-looking output, and it's cross-platform.</p>
      <ul>
        <li><strong>Price:</strong> $225 to $375 one-time.</li>
        <li><strong>Platform:</strong> Browser (with desktop companion app).</li>
        <li><strong>EPUB export:</strong> Yes.</li>
        <li><strong>Learning curve:</strong> Moderate.</li>
      </ul>
      <p><strong>Who it's for:</strong> Authors willing to spend a few hundred dollars upfront to avoid subscriptions. Note: the price is steep for a single book.</p>

      <h2>4. Vellum: Best for Mac Users Who Prioritize Design</h2>
      <p><a href="https://vellum.pub" rel="nofollow noopener" target="_blank">Vellum</a> produces the best-looking ebook output of any tool on this list. The typography is genuinely beautiful, and the app is a pleasure to use. The catch is two-fold: it's Mac only, and it's not cheap.</p>
      <ul>
        <li><strong>Price:</strong> $199 (ebooks), $249 (ebooks and print).</li>
        <li><strong>Platform:</strong> Mac only.</li>
        <li><strong>EPUB export:</strong> Yes, excellent quality.</li>
        <li><strong>Learning curve:</strong> Low.</li>
      </ul>
      <p><strong>Who it's for:</strong> Mac-owning authors publishing a series where pixel-perfect typography matters. Windows and Linux users cannot run this.</p>

      <h2>5. Google Docs + Kindle Create: Best Free DIY Workflow</h2>
      <p>Not a single tool, but a combination that covers writing and formatting for free. Draft in <a href="https://docs.google.com" rel="nofollow noopener" target="_blank">Google Docs</a>, then format and export using <a href="https://www.amazon.com/Kindle-Create/b?node=18292298011" rel="nofollow noopener" target="_blank">Kindle Create</a>.</p>
      <ul>
        <li><strong>Price:</strong> Free.</li>
        <li><strong>Platform:</strong> Docs is browser-based. Kindle Create is Mac and Windows desktop.</li>
        <li><strong>EPUB export:</strong> Kindle Create outputs KPF (Amazon's format) more naturally than EPUB, so this workflow is strongest for authors publishing exclusively on KDP.</li>
        <li><strong>Learning curve:</strong> Low for Docs, moderate for Kindle Create.</li>
      </ul>
      <p><strong>Who it's for:</strong> Authors who already live in Google Docs and publish only on Amazon. If you need true multi-platform EPUB output, you'll hit the limits of this stack quickly.</p>

      <h2>Comparison Table</h2>
      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Price</th>
            <th>Platform</th>
            <th>Free EPUB</th>
            <th>Cloud Sync</th>
            <th>Learning Curve</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Scrivener</td><td>$49</td><td>Mac, Windows, iOS</td><td>No</td><td>Paid add-on</td><td>Steep</td></tr>
          <tr><td>makeEbook</td><td>Free</td><td>Browser (offline PWA)</td><td>Yes</td><td>Pro tier</td><td>Very low</td></tr>
          <tr><td>Reedsy</td><td>Free</td><td>Browser</td><td>Yes</td><td>Yes</td><td>Low</td></tr>
          <tr><td>Atticus</td><td>$225+</td><td>Browser, desktop</td><td>No</td><td>Yes</td><td>Moderate</td></tr>
          <tr><td>Vellum</td><td>$199+</td><td>Mac only</td><td>No</td><td>No</td><td>Low</td></tr>
          <tr><td>Docs + Kindle Create</td><td>Free</td><td>Browser + desktop</td><td>KPF only</td><td>Yes</td><td>Low to moderate</td></tr>
        </tbody>
      </table>

      <h2>How to Migrate from Scrivener to Another Tool</h2>
      <p>If you already have a Scrivener project and want to move it, the path depends on your destination tool:</p>
      <ol>
        <li><strong>Compile to DOCX.</strong> In Scrivener, go to File, Compile, and choose Microsoft Word (.docx) as the output format. This is the universal bridge, most ebook tools can import it.</li>
        <li><strong>Open the DOCX in your new tool.</strong> makeEbook, Atticus, and Reedsy all accept DOCX import. Your chapters come across, though you may need to re-tag chapter breaks if Scrivener's structure didn't map cleanly.</li>
        <li><strong>Re-check your metadata.</strong> Title, author, language, and ISBN often don't migrate. Set them fresh in the new tool before exporting.</li>
        <li><strong>Do an EPUB export and validate.</strong> Your first export in the new tool is a shakedown run. Open it on a Kindle or in an EPUB reader and check that chapters, table of contents, and typography all look right.</li>
      </ol>
      <p>If you're still at the outline stage, don't migrate. Just start fresh in the new tool. The time you'd spend on migration is better spent writing.</p>

      <h2>Our Pick for Most Writers</h2>
      <p>For 80% of self-publishing authors, <a href="/make-ebook">makeEbook</a> is the best free Scrivener alternative. Browser-based, zero install, full EPUB export on the free tier, and AI manuscript analysis if you want it. The learning curve is measured in minutes, not weeks.</p>
      <p>If you're a Mac user who publishes a lot and cares deeply about typography, Vellum is the one paid tool worth the money.</p>

      <h2>Further Reading</h2>
      <p>For a broader look at ebook creation tools (beyond just Scrivener alternatives), see our <a href="/make-ebook/blog/best-ebook-creation-tools">detailed comparison of the best ebook creation tools</a>. If you haven't started writing yet, our <a href="/make-ebook/blog/how-to-write-an-ebook">beginner's guide to writing an ebook</a> walks through the whole process from idea to published EPUB.</p>
    `,
    faqs: [
      {
        q: 'Is there a free alternative to Scrivener?',
        a: 'Yes. The two main free alternatives are makeEbook and Reedsy Book Editor. Both run in the browser, handle chapter management, and export a clean EPUB without a paywall. makeEbook also works offline as a PWA, which matters if you write on flights or without reliable internet.',
      },
      {
        q: 'What is the best Scrivener alternative for Mac?',
        a: 'If typography and design matter most, Vellum is the top choice for Mac. If you want something free and cross-machine, makeEbook runs in any browser on any Mac. If you want a paid, all-in-one writing and formatting tool that also runs on Windows, Atticus is the strongest option.',
      },
      {
        q: 'What is the best Scrivener alternative for Windows?',
        a: 'Vellum does not run on Windows. For Windows users, the best alternatives are makeEbook (free, browser-based), Atticus (paid, all-in-one), and Reedsy Book Editor (free, browser-based with marketplace integration). makeEbook is the closest match for Scrivener users who want chapter management without the learning curve.',
      },
      {
        q: 'Can I export my Scrivener project to another tool?',
        a: 'Yes. In Scrivener, use File, Compile to export your project as a DOCX file. That DOCX can then be imported into makeEbook, Atticus, or Reedsy Book Editor. Your chapters come across, but you may need to re-check metadata (title, author, ISBN) in the new tool.',
      },
      {
        q: 'Is Scrivener still worth it in 2026?',
        a: "Scrivener is still excellent for long-form non-fiction and for writers who use research folders heavily. If you're writing a straightforward ebook and the main goal is a clean EPUB on Amazon KDP, it's overkill. A browser-based tool like makeEbook gets you to a published file in a fraction of the time.",
      },
    ],
  },
  {
    slug: 'how-to-create-an-ebook-cover',
    title: 'How to Create an Ebook Cover: Complete Guide for Self-Publishers',
    description: 'Design an ebook cover that sells. Dimensions, composition rules, tools, and mistakes to avoid when creating a cover for Amazon KDP, Apple Books, and Kobo.',
    date: '2026-04-20',
    updatedDate: '2026-04-20',
    readingTime: '10 min read',
    category: 'Design',
    keywords: [
      'how to create an ebook cover',
      'ebook cover design',
      'DIY ebook cover',
      'ebook cover size',
      'ebook cover software',
      'KDP cover dimensions',
    ],
    // image: '/blog/how-to-create-an-ebook-cover.png',
    // imageAlt: 'Ink drawing of a small easel holding a closed book, with a thin brush resting beside it.',
    content: `
      <p class="lead">Your cover does more work than any other piece of your ebook. It's the thumbnail on Amazon, the icon on a reader's shelf, and the image every single potential buyer sees before reading a word. Here's how to design one that earns the click.</p>

      <h2>Why the Cover Matters More Than You Think</h2>
      <p>The average Amazon shopper spends less than two seconds on each thumbnail before deciding whether to click. Your cover has two jobs in that window:</p>
      <ul>
        <li>Signal the genre or topic clearly.</li>
        <li>Look professional enough to trust.</li>
      </ul>
      <p>A weak cover isn't just an aesthetic problem. It's a conversion problem. Authors often spend a year writing and a weekend on the cover. That ratio is backwards.</p>

      <h2>Ebook Cover Dimensions</h2>
      <p>Every major store has slightly different specs, but a single file works for all of them if you follow the strictest requirements:</p>
      <ul>
        <li><strong>Aspect ratio:</strong> 1.6:1 (taller than wide). A 2:3 ratio is also widely accepted.</li>
        <li><strong>Recommended size:</strong> 1,600 pixels wide by 2,560 pixels tall.</li>
        <li><strong>Minimum size:</strong> 1,000 pixels on the longest side (Amazon KDP).</li>
        <li><strong>Format:</strong> JPEG or TIFF. Under 50 MB.</li>
        <li><strong>Colour space:</strong> RGB (not CMYK, which is for print).</li>
      </ul>
      <p>If you're unsure, 1,600 by 2,560 at RGB JPEG is the safe default. It meets every store's requirements with room to spare.</p>

      <h2>Three Rules for a Cover That Converts</h2>
      <h3>Rule 1: It has to survive the thumbnail test</h3>
      <p>Open your draft cover and shrink it to 200 pixels wide. Can you still read the title? Can you still tell what genre it is? If not, the cover is too complex. Covers are consumed at thumbnail size first and full size almost never.</p>
      <h3>Rule 2: Genre signal beats originality</h3>
      <p>A thriller cover should look like a thriller. A romance cover should look like a romance. Readers scan stores looking for what they already like. A "unique" cover that doesn't match its genre is a cover that won't get clicked.</p>
      <p>Look at the top 10 covers in your genre on Amazon. Note what they have in common (colour palette, typography style, imagery). Match those conventions, then find one small detail to make your cover distinct within them.</p>
      <h3>Rule 3: Typography does 70% of the work</h3>
      <p>On most successful ebook covers, the title is the biggest thing on the page. The author name is secondary but still readable at thumbnail size. If your typography is strong, a simple background carries the rest.</p>

      <h2>How to Design an Ebook Cover: Three Paths</h2>
      <h3>Path 1: In-app cover generator (fastest, free)</h3>
      <p>Some ebook tools include a cover generator that uses your title, author name, and genre to produce a clean cover. <a href="/make-ebook">makeEbook</a> has a built-in cover generator that produces a store-ready cover in seconds. No design skills required, and it's free.</p>
      <p>This works best when you want a quiet, typographic cover rather than a photographic one. If your book is literary fiction, non-fiction, or essays, a generated cover is often all you need.</p>
      <h3>Path 2: DIY with Canva or Photoshop</h3>
      <p>Canva has ebook cover templates you can customise. Photoshop and Affinity Designer offer more control but require design skills. DIY works if you have a clear vision and the time to execute it, or if your genre has simple conventions you can match (a lot of non-fiction, for example).</p>
      <p>Start with a template in the right aspect ratio. Don't try to design from a blank canvas unless you know what you're doing.</p>
      <h3>Path 3: Hire a professional</h3>
      <p>If your book is commercially ambitious, a professional cover is the highest-ROI investment you can make. Prices range from $50 (pre-made covers on Fiverr) to $800 (bespoke from a specialist cover designer).</p>
      <p>Platforms like Reedsy, 99designs, and Fiverr have vetted cover designers. Look at their portfolio in your genre before commissioning.</p>

      <h2>Common Mistakes to Avoid</h2>
      <ul>
        <li><strong>Title too small.</strong> If the title doesn't read at thumbnail size, the cover doesn't work.</li>
        <li><strong>Low-resolution stock images.</strong> Free stock is often overused and low-quality. Pay for one good image rather than patching together free ones.</li>
        <li><strong>Too many fonts.</strong> Two fonts maximum. One for title, one for author. Often the same font in two weights works better than two different fonts.</li>
        <li><strong>Amateur borders and drop shadows.</strong> The moment you add a fake "book" border or heavy drop shadow, the cover reads as DIY. Trust flat design.</li>
        <li><strong>Genre mismatch.</strong> A romance cover on a thriller is a publishing mistake, not a creative choice.</li>
        <li><strong>Forgetting the series.</strong> If you're writing a series, design the first cover with series templating in mind. Book two shouldn't be a different style.</li>
      </ul>

      <h2>Testing Your Cover Before You Publish</h2>
      <p>Before finalising, do two tests:</p>
      <ol>
        <li><strong>Thumbnail test.</strong> Shrink to 200px wide. Still readable and on-brand for the genre?</li>
        <li><strong>Peer test.</strong> Show the cover (without context) to five people in your target audience. Ask them to guess the genre in three seconds. If four out of five get it right, you're good.</li>
      </ol>

      <h2>Next Step: Get Your Manuscript Cover-Ready</h2>
      <p>A cover is half the battle. The other half is a manuscript that matches its promise. If you haven't started yet, our <a href="/make-ebook/blog/how-to-write-an-ebook">complete beginner's guide to writing an ebook</a> walks through the process from outline to finished EPUB.</p>
      <p>Looking for the tool to pull it all together? See our <a href="/make-ebook/blog/best-ebook-creation-tools">comparison of the best ebook creation tools</a> to pick the right fit.</p>
    `,
    faqs: [
      {
        q: 'What size should an ebook cover be?',
        a: 'The safe default is 1,600 pixels wide by 2,560 pixels tall, RGB, saved as JPEG. That meets every major store\'s requirements (Amazon KDP, Apple Books, Kobo, Google Play Books). Minimum is 1,000 pixels on the longest side.',
      },
      {
        q: 'Can I design my own ebook cover?',
        a: 'Yes. Canva has templates, makeEbook has a built-in cover generator, and Photoshop or Affinity Designer give full control. DIY works best for simple typographic covers. For commercially ambitious books, a professional designer is usually worth the spend.',
      },
      {
        q: 'How much does a professional ebook cover cost?',
        a: 'Pre-made covers on Fiverr start around $50. Custom covers from specialist designers typically run $200 to $800 depending on complexity. For a book you plan to market seriously, $300 to $500 is a reasonable budget.',
      },
      {
        q: 'What format should the cover file be?',
        a: 'JPEG is the safest choice. Every major store accepts it. Keep the file under 50 MB, use RGB colour space (not CMYK, which is for print), and make sure the resolution is at least 1,000 pixels on the longest side.',
      },
      {
        q: 'Do I need a different cover for print?',
        a: "Yes, if you're publishing in print as well. Print covers need a spine, a back cover, CMYK colour space, and specific bleed allowances. A print cover cannot be reused as an ebook cover without a redesign.",
      },
    ],
  },
  {
    slug: 'ai-manuscript-analysis',
    title: 'Using AI to Improve Your Ebook Manuscript: A Practical Guide',
    description: 'How to use AI tools for manuscript analysis, editing, and polishing. What AI does well, what it does badly, and how to integrate it without losing your voice.',
    date: '2026-04-20',
    updatedDate: '2026-04-20',
    readingTime: '11 min read',
    category: 'Writing',
    keywords: [
      'AI writing assistant',
      'AI manuscript analysis',
      'AI ebook editor',
      'AI for authors',
      'AI editing tools',
      'AI content editor',
    ],
    // image: '/blog/ai-manuscript-analysis.png',
    // imageAlt: 'Ink drawing of a magnifying glass over a page of text with small ticks floating above flagged phrases.',
    content: `
      <p class="lead">AI doesn't replace editors, and it doesn't write books that sell. What it does, when used well, is make you a more disciplined self-editor. Here's a practical guide to using AI on your ebook manuscript without surrendering your voice.</p>

      <h2>What AI Actually Does Well</h2>
      <p>AI tools have real strengths in manuscript work. Use them where they're strong and skip them where they're not.</p>
      <h3>Inconsistency detection across chapters</h3>
      <p>A human editor reads chapters one at a time. An AI can hold your entire manuscript in memory at once, making it good at catching things no single-pass read will catch: a character's eye colour changing in chapter twelve, a timeline that contradicts chapter three, a minor character's name spelled two ways.</p>
      <p>This is the single highest-value use of AI on a manuscript. It costs you nothing (most tools analyse the whole book for free or cheap) and catches issues that would otherwise make it to print.</p>
      <h3>Line-level tightening</h3>
      <p>AI is competent at spotting flabby sentences, redundant clauses, and filler phrases. "In order to" becomes "to". "It is important to note that" becomes "note that". These are easy wins that add up over 80,000 words.</p>
      <h3>Pacing and chapter-length analysis</h3>
      <p>AI can chart your chapter word counts, dialogue-to-prose ratios, and pacing cues. Suspicious patterns (all chapters exactly the same length, for example) are worth investigating. They're a subtle AI-tell that Amazon's spam filter has learned to flag.</p>
      <h3>Summarising for queries and blurbs</h3>
      <p>Writing a 150-word blurb is surprisingly hard when you've lived with the book for a year. AI is good at producing a first-pass blurb from your manuscript that you can edit. Same for query letters and jacket copy.</p>

      <h2>What AI Doesn't Do Well</h2>
      <p>AI struggles with the things that make writing feel like yours. Don't use it for these.</p>
      <h3>Generating prose in your voice</h3>
      <p>AI-generated paragraphs sound like everyone and no one. Even with careful prompting, the output has a telltale smoothness that a careful reader will spot. Use AI to edit, not to draft.</p>
      <h3>Judging literary quality</h3>
      <p>AI can't tell a good sentence from a bad one, only a grammatical one from an ungrammatical one. A sentence that breaks rules for effect (common in good fiction) will often get flagged as wrong.</p>
      <h3>Plot coherence on long books</h3>
      <p>AI can catch small contradictions but misses deeper structural issues (a subplot that doesn't pay off, a character arc that doesn't resolve). Those still need a human reader.</p>

      <h2>How to Integrate AI Into Your Workflow</h2>
      <ol>
        <li><strong>Draft first, AI second.</strong> Write your draft without AI. The voice has to be yours before AI can help polish it.</li>
        <li><strong>Do one AI pass for inconsistencies.</strong> Run the whole manuscript through an analysis tool that reads across chapters. Fix what it flags.</li>
        <li><strong>Do a line-edit pass, reviewing each suggestion.</strong> Don't accept AI edits blindly. For every suggestion, ask: does this keep my voice? If not, reject it.</li>
        <li><strong>Generate your blurb and chapter summaries.</strong> Use AI to produce first-pass marketing copy. Heavily edit before using.</li>
        <li><strong>Skip the final polish.</strong> The last pass before publish is always human. AI at this stage often introduces "improvements" that flatten the voice.</li>
      </ol>

      <h2>Tools Worth Considering</h2>
      <ul>
        <li><strong>Book Mind in <a href="/make-ebook">makeEbook</a>.</strong> Purpose-built for manuscript-level analysis. Reads the whole book, flags inconsistencies, surfaces pacing issues, and handles blurb generation. Pro tier.</li>
        <li><strong>Claude or ChatGPT.</strong> General-purpose but capable. Good for discrete tasks (tightening a paragraph, summarising a chapter). Context window limits on longer books.</li>
        <li><strong>ProWritingAid.</strong> Traditional grammar-and-style tool with AI features. Strong on sentence-level issues, weak on whole-manuscript analysis.</li>
        <li><strong>Grammarly.</strong> Useful for the final proofreading pass. Not built for manuscript work.</li>
      </ul>

      <h2>The Amazon KDP AI Disclosure</h2>
      <p>Amazon requires authors to disclose AI-generated and AI-assisted content during the KDP upload process. The key distinction:</p>
      <ul>
        <li><strong>AI-generated content.</strong> Text written by AI, even if you edited it. Must be disclosed.</li>
        <li><strong>AI-assisted content.</strong> Brainstorming, editing, research, where the final text is yours. No disclosure required.</li>
      </ul>
      <p>The safest path: use AI only for editing and analysis, keep the prose yours, and mark "AI-assisted" on the upload form. Amazon delists for lying about disclosure, not for using AI.</p>

      <h2>Ethical Considerations</h2>
      <p>Just because you can doesn't mean you should. A few guardrails:</p>
      <ul>
        <li>Don't generate entire books. Readers notice. Reviews will punish you. Amazon is actively filtering for this.</li>
        <li>Don't use AI to mimic another author's voice. That's not editing, that's plagiarism with extra steps.</li>
        <li>Do disclose honestly. Transparency protects your listing long-term.</li>
      </ul>

      <h2>Start With One AI Pass</h2>
      <p>If you're new to using AI on manuscripts, start with one experiment: run your current draft through an inconsistency-detection tool and see what it catches. That single pass will show you where AI helps and where it doesn't, without overcommitting to an AI-heavy workflow.</p>
      <p>When you're ready to go deeper, <a href="/make-ebook">makeEbook's Book Mind</a> is built specifically for manuscript-level analysis. If you haven't started your manuscript yet, our <a href="/make-ebook/blog/how-to-write-an-ebook">beginner's guide to writing an ebook</a> walks through the whole process.</p>
    `,
    faqs: [
      {
        q: 'Can AI write an entire ebook for me?',
        a: "Technically yes, but it's a bad idea. AI-generated prose reads flat, reviewers will flag it, and Amazon's spam filter actively targets wholly AI-generated books. Use AI to edit and analyse, not to draft. The books that sell are the ones with a human voice.",
      },
      {
        q: 'Will using AI get my book delisted on Amazon?',
        a: "No, provided you disclose accurately. Amazon allows AI-assisted and AI-generated books if you mark them correctly on upload. The books that get delisted are the ones that lie about AI use or that trip the spam filter with AI-telltale patterns (uniform chapter lengths, repetitive phrasing).",
      },
      {
        q: 'What\'s the difference between AI-assisted and AI-generated content?',
        a: 'AI-assisted means AI helped with brainstorming, research, or editing, but the final text is yours. AI-generated means AI wrote the text, even if you edited it. Amazon KDP treats these differently at upload. When in doubt, AI-generated is the more conservative declaration.',
      },
      {
        q: 'Should I use AI for my first draft?',
        a: "No. A first draft in your voice is the only way the book ends up sounding like you. AI is most useful after the draft is done, for inconsistency detection, line-editing, and generating blurbs.",
      },
      {
        q: 'What\'s the best AI tool for ebook manuscripts?',
        a: 'For whole-manuscript analysis, Book Mind in makeEbook is purpose-built for the job. For discrete editing tasks, Claude and ChatGPT are strong general-purpose tools. For proofreading, Grammarly remains solid. Different tools for different jobs.',
      },
    ],
  },
  {
    slug: 'best-offline-ebook-editors',
    title: 'Best Offline Ebook Editors: Write Without Internet in 2026',
    description: 'The best offline ebook editors for writers who travel, work on planes, or prefer to write without distraction. Desktop apps and offline-capable web tools compared.',
    date: '2026-04-20',
    updatedDate: '2026-04-20',
    readingTime: '9 min read',
    category: 'Tools & Comparisons',
    keywords: [
      'offline ebook editor',
      'ebook writing offline',
      'ebook editor no internet',
      'PWA ebook editor',
      'offline writing software',
      'best offline writing apps',
    ],
    // image: '/blog/best-offline-ebook-editors.png',
    // imageAlt: 'Ink drawing of an aeroplane window view with a notebook on the tray table and a pen resting on it.',
    content: `
      <p class="lead">Not every writing session happens with reliable internet. Flights, hotel rooms, cabins, co-working spots with flaky wifi. An ebook editor that stops working when your connection drops is a real problem. Here are the best offline ebook editors in 2026.</p>

      <h2>Why Offline Writing Matters</h2>
      <p>Three recurring scenarios push writers toward offline-capable tools:</p>
      <ul>
        <li><strong>Travel.</strong> Planes, trains, remote accommodation. Hours of productive writing time stuck behind an intermittent connection.</li>
        <li><strong>Focus.</strong> Being offline removes the tab-switching temptation. Some writers deliberately cut internet to write.</li>
        <li><strong>Resilience.</strong> A tool that keeps working when the network drops is a tool that never costs you a writing session to technical failure.</li>
      </ul>

      <h2>What "Offline" Really Means</h2>
      <p>Not all offline claims are equal. Three levels:</p>
      <ol>
        <li><strong>Full offline.</strong> Works indefinitely without internet. Saves locally. Syncs when you're back online, without losing data. Desktop apps and PWAs fall here.</li>
        <li><strong>Intermittent offline.</strong> Works for a session if you lose connection mid-write, but you can't open the tool cold without internet. Most browser-based tools fall here.</li>
        <li><strong>Online only.</strong> A dropped connection breaks the session. The tool fails.</li>
      </ol>
      <p>If you're writing on a long flight, you need level 1. Most "cloud" tools are level 2 or 3.</p>

      <h2>1. makeEbook (PWA): Best Free Offline Ebook Editor</h2>
      <p><a href="/make-ebook">makeEbook</a> installs as a Progressive Web App, which means the tool itself is cached on your device. You can open it without internet, write, add chapters, and export EPUB files. When you reconnect, your work syncs (on the Pro tier). Local-only writing works without an account.</p>
      <ul>
        <li><strong>Platform:</strong> Any browser, any device.</li>
        <li><strong>Offline capability:</strong> Full. PWA caches the app.</li>
        <li><strong>Price:</strong> Free (local-only), Pro $9 per month for cloud sync.</li>
      </ul>
      <p><strong>Best for:</strong> Writers who want browser-based convenience without giving up offline work.</p>

      <h2>2. Scrivener: Best Paid Desktop Offline Tool</h2>
      <p>Scrivener is a traditional desktop app, so offline is the default mode. It stores your project as a local file. No internet required for any core function.</p>
      <ul>
        <li><strong>Platform:</strong> Mac, Windows, iOS desktop apps.</li>
        <li><strong>Offline capability:</strong> Full.</li>
        <li><strong>Price:</strong> $49 one-time.</li>
      </ul>
      <p><strong>Best for:</strong> Writers comfortable with desktop software who want Scrivener's organisation features. Syncing between machines requires a paid Dropbox or iCloud integration.</p>

      <h2>3. Vellum: Best Offline Tool for Mac Design-First Writers</h2>
      <p>Vellum is a native Mac app. Fully offline. Produces beautiful ebook output. The limitation: Mac-only, which rules out most of the world.</p>
      <ul>
        <li><strong>Platform:</strong> Mac only.</li>
        <li><strong>Offline capability:</strong> Full.</li>
        <li><strong>Price:</strong> $199 (ebooks), $249 (ebooks and print).</li>
      </ul>
      <p><strong>Best for:</strong> Mac-owning writers who prioritise beautiful typography and don't mind paying upfront.</p>

      <h2>4. Microsoft Word: Best Ubiquitous Offline Option</h2>
      <p>Every writer has Word. It works offline, saves locally, and does the job for drafting. The catch: Word doesn't export clean EPUB, so you'll need a second tool for formatting and export.</p>
      <ul>
        <li><strong>Platform:</strong> Mac, Windows desktop. Offline only on installed copies.</li>
        <li><strong>Offline capability:</strong> Full (desktop only, not 365 web).</li>
        <li><strong>Price:</strong> $7 per month (365) or bundled with other Microsoft subscriptions.</li>
      </ul>
      <p><strong>Best for:</strong> Writers who draft in Word and plan to import into a dedicated ebook tool for the final EPUB.</p>

      <h2>5. iA Writer: Best Minimalist Offline Tool</h2>
      <p>iA Writer is a Markdown-based desktop app with a famously clean interface. No chapter management like Scrivener, but fast, quiet, and offline by default. Pairs well with a downstream ebook tool for EPUB export.</p>
      <ul>
        <li><strong>Platform:</strong> Mac, Windows, iOS, Android.</li>
        <li><strong>Offline capability:</strong> Full.</li>
        <li><strong>Price:</strong> $30 to $50 depending on platform.</li>
      </ul>
      <p><strong>Best for:</strong> Writers who want distraction-free drafting and handle chapter management separately.</p>

      <h2>Comparison Table</h2>
      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Offline Level</th>
            <th>Platform</th>
            <th>EPUB Export</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>makeEbook (PWA)</td><td>Full</td><td>Any browser</td><td>Yes, free</td><td>Free</td></tr>
          <tr><td>Scrivener</td><td>Full</td><td>Mac, Windows, iOS</td><td>Yes, via Compile</td><td>$49</td></tr>
          <tr><td>Vellum</td><td>Full</td><td>Mac only</td><td>Yes</td><td>$199+</td></tr>
          <tr><td>Microsoft Word</td><td>Full (desktop)</td><td>Mac, Windows</td><td>No (needs other tool)</td><td>$7/mo</td></tr>
          <tr><td>iA Writer</td><td>Full</td><td>Mac, Windows, iOS, Android</td><td>No (needs other tool)</td><td>$30+</td></tr>
          <tr><td>Reedsy Book Editor</td><td>Online only</td><td>Browser</td><td>Yes</td><td>Free</td></tr>
          <tr><td>Atticus</td><td>Intermittent</td><td>Browser, desktop</td><td>Yes</td><td>$225+</td></tr>
        </tbody>
      </table>

      <h2>For Travel Writers</h2>
      <p>If you're writing on the move (flights, trains, cafes with bad wifi), you want a tool that handles all three of these:</p>
      <ul>
        <li>Opens cold without internet (level 1 offline).</li>
        <li>Syncs reliably when you're back online.</li>
        <li>Handles EPUB export without a round trip to a cloud service.</li>
      </ul>
      <p>makeEbook's PWA model hits all three. Scrivener hits all three on desktop but requires a paid sync add-on. Vellum hits the first and third on Mac but has no sync.</p>

      <h2>Further Reading</h2>
      <p>For a broader look at ebook creation tools (not just offline ones), see our <a href="/make-ebook/blog/best-ebook-creation-tools">comparison of the best ebook creation tools</a>. If you're specifically hunting for Scrivener alternatives, our <a href="/make-ebook/blog/free-scrivener-alternatives">guide to free Scrivener alternatives</a> covers that in depth.</p>
    `,
    faqs: [
      {
        q: 'What is the best free offline ebook editor?',
        a: "makeEbook installs as a Progressive Web App, so the tool is cached on your device and works offline without an account. Free local writing, free EPUB export, and cloud sync on the Pro tier if you want it.",
      },
      {
        q: 'Does Scrivener work offline?',
        a: 'Yes. Scrivener is a desktop app. It stores your project as a local file and requires no internet to function. Syncing between machines requires a paid Dropbox or iCloud integration, but core writing is fully offline.',
      },
      {
        q: 'Can I write ebooks on a plane?',
        a: 'Yes, if you use a tool that supports full offline mode. makeEbook (as a PWA), Scrivener, Vellum, iA Writer, and desktop Word all work without internet. Reedsy Book Editor and most pure cloud tools do not.',
      },
      {
        q: 'Do PWAs really work offline?',
        a: "A properly-built PWA caches the app's code and assets on first visit. After that, you can open the tool without internet, write, save locally, and export files. When you reconnect, sync catches up. makeEbook is an example of a PWA that works this way.",
      },
      {
        q: 'Is Microsoft Word good for writing ebooks?',
        a: "Word is fine for drafting, but it doesn't produce a clean EPUB. If you draft in Word, plan to import the .docx into a dedicated ebook tool (makeEbook, Atticus, Scrivener) for formatting and EPUB export.",
      },
    ],
  },
  {
    slug: 'lifetime-license-vs-subscription',
    title: 'Lifetime License vs Subscription: Which Ebook Tools Offer Better Value?',
    description: 'The real cost of subscription vs lifetime-license ebook tools. A grown-up look at total cost of ownership over 24 months for Scrivener, Vellum, Atticus, and makeEbook.',
    date: '2026-04-20',
    updatedDate: '2026-04-20',
    readingTime: '10 min read',
    category: 'Tools & Comparisons',
    keywords: [
      'lifetime license ebook software',
      'one-time payment ebook tools',
      'ebook software subscription',
      'writing software lifetime license',
      'subscription vs one-time payment',
      'writing tools pricing',
    ],
    // image: '/blog/lifetime-license-vs-subscription.png',
    // imageAlt: 'Ink drawing of a wax seal being pressed onto a document with a small torn calendar page curling at the corner.',
    content: `
      <p class="lead">Subscription software is everywhere, and subscription fatigue is real. For most self-publishing authors, a lifetime license beats a subscription over 24 months. Here's the math, tool by tool, and the cases where subscription is still the right call.</p>

      <h2>The 24-Month Rule of Thumb</h2>
      <p>The rough heuristic: if you'll use a tool for more than 24 months, a lifetime license almost always comes out cheaper. If you're using it for one project and moving on, subscription is fine.</p>
      <p>Self-publishing authors tend to use the same writing and formatting tool for years. So lifetime tends to win. But there are exceptions worth naming.</p>

      <h2>What a Lifetime License Typically Buys You</h2>
      <ul>
        <li>Forever access to the software, including future updates (usually).</li>
        <li>No recurring billing, no credit card expiry headaches.</li>
        <li>Software that keeps working if the company goes quiet for a year.</li>
        <li>Fixed, predictable cost.</li>
      </ul>
      <p>What it doesn't buy you: server-side features that cost the company money to run (cloud sync, AI, collaboration). Those are often excluded from the lifetime deal, or offered as separate add-ons.</p>

      <h2>What a Subscription Actually Pays For</h2>
      <ul>
        <li><strong>Server costs.</strong> Cloud sync, AI processing, collaboration. These cost the company money every time you use them.</li>
        <li><strong>Ongoing development.</strong> A steady revenue stream funds new features, so subscriptions tend to improve faster than fire-and-forget lifetime software.</li>
        <li><strong>Support.</strong> Subscribers usually get priority support. Lifetime customers often wait longer.</li>
      </ul>

      <h2>Tool-by-Tool Breakdown</h2>
      <h3>Scrivener: $49 one-time</h3>
      <p>Classic lifetime pricing. $49 for a Mac or Windows license, with free updates within a major version. Periodic paid upgrades for major versions (every 5 to 7 years). No cloud sync included; you pair with Dropbox or iCloud yourself.</p>
      <p><strong>Verdict:</strong> Excellent value if you'll use it for multiple books. The learning curve is the real cost.</p>
      <h3>Vellum: $199 to $249 one-time</h3>
      <p>Pay once, use forever. Beautiful output. Mac only. No sync, no cloud.</p>
      <p><strong>Verdict:</strong> Expensive upfront, but if you publish multiple titles on Mac, the cost-per-book drops fast.</p>
      <h3>Atticus: $225 to $375 one-time</h3>
      <p>Lifetime license, no subscription option. All future updates included. Works in browser and desktop.</p>
      <p><strong>Verdict:</strong> One of the clearest "buy and own" deals in the space. High upfront cost is the barrier.</p>
      <h3>makeEbook: Free, $9/month Pro, or $149 lifetime</h3>
      <p><a href="/make-ebook">makeEbook</a> offers all three pricing models. The lifetime tier breaks even against the monthly subscription at 17 months, which is shorter than the 24-month heuristic. For any author planning to publish more than one book, lifetime is the clear choice.</p>
      <p><strong>Verdict:</strong> The lifetime option is the best deal in the space for authors committed to self-publishing long-term.</p>
      <h3>ProWritingAid: $30/month or $399 lifetime</h3>
      <p>Subscription-heavy tool with a lifetime option. Lifetime breaks even at 13 months.</p>
      <p><strong>Verdict:</strong> Lifetime worth it if you'll use it for more than a year.</p>
      <h3>Grammarly: $12/month to $30/month (no lifetime)</h3>
      <p>Pure subscription. No lifetime option exists.</p>
      <p><strong>Verdict:</strong> Only pay for Grammarly during the months you're actively editing. Cancel between projects.</p>
      <h3>Adobe Creative Cloud / InDesign: $23/month (no lifetime)</h3>
      <p>Subscription only since 2013. You cannot buy InDesign outright. This is the clearest example of a tool where the subscription lock-in is a real business risk for long-term users.</p>
      <p><strong>Verdict:</strong> Only pay for InDesign when you need it. For ebook-first workflows, there are cheaper alternatives that ship the same EPUB.</p>

      <h2>The Math: Cost Over 24 Months</h2>
      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Subscription (24 mo)</th>
            <th>Lifetime</th>
            <th>Winner</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>makeEbook</td><td>$216</td><td>$149</td><td>Lifetime</td></tr>
          <tr><td>ProWritingAid</td><td>$720</td><td>$399</td><td>Lifetime</td></tr>
          <tr><td>Scrivener</td><td>N/A</td><td>$49</td><td>Lifetime</td></tr>
          <tr><td>Vellum</td><td>N/A</td><td>$199</td><td>Lifetime</td></tr>
          <tr><td>Atticus</td><td>N/A</td><td>$225</td><td>Lifetime</td></tr>
          <tr><td>Grammarly Premium</td><td>$288</td><td>N/A</td><td>Subscription only</td></tr>
          <tr><td>Adobe InDesign</td><td>$552</td><td>N/A</td><td>Subscription only</td></tr>
        </tbody>
      </table>

      <h2>When Subscription Is Actually the Right Choice</h2>
      <p>Three cases where subscription beats lifetime:</p>
      <ol>
        <li><strong>One-book projects.</strong> If you'll finish and ship inside 12 months and not write another, subscription is cheaper.</li>
        <li><strong>Tool testing.</strong> Month-to-month lets you try a tool without committing. Many lifetime deals are final sale.</li>
        <li><strong>Server-heavy features.</strong> If the subscription is paying for AI, cloud sync, or collaboration you genuinely use every day, the server costs are real and the subscription reflects them.</li>
      </ol>

      <h2>The Subscription Trap to Avoid</h2>
      <p>The worst outcome is paying a subscription for years on a tool you barely use. Annual subscriptions compound quickly. Before renewing any writing tool, ask: am I actively using this, or is it autopay for a tab I haven't opened in three months?</p>
      <p>If the answer is the latter, cancel. You can always resubscribe.</p>

      <h2>For Most Self-Publishing Authors: Go Lifetime</h2>
      <p>If you're committed to self-publishing, a lifetime license is almost always the right economic choice. The upfront cost is higher, but the total cost over three or four books is lower, and you're insulated from pricing changes or the tool being discontinued.</p>
      <p><a href="/make-ebook">makeEbook's lifetime tier at $149</a> is the best value in the space for committed self-publishers. It breaks even against the subscription in under 18 months, and you never pay again.</p>

      <h2>Further Reading</h2>
      <p>For a side-by-side look at the tools themselves, see our <a href="/make-ebook/blog/best-ebook-creation-tools">comparison of the best ebook creation tools</a>. If you're considering Scrivener specifically, our <a href="/make-ebook/blog/free-scrivener-alternatives">guide to free Scrivener alternatives</a> covers that.</p>
    `,
    faqs: [
      {
        q: 'Is a lifetime license really forever?',
        a: "Usually yes, but read the fine print. Most lifetime licenses include all future minor updates. Major version upgrades (every 5 to 10 years) may cost extra. If the company shuts down, the software keeps working on your machine, though you won't get new features.",
      },
      {
        q: 'Which ebook tools offer lifetime licenses?',
        a: 'Scrivener ($49), Vellum ($199+), Atticus ($225+), makeEbook ($149), and ProWritingAid ($399) all offer lifetime licenses. Grammarly and Adobe InDesign are subscription-only.',
      },
      {
        q: 'Is $149 for makeEbook lifetime worth it?',
        a: "If you'll use makeEbook for more than 17 months, yes. The lifetime tier breaks even against the $9-per-month subscription at 17 months and pays for itself on every subsequent month. For multi-book authors, it's the clearest deal in the space.",
      },
      {
        q: "What happens if a lifetime license company goes out of business?",
        a: "The software on your machine keeps working. You won't get updates, cloud sync will stop if it relied on their servers, but the core app continues functioning. This is the resilience argument for lifetime over subscription.",
      },
      {
        q: 'Can I switch from subscription to lifetime later?',
        a: "Most tools let you. If you start on monthly and decide to commit, check for upgrade paths. Some companies credit your recent subscription payments against the lifetime cost, others don't. Worth emailing support before you upgrade.",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find(p => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return posts.sort((a, b) => {
    const aDate = new Date(a.updatedDate ?? a.date).getTime();
    const bDate = new Date(b.updatedDate ?? b.date).getTime();
    return bDate - aDate;
  });
}
