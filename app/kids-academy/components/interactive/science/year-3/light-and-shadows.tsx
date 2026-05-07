'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ToolProps } from '@/app/kids-academy/types/curriculum'

const W = 800
const H = 480
const GROUND_Y = 360
const OBJECT_HEIGHT = 130
const OBJECT_WIDTH = 50

type Pt = { x: number; y: number }
type Target = 'light' | 'object'

type StepState = { length: number; tipX: number; objectX: number }
type Step = {
  key: string
  prompt: string
  hint: string
  test: (s: StepState) => boolean
  startLight: Pt
  startObject: Pt
}

const TREE_HOME: Pt = { x: 400, y: GROUND_Y }

const STEPS: Step[] = [
  {
    key: 'cast',
    prompt: 'Move the sun to make a shadow.',
    hint: 'Try dragging the sun to one side.',
    test: (s) => s.length > 90,
    startLight: { x: 400, y: 90 },
    startObject: TREE_HOME,
  },
  {
    key: 'long',
    prompt: 'Now make the shadow really long.',
    hint: 'A low sun, far to one side, stretches the shadow.',
    test: (s) => s.length > 320,
    startLight: { x: 320, y: 100 },
    startObject: TREE_HOME,
  },
  {
    key: 'short',
    prompt: 'Bring the sun back so the shadow is short.',
    hint: 'A sun directly overhead leaves almost no shadow.',
    test: (s) => s.length < 30,
    startLight: { x: 110, y: 150 },
    startObject: TREE_HOME,
  },
  {
    key: 'left',
    prompt: 'Point the shadow to the LEFT of the tree.',
    hint: 'Where do you put the sun to push the shadow left?',
    test: (s) => s.tipX < s.objectX - 80,
    startLight: { x: 400, y: 90 },
    startObject: TREE_HOME,
  },
  {
    key: 'right',
    prompt: 'And now point the shadow to the RIGHT.',
    hint: 'The shadow always falls away from the sun.',
    test: (s) => s.tipX > s.objectX + 80,
    startLight: { x: 660, y: 100 },
    startObject: TREE_HOME,
  },
]

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
  const startedAt = useRef<number>(Date.now())
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const wasMet = useRef<boolean>(false)
  const completedRef = useRef<Set<number>>(new Set())

  const [light, setLight] = useState<Pt>(STEPS[0].startLight)
  const [object, setObject] = useState<Pt>(STEPS[0].startObject)
  const [activeStep, setActiveStep] = useState(0)
  const [unlockedUpTo, setUnlockedUpTo] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [dragging, setDragging] = useState<Target | null>(null)
  const [focused, setFocused] = useState<Target | null>(null)
  const [allDone, setAllDone] = useState(false)

  const shadowTipX = useMemo(() => {
    const topY = GROUND_Y - OBJECT_HEIGHT
    const dx = object.x - light.x
    const dy = topY - light.y
    if (dy <= 0) return object.x
    const t = (GROUND_Y - light.y) / dy
    return light.x + t * dx
  }, [light.x, light.y, object.x])

  const shadowLength = Math.abs(shadowTipX - object.x)

  // When the active step changes, capture whether the test is currently met,
  // so we only mark complete on a rising-edge transition (false → true).
  useEffect(() => {
    const step = STEPS[activeStep]
    if (!step) return
    wasMet.current = step.test({ length: shadowLength, tipX: shadowTipX, objectX: object.x })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep])

  // Edge-detect step completion against the active step only.
  useEffect(() => {
    const step = STEPS[activeStep]
    if (!step) return
    const meets = step.test({ length: shadowLength, tipX: shadowTipX, objectX: object.x })
    if (meets && !wasMet.current && !completedRef.current.has(activeStep)) {
      completedRef.current.add(activeStep)
      setCompletedSteps(Array.from(completedRef.current).sort((a, b) => a - b))
      if (activeStep + 1 > unlockedUpTo) setUnlockedUpTo(activeStep + 1)
    }
    wasMet.current = meets
  }, [shadowLength, shadowTipX, object.x, activeStep, unlockedUpTo])

  // Emit progress and onComplete based on completion count.
  useEffect(() => {
    onProgress(Math.round((completedSteps.length / STEPS.length) * 100))
    if (completedSteps.length === STEPS.length && !allDone) {
      setAllDone(true)
      onComplete({ durationSeconds: Math.round((Date.now() - startedAt.current) / 1000) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedSteps, allDone])

  // Track which section is in view (driven by snap scrolling).
  useEffect(() => {
    const root = scrollRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const idx = Number((visible.target as HTMLElement).dataset.step)
        if (!Number.isNaN(idx)) setActiveStep(idx)
      },
      { root, threshold: [0.55, 0.9] },
    )
    sectionRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [unlockedUpTo])

  // When the user advances to a new step, snap the scene to that step's
  // starting position so the challenge isn't already solved by carryover.
  function jumpToStartFor(stepIndex: number) {
    const s = STEPS[stepIndex]
    if (!s) return
    setLight(s.startLight)
    setObject(s.startObject)
  }

  function svgPoint(clientX: number, clientY: number): Pt {
    const svg = document.activeElement?.closest('svg') as SVGSVGElement | null
    const fallback = sectionRefs.current[activeStep]?.querySelector('svg') as SVGSVGElement | null
    const target = svg ?? fallback
    if (!target) return { x: 0, y: 0 }
    const rect = target.getBoundingClientRect()
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

  function scrollToStep(index: number) {
    const target = sectionRefs.current[index]
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleContinue() {
    const next = activeStep + 1
    if (next >= STEPS.length) return
    if (next > unlockedUpTo) setUnlockedUpTo(next)
    jumpToStartFor(next)
    requestAnimationFrame(() => scrollToStep(next))
  }

  function handleReset() {
    completedRef.current = new Set()
    setCompletedSteps([])
    setUnlockedUpTo(0)
    setAllDone(false)
    setActiveStep(0)
    jumpToStartFor(0)
    startedAt.current = Date.now()
    requestAnimationFrame(() => scrollToStep(0))
  }

  const visibleSteps = STEPS.slice(0, unlockedUpTo + 1)
  const currentStepDone = completedSteps.includes(activeStep)
  const isLast = activeStep === STEPS.length - 1

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
      <div className="px-4 sm:px-6 pt-3 pb-2 max-w-5xl w-full mx-auto flex items-center justify-between gap-3 shrink-0">
        <div className="flex-1 flex gap-1.5">
          {STEPS.map((s, i) => {
            const done = completedSteps.includes(i)
            const active = i === activeStep
            return (
              <span
                key={s.key}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  done ? 'bg-ka-year3' : active ? 'bg-ka-brand-500' : 'bg-slate-200'
                }`}
                aria-hidden="true"
              />
            )
          })}
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ka-brand-500"
        >
          <RotateCcw size={12} /> Restart
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto snap-y snap-mandatory scroll-smooth"
      >
        {visibleSteps.map((step, i) => {
          const done = completedSteps.includes(i)
          const isCurrent = i === activeStep
          const buttonReady = done && i < STEPS.length - 1
          const finishReady = done && i === STEPS.length - 1
          return (
            <section
              key={step.key}
              data-step={i}
              ref={(el) => {
                sectionRefs.current[i] = el
              }}
              className="snap-start h-full flex flex-col px-4 sm:px-6 pb-4 max-w-5xl mx-auto w-full"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <header className="shrink-0 pt-3 pb-2">
                <p className="font-ka-body text-xs text-slate-500 uppercase tracking-wide font-semibold">
                  Step {i + 1} of {STEPS.length}
                </p>
                <h2 className="font-ka-display text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
                  {step.prompt}
                </h2>
                <AnimatePresence>
                  {!done && isCurrent && (
                    <motion.p
                      key="hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.3 }}
                      className="font-ka-body text-xs text-slate-500 mt-1"
                    >
                      {step.hint}
                    </motion.p>
                  )}
                </AnimatePresence>
              </header>

              <div className="flex-1 min-h-0 rounded-3xl border border-slate-200 overflow-hidden shadow-sm bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50">
                <svg
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
                    <linearGradient id={`ka-ground-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#86efac" />
                      <stop offset="100%" stopColor="#4ade80" />
                    </linearGradient>
                    <radialGradient id={`ka-sun-${i}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%"   stopColor="#fef3c7" />
                      <stop offset="60%"  stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </radialGradient>
                  </defs>

                  <rect x={0} y={GROUND_Y} width={W} height={H - GROUND_Y} fill={`url(#ka-ground-${i})`} />
                  <line x1={0} y1={GROUND_Y} x2={W} y2={GROUND_Y} stroke="#16a34a" strokeWidth={2} opacity={0.5} />

                  <ellipse
                    cx={(object.x + shadowTipX) / 2}
                    cy={GROUND_Y + 8}
                    rx={Math.max(OBJECT_WIDTH * 0.55, Math.abs(shadowTipX - object.x) / 2 + OBJECT_WIDTH / 2)}
                    ry={Math.max(10, OBJECT_WIDTH * 0.28)}
                    fill="rgba(15, 23, 42, 0.42)"
                  />

                  <g style={{ cursor: dragging === 'object' ? 'grabbing' : 'grab' }}>
                    <rect x={object.x - 9} y={GROUND_Y - OBJECT_HEIGHT + 50} width={18} height={OBJECT_HEIGHT - 50} fill="#92400e" rx={5} />
                    <circle cx={object.x - 28} cy={GROUND_Y - OBJECT_HEIGHT + 55} r={32} fill="#15803d" />
                    <circle cx={object.x + 28} cy={GROUND_Y - OBJECT_HEIGHT + 55} r={32} fill="#15803d" />
                    <circle cx={object.x}      cy={GROUND_Y - OBJECT_HEIGHT + 30} r={42} fill="#16a34a" />
                    <circle cx={object.x - 14} cy={GROUND_Y - OBJECT_HEIGHT + 22} r={5}  fill="#bbf7d0" />
                    <rect
                      tabIndex={isCurrent ? 0 : -1}
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
                        outline: focused === 'object' && isCurrent ? '3px solid #6366F1' : 'none',
                        outlineOffset: 2,
                        borderRadius: 12,
                      }}
                      aria-label="Tree. Drag, or press arrow keys to move."
                    />
                  </g>

                  <g style={{ cursor: dragging === 'light' ? 'grabbing' : 'grab' }}>
                    {Array.from({ length: 8 }).map((_, k) => {
                      const a = (k / 8) * Math.PI * 2
                      const x1 = light.x + Math.cos(a) * 32
                      const y1 = light.y + Math.sin(a) * 32
                      const x2 = light.x + Math.cos(a) * 48
                      const y2 = light.y + Math.sin(a) * 48
                      return (
                        <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
                      )
                    })}
                    <circle cx={light.x} cy={light.y} r={28} fill={`url(#ka-sun-${i})`} stroke="#f59e0b" strokeWidth={2} />
                    <circle
                      tabIndex={isCurrent ? 0 : -1}
                      cx={light.x}
                      cy={light.y}
                      r={52}
                      fill="transparent"
                      onPointerDown={(e) => startDrag('light', e)}
                      onFocus={() => setFocused('light')}
                      onBlur={() => setFocused(null)}
                      className="focus:outline-none"
                      style={{
                        outline: focused === 'light' && isCurrent ? '3px solid #6366F1' : 'none',
                        outlineOffset: 2,
                      }}
                      aria-label="Sun. Drag, or press arrow keys to move."
                    />
                  </g>
                </svg>
              </div>

              <div className="shrink-0 pt-3 flex items-center justify-end gap-3">
                <AnimatePresence>
                  {done && !finishReady && (
                    <motion.span
                      key="passed"
                      initial={{ opacity: 0, x: 4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="font-ka-body text-xs font-semibold text-green-700"
                    >
                      Nice — keep going.
                    </motion.span>
                  )}
                </AnimatePresence>
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!buttonReady}
                  className={`inline-flex items-center gap-2 h-ka-touch px-6 rounded-full font-ka-display font-bold text-sm shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ka-brand-700 ${
                    buttonReady
                      ? 'bg-ka-brand-500 text-white hover:bg-ka-brand-600'
                      : finishReady
                        ? 'bg-ka-year3 text-white'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {finishReady ? 'All five done' : isLast ? 'Finish' : 'Continue'}
                  {buttonReady && <ArrowDown size={16} strokeWidth={2.5} />}
                </button>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
