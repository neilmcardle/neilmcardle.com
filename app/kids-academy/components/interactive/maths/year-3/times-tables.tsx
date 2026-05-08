'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowRight, Check, RotateCcw, Sparkles, X as XIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ToolProps } from '@/app/kids-academy/types/curriculum'
import { play } from '@/app/kids-academy/lib/sound'

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

type Pt = { x: number; y: number }
type SceneType = 'array' | 'skipcount' | 'match' | 'quiz' | 'missing'

type Step = { key: string; scene: SceneType; prompt: string; hint: string }

const STEPS: Step[] = [
  { key: 'array',     scene: 'array',     prompt: 'Three rows of four apples. How many in total?',         hint: 'Multiplying is just counting groups.' },
  { key: 'skipcount', scene: 'skipcount', prompt: 'Hop the frog all the way to 30, three at a time.',      hint: 'Tap to hop.' },
  { key: 'match',     scene: 'match',     prompt: 'Match each three times table to its answer.',           hint: 'Drag each card into the right box.' },
  { key: 'quiz',      scene: 'quiz',      prompt: 'Tap the right answer.',                                 hint: 'There are four to do.' },
  { key: 'missing',   scene: 'missing',   prompt: 'Find the missing number.',                              hint: 'What number times the other gives the answer?' },
]

const ARRAY_OPTIONS = [9, 11, 12, 16]
const ARRAY_ANSWER = 12

type MatchPair = { question: string; answer: number }
const MATCH_PAIRS: MatchPair[] = [
  { question: '3 × 1', answer: 3 },
  { question: '3 × 2', answer: 6 },
  { question: '3 × 3', answer: 9 },
  { question: '3 × 4', answer: 12 },
  { question: '3 × 5', answer: 15 },
]

type QuizQ = { question: string; answer: number; options: number[] }
const QUIZ_QUESTIONS: QuizQ[] = [
  { question: '3 × 4', answer: 12, options: [7, 12, 9, 15] },
  { question: '4 × 5', answer: 20, options: [18, 25, 20, 16] },
  { question: '8 × 2', answer: 16, options: [10, 18, 14, 16] },
  { question: '3 × 7', answer: 21, options: [21, 18, 24, 27] },
]

type MissingQ = { template: string; answer: number; options: number[] }
const MISSING_QUESTIONS: MissingQ[] = [
  { template: '? × 4 = 12',  answer: 3, options: [2, 3, 4, 6] },
  { template: '? × 3 = 9',   answer: 3, options: [3, 6, 4, 9] },
  { template: '8 × ? = 24',  answer: 3, options: [2, 3, 4, 6] },
  { template: '4 × ? = 16',  answer: 4, options: [2, 3, 4, 8] },
]

function svgPointFromEvent(svg: SVGSVGElement | null, clientX: number, clientY: number): Pt {
  if (!svg) return { x: 0, y: 0 }
  const rect = svg.getBoundingClientRect()
  return {
    x: ((clientX - rect.left) / rect.width) * W,
    y: ((clientY - rect.top) / rect.height) * H,
  }
}

export default function TimesTablesTool({ onProgress }: ToolProps) {
  const startedAt = useRef<number>(Date.now())
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const completedRef = useRef<Set<number>>(new Set())
  const moduleCompletePlayed = useRef<boolean>(false)

  const [activeStep, setActiveStep] = useState(0)
  const [unlockedUpTo, setUnlockedUpTo] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [justCompleted, setJustCompleted] = useState<number | null>(null)

  // Step 0: array choice.
  const [arrayPicked, setArrayPicked] = useState<number | null>(null)
  const [arrayWrong, setArrayWrong] = useState<Set<number>>(new Set())

  // Step 1: skip count — frog position (in steps of 3).
  const [skipPos, setSkipPos] = useState(0)

  // Step 2: match.
  const [matchBins, setMatchBins] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(MATCH_PAIRS.map((p) => [p.question, null])),
  )

  // Step 3: forward quiz.
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizCorrect, setQuizCorrect] = useState(0)
  const [quizWrong, setQuizWrong] = useState<Set<number>>(new Set())
  const [quizJustAnswered, setQuizJustAnswered] = useState<number | null>(null)

  // Step 4: missing number quiz.
  const [missIdx, setMissIdx] = useState(0)
  const [missCorrect, setMissCorrect] = useState(0)
  const [missWrong, setMissWrong] = useState<Set<number>>(new Set())
  const [missJustAnswered, setMissJustAnswered] = useState<number | null>(null)

  function markStepComplete(idx: number) {
    if (completedRef.current.has(idx)) return
    completedRef.current.add(idx)
    setCompletedSteps(Array.from(completedRef.current).sort((a, b) => a - b))
    if (idx + 1 > unlockedUpTo) setUnlockedUpTo(idx + 1)
  }

  // Step 0 test.
  useEffect(() => {
    if (activeStep !== 0) return
    if (arrayPicked === ARRAY_ANSWER) markStepComplete(0)
  }, [activeStep, arrayPicked])

  // Step 1 test: reach 30 (10 hops of 3).
  useEffect(() => {
    if (activeStep !== 1) return
    if (skipPos >= 10) markStepComplete(1)
  }, [activeStep, skipPos])

  // Step 2 test: every match correct.
  useEffect(() => {
    if (activeStep !== 2) return
    const allCorrect = MATCH_PAIRS.every((p) => matchBins[p.question] === p.answer)
    if (allCorrect) markStepComplete(2)
  }, [activeStep, matchBins])

  // Step 3 test: answered all 4 quiz questions.
  useEffect(() => {
    if (activeStep !== 3) return
    if (quizCorrect >= QUIZ_QUESTIONS.length) markStepComplete(3)
  }, [activeStep, quizCorrect])

  // Step 4 test: answered all 4 missing-number questions.
  useEffect(() => {
    if (activeStep !== 4) return
    if (missCorrect >= MISSING_QUESTIONS.length) markStepComplete(4)
  }, [activeStep, missCorrect])

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

  function handleContinue() {
    const next = activeStep + 1
    if (next > unlockedUpTo) setUnlockedUpTo(next)
    if (next < STEPS.length) {
      play('continueTap')
    } else if (!moduleCompletePlayed.current) {
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
    setArrayPicked(null)
    setArrayWrong(new Set())
    setSkipPos(0)
    setMatchBins(Object.fromEntries(MATCH_PAIRS.map((p) => [p.question, null])))
    setQuizIdx(0)
    setQuizCorrect(0)
    setQuizWrong(new Set())
    setQuizJustAnswered(null)
    setMissIdx(0)
    setMissCorrect(0)
    setMissWrong(new Set())
    setMissJustAnswered(null)
    moduleCompletePlayed.current = false
    startedAt.current = Date.now()
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
                {step.scene === 'array' && (
                  <ArrayScene
                    stepIdx={i}
                    picked={arrayPicked}
                    wrong={arrayWrong}
                    onPick={(n) => {
                      if (n === ARRAY_ANSWER) {
                        setArrayPicked(n)
                      } else {
                        setArrayWrong((s) => new Set(s).add(n))
                        setTimeout(() => {
                          setArrayWrong((s) => { const next = new Set(s); next.delete(n); return next })
                        }, 700)
                      }
                    }}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'skipcount' && (
                  <SkipCountScene
                    stepIdx={i}
                    pos={skipPos}
                    onHop={() => setSkipPos((p) => Math.min(p + 1, 10))}
                    onReset={() => setSkipPos(0)}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'match' && (
                  <MatchScene
                    stepIdx={i}
                    bins={matchBins}
                    onPlace={(q, a) => setMatchBins((m) => ({ ...m, [q]: a }))}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'quiz' && (
                  <QuizScene
                    stepIdx={i}
                    questions={QUIZ_QUESTIONS}
                    qIdx={quizIdx}
                    correctCount={quizCorrect}
                    wrong={quizWrong}
                    justAnswered={quizJustAnswered}
                    onAnswer={(opt) => {
                      if (quizJustAnswered !== null) return
                      const q = QUIZ_QUESTIONS[quizIdx]
                      if (opt === q.answer) {
                        setQuizJustAnswered(opt)
                        setQuizCorrect((c) => c + 1)
                        setQuizWrong(new Set())
                        setTimeout(() => {
                          setQuizIdx((idx) => Math.min(idx + 1, QUIZ_QUESTIONS.length - 1))
                          setQuizJustAnswered(null)
                        }, 1100)
                      } else {
                        setQuizWrong((s) => new Set(s).add(opt))
                      }
                    }}
                    mode="forward"
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'missing' && (
                  <QuizScene
                    stepIdx={i}
                    questions={MISSING_QUESTIONS.map((m) => ({ question: m.template, answer: m.answer, options: m.options }))}
                    qIdx={missIdx}
                    correctCount={missCorrect}
                    wrong={missWrong}
                    justAnswered={missJustAnswered}
                    onAnswer={(opt) => {
                      if (missJustAnswered !== null) return
                      const q = MISSING_QUESTIONS[missIdx]
                      if (opt === q.answer) {
                        setMissJustAnswered(opt)
                        setMissCorrect((c) => c + 1)
                        setMissWrong(new Set())
                        setTimeout(() => {
                          setMissIdx((idx) => Math.min(idx + 1, MISSING_QUESTIONS.length - 1))
                          setMissJustAnswered(null)
                        }, 1100)
                      } else {
                        setMissWrong((s) => new Set(s).add(opt))
                      }
                    }}
                    mode="missing"
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
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
                      ? { scale: [1, 1.08, 1], boxShadow: BTN_PULSE_KEYFRAMES }
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
                <li>Multiplying is just counting groups of the same size.</li>
                <li>Skip-counting in 3s gets you to 30 in ten hops.</li>
                <li>The 3 times table doubles up: 3, 6, 9, 12, 15…</li>
                <li>Working backwards (finding a missing number) helps with division too.</li>
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
// ARRAY SCENE — step 0.

function ArrayScene({
  stepIdx,
  picked,
  wrong,
  onPick,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  picked: number | null
  wrong: Set<number>
  onPick: (n: number) => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const rows = 3
  const cols = 4
  const startX = W / 2 - (cols - 1) * 36
  const startY = 90

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${W} 320`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full block touch-none select-none"
          role="img"
          aria-label="A grid of three rows of four apples."
        >
          <defs>
            <linearGradient id={`array-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={320} fill={`url(#array-bg-${stepIdx})`} />

          <text x={W / 2} y={50} textAnchor="middle" fill="#7c2d12" fontSize={28} fontWeight={800}
                style={{ fontFamily: 'system-ui, sans-serif' }}>
            3 × 4 = ?
          </text>

          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => (
              <g key={`${r}-${c}`} transform={`translate(${startX + c * 72}, ${startY + r * 60})`}>
                <circle cx={0} cy={0} r={22} fill="#ef4444" stroke="#7f1d1d" strokeWidth={2} />
                <path d="M -4 -22 Q 0 -28 6 -22" stroke="#7f1d1d" strokeWidth={2} fill="none" strokeLinecap="round" />
                <ellipse cx={4} cy={-26} rx={5} ry={2.5} fill="#16a34a" stroke="#15803d" strokeWidth={1.5} transform="rotate(20 4 -26)" />
                <ellipse cx={-6} cy={-7} rx={4} ry={2.5} fill="#fca5a5" opacity={0.7} />
              </g>
            )),
          )}

          {showSparkles && <SparkleBurst />}
        </svg>
      </div>

      {/* Answer buttons */}
      <div className="shrink-0 bg-white border-t border-slate-200 px-3 py-3">
        <div className="grid grid-cols-4 gap-3 max-w-xl mx-auto">
          {ARRAY_OPTIONS.map((n) => {
            const isPicked = picked === n
            const isWrong = wrong.has(n)
            const correct = n === ARRAY_ANSWER
            return (
              <motion.button
                key={n}
                type="button"
                onClick={() => onPick(n)}
                disabled={!isCurrent || picked !== null}
                animate={isWrong ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className={`relative h-14 rounded-2xl border-2 font-ka-display font-bold text-2xl transition focus-visible:outline-2 focus-visible:outline-ka-brand-500 ${
                  isPicked && correct
                    ? 'bg-ka-year3 border-ka-year3 text-white'
                    : isWrong
                      ? 'bg-ka-year6 border-ka-year6 text-white'
                      : picked !== null
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-default'
                        : 'bg-white border-slate-300 text-slate-800 hover:border-ka-brand-500'
                }`}
              >
                {n}
                {isPicked && correct && (
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
// SKIP COUNT SCENE — step 1.

function SkipCountScene({
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
  const totalUnits = 30
  const unitW = (lineX1 - lineX0) / totalUnits

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${W} 280`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full block touch-none select-none"
          role="img"
          aria-label="A number line with a frog. Tap to hop."
        >
          <defs>
            <linearGradient id={`skip-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#bbf7d0" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={280} fill={`url(#skip-bg-${stepIdx})`} />

          {/* Number line — every integer 0..30 spaced by unitW, so each "skip of 3" visibly
              steps over two minor ticks. */}
          <line x1={lineX0} y1={lineY} x2={lineX1} y2={lineY} stroke="#1f2937" strokeWidth={3} />
          {Array.from({ length: totalUnits + 1 }).map((_, n) => {
            const x = lineX0 + n * unitW
            if (n % 3 === 0) {
              const idx = n / 3
              const isReached = idx <= pos
              return (
                <g key={n}>
                  <line x1={x} y1={lineY - 8} x2={x} y2={lineY + 8} stroke="#1f2937" strokeWidth={2.5} />
                  <circle cx={x} cy={lineY} r={isReached ? 8 : 4} fill={isReached ? '#22c55e' : '#cbd5e1'} stroke={isReached ? '#15803d' : '#94a3b8'} strokeWidth={1.5} />
                  <text x={x} y={lineY + 32} textAnchor="middle" fill="#1f2937" fontSize={16} fontWeight={isReached ? 800 : 600}
                        style={{ fontFamily: 'system-ui, sans-serif' }}>
                    {n}
                  </text>
                </g>
              )
            }
            // Minor tick for non-multiples — the frog hops over these. Same colour
            // as the major ticks; the difference is length and stroke weight only.
            return (
              <line
                key={n}
                x1={x}
                y1={lineY - 4}
                x2={x}
                y2={lineY + 4}
                stroke="#1f2937"
                strokeWidth={1.5}
              />
            )
          })}

          {/* Frog — position is in unit space (pos * 3 actual units along the line). */}
          <motion.g
            animate={{ x: lineX0 + pos * 3 * unitW, y: lineY }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          >
            <ellipse cx={0} cy={-26} rx={20} ry={16} fill="#22c55e" stroke="#14532d" strokeWidth={2} />
            <ellipse cx={-9} cy={-38} rx={6} ry={6} fill="#22c55e" stroke="#14532d" strokeWidth={2} />
            <ellipse cx={9}  cy={-38} rx={6} ry={6} fill="#22c55e" stroke="#14532d" strokeWidth={2} />
            <circle cx={-9} cy={-39} r={2.5} fill="#1f2937" />
            <circle cx={9}  cy={-39} r={2.5} fill="#1f2937" />
            <path d="M -8 -22 Q 0 -16 8 -22" stroke="#14532d" strokeWidth={1.8} fill="none" strokeLinecap="round" />
          </motion.g>

          {/* Title */}
          <text x={W / 2} y={70} textAnchor="middle" fill="#14532d" fontSize={24} fontWeight={800}
                style={{ fontFamily: 'system-ui, sans-serif' }}>
            Skip count by 3s
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
          {pos >= 10 ? 'Made it!' : `Hop +3`}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MATCH SCENE — step 2.

const MATCH_BIN_TOP = 250
const MATCH_BIN_HEIGHT = 200

function MatchScene({
  stepIdx,
  bins,
  onPlace,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  bins: Record<string, number | null>
  onPlace: (q: string, a: number) => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragPos, setDragPos] = useState<Pt>({ x: 0, y: 0 })

  const binWidth = (W - 100) / MATCH_PAIRS.length
  const binAnswers = MATCH_PAIRS.map((p) => p.answer)

  function homePosition(q: string): Pt {
    const placedAnswer = bins[q]
    if (placedAnswer === null) {
      // In tray — find tray order based on unplaced cards.
      const trayCards = MATCH_PAIRS.filter((p) => bins[p.question] === null).map((p) => p.question)
      const idx = trayCards.indexOf(q)
      const trayWidth = W - 100
      const slotW = trayWidth / Math.max(trayCards.length, 1)
      return { x: 50 + slotW * idx + slotW / 2, y: 100 }
    }
    // In a bin — placed at the bin's position.
    const binIdx = binAnswers.indexOf(placedAnswer)
    return { x: 50 + binIdx * binWidth + binWidth / 2, y: MATCH_BIN_TOP + 100 }
  }

  function startDrag(q: string, e: React.PointerEvent<SVGElement>) {
    e.preventDefault()
    if (bins[q] !== null) return
    setDragging(q)
    const p = svgPointFromEvent(svgRef.current, e.clientX, e.clientY)
    setDragPos(p)
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
  }

  function moveDrag(e: React.PointerEvent<SVGElement>) {
    if (!dragging) return
    const p = svgPointFromEvent(svgRef.current, e.clientX, e.clientY)
    setDragPos(p)
  }

  function endDrag(e: React.PointerEvent<SVGElement>) {
    if (!dragging) return
    const p = svgPointFromEvent(svgRef.current, e.clientX, e.clientY)
    const target = binAtPoint(p)
    if (target !== null) {
      const correctAnswer = MATCH_PAIRS.find((m) => m.question === dragging)?.answer
      if (target === correctAnswer) onPlace(dragging, target)
    }
    setDragging(null)
    ;(e.currentTarget as Element).releasePointerCapture?.(e.pointerId)
  }

  function binAtPoint(p: Pt): number | null {
    if (p.y < MATCH_BIN_TOP || p.y > MATCH_BIN_TOP + MATCH_BIN_HEIGHT) return null
    for (let i = 0; i < binAnswers.length; i++) {
      const x0 = 50 + i * binWidth
      if (p.x >= x0 && p.x <= x0 + binWidth) return binAnswers[i]
    }
    return null
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block touch-none select-none"
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="img"
      aria-label="Drag each multiplication card to the right answer."
    >
      <defs>
        <linearGradient id={`match-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#match-bg-${stepIdx})`} />

      <text x={W / 2} y={36} textAnchor="middle" fill="#7c2d12" fontSize={14} fontWeight={700}
            style={{ fontFamily: 'system-ui, sans-serif' }}>
        Pick up a card
      </text>

      {/* Answer bins */}
      {binAnswers.map((ans, i) => {
        const x0 = 50 + i * binWidth
        return (
          <g key={ans}>
            <rect
              x={x0}
              y={MATCH_BIN_TOP}
              width={binWidth - 8}
              height={MATCH_BIN_HEIGHT}
              rx={20}
              fill="#fff7ed"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="6 6"
            />
            <text x={x0 + binWidth / 2} y={MATCH_BIN_TOP + 50} textAnchor="middle" fill="#1f2937" fontSize={32} fontWeight={800}
                  style={{ fontFamily: 'system-ui, sans-serif' }}>
              {ans}
            </text>
          </g>
        )
      })}

      {/* Cards */}
      {MATCH_PAIRS.map((pair) => {
        const isDragging = dragging === pair.question
        const home = homePosition(pair.question)
        const pos = isDragging ? dragPos : home
        const placed = bins[pair.question] !== null
        return (
          <motion.g
            key={pair.question}
            animate={{ x: pos.x, y: pos.y }}
            transition={isDragging ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 24 }}
            style={{ cursor: placed ? 'default' : 'grab' }}
          >
            <rect x={-44} y={-22} width={88} height={44} rx={10} fill={placed ? '#bbf7d0' : 'white'} stroke={placed ? '#16a34a' : '#1f2937'} strokeWidth={2} />
            <text x={0} y={7} textAnchor="middle" fill="#1f2937" fontSize={18} fontWeight={800}
                  style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}>
              {pair.question}
            </text>
            {!placed && (
              <rect
                tabIndex={isCurrent ? 0 : -1}
                x={-50}
                y={-30}
                width={100}
                height={60}
                fill="transparent"
                onPointerDown={(e) => startDrag(pair.question, e)}
                className={TOUCH_TARGET_CLASS}
                style={{ cursor: 'grab' }}
                aria-label={`${pair.question}. Drag to its answer.`}
              />
            )}
          </motion.g>
        )
      })}

      {showSparkles && <SparkleBurst />}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// QUIZ SCENE — steps 3 (forward) and 4 (missing). Reused with a `mode` flag.

function QuizScene({
  stepIdx,
  questions,
  qIdx,
  correctCount,
  wrong,
  justAnswered,
  onAnswer,
  mode,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  questions: { question: string; answer: number; options: number[] }[]
  qIdx: number
  correctCount: number
  wrong: Set<number>
  justAnswered: number | null
  onAnswer: (opt: number) => void
  mode: 'forward' | 'missing'
  isCurrent: boolean
  showSparkles: boolean
}) {
  const total = questions.length
  const finished = correctCount >= total
  const q = finished ? questions[total - 1] : questions[qIdx]
  const showRevealed = justAnswered !== null || finished

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${W} 280`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full block touch-none select-none"
          role="img"
          aria-label="A multiplication question."
        >
          <defs>
            <linearGradient id={`quiz-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={280} fill={`url(#quiz-bg-${stepIdx})`} />

          {/* Question count */}
          <text x={W / 2} y={50} textAnchor="middle" fill="#7c2d12" fontSize={14} fontWeight={700}
                style={{ fontFamily: 'system-ui, sans-serif' }}>
            Question {Math.min(qIdx + 1, total)} of {total}
          </text>

          {/* Question — text reveals the answer in place when the user gets it right. */}
          <AnimatePresence mode="wait">
            <motion.text
              key={`q-${qIdx}-${showRevealed ? 'done' : 'open'}`}
              x={W / 2}
              y={150}
              textAnchor="middle"
              fill={showRevealed ? '#15803d' : '#1f2937'}
              fontSize={52}
              fontWeight={900}
              style={{ fontFamily: 'system-ui, sans-serif' }}
              initial={{ opacity: 0, y: 160, scale: showRevealed ? 0.92 : 1 }}
              animate={{ opacity: 1, y: 150, scale: 1 }}
              exit={{ opacity: 0, y: 140 }}
              transition={{ duration: 0.25 }}
            >
              {showRevealed ? `${q.question} = ${q.answer}` : `${q.question} ${mode === 'forward' ? '= ?' : ''}`}
            </motion.text>
          </AnimatePresence>

          {/* Pip indicator for progress through the quiz */}
          <g transform={`translate(${W / 2 - (total * 16) / 2 + 8}, 220)`}>
            {Array.from({ length: total }).map((_, i) => (
              <circle
                key={i}
                cx={i * 16}
                cy={0}
                r={5}
                fill={i < correctCount ? '#22c55e' : '#cbd5e1'}
                stroke={i < correctCount ? '#15803d' : '#94a3b8'}
                strokeWidth={1.5}
              />
            ))}
          </g>

          {showSparkles && <SparkleBurst />}
        </svg>
      </div>

      {/* Answer buttons */}
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
