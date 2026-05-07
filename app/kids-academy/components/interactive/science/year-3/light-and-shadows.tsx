'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, RotateCcw, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ToolProps } from '@/app/kids-academy/types/curriculum'

const W = 800
const H = 480
const GROUND_Y = 360
const OBJECT_HEIGHT = 130
const OBJECT_WIDTH = 50

type Pt = { x: number; y: number }
type Target = 'light' | 'object'
type Phase = 'active' | 'celebrating' | 'done'

type StepState = { length: number; tipX: number; objectX: number }
type Step = {
  key: string
  prompt: string
  short: string
  test: (s: StepState) => boolean
}

const STEPS: Step[] = [
  { key: 'cast',  prompt: 'Move the sun to make a shadow on the ground.',          short: 'Make a shadow',     test: (s) => s.length > 90 },
  { key: 'long',  prompt: 'Now make the shadow really long.',                       short: 'Make it long',      test: (s) => s.length > 300 },
  { key: 'short', prompt: 'Bring the sun back so the shadow is short again.',       short: 'Make it short',     test: (s) => s.length < 30 },
  { key: 'left',  prompt: 'Point the shadow to the LEFT of the tree.',              short: 'Point it left',     test: (s) => s.tipX < s.objectX - 80 },
  { key: 'right', prompt: 'And now point the shadow to the RIGHT of the tree.',     short: 'Point it right',    test: (s) => s.tipX > s.objectX + 80 },
]

// Sun starts directly above the tree so the shadow is short and step 0
// is impossible to pass without moving the sun.
const INITIAL_LIGHT: Pt = { x: 400, y: 90 }
const INITIAL_OBJECT: Pt = { x: 400, y: GROUND_Y }

function clampLight(p: Pt): Pt {
  return {
    x: Math.max(40, Math.min(W - 40, p.x)),
    y: Math.max(30, Math.min(GROUND_Y - OBJECT_HEIGHT - 50, p.y)),
  }
}

function clampObject(p: Pt): Pt {
  return {
    x: Math.max(80, Math.min(W - 80, p.x)),
    y: GROUND_Y,
  }
}

export default function LightAndShadowsTool({ onProgress, onComplete }: ToolProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const startedAt = useRef<number>(Date.now())

  const [light, setLight] = useState<Pt>(INITIAL_LIGHT)
  const [object, setObject] = useState<Pt>(INITIAL_OBJECT)
  const [dragging, setDragging] = useState<Target | null>(null)
  const [focused, setFocused] = useState<Target | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('active')

  const shadowTipX = useMemo(() => {
    const topY = GROUND_Y - OBJECT_HEIGHT
    const dx = object.x - light.x
    const dy = topY - light.y
    if (dy <= 0) return object.x
    const t = (GROUND_Y - light.y) / dy
    return light.x + t * dx
  }, [light.x, light.y, object.x])

  const shadowLength = Math.abs(shadowTipX - object.x)

  useEffect(() => {
    if (phase !== 'active') return
    if (stepIndex >= STEPS.length) return
    const passed = STEPS[stepIndex].test({
      length: shadowLength,
      tipX: shadowTipX,
      objectX: object.x,
    })
    if (passed) setPhase('celebrating')
  }, [shadowLength, shadowTipX, object.x, stepIndex, phase])

  useEffect(() => {
    if (phase !== 'celebrating') return
    const t = setTimeout(() => {
      setStepIndex((s) => {
        const next = s + 1
        if (next >= STEPS.length) {
          setPhase('done')
        } else {
          setPhase('active')
        }
        return next
      })
    }, 1100)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    onProgress(Math.round((stepIndex / STEPS.length) * 100))
  }, [stepIndex, onProgress])

  useEffect(() => {
    if (phase === 'done') {
      onComplete({ durationSeconds: Math.round((Date.now() - startedAt.current) / 1000) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function svgPoint(clientX: number, clientY: number): Pt {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * W,
      y: ((clientY - rect.top) / rect.height) * H,
    }
  }

  function startDrag(target: Target, e: React.PointerEvent<SVGElement>) {
    e.preventDefault()
    setDragging(target)
    setFocused(target)
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
  }

  function moveDrag(e: React.PointerEvent<SVGElement>) {
    if (!dragging) return
    const p = svgPoint(e.clientX, e.clientY)
    if (dragging === 'light') setLight(clampLight(p))
    else setObject(clampObject(p))
  }

  function endDrag(e: React.PointerEvent<SVGElement>) {
    setDragging(null)
    ;(e.currentTarget as Element).releasePointerCapture?.(e.pointerId)
  }

  function handleKey(e: React.KeyboardEvent<SVGElement>) {
    if (!focused) return
    const STEP = 16
    let dx = 0, dy = 0
    if (e.key === 'ArrowLeft')       dx = -STEP
    else if (e.key === 'ArrowRight') dx = STEP
    else if (e.key === 'ArrowUp')    dy = -STEP
    else if (e.key === 'ArrowDown')  dy = STEP
    else return
    e.preventDefault()
    if (focused === 'light') setLight(clampLight({ x: light.x + dx, y: light.y + dy }))
    else setObject(clampObject({ x: object.x + dx, y: object.y + dy }))
  }

  function reset() {
    setLight(INITIAL_LIGHT)
    setObject(INITIAL_OBJECT)
    setDragging(null)
    setStepIndex(0)
    setPhase('active')
    startedAt.current = Date.now()
  }

  const shadowMidX = (object.x + shadowTipX) / 2
  const shadowRx = Math.max(OBJECT_WIDTH * 0.55, Math.abs(shadowTipX - object.x) / 2 + OBJECT_WIDTH / 2)
  const shadowRy = Math.max(10, OBJECT_WIDTH * 0.28)
  const liveDescription =
    shadowLength < 8
      ? 'The shadow is hidden right under the tree.'
      : shadowTipX < object.x
        ? `The shadow points left, about ${Math.round(shadowLength)} units long.`
        : `The shadow points right, about ${Math.round(shadowLength)} units long.`

  const currentStep = STEPS[stepIndex]
  const allDone = stepIndex >= STEPS.length

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 sm:px-6 pt-3 max-w-5xl w-full mx-auto flex items-center justify-between gap-3 shrink-0">
        <h1 className="font-ka-display text-xl sm:text-2xl font-extrabold text-slate-900">
          Light and shadows
        </h1>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 h-ka-touch px-3 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ka-brand-500"
        >
          <RotateCcw size={14} /> Start over
        </button>
      </div>

      <div className="flex-1 min-h-0 px-4 sm:px-6 pb-4 max-w-5xl w-full mx-auto flex flex-col gap-3 mt-3">
        <ol className="grid grid-cols-5 gap-1.5 sm:gap-2 shrink-0">
          {STEPS.map((s, i) => {
            const done = i < stepIndex
            const active = i === stepIndex && !allDone
            return (
              <li
                key={s.key}
                className={`flex items-center gap-1.5 sm:gap-2 rounded-xl border px-2 sm:px-3 py-1.5 sm:py-2 transition-colors ${
                  done
                    ? 'border-ka-year3 bg-ka-year3-light text-green-900'
                    : active
                      ? 'border-ka-brand-500 bg-white text-slate-900'
                      : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                <span
                  className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-2xs font-bold shrink-0 transition-colors ${
                    done
                      ? 'bg-ka-year3 text-white'
                      : active
                        ? 'bg-ka-brand-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {done ? <Check size={12} strokeWidth={3} /> : i + 1}
                </span>
                <span className="font-ka-body text-2xs sm:text-xs leading-tight hidden sm:inline">{s.short}</span>
              </li>
            )
          })}
        </ol>

        <div
          className="relative rounded-2xl border-2 border-ka-brand-500 bg-ka-brand-50 px-4 py-3 shrink-0 flex items-center"
          aria-live="polite"
        >
          <AnimatePresence mode="wait">
            {phase === 'celebrating' ? (
              <motion.div
                key="celebrating"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3 w-full"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-ka-year3 text-white shadow-md">
                  <Check size={20} strokeWidth={3} />
                </span>
                <div className="flex-1">
                  <p className="font-ka-display text-sm font-bold text-green-900">
                    {STEPS[stepIndex]?.short} — done!
                  </p>
                  <p className="font-ka-body text-xs text-green-800/80">
                    {stepIndex + 1 < STEPS.length ? 'Get ready for the next one…' : 'You did them all!'}
                  </p>
                </div>
              </motion.div>
            ) : allDone ? (
              <motion.div
                key="all-done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 w-full"
              >
                <Sparkles size={28} className="text-ka-year2" />
                <div>
                  <p className="font-ka-display text-base font-bold text-slate-900">
                    All five experiments complete.
                  </p>
                  <p className="font-ka-body text-xs text-slate-600">
                    You can keep playing — or hit Start over to do them again.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`step-${stepIndex}`}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3 w-full"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-ka-brand-500 text-white font-ka-display font-bold text-base shadow-sm shrink-0">
                  {stepIndex + 1}
                </span>
                <div>
                  <p className="font-ka-display text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {currentStep.prompt}
                  </p>
                  <p className="font-ka-body text-xs text-slate-500">
                    Step {stepIndex + 1} of {STEPS.length}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 min-h-0 rounded-3xl border border-slate-200 overflow-hidden shadow-sm bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full block touch-none select-none"
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={handleKey}
            role="img"
            aria-label="Shadow simulator. Drag the sun or the tree to change the shadow."
          >
            <defs>
              <linearGradient id="ka-ground" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#86efac" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
              <radialGradient id="ka-sun" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#fef3c7" />
                <stop offset="60%"  stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </radialGradient>
            </defs>

            <rect x={0} y={GROUND_Y} width={W} height={H - GROUND_Y} fill="url(#ka-ground)" />
            <line x1={0} y1={GROUND_Y} x2={W} y2={GROUND_Y} stroke="#16a34a" strokeWidth={2} opacity={0.5} />

            <ellipse
              cx={shadowMidX}
              cy={GROUND_Y + 8}
              rx={shadowRx}
              ry={shadowRy}
              fill="rgba(15, 23, 42, 0.42)"
            />

            <g style={{ cursor: dragging === 'object' ? 'grabbing' : 'grab' }}>
              <rect
                x={object.x - 9}
                y={GROUND_Y - OBJECT_HEIGHT + 50}
                width={18}
                height={OBJECT_HEIGHT - 50}
                fill="#92400e"
                rx={5}
              />
              <circle cx={object.x - 28} cy={GROUND_Y - OBJECT_HEIGHT + 55} r={32} fill="#15803d" />
              <circle cx={object.x + 28} cy={GROUND_Y - OBJECT_HEIGHT + 55} r={32} fill="#15803d" />
              <circle cx={object.x}      cy={GROUND_Y - OBJECT_HEIGHT + 30} r={42} fill="#16a34a" />
              <circle cx={object.x - 14} cy={GROUND_Y - OBJECT_HEIGHT + 22} r={5}  fill="#bbf7d0" />
              <rect
                tabIndex={0}
                x={object.x - 55}
                y={GROUND_Y - OBJECT_HEIGHT - 10}
                width={110}
                height={OBJECT_HEIGHT + 25}
                fill="transparent"
                onPointerDown={(e) => startDrag('object', e)}
                onFocus={() => setFocused('object')}
                onBlur={() => setFocused(null)}
                className="focus:outline-none"
                style={{
                  outline: focused === 'object' ? '3px solid #6366F1' : 'none',
                  outlineOffset: 2,
                  borderRadius: 12,
                }}
                aria-label="Tree. Drag, or press arrow keys to move."
              />
            </g>

            <g style={{ cursor: dragging === 'light' ? 'grabbing' : 'grab' }}>
              {Array.from({ length: 8 }).map((_, i) => {
                const a = (i / 8) * Math.PI * 2
                const x1 = light.x + Math.cos(a) * 32
                const y1 = light.y + Math.sin(a) * 32
                const x2 = light.x + Math.cos(a) * 48
                const y2 = light.y + Math.sin(a) * 48
                return (
                  <line
                    key={i}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#f59e0b"
                    strokeWidth={4}
                    strokeLinecap="round"
                    opacity={0.85}
                  />
                )
              })}
              <circle cx={light.x} cy={light.y} r={28} fill="url(#ka-sun)" stroke="#f59e0b" strokeWidth={2} />
              <circle
                tabIndex={0}
                cx={light.x}
                cy={light.y}
                r={52}
                fill="transparent"
                onPointerDown={(e) => startDrag('light', e)}
                onFocus={() => setFocused('light')}
                onBlur={() => setFocused(null)}
                className="focus:outline-none"
                style={{
                  outline: focused === 'light' ? '3px solid #6366F1' : 'none',
                  outlineOffset: 2,
                }}
                aria-label="Sun. Drag, or press arrow keys to move."
              />
            </g>
          </svg>

          <p className="sr-only" aria-live="polite">{liveDescription}</p>
        </div>
      </div>
    </div>
  )
}
