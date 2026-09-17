import { Resend } from "resend";

type SendArgs = {
  to: string;
};

type TrialEndingArgs = SendArgs & {
  trialEndsAt: Date;
};

type SubscriptionCanceledArgs = SendArgs;

type AbandonedCheckoutArgs = SendArgs & {
  resumeUrl: string;
};

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFrom(): string | null {
  return process.env.MAKEEBOOK_EMAIL_FROM ?? null;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://makeebook.ink";
}

export async function sendTrialEnding({ to, trialEndsAt }: TrialEndingArgs) {
  const resend = getResend();
  const from = getFrom();
  if (!resend || !from) {
    console.warn("[makeebook-email] skipping trial-ending: missing config");
    return;
  }
  const dateStr = fmtDate(trialEndsAt);
  const billingUrl = `${appUrl()}/make-ebook`;

  await resend.emails.send({
    from,
    to,
    subject: "Your makeebook trial ends in 3 days",
    text: [
      "Quick heads up: your makeebook trial ends in 3 days.",
      "",
      `If you want to keep Book Mind reading your manuscript, you don't need to do anything. Your card will be charged on ${dateStr} and you'll stay on Pro.`,
      "",
      `If you'd rather not, cancel in one click: ${billingUrl}`,
      "",
      "Either way, your books are yours and you can export them anytime.",
      "",
      "Neil",
    ].join("\n"),
  });
}

export async function sendSubscriptionCanceled({
  to,
}: SubscriptionCanceledArgs) {
  const resend = getResend();
  const from = getFrom();
  if (!resend || !from) {
    console.warn(
      "[makeebook-email] skipping subscription-canceled: missing config",
    );
    return;
  }
  const pricingUrl = `${appUrl()}/make-ebook#pricing`;

  await resend.emails.send({
    from,
    to,
    subject: "Your makeebook Pro is canceled",
    text: [
      "Your Pro subscription is canceled. The free editor is still yours for as long as you want, and all your books are still exportable.",
      "",
      "A quick favour: if you have 30 seconds, I'd love to know why you cancelled. Reply with one sentence. It directly shapes what I build next.",
      "",
      `If you ever want Pro back, the door is open: ${pricingUrl}`,
      "",
      "Neil",
    ].join("\n"),
  });
}

export async function sendAbandonedCheckout({
  to,
  resumeUrl,
}: AbandonedCheckoutArgs) {
  const resend = getResend();
  const from = getFrom();
  if (!resend || !from) {
    console.warn(
      "[makeebook-email] skipping abandoned-checkout: missing config",
    );
    return;
  }

  await resend.emails.send({
    from,
    to,
    subject: "Did you mean to start your makeebook trial?",
    text: [
      "You started a 7-day Pro trial but didn't quite finish. No charge, no problem.",
      "",
      "If something blocked you, hit reply and let me know.",
      "",
      `Otherwise, here's the link to pick up where you left off: ${resumeUrl}`,
      "",
      "Neil",
    ].join("\n"),
  });
}
