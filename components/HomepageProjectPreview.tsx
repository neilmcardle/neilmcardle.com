// Card-sized SVG/CSS animations that hint at each portfolio product's core
// gesture. White-on-dark, geometric, no images. Each one loops subtly so the
// card feels alive without dominating the text. Keyframes live in
// app/globals.css so this file stays purely structural.

export type ProjectKey =
  | "makeebook"
  | "doodlewire"
  | "vector-paint"
  | "icon-animator"
  | "promptr"
  | "spark"
  | "touchtype"
  | "kids-alphabet";

interface PreviewProps {
  k: ProjectKey;
}

export function HomepageProjectPreview({ k }: PreviewProps) {
  return (
    <div className="hpp-frame" aria-hidden="true">
      {renderForKey(k)}
    </div>
  );
}

function renderForKey(k: ProjectKey) {
  switch (k) {
    case "makeebook":
      return <MakeEbookPreview />;
    case "doodlewire":
      return <DoodleWirePreview />;
    case "vector-paint":
      return <VectorPaintPreview />;
    case "icon-animator":
      return <IconAnimatorPreview />;
    case "promptr":
      return <PromptrPreview />;
    case "spark":
      return <SparkPreview />;
    case "touchtype":
      return <TouchtypePreview />;
    case "kids-alphabet":
      return <KidsAlphabetPreview />;
  }
}

function MakeEbookPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="hpp-svg">
      {/* Page outline */}
      <rect x="32" y="14" width="96" height="62" rx="2" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        {/* Typed text — three solid lines, the middle one stops short so
            the AI ghost completion can land in its tail. */}
        <line x1="42" y1="30" x2="100" y2="30" className="hpp-me-line hpp-me-l1" />
        <line x1="42" y1="44" x2="80" y2="44" className="hpp-me-line hpp-me-l2" />
        {/* Ghost autocomplete: fades in dim, then solidifies as if accepted. */}
        <line x1="80" y1="44" x2="116" y2="44" className="hpp-me-ghost" />
        <line x1="42" y1="58" x2="96" y2="58" className="hpp-me-line hpp-me-l3" />
      </g>
    </svg>
  );
}

function DoodleWirePreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="hpp-svg">
      {/* Wobbly sketch path */}
      <path
        d="M40 35 Q42 33, 48 34 T62 33 Q70 35, 78 34 T98 33 Q108 35, 116 34 T120 35 Q121 40, 120 45 T120 52 Q118 56, 116 55 T100 56 Q88 55, 78 56 T58 55 Q44 57, 42 55 T40 50 Q39 42, 40 38 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="hpp-dw-sketch"
      />
      {/* Clean button morph in */}
      <rect x="42" y="34" width="76" height="22" rx="5" fill="currentColor" className="hpp-dw-poly" />
      <text x="80" y="49" textAnchor="middle" fontSize="9" fontWeight="600" fill="#0a0a0a" className="hpp-dw-label">Button</text>
    </svg>
  );
}

function VectorPaintPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="hpp-svg">
      <path
        d="M20 70 C 40 20, 90 20, 80 60 S 130 80, 140 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="hpp-vp-stroke"
      />
      {/* "brush nib" dot riding the stroke */}
      <circle cx="0" cy="0" r="3" fill="currentColor" className="hpp-vp-nib" />
    </svg>
  );
}

function IconAnimatorPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="hpp-svg">
      {/* A glyph that runs through three preset animations: rotate, scale, pulse */}
      <g className="hpp-ia-glyph" transform-origin="80 45" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="80,28 90,42 80,56 70,42" />
        <circle cx="80" cy="42" r="3" fill="currentColor" />
      </g>
    </svg>
  );
}

function PromptrPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="hpp-svg">
      <g stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round">
        {/* Each row pairs a wavy path with a straight line at the same y.
            Cross-fade between the two reads as the prompt sharpening. */}
        <path d="M34 30 Q42 25, 50 30 T66 30 T82 30 T98 30 T114 30" className="hpp-pr-wavy hpp-pr-r1" />
        <line x1="34" y1="30" x2="118" y2="30" className="hpp-pr-sharp hpp-pr-r1" />

        <path d="M34 45 Q40 41, 46 45 T58 45 T70 45 T82 45 T94 45 T106 45" className="hpp-pr-wavy hpp-pr-r2" />
        <line x1="34" y1="45" x2="108" y2="45" className="hpp-pr-sharp hpp-pr-r2" />

        <path d="M34 60 Q42 56, 50 60 T66 60 T82 60 T98 60" className="hpp-pr-wavy hpp-pr-r3" />
        <line x1="34" y1="60" x2="100" y2="60" className="hpp-pr-sharp hpp-pr-r3" />
      </g>
    </svg>
  );
}

function SparkPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="hpp-svg">
      {/* Subtle vertical divider between the two halves */}
      <line x1="80" y1="14" x2="80" y2="76" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />

      {/* Left half — hand-drawn wireframe primitives */}
      <g stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="34" y="22" width="36" height="14" rx="2" className="hpp-sp-sketch hpp-sp-p1" />
        <circle cx="42" cy="52" r="5" className="hpp-sp-sketch hpp-sp-p2" />
        <line x1="52" y1="52" x2="70" y2="52" strokeWidth="2" className="hpp-sp-sketch hpp-sp-p3" />
      </g>

      {/* Right half — matching code lines (token dot + line) */}
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="92" cy="30" r="2" fill="currentColor" className="hpp-sp-code hpp-sp-p1" />
        <line x1="98" y1="30" x2="128" y2="30" className="hpp-sp-code hpp-sp-p1" />
        <circle cx="92" cy="46" r="2" fill="currentColor" className="hpp-sp-code hpp-sp-p2" />
        <line x1="98" y1="46" x2="124" y2="46" className="hpp-sp-code hpp-sp-p2" />
        <circle cx="92" cy="62" r="2" fill="currentColor" className="hpp-sp-code hpp-sp-p3" />
        <line x1="98" y1="62" x2="118" y2="62" className="hpp-sp-code hpp-sp-p3" />
      </g>
    </svg>
  );
}

function TouchtypePreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="hpp-svg">
      {/* Row of "keys" lighting up in sequence */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect
          key={i}
          x={30 + i * 14}
          y={40}
          width={11}
          height={11}
          rx={1.5}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          className={`hpp-tt-key hpp-tt-k${i}`}
        />
      ))}
    </svg>
  );
}

function KidsAlphabetPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="hpp-svg">
      <g className="hpp-ka-stack">
        <text x="80" y="58" textAnchor="middle" fontSize="42" fontWeight="800" fontFamily="var(--font-playfair, serif)" fill="currentColor" className="hpp-ka-letter hpp-ka-a">A</text>
        <text x="80" y="58" textAnchor="middle" fontSize="42" fontWeight="800" fontFamily="var(--font-playfair, serif)" fill="currentColor" className="hpp-ka-letter hpp-ka-b">B</text>
        <text x="80" y="58" textAnchor="middle" fontSize="42" fontWeight="800" fontFamily="var(--font-playfair, serif)" fill="currentColor" className="hpp-ka-letter hpp-ka-c">C</text>
      </g>
    </svg>
  );
}
