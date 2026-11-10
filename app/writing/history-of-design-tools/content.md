# A History of Design Tools, 1963–2026

By Neil McArdle · 6 November 2026

## From a palette to a pen tool

I studied fine art at Loughborough University from 2004 to 2007 and painted for a living after that. The financial crash arrived as I started. Even established artists were selling around half as much at major shows, and over three years I sold about 250 paintings, most for between £30 and £150 and none for more than £1,000.

In London, after jobs in PR and media monitoring, I bought a textbook for Adobe Illustrator CS6, taught myself from it, and got a design job at a marketing agency. Since then I've worked in Illustrator, Photoshop, After Effects, Premiere Pro, Adobe XD, Figma and now Paper. I wanted to know where those tools came from, and why some of them lost. This is what I found.

## What 60 years show

Every big shift in design tools came from a change in _where the work lives_, not from a better brush. Paper moved to screen (1963), screen moved to the desktop (1984), the desktop moved to the browser (2016), and since 2025 the canvas is starting to move into a prompt.

- **The platform decides the winner.** PageMaker rode the Mac and the LaserWriter. Figma rode WebGL in the browser. Tools that ignored a platform shift (Fireworks, InVision, Adobe XD) died or froze.
- **Focused tools beat suites, until they become suites.** Sketch beat Photoshop for screens by doing less. Figma then grew into a suite of its own (FigJam, Slides, Sites, Make).
- **Collaboration beat features.** Figma's real-time, shared file ended the era of emailing files and syncing versions. Everything that sat on top of the old file (InVision, Zeplin, Abstract) lost its reason to exist.
- **Incumbents buy, regulators now block.** Adobe bought Aldus (1994) and Macromedia (2005) to win. Its $20 billion bid for Figma was abandoned in 2023 after UK and EU pushback.
- **AI is the current platform shift.** Prompt-to-interface tools (Figma Make, Google Stitch, Claude Design) arrived in 2025–26. If the pattern holds, the next winner will be the tool built _for_ AI, not the one that bolts AI on.

## 1963–1983: Drawing on a computer is invented

In 1963 one PhD student invented most of what a design tool still is. Ivan Sutherland wrote [Sketchpad](https://en.wikipedia.org/wiki/Sketchpad) at MIT's Lincoln Laboratory, running on the TX-2, one of the largest computers of its day. He could often only get the machine to himself between 3 and 5 a.m.

**What Sketchpad did.** You drew straight on the screen with a light pen (a pen that senses the screen's light to know where it is). You could draw lines and circles, zoom in and out, resize and delete shapes, and save your work. It also had:

- **Rubber-banding**: a line that stretches as you drag, the way every pen tool still works.
- **Constraints**: rules such as "keep these lines parallel", which the computer kept true as you edited.
- **Masters and instances**: draw a shape once, place copies, change the master and every copy updates. This is the direct ancestor of Sketch's Symbols and Figma's Components.

![Figure from Sutherland's Sketchpad thesis](/writing/history-of-design-tools/sketchpad-1963.png)

_Sketchpad, 1963: a figure from Sutherland's thesis showing how a line was stored as a linked structure of two points: an early form of the object model every vector tool uses. Source: [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Sketchpad_N-Component_Element.png), CC0._

Sutherland later won the Turing Award (1988) for this work. Sketchpad is treated as the starting point of both computer graphics and computer-aided design (CAD).

**NLS and "the Mother of All Demos" (1968).** On 9 December 1968 Douglas Engelbart of the Stanford Research Institute showed his oN-Line System to an audience in San Francisco. In one 90-minute demo he showed the mouse, windows, clickable links between documents, and two people editing the same screen from different places, talking over a video link. That last idea, live shared editing, is what Figma sold as "multiplayer" 48 years later.

**Xerox Alto and Bravo (1973–74).** Xerox's research lab in Palo Alto (PARC) hired many of Engelbart's team and built the Alto, a personal computer with a mouse, windows and a bitmap screen: a screen made of individually controllable dots, so it could show pictures and real typefaces. On it they built Bravo (1974), the first editor that showed text on screen exactly as it would print. That idea was later called WYSIWYG: "what you see is what you get". Every design tool since works this way.

**Xerox Star (1981).** Xerox's attempt to sell these ideas: the first commercial computer with a desktop, icons, folders and WYSIWYG documents. It was expensive and sold poorly. Apple's engineers had toured PARC, and the Lisa (1983) and Macintosh (1984) took the ideas to a mass market.

**Why it matters now.** Every core idea in Figma (direct manipulation, a large zoomable drawing sheet, reusable components) was demonstrated in 1963. What took 50 years was making it cheap, fast and shared.

## 1984–1994: The Mac makes everyone a publisher

In about eighteen months, work that had needed a typesetting shop and specialist machines became something one person could do at a desk. Three things arrived together: the Apple Macintosh (January 1984), Adobe's PostScript printer language in Apple's LaserWriter (March 1985), and Aldus PageMaker (July 1985). Aldus founder Paul Brainerd named the result "desktop publishing".

**MacPaint (1984).** Bill Atkinson's MacPaint shipped free with the first Mac. Its tool palette down the left (pencil, brush, paint bucket, eraser, lasso, marquee) set the layout almost every design tool still uses.

![MacPaint 2.0 screenshot](/writing/history-of-design-tools/macpaint-2.png)

_MacPaint 2.0: the tool palette and pattern swatches on the left set the template for every paint tool since. © Apple; screenshot via [English Wikipedia](https://en.wikipedia.org/wiki/File:MacPaint_2.0_screenshot.png), used for historical illustration._

**PageMaker (1985).** The first page-layout program for a personal computer. You placed text and pictures on a virtual pasteboard and printed what you saw. The PC version in 1986 shipped with, and needed, Windows 1.0.

![Adobe PageMaker 7.0 screenshot](/writing/history-of-design-tools/pagemaker-7.png)

_PageMaker 7.0 (Adobe era) on classic Mac OS: a page on a pasteboard, a toolbox and a colour palette. © Adobe; screenshot via [English Wikipedia](https://en.wikipedia.org/wiki/File:Adobe_PageMaker_7.0_on_Mac_OS_screenshot.png)._

**Adobe Illustrator (March 1987).** Adobe's first desktop drawing program. It brought the Bézier curve (a curve you shape by dragging handles) to designers, built on PostScript. The pen tool you use in Figma today descends from it.

![Adobe Illustrator 10 screenshot](/writing/history-of-design-tools/illustrator-10.png)

_Illustrator 10 (2001): long toolbox left, floating panels right: the layout Adobe kept for 20 years. © Adobe; screenshot via [English Wikipedia](https://en.wikipedia.org/wiki/File:Illustrator_10.png)._

**HyperCard (1987).** Also by Bill Atkinson, free on every Mac. You built "stacks" of cards and linked buttons on one card to another, with no real programming. People used it to make clickable prototypes, games (the first version of Myst) and reference tools. It was the first prototyping tool most designers ever touched, and its card-and-link model fed directly into the idea of the web.

**Adobe Photoshop (February 1990).** Started in 1987 as a program by Thomas Knoll, a University of Michigan PhD student, to show greyscale images on his Mac. His brother John, working at Industrial Light & Magic, saw its potential. After Aldus and SuperMac turned them down, Adobe licensed it in 1988. Photoshop 1.0 cost $895, at a time when retouching on dedicated high-end systems cost around $300 an hour. Adobe bought the rights outright in 1995 for $34.5 million.

![Adobe Photoshop 2023 screenshot](/writing/history-of-design-tools/photoshop-2023.png)

_Photoshop in 2023, 33 years on: the same toolbar-left, panels-right layout, now with AI features built in. © Adobe; screenshot via [English Wikipedia](https://en.wikipedia.org/wiki/File:Adobe_Photoshop_2023_screenshot.png)._

**The consolidation begins.** In 1994 Adobe bought Aldus, gaining PageMaker and After Effects. It is the first of three times Adobe tried to buy its way past a rival.

## 1995–2009: The web arrives and Adobe swallows Macromedia

The web created a new job (designing screens, not pages), and for fifteen years nobody built a tool just for it. Designers made websites in Photoshop, a photo editor, because nothing better existed. Macromedia came closest.

**Flash (1996).** Macromedia bought FutureSplash Animator and renamed it Flash. It put animated, interactive vector graphics in the browser. For a decade, ambitious websites, games, banner ads and online video were built in it. Its timeline-and-keyframe model still shapes animation tools such as Figma Motion and Rive.

**Fireworks (1998).** Macromedia's Fireworks was the first graphics tool made for screens. It mixed vector shapes and pixels, had pages and states for mock-ups, and exported web-ready images. Sketch and Figma later took many of its ideas.

![Adobe Fireworks CS6 screenshot](/writing/history-of-design-tools/fireworks-cs6.png)

_Fireworks CS6 (2012), the last version before Adobe stopped development. © Adobe; screenshot via [English Wikipedia](https://en.wikipedia.org/wiki/File:Adobe_Fireworks_CS_6.png)._

**Adobe buys Macromedia (2005).** Adobe completed the $3.4 billion all-stock purchase on 3 December 2005, its largest deal at that point. It gained Flash, Dreamweaver, Fireworks and FreeHand. FreeHand was dropped in favour of Illustrator. Fireworks lived on, under-loved, until 2013. Flash Player was switched off at the end of 2020, killed by the iPhone, which never supported it, and by open web standards.

**Why it matters now.** By 2009 a screen designer used four or five Adobe programs, none built for screens. That gap is what Sketch walked into.

## 2010–2015: Screen design finally gets its own tool

The iPhone (2007) and the app boom made screen design the biggest design job, and a two-person Dutch company built the tool for it. That tool, Sketch, did less than Photoshop and won because of it.

**Sketch (7 September 2010).** Built by Pieter Omvlee and Emanuel Sá at Bohemian Coding in The Hague, for Mac only. It was vector-based, fast, cheap (a one-off licence rather than Adobe's prices) and had nothing for photo editing. Key ideas:

- **Artboards**: many screens side by side on one canvas.
- **Symbols**: a reusable element you edit once and update everywhere (Sketchpad's masters, 47 years later).
- **Plugins**: an open system that let the community add features, which grew a large ecosystem.

It won an Apple Design Award in 2012. In December 2015 it left the Mac App Store, citing Apple's technical limits, slow app review and no way to charge for upgrades.

**Adobe abandons Fireworks (2013).** Adobe stopped developing Fireworks in 2013, saying it overlapped with Photoshop, Illustrator and Edge. Fireworks users moved to Sketch in large numbers; Sketch's team had courted that community directly.

**Creative Cloud (2013).** On 6 May 2013 Adobe announced that Creative Suite 6 would be the last boxed version. All future tools would be rented by subscription. Designers reacted angrily, but Adobe's subscription revenue grew from about $1.1 billion in 2013 to over $20 billion in 2024.

> I learned Illustrator in 2014 from a textbook for CS6, the last version Adobe ever sold in a box. By the time I opened it, the boxes had gone.

**Canva (2013).** Founded in Perth by Melanie Perkins, Cliff Obrecht and Cameron Adams, and launched from Sydney, Canva went after the people Adobe ignored: non-designers. It runs in a browser, starts you from a template rather than a blank page, and is free to start. Teachers, marketers and small businesses made it one of the most-used design tools in the world. It matters to this history because it proved the biggest market for design tools is people who are not designers: the same market today's prompt-to-design AI tools are chasing.

**InVision (2011) and the "stack" era.** Sketch files lived on one person's laptop, so tools grew up around them. InVision was the biggest: upload static screens, link them into a clickable prototype, share a link and collect comments. It was valued at $1.9 billion in 2018. Teams also paid for hand-off tools (Zeplin), version control (Abstract) and animation tools (Principle), and synced files between them.

Every tool in that stack existed only because the design file lived on one computer. Remove that problem and the whole stack goes, which is what happened next.

## 2016–2024: The browser wins

Figma won by putting the design file on a web address that everyone could open and edit at once. That one change made most of the Sketch-era stack unnecessary.

**Figma (public release 27 September 2016).** Dylan Field and Evan Wallace started it in 2012 after meeting at Brown University, funded at first by Field's $100,000 Thiel Fellowship. Wallace was a graphics specialist; their bet was WebGL, a browser technology that draws graphics using the computer's graphics chip, so a browser tool could feel as fast as a desktop app. It took four years to build. Invite-only preview opened on 3 December 2015; the first paid plan came in 2017.

What Figma changed:

- **One live file**: a link instead of a file. No "final_v7.sketch".
- **Multiplayer**: several people editing at once, each with a visible cursor, like Google Docs.
- **Any computer**: Windows and Linux users, developers and managers could all open it for free.
- **Built-in prototyping, comments and hand-off**: replacing InVision, Zeplin and Abstract.
- **Shared libraries**: a team's components published once and used across every file, which made design systems practical.

![A new Figma design file](/writing/history-of-design-tools/figma.png)

_A new Figma file, running in a browser tab: layers left, canvas centre, properties right, tools floating at the bottom. © Figma; screenshot via [English Wikipedia](https://en.wikipedia.org/wiki/File:A_newly-created_design_project_on_Figma.png)._

COVID-19 remote work in 2020 made a shared online canvas essential, and adoption accelerated. Figma then widened into a suite: FigJam whiteboards (2021), Dev Mode for developers (2023), and later Slides, Sites and more.

**The $20 billion deal that failed (2022–23).** In September 2022 Adobe agreed to buy Figma for $20 billion in cash and stock. Adobe's shares fell 17% on the news. The UK's Competition and Markets Authority and the European Commission saw it as a market leader removing its main rival. On 18 December 2023 both companies dropped the deal, saying there was "no clear path" to approval. Adobe paid Figma a $1 billion termination fee. Its own rival, Adobe XD (2016), had already been left to stall: from mid-2023 it was no longer sold on its own and gets bug fixes only.

> Adobe XD was the tool I used before Figma. Reading this back, I was on the losing side of a $20 billion deal without knowing it.

**InVision shuts down (2024).** Once valued at $1.9 billion, InVision sold its Freehand whiteboard to Miro in 2023, announced its closure in January 2024, and switched off its design services on 31 December 2024. Customer prototypes were deleted afterwards.

**Sketch survives as a niche.** Still Mac-first and independent, it added a web companion, but lost its default status to Figma.

## 2022–2026: AI moves into the canvas

The newest shift replaces drawing with describing what you want. It started with images in 2022 and reached interfaces in 2025, and the market began pricing Figma as a company that could be disrupted.

**Midjourney (2022).** Midjourney, along with DALL·E 2 and Stable Diffusion, turned a sentence into a finished image. Midjourney ran inside the chat app Discord and became the one designers actually used, for mood boards, concept art and campaign imagery. It was the first time a design tool's main input was words instead of a mouse or pen, and it set designers' expectations for everything that followed.

**Figma goes public (31 July 2025).** Priced at $33 a share, Figma opened at $85 and closed its first day at $115.50, up 250%. Renaissance Capital called it the biggest first-day jump for any US IPO raising over $500 million. At pricing it was valued just under the $20 billion Adobe had offered.

**Prompt-to-interface tools (2024–26).** Figma Make, Google Stitch, Claude Design, Paper, v0, Lovable and Bolt all turn a written prompt into a working interface or app. They are too new to judge, so they sit in the To watch list below. Google's Stitch 2.0 launch in March 2026 was followed by a fall in Figma's share price.

Figma's own results still showed customers spending more: net dollar retention (how much existing customers' spending grew) was 136% in its Q2 2026 results.

**Config 2026: Figma's response.** Figma repositioned its canvas as a shared space for people, code and AI agents. Announcements included Code Layers (real code as a material on the canvas, beside vectors), a Figma agent with reusable skills and connectors to tools like Slack and GitHub, generative plugins built from a prompt, Figma Motion for animation, AI shaders, and Weave tools for AI image tasks.

**Where this leaves the history.** For 60 years, design tools got better at _making_ the picture. The new tools make the picture for you and ask you to judge it. If the pattern from Sketch and Figma holds, the winner will be whichever tool is built natively for that judging-and-editing loop, rather than the incumbent that adds a prompt box.

## Also notable

Tools that scored 3–5 out of 10 on the scorecard: worth knowing, but not turning points. Oldest first.

- **SuperPaint (1973)**: Richard Shoup's early paint program at Xerox PARC.
- **Quantel Paintbox (1981)**: the paint system TV studios used for on-screen graphics.
- **AutoCAD (1982)**: brought Sketchpad's ideas to engineers and architects on ordinary PCs.
- **MacDraw (1984)**: shapes you could select and move after drawing them, beside MacPaint.
- **Fontographer (1986)**: made type design possible on a desktop computer.
- **QuarkXPress (1987)**: ruled magazine and newspaper layout through the 1990s.
- **FreeHand (1988)**: Illustrator's main rival; dropped by Adobe after it bought Macromedia.
- **Macromedia Director (1988)**: interactive CD-ROMs; the forerunner of Flash.
- **Fractal Design Painter (1991)**: imitated real brushes and paper; now Corel Painter.
- **Dreamweaver (1997)**: visual website building that wrote the HTML for you.
- **InDesign (1999)**: Adobe's layout tool; took print from QuarkXPress.
- **Axure RP (2003)**: clickable wireframes without code.
- **Balsamiq (2008)**: wireframes made to look hand-drawn on purpose.
- **Miro (2011)**: online whiteboard; bought InVision's Freehand in 2023.
- **Procreate (2011)**: the main professional illustration app on iPad.
- **Paper by FiftyThree (2012)**: sketching on iPad that felt like a real notebook.
- **Webflow (2013)**: visual website building that outputs production code.
- **Framer (2013)**: code prototyping tool turned no-code website builder.
- **Zeplin (2014)**: showed developers the sizes, colours and assets in a design.
- **Affinity (2014)**: Serif's one-off-price rivals to Illustrator and Photoshop; bought by Canva in 2024.
- **Lottie (2015)**: Airbnb's format for playing designers' animations inside apps.
- **Apple Pencil (2015)**: the stylus that made iPad drawing professional.
- **Modulz (2016)**: early web-native design tool. It produced the Radix UI library, and its co-founder Stephen Haney later started Paper.
- **Adobe XD (2016)**: Adobe's Sketch rival; frozen after the Figma deal.
- **Penpot (2021)**: open-source, browser-based, saves designs in web standards.
- **DALL·E 2 (2022)**: OpenAI's text-to-image model; the first many people saw.
- **Stable Diffusion (2022)**: open text-to-image model anyone could run and modify.
- **v0 (2023)**: Vercel's prompt-to-interface code tool.
- **Adobe Firefly (2023)**: Adobe's image generator, built into Photoshop as Generative Fill.

![Macromedia FreeHand screenshot](/writing/history-of-design-tools/freehand.png)

_FreeHand under Macromedia, with a detailed vector illustration. © Adobe/Macromedia; screenshot via [English Wikipedia](https://en.wikipedia.org/wiki/File:Macromedia_Freehand_screenshot.png)._

![Adobe Dreamweaver 2020 screenshot](/writing/history-of-design-tools/dreamweaver-2020.png)

_Dreamweaver in 2020: a live page preview on top, the HTML it generates below. © Adobe; screenshot via [English Wikipedia](https://en.wikipedia.org/wiki/File:Default_Dreamweaver_2020_screen.png)._

![Adobe XD screenshot](/writing/history-of-design-tools/adobe-xd.png)

_Adobe XD on macOS: Design, Prototype and Share tabs across the top: a direct copy of the Sketch-plus-InVision workflow in one app. Screenshot via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Adobe_XD_running_on_macOS_Catalina.png)._

## To watch

Launched in roughly the last two years, so their influence can't be judged yet.

- **Lovable (2024)**: prompt to working app.
- **Bolt (2024)**: prompt to working app, in the browser.
- **Figma Make (2025)**: prompt to prototype inside Figma.
- **Google Stitch (2025)**: Google's free AI-native interface canvas.
- **Figma Weave (2025)**: AI image and media workflows inside Figma.
- **Paper (2025)**: design canvas built on real HTML and CSS that AI agents can edit.

> Paper is the newest tool I work in. It sits in this list for the same reason as the rest: too new to judge.

- **Pencil (2025)**: design canvas that runs inside the code editor.
- **Claude Design (2026)**: Anthropic's prompt-to-prototype tool.

## Timeline

Main-story tools and turning points, newest first. Every tool considered, with its score, is in the [scorecard](/writing/history-of-design-tools/scorecard).

| Date     | Tool or event                       | What it changed                                               |
| -------- | ----------------------------------- | ------------------------------------------------------------- |
| 2026     | Figma Config 2026                   | Code Layers, Figma agent, generative plugins, Motion, shaders |
| Jul 2025 | Figma IPO                           | Up 250% on day one                                            |
| Dec 2024 | InVision shuts down                 | The Sketch-era prototyping layer ends                         |
| Dec 2023 | Adobe–Figma deal abandoned          | Regulators block a $20bn takeover; $1bn fee paid              |
| Sep 2022 | Adobe agrees to buy Figma           | Adobe's shares fall 17%                                       |
| 2022     | Midjourney                          | Words become a design tool's main input                       |
| Sep 2016 | Figma public release                | Browser-based, multiplayer design                             |
| May 2013 | Creative Cloud only; Fireworks ends | Subscriptions replace boxed software                          |
| 2013     | Canva                               | Design for non-designers                                      |
| 2011     | InVision                            | Clickable prototypes from static screens                      |
| Sep 2010 | Sketch                              | First popular tool built only for screens                     |
| Dec 2005 | Adobe buys Macromedia               | $3.4bn; Flash and Fireworks join Adobe                        |
| 1998     | Fireworks                           | First graphics tool built for screens                         |
| 1996     | Flash                               | Interactive animation in the browser                          |
| 1994     | Adobe buys Aldus                    | PageMaker joins Adobe                                         |
| Feb 1990 | Photoshop 1.0                       | Photo editing on a desktop, $895                              |
| 1987     | HyperCard                           | Clickable cards and links, no code                            |
| Mar 1987 | Illustrator                         | Bézier pen tool                                               |
| Jul 1985 | PageMaker                           | Desktop publishing is born                                    |
| Jan 1984 | MacPaint                            | The tool palette and the mouse go mainstream                  |
| 1981     | Xerox Star                          | First commercial desktop and icons                            |
| 1974     | Bravo                               | First WYSIWYG editor                                          |
| 1973     | Xerox Alto                          | Mouse, windows, bitmap screen                                 |
| Dec 1968 | NLS demo                            | Mouse, links, shared live editing                             |
| 1963     | Sketchpad                           | Direct drawing, constraints, reusable masters                 |

## Sources

- [Sketchpad, Wikipedia](https://en.wikipedia.org/wiki/Sketchpad)
- [Ivan Sutherland, Father of Computer Graphics, I Programmer](https://www.i-programmer.info/history/people/329.html)
- [Ivan Sutherland PhD '63, MIT Technology Review](https://www.technologyreview.com/s/614122/ivan-sutherland-phd-63/)
- [Desktop Publishing, Computer History Museum](https://www.computerhistory.org/revolution/personal-computers/17/306)
- [Adobe corporate milestones, Computer History Museum (PDF)](https://archive.computerhistory.org/resources/access/text/2012/10/102746510-05-01-acc.pdf)
- [A brief history of Adobe's apps, The Eclectic Light Company](https://eclecticlight.co/2025/09/06/a-brief-history-of-adobes-apps/)
- [Adobe Photoshop 2.0/2.5, Centre for Computing History](https://www.computinghistory.org.uk/det/31829/Adobe-Photoshop-2-0-2-5/)
- [Aldus Corporation, Centre for Computing History](https://www.computinghistory.org.uk/det/66562/Aldus-Corporation/)
- [Adobe Form 10-K FY2005 (Macromedia acquisition): SEC](https://www.sec.gov/Archives/edgar/data/0000796343/000104746906001601/a2167302z10-k.htm)
- [Sketch (software): Wikipedia](<https://en.wikipedia.org/wiki/Sketch_(software)>)
- [Fireworks begat Sketch, UX Collective](https://uxdesign.cc/fireworks-begat-sketch-2c208673d89f)
- [Figma, Wikipedia](https://en.wikipedia.org/wiki/Figma)
- [Design: Meet the internet, Figma blog](https://www.figma.com/blog/design-meet-the-internet/)
- [Adobe pays $1 billion to terminate Figma acquisition, PetaPixel](https://petapixel.com/2023/12/18/adobe-pays-1-billion-to-terminate-20-billion-figma-acquisition)
- [Adobe and Figma terminate $20 billion deal, Bloomberg via BNN](https://www.bnnbloomberg.ca/adobe-and-figma-terminate-20-billion-deal-after-regulator-clash-1.2013083)
- [Future of Adobe XD, Creative Bloq](https://www.creativebloq.com/news/future-of-adobe-xd)
- [InVision design collaboration services shutdown, InVision](https://invisionapp.com/inside-design/invision-design-collaboration-services-shutdown)
- [Why InVision failed, Fast Company](https://www.fastcompany.com/91069936/why-invision-failed)
- [Figma IPO first-day record, Renaissance Capital](https://www.renaissancecapital.com/IPO-Center/News/112482)
- [Figma Q2 2026 results, Business Wire](https://www.businesswire.com/news/home/20260805158853/en/)
- [Everything announced at Config 2026, Figma Forum](https://forum.figma.com/product-updates-3/everything-announced-at-config-2026-55221)
- [Figma unveils AI agents and code-native tools at Config 2026, AIM](https://analyticsindiamag.com/ai-news/figma-unveils-ai-agents-and-code-native-design-tools-at-config-2026)
- [AI vibe design with Google Stitch and Claude Design, SolGuruz](https://solguruz.com/blog/ai-vibe-design-using-stitch-and-claude-design/)
- [Best AI tools for UI/UX design 2026, Rework](https://resources.rework.com/tools/ai-tools/best-ai-tools-for-ui-ux-design-2026)

Screenshots are credited under each image.
