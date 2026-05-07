# PRODUCT_STRATEGY.md — Kids Academy Business and Product Context

This document exists so Claude Code understands the product's commercial context, constraints, and priorities. Reference this when making decisions about scope, feature trade-offs, or what to build next.

---

## What this product is

Kids Academy is a subscription web app for UK parents who want their children to engage actively with the primary school curriculum. It is not a tutoring service, a homework helper, or a revision tool. It is a digital equivalent of a hands-on science kit or construction toy — something a child picks up independently and explores.

The core differentiator: **every topic has its own purpose-built interactive tool**. Not a video. Not a worksheet. Not multiple-choice questions. An experience that lets the child actually do the thing — cast a shadow, sort rocks, build a column calculation, construct a circuit.

---

## Target user

**Primary purchaser:** Parents of primary school children (ages 5–11) in England.
- Likely already paying for other educational services (Kumon, tutoring, Times Table Rock Stars, Duolingo)
- Motivated by school performance AND genuine curiosity/love of learning in their child
- Probably own an iPad or family tablet — this is the primary device
- Privacy-conscious: will scrutinise data practices before signing up
- Value evidence of curriculum alignment — "Is this actually what they're learning at school?" is the key question

**Primary user (the child):** Ages 5–11. Using independently, without adult supervision in session.
- Attention span: 10–20 minutes per topic
- Reads independently from Year 2 upward; Year 1 needs audio support
- Highly motivated by immediate feedback, progress, and completion
- Easily distracted — the UI must have no external links, no social features, no rabbit holes

---

## Positioning

**Not** a competitor to BBC Bitesize (free, broad, video-heavy).
**Not** a competitor to Mathletics or Times Table Rock Stars (pure maths drill).
**Not** a competitor to tutoring apps (passive instruction).

Position as: **"The interactive science kit your child never gets at school"** — expanded across all subjects.

The periodic table we already built is a perfect reference point for the product vision: it's beautiful, explorable, age-agnostic, and teaches through interaction rather than instruction.

---

## Revenue model

**Launch with:** Monthly subscription (£7.99/month) and annual (£59.99/year).
**Year 2 opportunity:** School licensing. Schools pay per class or per pupil. This requires a teacher dashboard and class management features — do not build this in Phase 1–5.

**Free tier purpose:** Acquisition. Let parents see the quality before paying. 3 free tools is enough to demonstrate the experience without giving away the full product.

---

## Go-to-market (do not build, but understand)

1. **Parent communities:** Mumsnet, Facebook parent groups, school WhatsApp groups
2. **Teacher referrals:** Teachers who discover it recommend to parents
3. **SEO:** "Year 3 science activities", "KS2 interactive maths" — long-tail curriculum queries
4. **makeEbook.ink cross-promotion:** Potential overlap in creative/educational product audience

---

## Product decisions and rationale

### Why Next.js App Router?
Server components allow curriculum data to be fetched at build time, reducing client JavaScript. The dynamic tool route (`/learn/[year]/[subject]/[topic]`) benefits from server-side rendering for SEO (parents searching for specific topics).

### Why Clerk for auth?
Handles the complexity of parent accounts + child profiles without building a custom auth system. Clerk's organisation feature can be adapted for school plan in Year 2.

### Why Supabase?
Real-time subscriptions (if needed for future collaborative features), generous free tier for MVP, excellent TypeScript SDK, row-level security handles the parent/child data model cleanly.

### Why not React Native / native app?
Web PWA is sufficient for the child experience (full-screen, installable). Avoids App Store/Play Store approval friction for educational content. Can ship updates instantly without app store review. App Store version can come in Year 2 if distribution warrants it.

### Why build tools in components rather than iframes?
Full integration with the progress system, auth context, and design system. iframes would make child profile context, progress tracking, and the AI hint system much harder to implement. The trade-off is higher build cost per tool, which is worth it for product quality.

---

## Content strategy

### Accuracy commitment
Every NC objective citation in `docs/CURRICULUM.md` is taken from the statutory DfE programmes of study. If a tool's content ever conflicts with what a child is being taught at school, trust is destroyed. Review every tool against the source document before shipping.

DfE source: https://www.gov.uk/government/publications/national-curriculum-in-england-primary-curriculum

### Content updates
The National Curriculum changes infrequently (last major update: 2014). Minor updates happen. Subscribe to DfE curriculum updates and review annually.

Tools should be reviewed for accuracy by a qualified primary school teacher before launch. Budget for this as a one-time cost per year group.

### New tools cadence
Target: 2 new tools per month after initial launch. Priority driven by: which year groups have lowest coverage × which topics parents search for most (use analytics).

---

## Quality bar

Every tool that ships must meet this bar:
1. A Year 3 child (or appropriate year group) can use it without adult instruction
2. It genuinely teaches the NC objective — a child who completes it understands something they didn't before
3. It is more engaging than the BBC Bitesize equivalent
4. It works on an iPad without frustration
5. A teacher would be comfortable recommending it

If a tool doesn't meet all five, do not ship it. A smaller set of excellent tools is worth more than a large set of mediocre ones.

---

## What not to build (Phase 1–5)

- Social features (leaderboards, comparing with other children)
- Parent-to-parent community
- Teacher accounts and classroom management
- Video content
- Printable worksheets
- Push notifications
- Native iOS/Android app
- Languages other than English
- Content outside England's National Curriculum

These may all come later. Resist the temptation to build them early.
