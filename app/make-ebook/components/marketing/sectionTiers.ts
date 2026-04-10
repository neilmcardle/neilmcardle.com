// ── Section rhythm system ─────────────────────────────────────────────────────
// Three tiers create vertical rhythm across the page so adjacent sections never
// share the same "volume". Use cinematic for moments that should land hardest,
// standard for the body of the page, intimate for asides and quiet beats.
//
// Used by every marketing-surface page (landing, signin, blog, book-mind locked
// state, future comparison pages) so the brand voice stays consistent.
export const SECTION_TIERS = {
  cinematic: {
    section: 'py-28 sm:py-40 lg:py-48',
    title: {
      fontSize: 'clamp(2.75rem, 5.5vw + 0.5rem, 5rem)',
      letterSpacing: '-0.04em',
      lineHeight: 1.02,
    } as const,
  },
  standard: {
    section: 'py-20 sm:py-28',
    title: {
      fontSize: 'clamp(2rem, 3vw + 0.75rem, 3.25rem)',
      letterSpacing: '-0.035em',
      lineHeight: 1.1,
    } as const,
  },
  intimate: {
    section: 'py-16 sm:py-20',
    title: {
      fontSize: 'clamp(1.375rem, 1vw + 1rem, 1.75rem)',
      letterSpacing: '-0.02em',
      lineHeight: 1.25,
    } as const,
  },
} as const;

export type SectionTier = keyof typeof SECTION_TIERS;
