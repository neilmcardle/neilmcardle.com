'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react'
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
type Polarity = 'NS' | 'SN'
type SceneType = 'pair' | 'sort' | 'predict' | 'distance'
type SortBin = 'tray' | 'magnetic' | 'nonmagnetic'

type SortItemConfig = {
  key: string
  label: string
  magnetic: boolean
  fill: string
  shape: 'paperclip' | 'key' | 'nail' | 'spoon' | 'wood' | 'eraser'
}

const SORT_ITEMS: SortItemConfig[] = [
  { key: 'paperclip', label: 'Paperclip', magnetic: true,  fill: '#94a3b8', shape: 'paperclip' },
  { key: 'key',       label: 'Key',       magnetic: true,  fill: '#fbbf24', shape: 'key' },
  { key: 'nail',      label: 'Nail',      magnetic: true,  fill: '#64748b', shape: 'nail' },
  { key: 'spoon',     label: 'Spoon',     magnetic: false, fill: '#e0e7ff', shape: 'spoon' },
  { key: 'wood',      label: 'Wood',      magnetic: false, fill: '#92400e', shape: 'wood' },
  { key: 'eraser',    label: 'Eraser',    magnetic: false, fill: '#fb7185', shape: 'eraser' },
]

type Step = {
  key: string
  scene: SceneType
  prompt: string
  hint: string
}

const STEPS: Step[] = [
  {
    key: 'attract',
    scene: 'pair',
    prompt: 'Drag the right magnet up to the left one.',
    hint: 'See what happens when they get close.',
  },
  {
    key: 'repel',
    scene: 'pair',
    prompt: 'Flip the right magnet, then try again.',
    hint: 'Tap the small arrow above the magnet to flip it.',
  },
  {
    key: 'sort',
    scene: 'sort',
    prompt: 'Sort the things magnets pull, and the things they don\'t.',
    hint: 'Drag each thing into the right box.',
  },
  {
    key: 'predict',
    scene: 'predict',
    prompt: 'These two magnets are about to meet. What will happen?',
    hint: 'Look at the letters facing each other.',
  },
  {
    key: 'distance',
    scene: 'distance',
    prompt: 'Move the magnet near the paperclip — without touching it.',
    hint: 'Magnets can pull things from a tiny way away.',
  },
]

const MAGNET_W = 130
const MAGNET_H = 44

function distance(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

// Which letter on each magnet faces the other? Used to decide attract vs repel.
function facingPoles(a: Magnet, b: Magnet): { aFace: 'N' | 'S'; bFace: 'N' | 'S' } {
  const aRightLetter = a.polarity[1] as 'N' | 'S'
  const aLeftLetter  = a.polarity[0] as 'N' | 'S'
  const bRightLetter = b.polarity[1] as 'N' | 'S'
  const bLeftLetter  = b.polarity[0] as 'N' | 'S'
  if (b.x >= a.x) return { aFace: aRightLetter, bFace: bLeftLetter }
  return { aFace: aLeftLetter, bFace: bRightLetter }
}

function isAttract(a: Magnet, b: Magnet): boolean {
  const { aFace, bFace } = facingPoles(a, b)
  return aFace !== bFace
}

type Magnet = { x: number; y: number; polarity: Polarity }

const STEP_INITIAL = {
  pair: {
    a: { x: 240, y: 230, polarity: 'NS' as Polarity },
    b: { x: 580, y: 230, polarity: 'NS' as Polarity },
  },
  pairRepel: {
    a: { x: 240, y: 230, polarity: 'NS' as Polarity },
    b: { x: 580, y: 230, polarity: 'SN' as Polarity },
  },
  predict: {
    a: { x: 260, y: 230, polarity: 'NS' as Polarity },
    b: { x: 540, y: 230, polarity: 'SN' as Polarity },
  },
  distance: {
    magnet: { x: 200, y: 230, polarity: 'NS' as Polarity },
    paperclip: { x: 540, y: 230 },
  },
}

export default function ForcesAndMagnetsTool({ onProgress }: ToolProps) {
  const startedAt = useRef<number>(Date.now())
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const completedRef = useRef<Set<number>>(new Set())
  const moduleCompletePlayed = useRef<boolean>(false)

  const [activeStep, setActiveStep] = useState(0)
  const [unlockedUpTo, setUnlockedUpTo] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [justCompleted, setJustCompleted] = useState<number | null>(null)

  // Pair scene shared state (steps 0 and 1).
  const [pairA, setPairA] = useState<Magnet>(STEP_INITIAL.pair.a)
  const [pairB, setPairB] = useState<Magnet>(STEP_INITIAL.pair.b)
  const [bWasFlipped, setBWasFlipped] = useState(false)

  // Sort scene state (step 2).
  const [bins, setBins] = useState<Record<string, SortBin>>(() =>
    Object.fromEntries(SORT_ITEMS.map((it) => [it.key, 'tray'])),
  )

  // Predict scene state (step 3).
  const [prediction, setPrediction] = useState<'attract' | 'repel' | null>(null)
  const [predictRevealed, setPredictRevealed] = useState(false)

  // Distance scene state (step 4).
  const [distMagnet, setDistMagnet] = useState<Pt>(STEP_INITIAL.distance.magnet)
  const [paperclipAttached, setPaperclipAttached] = useState(false)

  function markStepComplete(idx: number) {
    if (completedRef.current.has(idx)) return
    completedRef.current.add(idx)
    setCompletedSteps(Array.from(completedRef.current).sort((a, b) => a - b))
    if (idx + 1 > unlockedUpTo) setUnlockedUpTo(idx + 1)
  }

  // Step 0: Attract — magnets stuck.
  useEffect(() => {
    if (activeStep !== 0) return
    const dist = distance(pairA, pairB)
    if (dist < MAGNET_W + 10 && isAttract(pairA, pairB)) markStepComplete(0)
  }, [activeStep, pairA, pairB])

  // Step 1: Repel — user has flipped B AND magnets are now close (i.e., flipped to attract and brought together).
  useEffect(() => {
    if (activeStep !== 1) return
    if (!bWasFlipped) return
    const dist = distance(pairA, pairB)
    if (dist < MAGNET_W + 10 && isAttract(pairA, pairB)) markStepComplete(1)
  }, [activeStep, pairA, pairB, bWasFlipped])

  // Step 2: Sort — every item in its correct bin.
  useEffect(() => {
    if (activeStep !== 2) return
    const allCorrect = SORT_ITEMS.every((it) => {
      const b = bins[it.key]
      return (it.magnetic && b === 'magnetic') || (!it.magnetic && b === 'nonmagnetic')
    })
    if (allCorrect) markStepComplete(2)
  }, [activeStep, bins])

  // Step 3: Predict — answer is "repel" because the configured pair has like poles facing.
  useEffect(() => {
    if (activeStep !== 3) return
    if (prediction === 'repel') markStepComplete(3)
  }, [activeStep, prediction])

  // Step 3: wrong answer — let the magnet animation play out (which itself
  // shows the truth: child said "pull" but they pushed apart), then clear
  // the answer so the child can try again. Without this, both buttons lock
  // and the only way forward is the global Restart, which throws away all
  // prior progress.
  useEffect(() => {
    if (activeStep !== 3) return
    if (!predictRevealed) return
    if (prediction === 'repel') return
    const t = setTimeout(() => {
      setPrediction(null)
      setPredictRevealed(false)
    }, 1800)
    return () => clearTimeout(t)
  }, [activeStep, prediction, predictRevealed])

  // Step 4: Distance — paperclip has been attracted.
  useEffect(() => {
    if (activeStep !== 4) return
    if (paperclipAttached) markStepComplete(4)
  }, [activeStep, paperclipAttached])

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

  function jumpToStartFor(stepIndex: number) {
    if (stepIndex === 0) {
      setPairA({ ...STEP_INITIAL.pair.a })
      setPairB({ ...STEP_INITIAL.pair.b })
      setBWasFlipped(false)
    } else if (stepIndex === 1) {
      setPairA({ ...STEP_INITIAL.pairRepel.a })
      setPairB({ ...STEP_INITIAL.pairRepel.b })
      setBWasFlipped(false)
    } else if (stepIndex === 4) {
      setDistMagnet({ ...STEP_INITIAL.distance.magnet })
      setPaperclipAttached(false)
    }
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
    setPairA({ ...STEP_INITIAL.pair.a })
    setPairB({ ...STEP_INITIAL.pair.b })
    setBWasFlipped(false)
    setBins(Object.fromEntries(SORT_ITEMS.map((it) => [it.key, 'tray'])))
    setPrediction(null)
    setPredictRevealed(false)
    setDistMagnet({ ...STEP_INITIAL.distance.magnet })
    setPaperclipAttached(false)
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

              <div className="flex-1 min-h-0 rounded-3xl border border-slate-200 overflow-hidden shadow-sm bg-white">
                {step.scene === 'pair' && (
                  <PairScene
                    stepIdx={i}
                    a={pairA}
                    b={pairB}
                    onBChange={setPairB}
                    onFlipB={() => {
                      setPairB((m) => ({
                        ...m,
                        polarity: m.polarity === 'NS' ? 'SN' : 'NS',
                      }))
                      setBWasFlipped(true)
                    }}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'sort' && (
                  <SortScene
                    stepIdx={i}
                    bins={bins}
                    onPlace={(itemKey, target) =>
                      setBins((prev) => ({ ...prev, [itemKey]: target }))
                    }
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'predict' && (
                  <PredictScene
                    stepIdx={i}
                    prediction={prediction}
                    revealed={predictRevealed}
                    onAnswer={(p) => {
                      setPrediction(p)
                      setPredictRevealed(true)
                    }}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'distance' && (
                  <DistanceScene
                    stepIdx={i}
                    magnet={distMagnet}
                    onMagnetChange={setDistMagnet}
                    paperclipAttached={paperclipAttached}
                    onAttach={() => setPaperclipAttached(true)}
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
                <li>Magnets have two ends, called <strong>poles</strong>: N and S.</li>
                <li>Different poles pull together. The same poles push apart.</li>
                <li>Magnets only attract some materials — mostly iron and steel.</li>
                <li>Magnets can pull things from a tiny distance away — without touching.</li>
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
// Bar magnet visual + helpers, used by Pair, Predict, Distance scenes.

type BarMagnetProps = {
  magnet: Magnet
  idPrefix: string
  flippable?: boolean
  onFlip?: () => void
  draggable?: boolean
  onDragStart?: (e: React.PointerEvent<SVGElement>) => void
  isCurrent?: boolean
  width?: number
  height?: number
}

function BarMagnet({
  magnet,
  idPrefix,
  flippable,
  onFlip,
  draggable,
  onDragStart,
  isCurrent = true,
  width = MAGNET_W,
  height = MAGNET_H,
}: BarMagnetProps) {
  const w = width
  const h = height
  const leftLetter = magnet.polarity[0] as 'N' | 'S'
  const rightLetter = magnet.polarity[1] as 'N' | 'S'
  const leftFill = leftLetter === 'N' ? '#dc2626' : '#2563eb'
  const rightFill = rightLetter === 'N' ? '#dc2626' : '#2563eb'
  const clipId = `${idPrefix}-clip`

  return (
    <g transform={`translate(${magnet.x - w / 2}, ${magnet.y - h / 2})`}>
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={w} height={h} rx={12} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect x={0} y={0} width={w / 2} height={h} fill={leftFill} />
        <rect x={w / 2} y={0} width={w / 2} height={h} fill={rightFill} />
      </g>
      <rect x={0} y={0} width={w} height={h} rx={12} fill="none" stroke="#1f2937" strokeWidth={2} />
      <text
        x={w / 4}
        y={h / 2 + 7}
        textAnchor="middle"
        fill="white"
        fontSize={20}
        fontWeight={800}
        style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}
      >
        {leftLetter}
      </text>
      <text
        x={(3 * w) / 4}
        y={h / 2 + 7}
        textAnchor="middle"
        fill="white"
        fontSize={20}
        fontWeight={800}
        style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}
      >
        {rightLetter}
      </text>

      {flippable && onFlip && (
        <g transform={`translate(${w / 2}, ${-22})`}>
          <circle cx={0} cy={0} r={15} fill="white" stroke="#1f2937" strokeWidth={1.8} />
          <path
            d="M -6 -1 A 6 6 0 1 1 -1 -6"
            stroke="#1f2937"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <path d="M -2 -9 L 2 -6 L -1 -3 Z" fill="#1f2937" />
          <circle
            tabIndex={isCurrent ? 0 : -1}
            cx={0}
            cy={0}
            r={20}
            fill="transparent"
            onPointerDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onFlip()
            }}
            className={TOUCH_TARGET_CLASS}
            style={{ cursor: 'pointer' }}
            aria-label="Flip the magnet"
          />
        </g>
      )}

      {draggable && onDragStart && (
        <rect
          tabIndex={isCurrent ? 0 : -1}
          x={-10}
          y={-10}
          width={w + 20}
          height={h + 20}
          fill="transparent"
          onPointerDown={onDragStart}
          className={TOUCH_TARGET_CLASS}
          style={{ cursor: 'grab' }}
          aria-label="Magnet. Drag to move."
        />
      )}
    </g>
  )
}

function svgPointFromEvent(svg: SVGSVGElement | null, clientX: number, clientY: number): Pt {
  if (!svg) return { x: 0, y: 0 }
  const rect = svg.getBoundingClientRect()
  return {
    x: ((clientX - rect.left) / rect.width) * W,
    y: ((clientY - rect.top) / rect.height) * H,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PAIR SCENE — used by step 0 (Attract) and step 1 (Repel + Flip).

type PairSceneProps = {
  stepIdx: number
  a: Magnet
  b: Magnet
  onBChange: (next: Magnet | ((prev: Magnet) => Magnet)) => void
  onFlipB: () => void
  isCurrent: boolean
  showSparkles: boolean
}

function PairScene({ stepIdx, a, b, onBChange, onFlipB, isCurrent, showSparkles }: PairSceneProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragOffset = useRef<Pt>({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  function startDrag(e: React.PointerEvent<SVGElement>) {
    e.preventDefault()
    const p = svgPointFromEvent(svgRef.current, e.clientX, e.clientY)
    dragOffset.current = { x: p.x - b.x, y: p.y - b.y }
    setDragging(true)
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
  }

  function moveDrag(e: React.PointerEvent<SVGElement>) {
    if (!dragging) return
    const p = svgPointFromEvent(svgRef.current, e.clientX, e.clientY)
    const proposed: Magnet = {
      ...b,
      x: clamp(p.x - dragOffset.current.x, MAGNET_W / 2 + 10, W - MAGNET_W / 2 - 10),
      y: clamp(p.y - dragOffset.current.y, MAGNET_H / 2 + 30, H - MAGNET_H / 2 - 10),
    }

    const dist = distance(a, proposed)
    const attract = isAttract(a, proposed)
    const minSeparation = MAGNET_W + 6
    const snapWithin = MAGNET_W + 22

    if (!attract && dist < minSeparation + 60) {
      // Repel: push back to maintain a "force-field" min separation.
      const dx = proposed.x - a.x
      const dy = proposed.y - a.y
      const norm = Math.max(0.0001, Math.hypot(dx, dy))
      const target = minSeparation + 60
      onBChange({
        ...proposed,
        x: a.x + (dx / norm) * target,
        y: a.y + (dy / norm) * target,
      })
      return
    }

    if (attract && dist < snapWithin) {
      // Snap to touching position when close.
      const dx = proposed.x - a.x
      const dy = proposed.y - a.y
      const norm = Math.max(0.0001, Math.hypot(dx, dy))
      onBChange({
        ...proposed,
        x: a.x + (dx / norm) * minSeparation,
        y: a.y + (dy / norm) * minSeparation,
      })
      return
    }

    onBChange(proposed)
  }

  function endDrag(e: React.PointerEvent<SVGElement>) {
    setDragging(false)
    ;(e.currentTarget as Element).releasePointerCapture?.(e.pointerId)
  }

  const attract = isAttract(a, b)
  const dist = distance(a, b)
  const closeEnoughForFieldHint = dist < 240

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
      aria-label="Two magnets. Drag the right one to feel attract or repel."
    >
      <defs>
        <linearGradient id={`pair-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#pair-bg-${stepIdx})`} />
      <line x1={40} y1={H - 30} x2={W - 40} y2={H - 30} stroke="#cbd5e1" strokeWidth={2} />

      {closeEnoughForFieldHint && (
        <motion.g
          key={attract ? 'attract' : 'repel'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 0.2 }}
        >
          {[0, 1, 2].map((k) => {
            const baseR = MAGNET_W / 2 + 18 + k * 14
            return (
              <ellipse
                key={k}
                cx={(a.x + b.x) / 2}
                cy={a.y}
                rx={Math.max(60, dist / 2 + baseR)}
                ry={MAGNET_H / 2 + 8 + k * 4}
                fill="none"
                stroke={attract ? '#22c55e' : '#ef4444'}
                strokeWidth={1.5}
                strokeDasharray="4 6"
                opacity={1 - k * 0.25}
              />
            )
          })}
        </motion.g>
      )}

      <BarMagnet magnet={a} idPrefix={`pair-a-${stepIdx}`} />
      <BarMagnet
        magnet={b}
        idPrefix={`pair-b-${stepIdx}`}
        draggable
        onDragStart={startDrag}
        flippable={stepIdx === 1}
        onFlip={onFlipB}
        isCurrent={isCurrent}
      />

      {showSparkles && <SparkleBurst />}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SORT SCENE — step 2.

const SORT_TRAY_Y = 90
const SORT_BIN_TOP = 250
const SORT_BIN_HEIGHT = 200

const SORT_BIN_LAYOUT: Record<Exclude<SortBin, 'tray'>, { x: number; w: number; label: string }> = {
  magnetic:    { x: 60,  w: 320, label: 'Magnetic' },
  nonmagnetic: { x: 420, w: 320, label: 'Not magnetic' },
}

function SortScene({
  stepIdx,
  bins,
  onPlace,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  bins: Record<string, SortBin>
  onPlace: (itemKey: string, target: SortBin) => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragPos, setDragPos] = useState<Pt>({ x: 0, y: 0 })

  // Compute home position for an item based on its current bin and index in that bin.
  function homePosition(itemKey: string): Pt {
    const bin = bins[itemKey]
    if (bin === 'tray') {
      const trayItems = SORT_ITEMS.filter((it) => bins[it.key] === 'tray')
      const idx = trayItems.findIndex((it) => it.key === itemKey)
      const trayWidth = W - 120
      const slotW = trayWidth / Math.max(trayItems.length, 1)
      return { x: 60 + slotW * idx + slotW / 2, y: SORT_TRAY_Y }
    }
    const layout = SORT_BIN_LAYOUT[bin]
    const inBin = SORT_ITEMS.filter((it) => bins[it.key] === bin)
    const idx = inBin.findIndex((it) => it.key === itemKey)
    const slotW = layout.w / Math.max(inBin.length, 1)
    return { x: layout.x + slotW * idx + slotW / 2, y: SORT_BIN_TOP + 60 }
  }

  function startDrag(itemKey: string, e: React.PointerEvent<SVGElement>) {
    e.preventDefault()
    setDragging(itemKey)
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
      const item = SORT_ITEMS.find((it) => it.key === dragging)
      if (item) {
        const correct = (item.magnetic && target === 'magnetic') || (!item.magnetic && target === 'nonmagnetic')
        if (correct) {
          onPlace(dragging, target)
        }
        // Wrong drop: do nothing — the item snaps back to its previous home.
      }
    }
    setDragging(null)
    ;(e.currentTarget as Element).releasePointerCapture?.(e.pointerId)
  }

  function binAtPoint(p: Pt): Exclude<SortBin, 'tray'> | null {
    if (p.y < SORT_BIN_TOP) return null
    if (p.y > SORT_BIN_TOP + SORT_BIN_HEIGHT) return null
    if (p.x >= SORT_BIN_LAYOUT.magnetic.x && p.x <= SORT_BIN_LAYOUT.magnetic.x + SORT_BIN_LAYOUT.magnetic.w) return 'magnetic'
    if (p.x >= SORT_BIN_LAYOUT.nonmagnetic.x && p.x <= SORT_BIN_LAYOUT.nonmagnetic.x + SORT_BIN_LAYOUT.nonmagnetic.w) return 'nonmagnetic'
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
      aria-label="Drag each item into the correct box."
    >
      <defs>
        <linearGradient id={`sort-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#sort-bg-${stepIdx})`} />

      {/* Tray label */}
      <text x={W / 2} y={32} textAnchor="middle" fill="#64748b" fontSize={14} fontWeight={700}
            style={{ fontFamily: 'system-ui, sans-serif' }}>
        Pick up an item
      </text>

      {/* Bins */}
      {(Object.keys(SORT_BIN_LAYOUT) as Array<Exclude<SortBin, 'tray'>>).map((binKey) => {
        const layout = SORT_BIN_LAYOUT[binKey]
        const isMagnetic = binKey === 'magnetic'
        const fill = isMagnetic ? '#dbeafe' : '#fef3c7'
        const stroke = isMagnetic ? '#3b82f6' : '#f59e0b'
        return (
          <g key={binKey}>
            <rect
              x={layout.x}
              y={SORT_BIN_TOP}
              width={layout.w}
              height={SORT_BIN_HEIGHT}
              rx={20}
              fill={fill}
              stroke={stroke}
              strokeWidth={2}
              strokeDasharray="6 6"
            />
            <text
              x={layout.x + layout.w / 2}
              y={SORT_BIN_TOP + 30}
              textAnchor="middle"
              fill="#1f2937"
              fontSize={20}
              fontWeight={800}
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              {layout.label}
            </text>
          </g>
        )
      })}

      {/* Items */}
      {SORT_ITEMS.map((item) => {
        const isDragging = dragging === item.key
        const home = homePosition(item.key)
        const pos = isDragging ? dragPos : home
        return (
          <motion.g
            key={item.key}
            animate={{ x: pos.x, y: pos.y }}
            transition={isDragging ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 24 }}
            style={{ cursor: 'grab' }}
          >
            <SortItemGraphic item={item} />
            <text
              y={48}
              textAnchor="middle"
              fill="#1f2937"
              fontSize={12}
              fontWeight={600}
              style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}
            >
              {item.label}
            </text>
            <rect
              tabIndex={isCurrent ? 0 : -1}
              x={-40}
              y={-40}
              width={80}
              height={90}
              fill="transparent"
              onPointerDown={(e) => startDrag(item.key, e)}
              className={TOUCH_TARGET_CLASS}
              style={{ cursor: 'grab' }}
              aria-label={`${item.label}. Drag into the right box.`}
            />
          </motion.g>
        )
      })}

      {showSparkles && <SparkleBurst />}
    </svg>
  )
}

function SortItemGraphic({ item }: { item: SortItemConfig }) {
  switch (item.shape) {
    case 'paperclip':
      return (
        <g>
          <path
            d="M -16 -16 L 14 -16 A 8 8 0 0 1 14 0 L -10 0 A 6 6 0 0 0 -10 12 L 12 12"
            stroke={item.fill}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )
    case 'key':
      return (
        <g>
          <circle cx={-12} cy={0} r={11} fill={item.fill} stroke="#1f2937" strokeWidth={2} />
          <circle cx={-12} cy={0} r={4} fill="white" />
          <rect x={-2} y={-4} width={28} height={8} fill={item.fill} stroke="#1f2937" strokeWidth={2} />
          <rect x={18} y={-7} width={4} height={5} fill={item.fill} />
          <rect x={11} y={-7} width={4} height={5} fill={item.fill} />
        </g>
      )
    case 'nail':
      return (
        <g>
          <ellipse cx={0} cy={-12} rx={11} ry={5} fill={item.fill} stroke="#1f2937" strokeWidth={1.5} />
          <path d="M -3 -10 L 3 -10 L 1 16 L -1 16 Z" fill={item.fill} stroke="#1f2937" strokeWidth={1.5} />
        </g>
      )
    case 'spoon':
      return (
        <g>
          <ellipse cx={0} cy={-10} rx={10} ry={12} fill={item.fill} stroke="#1f2937" strokeWidth={1.5} />
          <rect x={-2.5} y={2} width={5} height={20} fill={item.fill} stroke="#1f2937" strokeWidth={1.5} rx={2} />
        </g>
      )
    case 'wood':
      return (
        <g>
          <rect x={-18} y={-12} width={36} height={24} fill={item.fill} stroke="#1f2937" strokeWidth={1.5} rx={3} />
          <line x1={-14} y1={-6} x2={14} y2={-6} stroke="#451a03" strokeWidth={1.2} opacity={0.6} />
          <line x1={-14} y1={2} x2={14} y2={2} stroke="#451a03" strokeWidth={1.2} opacity={0.6} />
          <line x1={-14} y1={8} x2={14} y2={8} stroke="#451a03" strokeWidth={1.2} opacity={0.6} />
        </g>
      )
    case 'eraser':
      return (
        <g>
          <rect x={-16} y={-10} width={32} height={20} fill={item.fill} stroke="#1f2937" strokeWidth={1.5} rx={3} />
          <rect x={-16} y={-10} width={32} height={6} fill="white" opacity={0.4} rx={3} />
        </g>
      )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PREDICT SCENE — step 3.

function PredictScene({
  stepIdx,
  prediction,
  revealed,
  onAnswer,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  prediction: 'attract' | 'repel' | null
  revealed: boolean
  onAnswer: (p: 'attract' | 'repel') => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const cfg = STEP_INITIAL.predict
  const aMagnet = cfg.a
  const bMagnet = cfg.b
  const correctAnswer: 'attract' | 'repel' = isAttract(aMagnet, bMagnet) ? 'attract' : 'repel'

  // After answer, animate magnets toward each other (attract: stick; repel: bounce).
  const [animMagnetB, setAnimMagnetB] = useState<Magnet>(bMagnet)
  useEffect(() => {
    if (!revealed) {
      setAnimMagnetB(bMagnet)
      return
    }
    if (correctAnswer === 'attract') {
      const t = setTimeout(() => {
        setAnimMagnetB({ ...bMagnet, x: aMagnet.x + MAGNET_W })
      }, 200)
      return () => clearTimeout(t)
    }
    // Repel: push them apart.
    const t = setTimeout(() => {
      setAnimMagnetB({ ...bMagnet, x: bMagnet.x + 80 })
    }, 200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${W} ${H - 80}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full block touch-none select-none"
          role="img"
          aria-label="Two magnets in a fixed orientation."
        >
          <defs>
            <linearGradient id={`predict-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={H - 80} fill={`url(#predict-bg-${stepIdx})`} />

          <BarMagnet magnet={aMagnet} idPrefix={`predict-a-${stepIdx}`} />
          <motion.g
            animate={{ x: animMagnetB.x - bMagnet.x }}
            transition={{ type: 'spring', stiffness: 140, damping: 14 }}
          >
            <BarMagnet magnet={bMagnet} idPrefix={`predict-b-${stepIdx}`} />
          </motion.g>

          {showSparkles && <SparkleBurst />}
        </svg>
      </div>
      <div className="shrink-0 bg-white border-t border-slate-200 px-4 py-3">
        <AnimatePresence>
          {revealed && prediction !== null && prediction !== correctAnswer && (
            <motion.p
              key="predict-retry-hint"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center font-ka-body text-sm font-semibold text-rose-600 mb-2"
            >
              Not quite. Look at the letters again.
            </motion.p>
          )}
        </AnimatePresence>
        <div className="flex items-center justify-center gap-3">
          <PredictButton
            label="Pull together"
            isCorrect={correctAnswer === 'attract'}
            chosen={prediction === 'attract'}
            revealed={revealed}
            disabled={revealed && prediction !== null}
            onClick={() => onAnswer('attract')}
            isCurrent={isCurrent}
          />
          <PredictButton
            label="Push apart"
            isCorrect={correctAnswer === 'repel'}
            chosen={prediction === 'repel'}
            revealed={revealed}
            disabled={revealed && prediction !== null}
            onClick={() => onAnswer('repel')}
            isCurrent={isCurrent}
          />
        </div>
      </div>
    </div>
  )
}

function PredictButton({
  label,
  isCorrect,
  chosen,
  revealed,
  disabled,
  onClick,
  isCurrent,
}: {
  label: string
  isCorrect: boolean
  chosen: boolean
  revealed: boolean
  disabled: boolean
  onClick: () => void
  isCurrent: boolean
}) {
  let bg = 'bg-white border-slate-300 text-slate-800 hover:border-ka-brand-500'
  if (revealed && chosen && isCorrect) bg = 'bg-ka-year3 border-ka-year3 text-white'
  else if (revealed && chosen && !isCorrect) bg = 'bg-ka-year6 border-ka-year6 text-white'
  else if (revealed && isCorrect) bg = 'bg-ka-year3-light border-ka-year3 text-green-900'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !isCurrent}
      tabIndex={isCurrent ? 0 : -1}
      className={`inline-flex items-center justify-center h-ka-touch px-5 rounded-full border-2 font-ka-display font-bold text-sm transition focus-visible:outline-2 focus-visible:outline-ka-brand-500 ${bg} ${
        disabled ? 'cursor-default' : 'cursor-pointer'
      }`}
    >
      {label}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DISTANCE SCENE — step 4.

const DIST_PAPERCLIP_HOME: Pt = STEP_INITIAL.distance.paperclip
const DIST_ATTRACT_THRESHOLD = MAGNET_W / 2 + 80

function DistanceScene({
  stepIdx,
  magnet,
  onMagnetChange,
  paperclipAttached,
  onAttach,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  magnet: Pt
  onMagnetChange: (next: Pt | ((prev: Pt) => Pt)) => void
  paperclipAttached: boolean
  onAttach: () => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef<Pt>({ x: 0, y: 0 })

  function startDrag(e: React.PointerEvent<SVGElement>) {
    e.preventDefault()
    const p = svgPointFromEvent(svgRef.current, e.clientX, e.clientY)
    dragOffset.current = { x: p.x - magnet.x, y: p.y - magnet.y }
    setDragging(true)
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
  }

  function moveDrag(e: React.PointerEvent<SVGElement>) {
    if (!dragging) return
    const p = svgPointFromEvent(svgRef.current, e.clientX, e.clientY)
    onMagnetChange(() => ({
      x: clamp(p.x - dragOffset.current.x, MAGNET_W / 2 + 10, W - MAGNET_W / 2 - 10),
      y: clamp(p.y - dragOffset.current.y, MAGNET_H / 2 + 30, H - MAGNET_H / 2 - 10),
    }))
  }

  function endDrag(e: React.PointerEvent<SVGElement>) {
    setDragging(false)
    ;(e.currentTarget as Element).releasePointerCapture?.(e.pointerId)
  }

  // When the magnet gets close to the paperclip's home, it jumps to the magnet.
  useEffect(() => {
    if (paperclipAttached) return
    const dist = distance(magnet, DIST_PAPERCLIP_HOME)
    if (dist < DIST_ATTRACT_THRESHOLD) onAttach()
  }, [magnet, paperclipAttached, onAttach])

  // Paperclip position: at home until attracted, then attached to the magnet's
  // right pole (so the user sees it physically jump across the gap).
  const paperclipPos: Pt = paperclipAttached
    ? { x: magnet.x + MAGNET_W / 2 + 14, y: magnet.y }
    : DIST_PAPERCLIP_HOME

  const distLine = distance(magnet, paperclipPos)
  const showPullHint = !paperclipAttached && distLine < DIST_ATTRACT_THRESHOLD + 40

  const magnetMagnet: Magnet = { x: magnet.x, y: magnet.y, polarity: 'NS' }

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
      aria-label="A magnet and a paperclip on a table."
    >
      <defs>
        <linearGradient id={`dist-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#dist-bg-${stepIdx})`} />
      <line x1={40} y1={H - 30} x2={W - 40} y2={H - 30} stroke="#cbd5e1" strokeWidth={2} />

      {showPullHint && (
        <motion.line
          x1={magnet.x + MAGNET_W / 2}
          y1={magnet.y}
          x2={paperclipPos.x - 16}
          y2={paperclipPos.y}
          stroke="#22c55e"
          strokeWidth={2}
          strokeDasharray="4 6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
        />
      )}

      <motion.g
        animate={{ x: paperclipPos.x, y: paperclipPos.y }}
        transition={paperclipAttached ? { type: 'spring', stiffness: 320, damping: 20 } : { duration: 0 }}
      >
        <Paperclip />
      </motion.g>

      <BarMagnet
        magnet={magnetMagnet}
        idPrefix={`dist-${stepIdx}`}
        draggable
        onDragStart={startDrag}
        isCurrent={isCurrent}
      />

      {showSparkles && <SparkleBurst />}
    </svg>
  )
}

function Paperclip() {
  return (
    <g>
      <path
        d="M -20 -18 L 16 -18 A 9 9 0 0 1 16 0 L -12 0 A 7 7 0 0 0 -12 14 L 14 14"
        stroke="#94a3b8"
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}
