'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ToolProps } from '@/app/kids-academy/types/curriculum'
import { play } from '@/app/kids-academy/lib/sound'

const W = 800
const H = 480
const GROUND_Y = 360
const OBJECT_HEIGHT = 130
const OBJECT_WIDTH = 50

type Pt = { x: number; y: number }
type Target = 'light' | 'object'

type StepState = { length: number; tipX: number; objectX: number; lightY: number }
type Step = {
  key: string
  prompt: string
  hint: string
  test: (s: StepState) => boolean
  startLight: Pt
  startObject: Pt
}

const TREE_HOME: Pt = { x: 400, y: GROUND_Y }

// :focus-visible only — keyboard users see an outline; touch and mouse don't.
// -webkit-tap-highlight-color suppresses iOS's grey-on-tap rectangle that was
// leaving paint artifacts during rapid drags.
const TOUCH_TARGET_CLASS =
  '[outline:none] [-webkit-tap-highlight-color:transparent] focus-visible:[outline:3px_solid_#6366F1] focus-visible:[outline-offset:2px]'

// Pulse the Continue button after a step passes — the button gets a soft indigo
// halo that ripples outward, on top of a small base shadow. Three keyframes so
// the loop is seamless (start = end).
const BTN_BASE_SHADOW = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
const BTN_PULSE_KEYFRAMES = [
  `${BTN_BASE_SHADOW}, 0 0 0 0 rgba(99, 102, 241, 0)`,
  `${BTN_BASE_SHADOW}, 0 0 0 14px rgba(99, 102, 241, 0.45)`,
  `${BTN_BASE_SHADOW}, 0 0 0 0 rgba(99, 102, 241, 0)`,
]
const BTN_REST_SHADOW = `${BTN_BASE_SHADOW}, 0 0 0 0 rgba(99, 102, 241, 0)`

const SPARKLE_POSITIONS = [
  { x: 150, y: 80 },  { x: 400, y: 60 },  { x: 650, y: 90 },
  { x: 100, y: 200 }, { x: 700, y: 200 }, { x: 250, y: 290 },
  { x: 550, y: 290 }, { x: 350, y: 150 }, { x: 450, y: 340 },
  { x: 200, y: 410 }, { x: 600, y: 410 }, { x: 750, y: 350 },
]

function SparkleBurst() {
  return (
    <g pointerEvents="none">
      {SPARKLE_POSITIONS.map((pos, i) => (
        <motion.g
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1, delay: i * 0.04, ease: 'easeOut' }}
          style={{ x: pos.x, y: pos.y }}
        >
          <path
            d="M0 -16 L4 -4 L16 0 L4 4 L0 16 L-4 4 L-16 0 L-4 -4 Z"
            fill="white"
            opacity={0.75}
          />
          <path
            d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5 Z"
            fill="#fbbf24"
          />
        </motion.g>
      ))}
    </g>
  )
}

const STEPS: Step[] = [
  {
    key: 'light',
    prompt: 'Drag the sun up into the sky.',
    hint: 'When the sun rises, light fills the world. A shadow appears too.',
    test: (s) => s.lightY < 200,
    startLight: { x: 400, y: 460 },
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

// Step 0 is the only step where the sun can sit below the horizon (so it can
// start in a "set" position the user lifts into the sky). Other steps clamp
// the sun to the sky region so the shadow geometry stays well-defined.
function clampLight(p: Pt, allowBelowHorizon: boolean): Pt {
  return {
    x: Math.max(40, Math.min(W - 40, p.x)),
    y: Math.max(30, Math.min(allowBelowHorizon ? 460 : GROUND_Y - OBJECT_HEIGHT - 50, p.y)),
  }
}

function clampObject(p: Pt): Pt {
  return {
    x: Math.max(80, Math.min(W - 80, p.x)),
    y: GROUND_Y,
  }
}

export default function LightAndShadowsTool({ onProgress }: ToolProps) {
  const startedAt = useRef<number>(Date.now())
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const wasMet = useRef<boolean>(false)
  const completedRef = useRef<Set<number>>(new Set())
  const moduleCompletePlayed = useRef<boolean>(false)

  const [light, setLight] = useState<Pt>(STEPS[0].startLight)
  const [object, setObject] = useState<Pt>(STEPS[0].startObject)
  const [activeStep, setActiveStep] = useState(0)
  const [unlockedUpTo, setUnlockedUpTo] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [dragging, setDragging] = useState<Target | null>(null)
  const [justCompleted, setJustCompleted] = useState<number | null>(null)

  const shadowTipX = useMemo(() => {
    const topY = GROUND_Y - OBJECT_HEIGHT
    const dx = object.x - light.x
    const dy = topY - light.y
    if (dy <= 0) return object.x
    const t = (GROUND_Y - light.y) / dy
    return light.x + t * dx
  }, [light.x, light.y, object.x])

  const shadowLength = Math.abs(shadowTipX - object.x)

  // Brightness ramps from 0 (sun at y=460, "set") to 1 (sun at y<=250, in the sky).
  // Used to fade the dark overlay in step 0 so the world lights up as the sun rises.
  const brightness = Math.max(0, Math.min(1, (460 - light.y) / 210))

  useEffect(() => {
    const step = STEPS[activeStep]
    if (!step) return
    wasMet.current = step.test({
      length: shadowLength,
      tipX: shadowTipX,
      objectX: object.x,
      lightY: light.y,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep])

  useEffect(() => {
    const step = STEPS[activeStep]
    if (!step) return
    const meets = step.test({
      length: shadowLength,
      tipX: shadowTipX,
      objectX: object.x,
      lightY: light.y,
    })
    if (meets && !wasMet.current && !completedRef.current.has(activeStep)) {
      completedRef.current.add(activeStep)
      setCompletedSteps(Array.from(completedRef.current).sort((a, b) => a - b))
      if (activeStep + 1 > unlockedUpTo) setUnlockedUpTo(activeStep + 1)
    }
    wasMet.current = meets
  }, [shadowLength, shadowTipX, object.x, light.y, activeStep, unlockedUpTo])

  useEffect(() => {
    onProgress(Math.round((completedSteps.length / STEPS.length) * 100))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedSteps])

  useEffect(() => {
    const last = completedSteps[completedSteps.length - 1]
    if (last === undefined) return
    setJustCompleted(last)
    play('stepPass')
    const t = setTimeout(() => setJustCompleted(null), 4000)
    return () => clearTimeout(t)
  }, [completedSteps])

  useEffect(() => {
    if (activeStep === STEPS.length && !moduleCompletePlayed.current) {
      moduleCompletePlayed.current = true
      play('moduleComplete')
    }
  }, [activeStep])

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

  function jumpToStartFor(stepIndex: number) {
    const s = STEPS[stepIndex]
    if (!s) return
    setLight(s.startLight)
    setObject(s.startObject)
  }

  function svgPoint(clientX: number, clientY: number): Pt {
    const target = sectionRefs.current[activeStep]?.querySelector('svg') as SVGSVGElement | null
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
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
  }

  function moveDrag(e: React.PointerEvent<SVGElement>) {
    if (!dragging) return
    const p = svgPoint(e.clientX, e.clientY)
    if (dragging === 'light') setLight(clampLight(p, activeStep === 0))
    else setObject(clampObject(p))
  }

  function endDrag(e: React.PointerEvent<SVGElement>) {
    setDragging(null)
    ;(e.currentTarget as Element).releasePointerCapture?.(e.pointerId)
  }

  function handleKey(e: React.KeyboardEvent<SVGElement>, target: Target) {
    const STEP = 16
    let dx = 0, dy = 0
    if (e.key === 'ArrowLeft')       dx = -STEP
    else if (e.key === 'ArrowRight') dx = STEP
    else if (e.key === 'ArrowUp')    dy = -STEP
    else if (e.key === 'ArrowDown')  dy = STEP
    else return
    e.preventDefault()
    if (target === 'light') setLight(clampLight({ x: light.x + dx, y: light.y + dy }, activeStep === 0))
    else setObject(clampObject({ x: object.x + dx, y: object.y + dy }))
  }

  function scrollToStep(index: number) {
    const target = sectionRefs.current[index]
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleContinue() {
    const next = activeStep + 1
    if (next > unlockedUpTo) setUnlockedUpTo(next)
    if (next < STEPS.length) {
      jumpToStartFor(next)
      play('continueTap')
    } else if (!moduleCompletePlayed.current) {
      // Play in the click handler so the gesture context is preserved (iOS
      // Safari refuses audio that originates from a useEffect after a scroll).
      moduleCompletePlayed.current = true
      play('moduleComplete')
    }
    requestAnimationFrame(() => scrollToStep(next))
  }

  function handleReset() {
    completedRef.current = new Set()
    setCompletedSteps([])
    setUnlockedUpTo(0)
    setActiveStep(0)
    jumpToStartFor(0)
    startedAt.current = Date.now()
    moduleCompletePlayed.current = false
    requestAnimationFrame(() => scrollToStep(0))
  }

  const visibleSteps = STEPS.slice(0, unlockedUpTo + 1)
  const showSummary = unlockedUpTo >= STEPS.length

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
          const buttonReady = done
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

              <div className="flex-1 min-h-0 rounded-3xl border border-slate-200 overflow-hidden shadow-sm bg-slate-900">
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-full block touch-none select-none"
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  role="img"
                  aria-label="Shadow simulator. Drag the sun or the tree to change the shadow."
                >
                  <defs>
                    <linearGradient id={`ka-sky-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#bae6fd" />
                      <stop offset="100%" stopColor="#fef3c7" />
                    </linearGradient>
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

                  <rect x={0} y={0} width={W} height={GROUND_Y} fill={`url(#ka-sky-${i})`} />
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
                      onKeyDown={(e) => handleKey(e, 'object')}
                      className={TOUCH_TARGET_CLASS}
                      style={{ borderRadius: 12 }}
                      aria-label="Tree. Drag, or press arrow keys to move."
                    />
                  </g>

                  <rect
                    x={0}
                    y={0}
                    width={W}
                    height={H}
                    fill="#020617"
                    opacity={1 - brightness}
                    pointerEvents="none"
                  />

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
                      onKeyDown={(e) => handleKey(e, 'light')}
                      className={TOUCH_TARGET_CLASS}
                      aria-label="Sun. Drag, or press arrow keys to move."
                    />
                  </g>

                  {justCompleted === i && <SparkleBurst />}
                </svg>
              </div>

              <div className="shrink-0 pt-3 flex items-center justify-end gap-3">
                <AnimatePresence>
                  {done && (
                    <motion.span
                      key="passed"
                      initial={{ opacity: 0, x: 8, scale: 0.85 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                      className="inline-flex items-center gap-1.5 font-ka-body text-xs font-semibold text-green-700"
                    >
                      <Check size={14} strokeWidth={3} className="text-ka-year3" />
                      Got it!
                    </motion.span>
                  )}
                </AnimatePresence>
                <motion.button
                  key={`continue-${i}-${justCompleted === i ? 'pulse' : 'rest'}`}
                  type="button"
                  onClick={handleContinue}
                  disabled={!buttonReady}
                  animate={
                    justCompleted === i
                      ? {
                          scale: [1, 1.08, 1],
                          boxShadow: BTN_PULSE_KEYFRAMES,
                        }
                      : { scale: 1, boxShadow: BTN_REST_SHADOW }
                  }
                  transition={
                    justCompleted === i
                      ? { duration: 1.0, repeat: Infinity, ease: 'easeInOut' }
                      : { duration: 0.2 }
                  }
                  className={`inline-flex items-center gap-2 h-ka-touch px-6 rounded-full font-ka-display font-bold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ka-brand-700 ${
                    buttonReady
                      ? 'bg-ka-brand-500 text-white hover:bg-ka-brand-600'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Continue
                  {buttonReady && <ArrowDown size={16} strokeWidth={2.5} />}
                </motion.button>
              </div>
            </section>
          )
        })}

        {showSummary && (
          <section
            key="summary"
            data-step={STEPS.length}
            ref={(el) => {
              sectionRefs.current[STEPS.length] = el
            }}
            className="snap-start h-full flex flex-col px-4 sm:px-6 pb-4 max-w-5xl mx-auto w-full"
          >
            <motion.div
              className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Sparkles className="text-ka-year2" size={56} strokeWidth={2} aria-hidden="true" />
              <h2 className="font-ka-display text-3xl sm:text-4xl font-extrabold text-slate-900">
                Brilliant work!
              </h2>
              <ul className="text-left max-w-md mx-auto space-y-2 font-ka-body text-sm sm:text-base text-slate-700 list-disc pl-6">
                <li>Without light, you can&rsquo;t see anything, and there are no shadows.</li>
                <li>A shadow appears when an object blocks light.</li>
                <li>A low sun makes a long shadow. A high sun makes a short shadow.</li>
                <li>The shadow always points away from the sun.</li>
              </ul>
            </motion.div>
            <div className="shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 h-ka-touch px-5 rounded-full bg-white border border-slate-200 text-slate-700 font-ka-display font-semibold text-sm hover:bg-slate-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ka-brand-500"
              >
                <RotateCcw size={14} /> Try again
              </button>
              <Link
                href="/kids-academy/curriculum"
                className="inline-flex items-center justify-center gap-2 h-ka-touch px-6 rounded-full bg-ka-year3 text-white font-ka-display font-bold text-sm hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ka-brand-500"
              >
                Back to curriculum
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
