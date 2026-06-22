'use client';

import { useRef, useEffect, useState } from 'react';
import AssembleText, { type AssembleTextHandle } from './AssembleText';
import ElectricBorder from './ElectricBorder';

const BUTTON_STYLE = {
  border: '1px solid rgba(158, 148, 130, 0.35)',
  fontFamily: 'var(--font-inter)',
  fontSize: '1.125rem',
  fontWeight: 400,
  letterSpacing: '0.01em',
  color: '#fbf9f3',
  background: 'transparent',
} as const;

const Logomark = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 78 78"
    fill="currentColor"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <path d="M0,0v76.8c0,.5.4,1,1,1h37c.5,0,1-.4,1-1v-37.8L0,0Z" />
    <path d="M78,78V1.2c0-.5-.4-1-1-1h-37c-.5,0-1,.4-1,1v37.8l39,39Z" />
  </svg>
);

// px-6 (24px) + logomark (14px) + gap-2.5 (10px) = 48px offset for the text area
const TEXT_LEFT_OFFSET = '3rem';

export default function HeroCta({ href }: { href: string }) {
  const assembleRef = useRef<AssembleTextHandle>(null);
  const [electricVisible, setElectricVisible] = useState(false);

  useEffect(() => {
    const assembleTimer = setTimeout(() => assembleRef.current?.assemble(), 200);
    const scatterTimer = setTimeout(() => assembleRef.current?.scatter(), 2400);
    return () => { clearTimeout(assembleTimer); clearTimeout(scatterTimer); };
  }, []);

  return (
    <>
      {/* Desktop */}
      <div
        className="relative hidden md:inline-block"
        onMouseEnter={() => { assembleRef.current?.assemble(); setElectricVisible(true); }}
        onMouseLeave={() => { assembleRef.current?.scatter(); setElectricVisible(false); }}
      >
        <ElectricBorder
          color="#d8b46a"
          speed={0.7}
          chaos={0.06}
          borderRadius={8}
          visible={electricVisible}
        >
          <a
            href={href}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-[8px]"
            style={BUTTON_STYLE}
            aria-label="Let's work together"
          >
            {/* Logomark always visible */}
            <Logomark size={14} />
            {/* invisible sizer keeps button the right width */}
            <span className="invisible select-none" aria-hidden="true">Let's work together</span>
          </a>
        </ElectricBorder>

        {/* AssembleText only covers the text area (right of logomark) */}
        <AssembleText
          ref={assembleRef}
          text="Let's work together"
          fontSize="1.125rem"
          color={electricVisible ? "#fbf9f3" : "rgba(255,255,255,0.3)"}
          className="absolute pointer-events-none overflow-visible"
          style={{ left: TEXT_LEFT_OFFSET, right: '1.5rem', top: 0, bottom: 0 }}
          scatterScale={0.35}
        />
      </div>

      {/* Mobile */}
      <a
        href={href}
        className="mobile-border-glint md:hidden inline-flex items-center gap-2.5 px-6 py-3 rounded-[8px]"
        style={{ ...BUTTON_STYLE, position: 'relative' }}
      >
        <Logomark size={14} />
        Let's work together
      </a>
    </>
  );
}
