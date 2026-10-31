import type { ReactNode } from "react";
import CaseLayout from "../_signature/CaseLayout";

export type Frame =
  | { kind: "full"; src: string; alt: string }
  | { kind: "pair"; items: { src: string; alt: string }[] }
  | { kind: "film"; src: string; poster: string; label: string }
  | { kind: "custom"; id: string; node: ReactNode };

export type Fact = { label: string; value: ReactNode };

export default function CaseStudy({
  hero,
  title,
  overview,
  facts,
  frames,
}: {
  hero: ReactNode;
  title?: string;
  overview: string;
  facts?: Fact[];
  frames: Frame[];
}) {
  return (
    <CaseLayout
      hero={hero}
      title={title}
      overview={overview}
      facts={facts}
      frames={frames}
    />
  );
}
