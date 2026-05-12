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
      {/* Text lines appearing one by one */}
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="42" y1="28" x2="78" y2="28" className="hpp-me-line hpp-me-l1" />
        <line x1="42" y1="38" x2="116" y2="38" className="hpp-me-line hpp-me-l2" />
        <line x1="42" y1="48" x2="100" y2="48" className="hpp-me-line hpp-me-l3" />
        <line x1="42" y1="58" x2="92" y2="58" className="hpp-me-line hpp-me-l4" />
      </g>
      {/* Blinking cursor */}
      <rect x="118" y="36" width="2" height="6" fill="currentColor" className="hpp-me-cursor" />
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
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="34" y1="30" x2="104" y2="30" />
        <line x1="34" y1="42" x2="92" y2="42" />
        <line x1="34" y1="54" x2="118" y2="54" />
      </g>
      {/* Score circles, filling in sequence */}
      <g className="hpp-pr-scores">
        <circle cx="120" cy="30" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" className="hpp-pr-c1" />
        <circle cx="108" cy="42" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" className="hpp-pr-c2" />
        <circle cx="132" cy="54" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" className="hpp-pr-c3" />
      </g>
    </svg>
  );
}

function SparkPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="hpp-svg">
      {/* Three "lines of code" with a syntax dot before each */}
      <g>
        <circle cx="32" cy="30" r="2" fill="currentColor" />
        <line x1="40" y1="30" x2="80" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="hpp-sp-l1" />
        <line x1="84" y1="30" x2="100" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" className="hpp-sp-l1" />
      </g>
      <g>
        <circle cx="40" cy="44" r="2" fill="currentColor" />
        <line x1="48" y1="44" x2="74" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="hpp-sp-l2" />
        <line x1="78" y1="44" x2="118" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" className="hpp-sp-l2" />
      </g>
      <g>
        <circle cx="40" cy="58" r="2" fill="currentColor" />
        <line x1="48" y1="58" x2="92" y2="58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="hpp-sp-l3" />
      </g>
      <g>
        <circle cx="32" cy="72" r="2" fill="currentColor" />
        <line x1="40" y1="72" x2="68" y2="72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="hpp-sp-l4" />
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
