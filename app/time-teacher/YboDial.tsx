"use client";

import { useRef } from "react";

const VB = 1088;
const CX = 544;
const CY = 544;

const R_DIAL = 384;
const R_ARC = 384;
const R_MINUTE = 304;
const R_HOUR = 200;
const R_OUTER_WORD = 472;

const HOUR_HAND = 152;
const HOUR_HAND_W = 40;
const MINUTE_HAND = 256;
const SECOND_HAND = 344;
const SECOND_TAIL = 32;
const R_SECOND_NUM = 364;
const SECOND_NUM_SIZE = 20;
const MINUTE_HAND_W = 32;

const HOUR_LABEL_R = 64;
const MINUTE_LABEL_R = 128;

const SNAP = 5;

export const INK = {
  page: "#0a0a0b",
  dial: "#121213",
  grey: "#6a6a6c",
  greyOpacity: 0.34,
  arcOff: "#2b2b2c",
  yellow: "#F0E442",
  blue: "#56B4E9",
  orange: "#F8760F",
};

export const ORDER = [INK.yellow, INK.blue, INK.orange];

export const DULL = 0.25;

const SANS = 'var(--font-cantarell), "Helvetica Neue", Arial, sans-serif';

function round(n: number) {
  return Math.round(n * 1000) / 1000;
}

function polar(angleDeg: number, r: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: round(CX + r * Math.cos(a)), y: round(CY + r * Math.sin(a)) };
}

function arc(fromDeg: number, toDeg: number, r: number) {
  const a = polar(fromDeg, r);
  const b = polar(toDeg, r);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${toDeg - fromDeg > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
}

export function wrapDial(v: number) {
  return ((v % 720) + 720) % 720;
}

export function spokenTokens(hour: number, minutes: number): string[] {
  const h = ((hour % 12) + 12) % 12;
  const next = (h + 1) % 12;
  if (minutes === 0) return [`hour:${h}`, "word:oclock"];
  if (minutes === 30) return ["word:half", "word:past", `hour:${h}`];
  if (minutes < 30) return [`min:${minutes}`, "word:past", `hour:${h}`];
  return [`min:${minutes}`, "word:to", `hour:${next}`];
}

function upright(rotation: number) {
  const norm = ((rotation % 360) + 360) % 360;
  return !(norm > 90 && norm < 270);
}

function handLabel(
  angle: number,
  r: number,
  text: string,
  litColour: string,
  litOpacity: number,
) {
  let rot = angle - 90;
  if (!upright(rot)) rot += 180;
  return { angle, r, rot, text, litColour, litOpacity };
}

export type YboDialProps = {
  totalMinutes: number;
  label?: string;
  seconds?: number | null;
  className?: string;
  onChange?: (totalMinutes: number) => void;
};

export default function YboDial({
  totalMinutes,
  label,
  seconds = null,
  className,
  onChange,
}: YboDialProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const drag = useRef<{
    mode: "hour" | "minute";
    last: number;
    value: number;
    captured?: boolean;
  } | null>(null);

  const dial = wrapDial(totalMinutes);
  const hour = Math.floor(dial / 60);
  const minutes = dial % 60;

  const order = spokenTokens(hour, minutes);
  const colourOf = (key: string) => {
    const i = order.indexOf(key);
    return i === -1 ? INK.grey : ORDER[Math.min(i, ORDER.length - 1)];
  };
  const opacityOf = (key: string) =>
    order.includes(key) ? 1 : INK.greyOpacity;

  const hourAngle = round((dial / 720) * 360);
  const minuteAngle = round((minutes / 60) * 360);
  const pastSide = minutes > 0 && minutes <= 30;
  const toSide = minutes > 30;

  const handOpacity = (slot: number) => (slot < order.length ? 1 : DULL);
  const hourOpacity = handOpacity(2);
  const minuteOpacity = minutes === 0 ? DULL : 1;

  function angleFromPointer(clientX: number, clientY: number): number | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = ((clientX - rect.left) / rect.width) * VB;
    const y = ((clientY - rect.top) / rect.height) * VB;
    const angle = (Math.atan2(x - CX, CY - y) * 180) / Math.PI;
    return Number.isFinite(angle) ? angle : null;
  }

  function onPointerDown(e: React.PointerEvent<SVGElement>) {
    if (!onChange) return;
    const mode = e.currentTarget.dataset.grab === "hour" ? "hour" : "minute";
    const start = angleFromPointer(e.clientX, e.clientY);
    if (start === null) return;
    e.preventDefault();
    svgRef.current?.focus({ preventScroll: true });
    drag.current = { mode, last: start, value: dial };
    try {
      svgRef.current?.setPointerCapture(e.pointerId);
    } catch {
      drag.current.captured = false;
    }
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const state = drag.current;
    if (!state || !onChange) return;
    const angle = angleFromPointer(e.clientX, e.clientY);
    if (angle === null) return;
    let delta = angle - state.last;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    state.last = angle;
    const next = wrapDial(
      state.value + delta * (state.mode === "minute" ? 1 / 6 : 2),
    );
    if (!Number.isFinite(next)) return;
    state.value = next;
    onChange(wrapDial(Math.round(next / SNAP) * SNAP));
  }

  function endDrag(e: React.PointerEvent<SVGSVGElement>) {
    if (!drag.current) return;
    const captured = drag.current.captured !== false;
    drag.current = null;
    if (!captured) return;
    try {
      svgRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      return;
    }
  }

  function onKeyDown(e: React.KeyboardEvent<SVGSVGElement>) {
    if (!onChange) return;
    const step =
      e.key === "ArrowRight"
        ? SNAP
        : e.key === "ArrowLeft"
          ? -SNAP
          : e.key === "ArrowUp"
            ? 60
            : e.key === "ArrowDown"
              ? -60
              : 0;
    if (step === 0) return;
    e.preventDefault();
    onChange(wrapDial(dial + step));
  }

  const outerWords = [
    { key: "word:oclock", text: "O'clock", angle: 0 },
    { key: "word:past", text: "past", angle: 90 },
    { key: "word:half", text: "half", angle: 180 },
    { key: "word:to", text: "to", angle: 270 },
  ];

  const minuteLabel = handLabel(
    minuteAngle,
    MINUTE_LABEL_R,
    "minute",
    INK.yellow,
    minuteOpacity,
  );
  const hourLabel = handLabel(
    hourAngle,
    HOUR_LABEL_R,
    "hour",
    INK.orange,
    hourOpacity,
  );

  const renderHandLabel = (l: typeof hourLabel) => {
    const p = polar(l.angle, l.r);
    return (
      <text
        x={p.x}
        y={p.y}
        transform={`rotate(${round(l.rot)} ${p.x} ${p.y})`}
        fill={l.litColour}
        fillOpacity={l.litOpacity}
        fontSize={20}
        fontWeight={700}
        fontFamily={SANS}
        textAnchor="middle"
        dominantBaseline="central"
        pointerEvents="none"
      >
        {l.text}
      </text>
    );
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VB} ${VB}`}
      className={className}
      role="img"
      aria-label={label ?? "clock"}
      tabIndex={onChange ? 0 : -1}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      style={{ touchAction: "none" }}
    >
      <circle cx={CX} cy={CY} r={R_DIAL} fill={INK.dial} />

      <path
        d={arc(0, 180, R_ARC)}
        fill="none"
        stroke={pastSide ? INK.blue : INK.arcOff}
        strokeWidth={8}
      />
      <path
        d={arc(180, 360, R_ARC)}
        fill="none"
        stroke={toSide ? INK.blue : INK.arcOff}
        strokeWidth={8}
      />

      {outerWords.map(({ key, text, angle }) => {
        const { x, y } = polar(angle, R_OUTER_WORD);
        return (
          <text
            key={key}
            x={x}
            y={y}
            fill={colourOf(key)}
            fillOpacity={opacityOf(key)}
            fontSize={48}
            fontFamily={SANS}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {text}
          </text>
        );
      })}

      {Array.from({ length: 12 }, (_, i) => {
        const p = i * 5;
        const { x, y } = polar(p * 6, R_MINUTE);
        const key = `min:${p}`;
        return (
          <text
            key={key}
            x={x}
            y={y}
            fill={colourOf(key)}
            fillOpacity={opacityOf(key)}
            fontSize={64}
            fontFamily={SANS}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {p === 0 ? 0 : p <= 30 ? p : 60 - p}
          </text>
        );
      })}

      {Array.from({ length: 12 }, (_, i) => {
        const { x, y } = polar(i * 30, R_HOUR);
        const key = `hour:${i}`;
        return (
          <text
            key={key}
            x={x}
            y={y}
            fill={colourOf(key)}
            fillOpacity={opacityOf(key)}
            fontSize={64}
            stroke={INK.dial}
            strokeWidth={11}
            paintOrder="stroke"
            fontFamily={SANS}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {i === 0 ? 12 : i}
          </text>
        );
      })}

      <g transform={`rotate(${minuteAngle} ${CX} ${CY})`}>
        <rect
          x={CX - MINUTE_HAND_W / 2}
          y={CY - MINUTE_HAND}
          width={MINUTE_HAND_W}
          height={MINUTE_HAND + MINUTE_HAND_W / 2}
          rx={MINUTE_HAND_W / 2}
          fill="none"
          stroke={INK.yellow}
          strokeOpacity={minuteOpacity}
          strokeWidth={4}
        />
      </g>
      {renderHandLabel(minuteLabel)}
      <g transform={`rotate(${hourAngle} ${CX} ${CY})`}>
        <rect
          x={CX - HOUR_HAND_W / 2}
          y={CY - HOUR_HAND}
          width={HOUR_HAND_W}
          height={HOUR_HAND + HOUR_HAND_W / 2}
          rx={HOUR_HAND_W / 2}
          fill={INK.dial}
          stroke={INK.orange}
          strokeOpacity={hourOpacity}
          strokeWidth={4}
        />
      </g>

      {seconds !== null && (
        <text
          x={polar(seconds * 6, R_SECOND_NUM).x}
          y={polar(seconds * 6, R_SECOND_NUM).y}
          fill="#ffffff"
          fillOpacity={0.45}
          fontSize={SECOND_NUM_SIZE}
          fontFamily={SANS}
          textAnchor="middle"
          dominantBaseline="central"
          pointerEvents="none"
        >
          {seconds === 0 ? 60 : seconds}
        </text>
      )}

      {seconds !== null && (
        <g
          transform={`rotate(${round((seconds / 60) * 360)} ${CX} ${CY})`}
          pointerEvents="none"
        >
          <line
            x1={CX}
            y1={CY + SECOND_TAIL}
            x2={CX}
            y2={CY - SECOND_HAND}
            stroke="#ffffff"
            strokeOpacity={0.45}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </g>
      )}

      <g pointerEvents="none">
        {order.map((key) => {
          if (key.startsWith("min:")) {
            const p = Number(key.slice(4));
            const { x, y } = polar(p * 6, R_MINUTE);
            return (
              <text
                key={key}
                x={x}
                y={y}
                fill={colourOf(key)}
                fontSize={64}
                fontFamily={SANS}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {p === 0 ? 0 : p <= 30 ? p : 60 - p}
              </text>
            );
          }
          if (key.startsWith("hour:")) {
            const i = Number(key.slice(5));
            const { x, y } = polar(i * 30, R_HOUR);
            return (
              <text
                key={key}
                x={x}
                y={y}
                fill={colourOf(key)}
                fontSize={64}
                stroke={INK.dial}
                strokeWidth={11}
                paintOrder="stroke"
                fontFamily={SANS}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {i === 0 ? 12 : i}
              </text>
            );
          }
          const word = outerWords.find((w) => w.key === key);
          if (!word) return null;
          const { x, y } = polar(word.angle, R_OUTER_WORD);
          return (
            <text
              key={key}
              x={x}
              y={y}
              fill={colourOf(key)}
              fontSize={48}
              fontFamily={SANS}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {word.text}
            </text>
          );
        })}
      </g>

      {renderHandLabel(hourLabel)}

      <circle
        cx={CX}
        cy={CY}
        r={8}
        fill={INK.dial}
        stroke="#ffffff"
        strokeWidth={4}
      />

      {onChange && (
        <g>
          <circle
            cx={CX}
            cy={CY}
            r={R_DIAL}
            fill="transparent"
            data-grab="minute"
            style={{ cursor: "grab", touchAction: "none" }}
            onPointerDown={onPointerDown}
          />
          <g transform={`rotate(${hourAngle} ${CX} ${CY})`}>
            <line
              x1={CX}
              y1={CY}
              x2={CX}
              y2={CY - HOUR_HAND}
              stroke="transparent"
              strokeWidth={64}
              strokeLinecap="round"
              data-grab="hour"
              style={{ cursor: "grab", touchAction: "none" }}
              onPointerDown={onPointerDown}
            />
          </g>
          <g transform={`rotate(${minuteAngle} ${CX} ${CY})`}>
            <line
              x1={CX}
              y1={CY}
              x2={CX}
              y2={CY - MINUTE_HAND}
              stroke="transparent"
              strokeWidth={56}
              strokeLinecap="round"
              data-grab="minute"
              style={{ cursor: "grab", touchAction: "none" }}
              onPointerDown={onPointerDown}
            />
          </g>
        </g>
      )}
    </svg>
  );
}
