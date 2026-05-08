'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ToolProps } from '@/app/kids-academy/types/curriculum'
import { play } from '@/app/kids-academy/lib/sound'
import { useAutoAdvance } from '@/app/kids-academy/lib/lesson-flow'
import { LessonStepFooter } from '@/app/kids-academy/components/ui/lesson-step-footer'

const W = 800
const H = 480

const TOUCH_TARGET_CLASS =
  '[outline:none] [-webkit-tap-highlight-color:transparent] focus-visible:[outline:3px_solid_#6366F1] focus-visible:[outline-offset:2px]'

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
          <path d="M0 -16 L4 -4 L16 0 L4 4 L0 16 L-4 4 L-16 0 L-4 -4 Z" fill="white" opacity={0.75} />
          <path d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5 Z" fill="#fbbf24" />
        </motion.g>
      ))}
    </g>
  )
}

type SceneType = 'spot' | 'set' | 'bar' | 'tenths' | 'compare'

type Step = { key: string; scene: SceneType; prompt: string; hint: string }

const STEPS: Step[] = [
  { key: 'spot',    scene: 'spot',    prompt: 'How much of the shape is coloured in?',         hint: 'Look at the slices.' },
  { key: 'set',     scene: 'set',     prompt: 'Tap the right number of cookies.',              hint: 'Count carefully.' },
  { key: 'bar',     scene: 'bar',     prompt: 'Fill each bar all the way to make a whole.',    hint: 'Tap the pieces to add them.' },
  { key: 'tenths',  scene: 'tenths',  prompt: 'Hop the frog all the way to 1, one tenth at a time.', hint: 'Ten little hops make a whole.' },
  { key: 'compare', scene: 'compare', prompt: 'Tap the bigger fraction.',                      hint: 'More slices coloured means more.' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Spot the fraction.

type SpotQ = {
  shape: 'circle' | 'rect'
  denom: number
  num: number
  options: string[]
  answer: string
}
const SPOT_QUESTIONS: SpotQ[] = [
  { shape: 'circle', denom: 2, num: 1, options: ['1/4', '1/3', '1/2', '2/3'], answer: '1/2' },
  { shape: 'rect',   denom: 4, num: 3, options: ['1/4', '1/2', '3/4', '1/3'], answer: '3/4' },
  { shape: 'circle', denom: 3, num: 1, options: ['1/2', '1/3', '1/4', '2/3'], answer: '1/3' },
]

// Step 2: tap fraction of a set.
type SetQ = { total: number; fractionLabel: string; targetCount: number }
const SET_QUESTIONS: SetQ[] = [
  { total: 12, fractionLabel: '1/4', targetCount: 3 },
  { total: 8,  fractionLabel: '1/2', targetCount: 4 },
]

// Step 5: comparison.
type CompareQ = { left: { denom: number; num: number }; right: { denom: number; num: number }; answer: 'left' | 'right' }
const COMPARE_QUESTIONS: CompareQ[] = [
  { left: { denom: 2, num: 1 }, right: { denom: 4, num: 1 }, answer: 'left' },   // 1/2 vs 1/4
  { left: { denom: 3, num: 1 }, right: { denom: 2, num: 1 }, answer: 'right' },  // 1/3 vs 1/2
  { left: { denom: 4, num: 3 }, right: { denom: 4, num: 1 }, answer: 'left' },   // 3/4 vs 1/4
]

// ─────────────────────────────────────────────────────────────────────────────
// Pie wedge geometry — used in spot, compare, and the cover.

function pieWedge(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const startRad = ((startDeg - 90) * Math.PI) / 180
  const endRad = ((endDeg - 90) * Math.PI) / 180
  const x1 = cx + r * Math.cos(startRad)
  const y1 = cy + r * Math.sin(startRad)
  const x2 = cx + r * Math.cos(endRad)
  const y2 = cy + r * Math.sin(endRad)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
}

function FractionShape({
  shape,
  denom,
  num,
  size = 120,
  fill = '#22c55e',
}: {
  shape: 'circle' | 'rect'
  denom: number
  num: number
  size?: number
  fill?: string
}) {
  if (shape === 'circle') {
    const r = size / 2
    return (
      <g>
        {Array.from({ length: denom }).map((_, i) => {
          const startDeg = (i / denom) * 360
          const endDeg = ((i + 1) / denom) * 360
          const isShaded = i < num
          return (
            <path
              key={i}
              d={pieWedge(0, 0, r, startDeg, endDeg)}
              fill={isShaded ? fill : 'white'}
              stroke="#1f2937"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          )
        })}
      </g>
    )
  }
  const w = size
  const h = size * 0.55
  const partW = w / denom
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="white" />
      {Array.from({ length: num }).map((_, i) => (
        <rect
          key={i}
          x={-w / 2 + i * partW}
          y={-h / 2}
          width={partW}
          height={h}
          fill={fill}
        />
      ))}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke="#1f2937" strokeWidth={2.5} />
      {Array.from({ length: denom - 1 }).map((_, i) => (
        <line
          key={`l-${i}`}
          x1={-w / 2 + (i + 1) * partW}
          y1={-h / 2}
          x2={-w / 2 + (i + 1) * partW}
          y2={h / 2}
          stroke="#1f2937"
          strokeWidth={2}
        />
      ))}
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function FractionsTool({ onProgress }: ToolProps) {
  const startedAt = useRef<number>(Date.now())
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const completedRef = useRef<Set<number>>(new Set())
  const moduleCompletePlayed = useRef<boolean>(false)

  const [activeStep, setActiveStep] = useState(0)
  const [unlockedUpTo, setUnlockedUpTo] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [justCompleted, setJustCompleted] = useState<number | null>(null)

  // Step 0 — Spot.
  const [spotIdx, setSpotIdx] = useState(0)
  const [spotCorrect, setSpotCorrect] = useState(0)
  const [spotWrong, setSpotWrong] = useState<Set<string>>(new Set())
  const [spotJustAnswered, setSpotJustAnswered] = useState<string | null>(null)

  // Step 1 — Set.
  const [setQIdx, setSetQIdx] = useState(0)
  const [setSelected, setSetSelected] = useState<Set<number>>(new Set())
  const [setQDone, setSetQDone] = useState(0)
  const [setLocked, setSetLocked] = useState(false)

  // Step 2 — Bar.
  const [halvesAdded, setHalvesAdded] = useState(0)
  const [quartersAdded, setQuartersAdded] = useState(0)

  // Step 3 — Tenths.
  const [tenthsPos, setTenthsPos] = useState(0)

  // Step 4 — Compare.
  const [compareIdx, setCompareIdx] = useState(0)
  const [compareCorrect, setCompareCorrect] = useState(0)
  const [compareWrong, setCompareWrong] = useState<'left' | 'right' | null>(null)
  const [compareJustAnswered, setCompareJustAnswered] = useState<'left' | 'right' | null>(null)

  function markStepComplete(idx: number) {
    if (completedRef.current.has(idx)) return
    completedRef.current.add(idx)
    setCompletedSteps(Array.from(completedRef.current).sort((a, b) => a - b))
    if (idx + 1 > unlockedUpTo) setUnlockedUpTo(idx + 1)
  }

  // Step 0 test.
  useEffect(() => {
    if (activeStep !== 0) return
    if (spotCorrect >= SPOT_QUESTIONS.length) markStepComplete(0)
  }, [activeStep, spotCorrect])

  // Step 1 test.
  useEffect(() => {
    if (activeStep !== 1) return
    if (setQDone >= SET_QUESTIONS.length) markStepComplete(1)
  }, [activeStep, setQDone])

  // Step 2 test: both bars full.
  useEffect(() => {
    if (activeStep !== 2) return
    if (halvesAdded >= 2 && quartersAdded >= 4) markStepComplete(2)
  }, [activeStep, halvesAdded, quartersAdded])

  // Step 3 test: reach 10/10.
  useEffect(() => {
    if (activeStep !== 3) return
    if (tenthsPos >= 10) markStepComplete(3)
  }, [activeStep, tenthsPos])

  // Step 4 test.
  useEffect(() => {
    if (activeStep !== 4) return
    if (compareCorrect >= COMPARE_QUESTIONS.length) markStepComplete(4)
  }, [activeStep, compareCorrect])

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

  function scrollToStep(index: number) {
    const target = sectionRefs.current[index]
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const autoAdvancedRef = useAutoAdvance({
    activeStep,
    justCompleted,
    unlockedUpTo,
    setUnlockedUpTo,
    totalSteps: STEPS.length,
    scrollToStep,
    moduleCompletePlayed,
  })

  function goBack(i: number) {
    if (i <= 0) return
    scrollToStep(i - 1)
  }

  function goForward(i: number) {
    if (i + 1 > unlockedUpTo) return
    scrollToStep(i + 1)
  }

  function resetStep(idx: number) {
    completedRef.current.delete(idx)
    setCompletedSteps(Array.from(completedRef.current).sort((a, b) => a - b))
    autoAdvancedRef.current.delete(idx)
    if (justCompleted === idx) setJustCompleted(null)
    switch (idx) {
      case 0:
        setSpotIdx(0); setSpotCorrect(0); setSpotWrong(new Set()); setSpotJustAnswered(null)
        break
      case 1:
        setSetQIdx(0); setSetSelected(new Set()); setSetQDone(0); setSetLocked(false)
        break
      case 2:
        setHalvesAdded(0); setQuartersAdded(0)
        break
      case 3:
        setTenthsPos(0)
        break
      case 4:
        setCompareIdx(0); setCompareCorrect(0); setCompareWrong(null); setCompareJustAnswered(null)
        break
    }
  }

  function handleReset() {
    completedRef.current = new Set()
    setCompletedSteps([])
    setUnlockedUpTo(0)
    setActiveStep(0)
    setSpotIdx(0); setSpotCorrect(0); setSpotWrong(new Set()); setSpotJustAnswered(null)
    setSetQIdx(0); setSetSelected(new Set()); setSetQDone(0); setSetLocked(false)
    setHalvesAdded(0); setQuartersAdded(0)
    setTenthsPos(0)
    setCompareIdx(0); setCompareCorrect(0); setCompareWrong(null); setCompareJustAnswered(null)
    setJustCompleted(null)
    autoAdvancedRef.current = new Set()
    moduleCompletePlayed.current = false
    startedAt.current = Date.now()
    requestAnimationFrame(() => scrollToStep(0))
  }

  // Step 1 handler — when user taps a cookie, toggle selection. When count matches target, lock + advance.
  // Side effects live outside the setSetSelected updater so the updater stays pure.
  function handleSetTap(idx: number) {
    if (setLocked) return
    const q = SET_QUESTIONS[setQIdx]

    const next = new Set(setSelected)
    if (next.has(idx)) next.delete(idx)
    else next.add(idx)
    setSetSelected(next)

    if (next.size === q.targetCount) {
      setSetLocked(true)
      setTimeout(() => {
        setSetQDone((d) => d + 1)
        if (setQIdx + 1 < SET_QUESTIONS.length) {
          setSetQIdx((i) => i + 1)
          setSetSelected(new Set())
        }
        setSetLocked(false)
      }, 1100)
    }
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
              ref={(el) => { sectionRefs.current[i] = el }}
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

              <div className="flex-1 min-h-0 rounded-3xl border border-slate-200 overflow-hidden shadow-sm bg-white">
                {step.scene === 'spot' && (
                  <SpotScene
                    stepIdx={i}
                    qIdx={spotIdx}
                    correctCount={spotCorrect}
                    wrong={spotWrong}
                    justAnswered={spotJustAnswered}
                    onAnswer={(opt) => {
                      if (spotJustAnswered !== null) return
                      const q = SPOT_QUESTIONS[spotIdx]
                      if (opt === q.answer) {
                        setSpotJustAnswered(opt)
                        setSpotCorrect((c) => c + 1)
                        setSpotWrong(new Set())
                        setTimeout(() => {
                          setSpotIdx((idx) => Math.min(idx + 1, SPOT_QUESTIONS.length - 1))
                          setSpotJustAnswered(null)
                        }, 1100)
                      } else {
                        setSpotWrong((s) => new Set(s).add(opt))
                      }
                    }}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'set' && (
                  <SetScene
                    stepIdx={i}
                    qIdx={setQIdx}
                    selected={setSelected}
                    locked={setLocked}
                    onTap={handleSetTap}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'bar' && (
                  <BarScene
                    stepIdx={i}
                    halves={halvesAdded}
                    quarters={quartersAdded}
                    onAddHalf={() => setHalvesAdded((n) => Math.min(n + 1, 2))}
                    onAddQuarter={() => setQuartersAdded((n) => Math.min(n + 1, 4))}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'tenths' && (
                  <TenthsScene
                    stepIdx={i}
                    pos={tenthsPos}
                    onHop={() => setTenthsPos((p) => Math.min(p + 1, 10))}
                    onReset={() => setTenthsPos(0)}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'compare' && (
                  <CompareScene
                    stepIdx={i}
                    qIdx={compareIdx}
                    correctCount={compareCorrect}
                    wrong={compareWrong}
                    justAnswered={compareJustAnswered}
                    onAnswer={(side) => {
                      if (compareJustAnswered !== null) return
                      const q = COMPARE_QUESTIONS[compareIdx]
                      if (side === q.answer) {
                        setCompareJustAnswered(side)
                        setCompareCorrect((c) => c + 1)
                        setCompareWrong(null)
                        setTimeout(() => {
                          setCompareIdx((idx) => Math.min(idx + 1, COMPARE_QUESTIONS.length - 1))
                          setCompareJustAnswered(null)
                        }, 1100)
                      } else {
                        setCompareWrong(side)
                        setTimeout(() => setCompareWrong(null), 700)
                      }
                    }}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
              </div>

              <LessonStepFooter
                stepIndex={i}
                done={done}
                canGoForward={i + 1 <= unlockedUpTo}
                onBack={() => goBack(i)}
                onForward={() => goForward(i)}
                onResetStep={() => resetStep(i)}
              />
            </section>
          )
        })}

        {showSummary && (
          <section
            key="summary"
            data-step={STEPS.length}
            ref={(el) => { sectionRefs.current[STEPS.length] = el }}
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
                <li>A fraction tells you a bit of a whole thing.</li>
                <li>Two halves, four quarters, or three thirds all make one whole.</li>
                <li>Ten tenths add up to one — that&rsquo;s how tenths work.</li>
                <li>The bigger the slice, the bigger the fraction.</li>
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

// ─────────────────────────────────────────────────────────────────────────────
// SPOT SCENE — step 0.

function SpotScene({
  stepIdx,
  qIdx,
  correctCount,
  wrong,
  justAnswered,
  onAnswer,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  qIdx: number
  correctCount: number
  wrong: Set<string>
  justAnswered: string | null
  onAnswer: (opt: string) => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const total = SPOT_QUESTIONS.length
  const finished = correctCount >= total
  const q = finished ? SPOT_QUESTIONS[total - 1] : SPOT_QUESTIONS[qIdx]
  const showRevealed = justAnswered !== null || finished

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${W} 320`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full block touch-none select-none"
          role="img"
          aria-label="A shape divided into parts. Some parts are coloured in."
        >
          <defs>
            <linearGradient id={`spot-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={320} fill={`url(#spot-bg-${stepIdx})`} />

          <text x={W / 2} y={50} textAnchor="middle" fill="#7c2d12" fontSize={14} fontWeight={700}
                style={{ fontFamily: 'system-ui, sans-serif' }}>
            Question {Math.min(qIdx + 1, total)} of {total}
          </text>

          <g transform={`translate(${W / 2}, 180)`}>
            <AnimatePresence mode="wait">
              <motion.g
                key={`spot-${qIdx}-${showRevealed ? 'done' : 'open'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <FractionShape shape={q.shape} denom={q.denom} num={q.num} size={140} fill={showRevealed ? '#22c55e' : '#fb923c'} />
              </motion.g>
            </AnimatePresence>
          </g>

          {showRevealed && (
            <motion.text
              key={`spot-answer-${qIdx}`}
              x={W / 2}
              y={290}
              textAnchor="middle"
              fill="#15803d"
              fontSize={28}
              fontWeight={900}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              {q.answer}
            </motion.text>
          )}

          {showSparkles && <SparkleBurst />}
        </svg>
      </div>

      <div className="shrink-0 bg-white border-t border-slate-200 px-3 py-3">
        <div className="grid grid-cols-4 gap-3 max-w-2xl mx-auto">
          {q.options.map((opt) => {
            const isWrong = wrong.has(opt)
            const isJustCorrect = justAnswered === opt
            const isLocked = isWrong || finished || justAnswered !== null
            return (
              <motion.button
                key={`${qIdx}-${opt}`}
                type="button"
                onClick={() => onAnswer(opt)}
                disabled={!isCurrent || isLocked}
                animate={
                  isWrong
                    ? { x: [-6, 6, -4, 4, 0] }
                    : isJustCorrect
                      ? { scale: [1, 1.08, 1] }
                      : { scale: 1, x: 0 }
                }
                transition={{ duration: isJustCorrect ? 0.45 : 0.4 }}
                className={`relative h-14 rounded-2xl border-2 font-ka-display font-bold text-2xl transition focus-visible:outline-2 focus-visible:outline-ka-brand-500 ${
                  isJustCorrect
                    ? 'bg-ka-year3 border-ka-year3 text-white'
                    : isWrong
                      ? 'bg-ka-year6 border-ka-year6 text-white'
                      : 'bg-white border-slate-300 text-slate-800 hover:border-ka-brand-500'
                }`}
              >
                {opt}
                {isJustCorrect && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-ka-year3 flex items-center justify-center shadow-sm">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SET SCENE — step 1.

function SetScene({
  stepIdx,
  qIdx,
  selected,
  locked,
  onTap,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  qIdx: number
  selected: Set<number>
  locked: boolean
  onTap: (idx: number) => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const q = SET_QUESTIONS[qIdx]
  const total = q.total
  const cols = total === 12 ? 4 : total === 8 ? 4 : Math.min(total, 4)
  const rows = Math.ceil(total / cols)
  const cellW = 88
  const cellH = 88
  const gridW = cols * cellW
  const gridH = rows * cellH
  const startX = W / 2 - gridW / 2 + cellW / 2
  // Pushed down so the first row clears the "Tap 1/4 of 12 cookies" header.
  const startY = 170

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block touch-none select-none"
      role="img"
      aria-label="A set of cookies. Tap the right number to match the fraction."
    >
      <defs>
        <linearGradient id={`set-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#set-bg-${stepIdx})`} />

      <text x={W / 2} y={50} textAnchor="middle" fill="#7c2d12" fontSize={14} fontWeight={700}
            style={{ fontFamily: 'system-ui, sans-serif' }}>
        Question {qIdx + 1} of {SET_QUESTIONS.length}
      </text>
      <text x={W / 2} y={88} textAnchor="middle" fill="#1f2937" fontSize={26} fontWeight={800}
            style={{ fontFamily: 'system-ui, sans-serif' }}>
        Tap {q.fractionLabel} of {q.total} cookies
      </text>

      {Array.from({ length: total }).map((_, idx) => {
        const r = Math.floor(idx / cols)
        const c = idx % cols
        const x = startX + c * cellW
        const y = startY + r * cellH
        const isSelected = selected.has(idx)
        return (
          <g key={`${qIdx}-${idx}`} transform={`translate(${x}, ${y})`}>
            <motion.g
              animate={{ scale: isSelected ? 1.05 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <circle cx={0} cy={0} r={28} fill="#a16207" stroke="#451a03" strokeWidth={2} />
              <circle cx={-8} cy={-6} r={3} fill="#451a03" />
              <circle cx={6}  cy={-2} r={3} fill="#451a03" />
              <circle cx={-2} cy={8}  r={3} fill="#451a03" />
              <circle cx={10} cy={10} r={3} fill="#451a03" />
              <circle cx={-12} cy={6} r={3} fill="#451a03" />
              {isSelected && (
                <>
                  <circle cx={0} cy={0} r={32} fill="none" stroke="#22c55e" strokeWidth={3.5} />
                  <g transform="translate(20, -20)">
                    <circle cx={0} cy={0} r={9} fill="#22c55e" stroke="white" strokeWidth={1.5} />
                    <path d="M -4 0 L -1 3 L 5 -3" stroke="white" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </>
              )}
            </motion.g>
            <rect
              tabIndex={isCurrent ? 0 : -1}
              x={-36}
              y={-36}
              width={72}
              height={72}
              fill="transparent"
              onPointerDown={(e) => { e.preventDefault(); onTap(idx) }}
              className={TOUCH_TARGET_CLASS}
              style={{ cursor: 'pointer' }}
              aria-label={`Cookie ${idx + 1} of ${total}`}
            />
          </g>
        )
      })}

      {/* Status counter */}
      <text
        x={W / 2}
        y={H - 30}
        textAnchor="middle"
        fill={locked ? '#15803d' : '#475569'}
        fontSize={16}
        fontWeight={700}
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        Selected: {selected.size} of {q.targetCount}
        {locked ? '   ✓' : ''}
      </text>

      {showSparkles && <SparkleBurst />}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BAR SCENE — step 2.

function BarScene({
  stepIdx,
  halves,
  quarters,
  onAddHalf,
  onAddQuarter,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  halves: number
  quarters: number
  onAddHalf: () => void
  onAddQuarter: () => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const barWidth = 480
  const barHeight = 60
  const barX = (W - barWidth) / 2

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${W} 360`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full block touch-none select-none"
          role="img"
          aria-label="Two empty bars. Tap pieces to fill them."
        >
          <defs>
            <linearGradient id={`bar-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={360} fill={`url(#bar-bg-${stepIdx})`} />

          {/* Halves bar */}
          <text x={barX} y={90} fill="#7c2d12" fontSize={16} fontWeight={800}
                style={{ fontFamily: 'system-ui, sans-serif' }}>
            Make 1 with halves
          </text>
          <rect x={barX} y={100} width={barWidth} height={barHeight} fill="white" stroke="#1f2937" strokeWidth={2} rx={8} />
          {Array.from({ length: halves }).map((_, i) => (
            <motion.rect
              key={`h-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ originX: barX + i * (barWidth / 2) + (barWidth / 4), originY: 100 + barHeight / 2 } as React.CSSProperties}
              x={barX + i * (barWidth / 2)}
              y={100}
              width={barWidth / 2}
              height={barHeight}
              fill="#3b82f6"
              stroke="#1f2937"
              strokeWidth={2}
              rx={6}
            />
          ))}
          <text x={barX + barWidth + 16} y={100 + barHeight / 2 + 6} fill="#1f2937" fontSize={20} fontWeight={800}
                style={{ fontFamily: 'system-ui, sans-serif' }}>
            {halves >= 2 ? '= 1' : `${halves}/2`}
          </text>

          {/* Quarters bar */}
          <text x={barX} y={220} fill="#7c2d12" fontSize={16} fontWeight={800}
                style={{ fontFamily: 'system-ui, sans-serif' }}>
            Make 1 with quarters
          </text>
          <rect x={barX} y={230} width={barWidth} height={barHeight} fill="white" stroke="#1f2937" strokeWidth={2} rx={8} />
          {Array.from({ length: quarters }).map((_, i) => (
            <motion.rect
              key={`q-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              x={barX + i * (barWidth / 4)}
              y={230}
              width={barWidth / 4}
              height={barHeight}
              fill="#a855f7"
              stroke="#1f2937"
              strokeWidth={2}
              rx={6}
            />
          ))}
          <text x={barX + barWidth + 16} y={230 + barHeight / 2 + 6} fill="#1f2937" fontSize={20} fontWeight={800}
                style={{ fontFamily: 'system-ui, sans-serif' }}>
            {quarters >= 4 ? '= 1' : `${quarters}/4`}
          </text>

          {showSparkles && <SparkleBurst />}
        </svg>
      </div>

      <div className="shrink-0 bg-white border-t border-slate-200 px-3 py-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onAddHalf}
          disabled={!isCurrent || halves >= 2}
          className="inline-flex items-center gap-2 h-ka-touch px-5 rounded-full bg-blue-500 text-white font-ka-display font-bold text-sm shadow-sm hover:bg-blue-600 transition disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-ka-brand-500"
        >
          {halves >= 2 ? 'Halves done' : 'Add 1/2'}
        </button>
        <button
          type="button"
          onClick={onAddQuarter}
          disabled={!isCurrent || quarters >= 4}
          className="inline-flex items-center gap-2 h-ka-touch px-5 rounded-full bg-purple-500 text-white font-ka-display font-bold text-sm shadow-sm hover:bg-purple-600 transition disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-ka-brand-500"
        >
          {quarters >= 4 ? 'Quarters done' : 'Add 1/4'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TENTHS SCENE — step 3.

function TenthsScene({
  stepIdx,
  pos,
  onHop,
  onReset,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  pos: number
  onHop: () => void
  onReset: () => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const lineY = 180
  const lineX0 = 60
  const lineX1 = W - 60
  const totalUnits = 10
  const unitW = (lineX1 - lineX0) / totalUnits

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${W} 280`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full block touch-none select-none"
          role="img"
          aria-label="A number line from zero to one in tenths."
        >
          <defs>
            <linearGradient id={`tenths-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#bbf7d0" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={280} fill={`url(#tenths-bg-${stepIdx})`} />

          <line x1={lineX0} y1={lineY} x2={lineX1} y2={lineY} stroke="#1f2937" strokeWidth={3} />
          {Array.from({ length: totalUnits + 1 }).map((_, n) => {
            const x = lineX0 + n * unitW
            const isReached = n <= pos
            const label = n === 0 ? '0' : n === 10 ? '1' : `${n}/10`
            return (
              <g key={n}>
                <line x1={x} y1={lineY - 8} x2={x} y2={lineY + 8} stroke="#1f2937" strokeWidth={2.5} />
                <circle cx={x} cy={lineY} r={isReached ? 8 : 4} fill={isReached ? '#22c55e' : '#cbd5e1'} stroke={isReached ? '#15803d' : '#94a3b8'} strokeWidth={1.5} />
                <text x={x} y={lineY + 32} textAnchor="middle" fill="#1f2937" fontSize={14} fontWeight={isReached ? 800 : 600}
                      style={{ fontFamily: 'system-ui, sans-serif' }}>
                  {label}
                </text>
              </g>
            )
          })}

          {/* Frog */}
          <motion.g
            animate={{ x: lineX0 + pos * unitW, y: lineY }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          >
            <ellipse cx={0} cy={-26} rx={20} ry={16} fill="#22c55e" stroke="#14532d" strokeWidth={2} />
            <ellipse cx={-9} cy={-38} rx={6} ry={6} fill="#22c55e" stroke="#14532d" strokeWidth={2} />
            <ellipse cx={9}  cy={-38} rx={6} ry={6} fill="#22c55e" stroke="#14532d" strokeWidth={2} />
            <circle cx={-9} cy={-39} r={2.5} fill="#1f2937" />
            <circle cx={9}  cy={-39} r={2.5} fill="#1f2937" />
            <path d="M -8 -22 Q 0 -16 8 -22" stroke="#14532d" strokeWidth={1.8} fill="none" strokeLinecap="round" />
          </motion.g>

          <text x={W / 2} y={70} textAnchor="middle" fill="#14532d" fontSize={24} fontWeight={800}
                style={{ fontFamily: 'system-ui, sans-serif' }}>
            Hop in tenths
          </text>
          <text x={W / 2} y={94} textAnchor="middle" fill="#475569" fontSize={14}
                style={{ fontFamily: 'system-ui, sans-serif' }}>
            Hops: {pos} of 10
          </text>

          {showSparkles && <SparkleBurst />}
        </svg>
      </div>

      <div className="shrink-0 bg-white border-t border-slate-200 px-3 py-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          disabled={!isCurrent || pos === 0}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw size={14} /> Back to start
        </button>
        <button
          type="button"
          onClick={onHop}
          disabled={!isCurrent || pos >= 10}
          tabIndex={isCurrent ? 0 : -1}
          className="inline-flex items-center gap-2 h-ka-touch px-6 rounded-full bg-ka-brand-500 text-white font-ka-display font-bold text-base shadow-sm hover:bg-ka-brand-600 transition disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-ka-brand-700"
        >
          {pos >= 10 ? 'Made it!' : 'Hop +1/10'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPARE SCENE — step 4.

function CompareScene({
  stepIdx,
  qIdx,
  correctCount,
  wrong,
  justAnswered,
  onAnswer,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  qIdx: number
  correctCount: number
  wrong: 'left' | 'right' | null
  justAnswered: 'left' | 'right' | null
  onAnswer: (side: 'left' | 'right') => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const total = COMPARE_QUESTIONS.length
  const finished = correctCount >= total
  const q = finished ? COMPARE_QUESTIONS[total - 1] : COMPARE_QUESTIONS[qIdx]
  const showRevealed = justAnswered !== null || finished

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block touch-none select-none"
      role="img"
      aria-label="Two fractions side by side. Tap the bigger one."
    >
      <defs>
        <linearGradient id={`cmp-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#cmp-bg-${stepIdx})`} />

      <text x={W / 2} y={50} textAnchor="middle" fill="#7c2d12" fontSize={14} fontWeight={700}
            style={{ fontFamily: 'system-ui, sans-serif' }}>
        Question {Math.min(qIdx + 1, total)} of {total}
      </text>
      <text x={W / 2} y={86} textAnchor="middle" fill="#1f2937" fontSize={22} fontWeight={800}
            style={{ fontFamily: 'system-ui, sans-serif' }}>
        Tap the bigger fraction
      </text>

      {(['left', 'right'] as const).map((side) => {
        const cfg = q[side]
        const cx = side === 'left' ? 240 : 560
        const cy = 240
        const isWrongPick = wrong === side
        const isJustCorrect = justAnswered === side
        const isCorrect = q.answer === side
        const showCorrectMark = showRevealed && isCorrect
        const showWrongMark = showRevealed && !isCorrect && side === justAnswered
        return (
          <motion.g
            key={`${qIdx}-${side}`}
            animate={
              isWrongPick
                ? { x: side === 'left' ? [-6, 6, -4, 4, 0] : [6, -6, 4, -4, 0] }
                : isJustCorrect
                  ? { scale: [1, 1.08, 1] }
                  : { scale: 1, x: 0 }
            }
            transition={{ duration: isJustCorrect ? 0.45 : 0.4 }}
          >
            <g transform={`translate(${cx}, ${cy})`}>
              <FractionShape
                shape="circle"
                denom={cfg.denom}
                num={cfg.num}
                size={140}
                fill={showCorrectMark ? '#22c55e' : '#fb923c'}
              />
              <text x={0} y={110} textAnchor="middle" fill="#1f2937" fontSize={26} fontWeight={900}
                    style={{ fontFamily: 'system-ui, sans-serif' }}>
                {cfg.num}/{cfg.denom}
              </text>
              {showCorrectMark && (
                <g transform="translate(70, -70)">
                  <circle cx={0} cy={0} r={16} fill="#22c55e" stroke="white" strokeWidth={2.5} />
                  <path d="M -7 0 L -2 6 L 8 -6" stroke="white" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              )}
              {showWrongMark && (
                <g transform="translate(70, -70)">
                  <circle cx={0} cy={0} r={16} fill="#ef4444" stroke="white" strokeWidth={2.5} />
                  <path d="M -6 -6 L 6 6 M 6 -6 L -6 6" stroke="white" strokeWidth={3.5} strokeLinecap="round" />
                </g>
              )}
            </g>
            <rect
              tabIndex={isCurrent ? 0 : -1}
              x={cx - 90}
              y={cy - 90}
              width={180}
              height={210}
              fill="transparent"
              onPointerDown={(e) => {
                e.preventDefault()
                if (justAnswered === null && !finished) onAnswer(side)
              }}
              className={TOUCH_TARGET_CLASS}
              style={{ cursor: 'pointer' }}
              aria-label={`${cfg.num} over ${cfg.denom}`}
            />
          </motion.g>
        )
      })}

      {showSparkles && <SparkleBurst />}
    </svg>
  )
}
