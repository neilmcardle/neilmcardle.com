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
  | "kids-alphabet"
  | "tessera";

interface PreviewProps {
  k: ProjectKey;
}

export function HomepageProjectPreview({ k }: PreviewProps) {
  const isGlass = k === "makeebook" || k === "doodlewire" || k === "tessera";
  return (
    <div
      className={`hpp-frame${isGlass ? " hpp-frame--glass" : ""}`}
      aria-hidden="true"
    >
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
    case "tessera":
      return <TesseraPreview />;
  }
}

function TesseraPreview() {
  // Glass tile design from the product-icon handoff, ts- prefixed ids and
  // the Tessera logomark paths verbatim from /public/tessera/logo.svg.
  // Logo native viewBox is 320×280; scaled 1.5× and centered into the 600
  // square tile (translate 60,90 puts it in the centre).
  return (
    <svg viewBox="0 0 600 600" width="100%" height="100%" className="hpp-svg">
      <defs>
        <linearGradient id="ts-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset=".55" stopColor="#101012" />
          <stop offset="1" stopColor="#0a0a0c" />
        </linearGradient>
        <radialGradient id="ts-vignette" cx=".5" cy=".5" r=".7">
          <stop offset=".55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".55" />
        </radialGradient>
        <filter id="ts-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={11} />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .25 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <radialGradient id="ts-pool" cx=".5" cy="1.05" r=".55" fx=".5" fy="1.05">
          <stop offset="0" stopColor="#8A7F70" stopOpacity="1" />
          <stop offset=".45" stopColor="#8A7F70" stopOpacity=".55" />
          <stop offset="1" stopColor="#8A7F70" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ts-body" gradientUnits="userSpaceOnUse" x1="0" y1="90" x2="0" y2="510">
          <stop offset="0" stopColor="#0e0d0c" />
          <stop offset=".5" stopColor="#100f0d" />
          <stop offset=".85" stopColor="#1f1c15" />
          <stop offset="1" stopColor="#332d20" />
        </linearGradient>
        <linearGradient id="ts-spec" gradientUnits="userSpaceOnUse" x1="0" y1="90" x2="0" y2="300">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".35" />
          <stop offset=".4" stopColor="#ffffff" stopOpacity=".1" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <mask id="ts-spec-mask">
          <rect width="600" height="600" fill="url(#ts-spec)" />
        </mask>
        <filter id="ts-shadow" x="-20%" y="-15%" width="140%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={6} />
          <feOffset dy={10} />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".55" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="ts-clip">
          <rect width="600" height="600" rx="132" ry="132" />
        </clipPath>
        <g id="ts-logo">
          <path d="M225.74,16.26l-65.23,113.25L225.76,16.3s-.02-.03-.02-.05Z" />
          <path d="M19.86,135.14l130.82.06s0-.05.03-.06H19.86ZM93.98,16.19l65.5,113.31h.03L93.98,16.19Z" />
          <path d="M150.64,144.74H19.86l130.8.05s-.03-.03-.02-.05Z" />
          <path d="M160.53,150.48l65.5,113.34.02-.02-65.52-113.33Z" />
          <path d="M309.49,129.41c-.18,0-.35,0-.51.02L243.44,16.27c1.06-1.65,1.66-3.6,1.66-5.68,0-5.79-4.7-10.5-10.51-10.5-4.03,0-7.54,2.27-9.3,5.6H94.5c-1.74-3.38-5.26-5.7-9.34-5.7-5.81,0-10.51,4.7-10.51,10.5,0,2.11.62,4.08,1.7,5.73L11.02,129.46c-.16-.02-.34-.02-.51-.02-5.79,0-10.51,4.69-10.51,10.5s4.72,10.5,10.51,10.5c.18,0,.35,0,.51-.02l65.39,113.2c-1.07,1.65-1.68,3.6-1.68,5.7,0,5.81,4.7,10.51,10.51,10.51,4.06,0,7.6-2.3,9.34-5.7l130.93.16c1.73,3.39,5.28,5.71,9.34,5.71,5.81,0,10.51-4.7,10.51-10.5,0-2.1-.62-4.06-1.7-5.71v-.02l65.31-113.38c.16.02.34.02.5.02,5.81,0,10.51-4.7,10.51-10.51s-4.7-10.5-10.51-10.5ZM234.03,21.07s.03.02.06.02c.16.02.32.02.5.02s.35,0,.53-.02l65.54,113.15c-.19.27-.35.56-.5.86l-.02.02-130.8.08v-.02c-.14-.3-.32-.59-.51-.88v-.02L234.03,21.07ZM94.5,15.3h130.7c.14.34.34.66.54.96,0,.02,0,.03.02.05l-65.25,113.2h-.02c-.16-.02-.32-.02-.5-.02-.16,0-.32,0-.48.02h-.03L93.98,16.19c.19-.29.37-.58.51-.9ZM84.66,20.99c.16.02.32.02.5.02s.35,0,.53-.02l65.5,113.3v.02c-.19.27-.35.54-.48.83-.03.02-.03.03-.03.06l-130.82-.06c-.16-.3-.32-.61-.51-.9L84.66,20.99ZM85.76,258.83c-.16-.02-.34-.02-.51-.02s-.35,0-.51.02L19.34,145.62c.19-.29.37-.58.51-.88h130.78s0,.03.02.05c.14.3.32.61.53.9l-65.42,113.15ZM226.03,263.82c-.19.27-.35.56-.5.86l-130.93-.16c-.16-.3-.32-.61-.53-.9l65.41-113.15c.16.02.34.02.51.02s.35,0,.51-.02h.02l65.52,113.33-.02.02ZM235.36,259.01c-.16-.02-.34-.02-.5-.02-.18,0-.35,0-.51.02l-65.52-113.33c.19-.29.37-.58.51-.88l.02-.02,130.8-.08v.02c.14.3.32.59.51.88l-65.31,113.41Z" />
        </g>
      </defs>
      <g clipPath="url(#ts-clip)">
        <rect width="600" height="600" fill="url(#ts-tile)" />
        <rect width="600" height="600" fill="url(#ts-pool)" />
        <rect width="600" height="600" fill="url(#ts-vignette)" />
        <rect width="600" height="600" filter="url(#ts-grain)" />
        <g filter="url(#ts-shadow)" fill="url(#ts-body)">
          <use href="#ts-logo" transform="translate(60,90) scale(1.5)" />
        </g>
        <g mask="url(#ts-spec-mask)" style={{ mixBlendMode: "screen" }} fill="#ffffff">
          <use href="#ts-logo" transform="translate(60,90) scale(1.5)" />
        </g>
      </g>
    </svg>
  );
}

function MakeEbookPreview() {
  // Glass tile design from the product-icon handoff. Verbatim path data
  // and gradients. The outer .hpp-frame--glass class handles aspect ratio
  // and removes the page-side rectangle so the squircle sits alone.
  return (
    <svg viewBox="0 0 600 600" width="100%" height="100%" className="hpp-svg">
      <defs>
        <linearGradient id="mb-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset=".55" stopColor="#101012" />
          <stop offset="1" stopColor="#0a0a0c" />
        </linearGradient>
        <radialGradient id="mb-vignette" cx=".5" cy=".5" r=".7">
          <stop offset=".55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".55" />
        </radialGradient>
        <filter id="mb-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={3} />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .25 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <radialGradient id="mb-pool" cx=".5" cy="1.05" r=".55" fx=".5" fy="1.05">
          <stop offset="0" stopColor="#8A7F70" stopOpacity="1" />
          <stop offset=".45" stopColor="#8A7F70" stopOpacity=".55" />
          <stop offset="1" stopColor="#8A7F70" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mb-body" gradientUnits="userSpaceOnUse" x1="0" y1="162" x2="0" y2="435">
          <stop offset="0" stopColor="#0e0d0c" />
          <stop offset=".5" stopColor="#100f0d" />
          <stop offset=".85" stopColor="#1f1c15" />
          <stop offset="1" stopColor="#332d20" />
        </linearGradient>
        <linearGradient id="mb-spec" gradientUnits="userSpaceOnUse" x1="0" y1="162" x2="0" y2="322">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".35" />
          <stop offset=".4" stopColor="#ffffff" stopOpacity=".1" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <mask id="mb-spec-mask">
          <rect width="600" height="600" fill="url(#mb-spec)" />
        </mask>
        <filter id="mb-shadow" x="-20%" y="-15%" width="140%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={6} />
          <feOffset dy={10} />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".55" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="mb-clip">
          <rect width="600" height="600" rx="132" ry="132" />
        </clipPath>
        <path id="mb-top" d="M263.1,13.7v151.4c0,4.3-2.2,8.1-5.6,10.3-1.9,1.2-4.2,2-6.7,2s-4.8-.7-6.7-2c-3.3-2.2-5.5-6-5.5-10.3V31.9c-12.6,4-31.3,8.2-54.5,8.2s-36.7,14.5-39.4,19.6v135.7c0,.8,0,1.6-.2,2.4-1.1,5.6-6.1,9.9-12,9.9s-10.9-4.2-12-9.8c-.2-.8-.2-1.6-.2-2.4V59.7c-2.7-5-12.9-19.6-39.4-19.6s-41.9-4.2-54.5-8.2v133.3c0,4.3-2.2,8.1-5.6,10.3-1.9,1.3-4.2,2-6.7,2s-4.7-.7-6.6-2c-3.4-2.2-5.6-6-5.6-10.3V13.8c0-4.3,2.3-8.3,6-10.5,3.7-2.2,8.3-2.3,12.1-.2.2,0,23.9,12.5,60.9,12.5s42.3,10.2,51.6,19.9c9.4-9.7,25.4-19.9,51.7-19.9s60.7-12.4,60.9-12.6c3.8-2.1,8.4-2,12.1.2s5.9,6.2,5.9,10.5Z" />
        <path id="mb-bot" d="M256.4,226.9c-2.4,1.1-16,8-38.1,12.2-8.1,1.5-15.2,2.4-23.7,2.9-4.9.3-10.1,0-15,.3-17.4,1.5-29.4,8.2-36.3,22-4.5,9.8-18.4,9.4-22.5-.5-6.5-12.7-17.4-19.3-33.9-21.3-4.8-.5-9.9-.3-14.6-.4-6-.2-12.3-.8-17.8-1.6-2.7-.4-5.6-.9-8.4-1.4-21.6-4.1-35.2-10.8-37.9-12.1-3.8-1.8-6.7-6.6-6.7-10.7-.2-7.2,6.5-13.5,13.7-12.4,2.6.4,4.3,1.3,6.3,2.1,3.7,2.4,31.5,10.8,51.5,11.3,4.1.3,9.2.3,13.6.4,4.2,0,10,1.1,14.7,2.3,7.7,1.8,14.9,5.6,20,11.7,4.1,5.5,11.5,7.8,17.5,3.9,1.7-1.1,3-2.6,4.3-4.1,3.2-3.6,7.1-6.7,11.5-8.7,9-3.9,19.4-5.5,28.9-5.3,5.4,0,9.1-.3,14.3-.8,23.8-2.4,39.4-8.3,45.4-11,8.6-4.9,18.8-.6,19.6,9.8v.2h.2c.2,4.2-2.7,9.2-6.6,11.2Z" />
      </defs>
      <g clipPath="url(#mb-clip)">
        <rect width="600" height="600" fill="url(#mb-tile)" />
        <rect width="600" height="600" fill="url(#mb-pool)" />
        <rect width="600" height="600" fill="url(#mb-vignette)" />
        <rect width="600" height="600" filter="url(#mb-grain)" />
        <g filter="url(#mb-shadow)" fill="url(#mb-body)">
          <use href="#mb-top" transform="translate(167.6,162)" />
          <use href="#mb-bot" transform="translate(167.6,162)" />
        </g>
        <g mask="url(#mb-spec-mask)" style={{ mixBlendMode: "screen" }} fill="#ffffff">
          <use href="#mb-top" transform="translate(167.6,162)" />
          <use href="#mb-bot" transform="translate(167.6,162)" />
        </g>
      </g>
    </svg>
  );
}

function DoodleWirePreview() {
  // Glass tile design from the product-icon handoff. Same recipe as
  // makeEbook with dw- prefixed ids and the DoodleWire logo paths.
  return (
    <svg viewBox="0 0 600 600" width="100%" height="100%" className="hpp-svg">
      <defs>
        <linearGradient id="dw-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset=".55" stopColor="#101012" />
          <stop offset="1" stopColor="#0a0a0c" />
        </linearGradient>
        <radialGradient id="dw-vignette" cx=".5" cy=".5" r=".7">
          <stop offset=".55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".55" />
        </radialGradient>
        <filter id="dw-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={7} />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .25 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <radialGradient id="dw-pool" cx=".5" cy="1.05" r=".55" fx=".5" fy="1.05">
          <stop offset="0" stopColor="#8A7F70" stopOpacity="1" />
          <stop offset=".45" stopColor="#8A7F70" stopOpacity=".55" />
          <stop offset="1" stopColor="#8A7F70" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dw-body" gradientUnits="userSpaceOnUse" x1="0" y1="201" x2="0" y2="399">
          <stop offset="0" stopColor="#0e0d0c" />
          <stop offset=".5" stopColor="#100f0d" />
          <stop offset=".85" stopColor="#1f1c15" />
          <stop offset="1" stopColor="#332d20" />
        </linearGradient>
        <linearGradient id="dw-spec" gradientUnits="userSpaceOnUse" x1="0" y1="201" x2="0" y2="320">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".35" />
          <stop offset=".4" stopColor="#ffffff" stopOpacity=".1" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <mask id="dw-spec-mask">
          <rect width="600" height="600" fill="url(#dw-spec)" />
        </mask>
        <filter id="dw-shadow" x="-20%" y="-15%" width="140%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={6} />
          <feOffset dy={10} />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".55" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="dw-clip">
          <rect width="600" height="600" rx="132" ry="132" />
        </clipPath>
        <path id="dw-top" fillRule="evenodd" d="M184.2,15.4c-8.6-9.4-20.9-15.4-33.8-15.4H18.1C7.9,0,0,9.1,0,18.9v56.3c0,10.1,8.2,18.8,18.5,18.8h132.1c18.2,0,34.4-11.7,41.6-27.5,7.9-17.4,4.7-37.3-8-51.2h0ZM150.1,67.9H26.2V26.1h124.2c11.4.4,20,9.9,20,20.9s-8.8,20.4-20.2,20.9h0Z" />
        <path id="dw-bot" d="M189.9,149.4l-22.6,15.5c-5.6,3.9-11.2,7.2-17.9,9-13.4,3.7-26,1.5-38.1-5-8.4-4.5-18.2-4.4-26.6.2-13.9,7.7-29.3,8.9-44,2.7-4.4-1.9-8.1-4.4-12-7.1l-22.1-15.1c-6-4.1-7.4-12.3-3.4-18.2s12.1-7.5,18.2-3.4l23.2,15.9c3.8,2.6,7.3,4.9,12,5.5,5,.7,10.2-.3,14.7-2.8,16.9-9.6,37.2-9.4,54,.2,4.3,2.5,9.5,3.3,14.3,2.6,4.6-.6,8.2-2.9,12-5.5l23.1-15.8c6-4.1,13.9-2.8,18.1,3,4.2,5.7,3.2,14.1-2.9,18.3h0Z" />
      </defs>
      <g clipPath="url(#dw-clip)">
        <rect width="600" height="600" fill="url(#dw-tile)" />
        <rect width="600" height="600" fill="url(#dw-pool)" />
        <rect width="600" height="600" fill="url(#dw-vignette)" />
        <rect width="600" height="600" filter="url(#dw-grain)" />
        <g filter="url(#dw-shadow)" fill="url(#dw-body)">
          <use href="#dw-top" transform="translate(189.47,201) scale(1.125)" />
          <use href="#dw-bot" transform="translate(189.47,201) scale(1.125)" />
        </g>
        <g mask="url(#dw-spec-mask)" style={{ mixBlendMode: "screen" }} fill="#ffffff">
          <use href="#dw-top" transform="translate(189.47,201) scale(1.125)" />
          <use href="#dw-bot" transform="translate(189.47,201) scale(1.125)" />
        </g>
      </g>
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
