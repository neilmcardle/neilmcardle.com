'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

interface Props {
  text: string;
  fontSize?: string;
  color?: string;
  className?: string;
  scatterUp?: boolean;
  scatterScale?: number;
  scatteredOpacity?: number;
  style?: React.CSSProperties;
}

export interface AssembleTextHandle {
  assemble: () => void;
  scatter: () => void;
}

const AssembleText = forwardRef<AssembleTextHandle, Props>(function AssembleText(
  { text, fontSize = '1rem', color = 'currentColor', className = '', scatterUp = false, scatterScale = 1, scatteredOpacity = 1, style },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);

  const makeScatterTransform = useCallback(() => {
    const rx = (Math.random() - 0.5) * 180 * scatterScale;
    const ry = scatterUp
      ? -(Math.random() * 120 + 30) * scatterScale
      : (Math.random() * 80 + 30) * scatterScale;
    const angle = (Math.random() - 0.5) * 90;
    return `translate(${rx}px, ${ry}px) rotate(${angle}deg)`;
  }, [scatterUp, scatterScale]);

  const scatter = useCallback(() => {
    const spans = containerRef.current?.querySelectorAll<HTMLElement>('.asm-word') ?? [];
    spans.forEach((span, i) => {
      span.style.transition = `transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 25}ms, opacity 300ms ease ${i * 25}ms`;
      span.style.transform = makeScatterTransform();
      span.style.opacity = String(scatteredOpacity);
    });
  }, [makeScatterTransform, scatteredOpacity]);

  const assemble = useCallback(() => {
    const spans = containerRef.current?.querySelectorAll<HTMLElement>('.asm-word') ?? [];
    spans.forEach((span, i) => {
      span.style.transition = `transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 45}ms, opacity 200ms ease ${i * 45}ms`;
      span.style.transform = 'translate(0px, 0px) rotate(0deg)';
      span.style.opacity = '1';
    });
  }, []);

  useImperativeHandle(ref, () => ({ assemble, scatter }), [assemble, scatter]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = text
      .split(' ')
      .map(w => `<span class="asm-word" style="display:inline-block;white-space:nowrap;user-select:none;opacity:0">${w}</span>`)
      .join(' ');

    requestAnimationFrame(() => {
      container.querySelectorAll<HTMLElement>('.asm-word').forEach(span => {
        span.style.transition = 'none';
        span.style.transform = makeScatterTransform();
        span.style.opacity = String(scatteredOpacity);
      });
    });
  }, [text, makeScatterTransform, scatteredOpacity]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        fontSize,
        color,
        lineHeight: 1.4,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '0 5px',
        transition: 'color 300ms ease',
        ...style,
      }}
    />
  );
});

export default AssembleText;
