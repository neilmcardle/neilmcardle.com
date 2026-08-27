import type { Metadata } from "next";
import { RIGHTS_NOTICE } from "@/lib/coverly/attribution";

export const metadata: Metadata = {
  title: "Takedown requests — Coverly",
  description:
    "How rights holders can ask for a book cover to be removed from Coverly, and what happens when they do.",
};

const CONTACT =
  process.env.NEXT_PUBLIC_TAKEDOWN_EMAIL?.trim() || "neil@neilmcardle.com";

export default function TakedownPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        Takedown requests
      </h1>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Coverly is a research tool for book cover designers. It shows covers at
        reduced resolution, hotlinked from their source and never rehosted,
        alongside the publisher and — where we know it — the designer.{" "}
        {RIGHTS_NOTICE}
      </p>

      <h2 className="mt-10 text-sm font-semibold">
        If you want a cover removed
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Email{" "}
        <a
          href={`mailto:${CONTACT}?subject=Coverly%20takedown%20request`}
          className="text-foreground underline underline-offset-2"
        >
          {CONTACT}
        </a>{" "}
        with the title and ISBN, or just the link to the cover&rsquo;s page
        here. Tell us who you are and what right you hold. You don&rsquo;t need
        a lawyer and you don&rsquo;t need to argue the case — we don&rsquo;t
        require one.
      </p>

      <h2 className="mt-10 text-sm font-semibold">What happens next</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
        <li>We acknowledge the request, normally within two working days.</li>
        <li>
          The cover is delisted: it disappears from browse, from search, from
          similar-cover suggestions, from its own page, and from any comparison
          deck exported afterwards.
        </li>
        <li>We confirm once it&rsquo;s done.</li>
      </ol>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Decks already exported and saved by users are outside our control, in
        the same way a printed page is. Everything we serve, we can and will
        remove.
      </p>

      <h2 className="mt-10 text-sm font-semibold">Corrections</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        If a cover is credited to the wrong designer, or has no designer credit
        and should, that&rsquo;s worth an email too — to the same address. Cover
        designers are chronically uncredited and we would rather get it right.
      </p>
    </div>
  );
}
