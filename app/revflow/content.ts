export const EMAIL = "neil@neilmcardle.com";

export const BOOK_CALL = `mailto:${EMAIL}?subject=${encodeURIComponent(
  "Revflow: booking flow sprint",
)}`;

export const LEAD =
  "A four-week sprint for airlines, hotels, tours and events that lose people between search and payment.";

export const WEEKS = [
  {
    when: "Week 1",
    title: "Audit",
    body: "I map your flow from search to confirmation and find where people drop off, using your analytics and session recordings.",
  },
  {
    when: "Weeks 2–3",
    title: "Redesign",
    body: "I redesign the steps that leak, ready for your team to build: fewer steps, prices that don't change at the end, payment without surprises.",
  },
  {
    when: "Week 4",
    title: "Test plan",
    body: "You get a ranked plan of what to ship first and how to measure it, so the lift shows up in your numbers.",
  },
];

export const DELIVERABLES = [
  "A drop-off map of your booking flow",
  "The redesigned flow for mobile and desktop, in Figma",
  "A test plan with the metric for each change",
  "A walkthrough with your product and engineering team",
];

export const FOR_WHO =
  "Best when you have a conversion target this quarter or a peak-season date coming up, and your own team is booked on the roadmap.";

export const PRICE = "Fixed price, from £18,000";
