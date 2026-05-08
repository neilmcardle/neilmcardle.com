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
type SceneType = 'parts' | 'needs' | 'water' | 'pollinate' | 'seeds'

type PlantPart = 'roots' | 'stem' | 'leaves' | 'flower'
type NeedKey = 'water' | 'sun' | 'soil' | 'candy' | 'snow' | 'music'
type SeedKey = 'dandelion' | 'burr' | 'coconut'
type DispersalKey = 'wind' | 'animal' | 'water'

type Step = { key: string; scene: SceneType; prompt: string; hint: string }

const STEPS: Step[] = [
  { key: 'parts',     scene: 'parts',     prompt: 'Tap each part of the plant.',          hint: 'Every part does an important job.' },
  { key: 'needs',     scene: 'needs',     prompt: 'Tap the things a plant needs to grow.', hint: 'Some things help. Some don\'t.' },
  { key: 'water',     scene: 'water',     prompt: 'Tip the watering can to water the plant.', hint: 'Watch the water travel up to the leaves.' },
  { key: 'pollinate', scene: 'pollinate', prompt: 'Help the bee carry pollen to the other flower.', hint: 'Drag the bee. When pollen moves between flowers, they can make seeds.' },
  { key: 'seeds',     scene: 'seeds',     prompt: 'Match each seed to how it travels.',   hint: 'Wind, water, or animals?' },
]

const PLANT_PARTS: Record<PlantPart, { label: string; description: string }> = {
  roots:  { label: 'Roots',  description: 'Hold the plant in the ground and drink up water and food from the soil.' },
  stem:   { label: 'Stem',   description: 'Holds the plant up. Carries water from the roots to the leaves.' },
  leaves: { label: 'Leaves', description: 'Catch sunlight. Plants use sunlight to make their food.' },
  flower: { label: 'Flower', description: 'Where the seeds are made. Flowers attract bees and butterflies.' },
}

const NEED_OPTIONS: Array<{ key: NeedKey; label: string; good: boolean; emoji: string }> = [
  { key: 'water', label: 'Water',       good: true,  emoji: '💧' },
  { key: 'sun',   label: 'Sunlight',    good: true,  emoji: '☀️' },
  { key: 'soil',  label: 'Soil',        good: true,  emoji: '🌱' },
  { key: 'candy', label: 'Candy',       good: false, emoji: '🍭' },
  { key: 'snow',  label: 'Snow',        good: false, emoji: '❄️' },
  { key: 'music', label: 'Music',       good: false, emoji: '🎵' },
]

const SEEDS: Record<SeedKey, { label: string; method: DispersalKey }> = {
  dandelion: { label: 'Dandelion', method: 'wind' },
  burr:      { label: 'Sticky burr', method: 'animal' },
  coconut:   { label: 'Coconut',  method: 'water' },
}

const DISPERSAL_LABEL: Record<DispersalKey, string> = {
  wind:   'Wind',
  animal: 'Animal',
  water:  'Water',
}

function svgPointFromEvent(svg: SVGSVGElement | null, clientX: number, clientY: number): Pt {
  if (!svg) return { x: 0, y: 0 }
  const rect = svg.getBoundingClientRect()
  return {
    x: ((clientX - rect.left) / rect.width) * W,
    y: ((clientY - rect.top) / rect.height) * H,
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

export default function PlantsTool({ onProgress }: ToolProps) {
  const startedAt = useRef<number>(Date.now())
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const completedRef = useRef<Set<number>>(new Set())
  const moduleCompletePlayed = useRef<boolean>(false)

  const [activeStep, setActiveStep] = useState(0)
  const [unlockedUpTo, setUnlockedUpTo] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [justCompleted, setJustCompleted] = useState<number | null>(null)

  // Step 0: parts.
  const [tappedParts, setTappedParts] = useState<Set<PlantPart>>(new Set())
  const [activePart, setActivePart] = useState<PlantPart | null>(null)

  // Step 1: needs.
  const [chosenNeeds, setChosenNeeds] = useState<Set<NeedKey>>(new Set())
  const [rejectedNeeds, setRejectedNeeds] = useState<Set<NeedKey>>(new Set())

  // Step 2: water travel.
  const [waterPlayed, setWaterPlayed] = useState(false)
  const [wateringNow, setWateringNow] = useState(false)

  // Step 3: pollination.
  const [beeAtFlowerB, setBeeAtFlowerB] = useState(false)
  const [bee, setBee] = useState<Pt>({ x: 220, y: 200 })
  const [beeDragging, setBeeDragging] = useState(false)

  // Step 4: seed dispersal.
  const [seedBins, setSeedBins] = useState<Record<SeedKey, DispersalKey | 'tray'>>({
    dandelion: 'tray', burr: 'tray', coconut: 'tray',
  })

  function markStepComplete(idx: number) {
    if (completedRef.current.has(idx)) return
    completedRef.current.add(idx)
    setCompletedSteps(Array.from(completedRef.current).sort((a, b) => a - b))
    if (idx + 1 > unlockedUpTo) setUnlockedUpTo(idx + 1)
  }

  // Step 0 test: all 4 parts tapped.
  useEffect(() => {
    if (activeStep !== 0) return
    if (tappedParts.size >= 4) markStepComplete(0)
  }, [activeStep, tappedParts])

  // Step 1 test: all 3 good needs chosen.
  useEffect(() => {
    if (activeStep !== 1) return
    const goodCount = NEED_OPTIONS.filter((n) => n.good && chosenNeeds.has(n.key)).length
    if (goodCount >= 3) markStepComplete(1)
  }, [activeStep, chosenNeeds])

  // Step 2 test: water animation has run.
  useEffect(() => {
    if (activeStep !== 2) return
    if (waterPlayed) markStepComplete(2)
  }, [activeStep, waterPlayed])

  // Step 3 test: bee has reached flower B.
  useEffect(() => {
    if (activeStep !== 3) return
    if (beeAtFlowerB) markStepComplete(3)
  }, [activeStep, beeAtFlowerB])

  // Step 4 test: all seeds correctly placed.
  useEffect(() => {
    if (activeStep !== 4) return
    const allCorrect = (Object.keys(SEEDS) as SeedKey[]).every((sk) => seedBins[sk] === SEEDS[sk].method)
    if (allCorrect) markStepComplete(4)
  }, [activeStep, seedBins])

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
    setTappedParts(new Set())
    setActivePart(null)
    setChosenNeeds(new Set())
    setRejectedNeeds(new Set())
    setWaterPlayed(false)
    setWateringNow(false)
    setBeeAtFlowerB(false)
    setBee({ x: 220, y: 200 })
    setBeeDragging(false)
    setSeedBins({ dandelion: 'tray', burr: 'tray', coconut: 'tray' })
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
                {step.scene === 'parts' && (
                  <PartsScene
                    stepIdx={i}
                    tapped={tappedParts}
                    activePart={activePart}
                    onTap={(part) => {
                      setTappedParts((s) => new Set(s).add(part))
                      setActivePart(part)
                    }}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'needs' && (
                  <NeedsScene
                    stepIdx={i}
                    chosen={chosenNeeds}
                    rejected={rejectedNeeds}
                    onTap={(need) => {
                      const cfg = NEED_OPTIONS.find((n) => n.key === need)
                      if (!cfg) return
                      if (cfg.good) {
                        setChosenNeeds((s) => new Set(s).add(need))
                      } else {
                        setRejectedNeeds((s) => new Set(s).add(need))
                        setTimeout(() => {
                          setRejectedNeeds((s) => {
                            const next = new Set(s)
                            next.delete(need)
                            return next
                          })
                        }, 700)
                      }
                    }}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'water' && (
                  <WaterScene
                    stepIdx={i}
                    wateringNow={wateringNow}
                    onWater={() => {
                      if (wateringNow) return
                      setWateringNow(true)
                      setTimeout(() => {
                        setWateringNow(false)
                        setWaterPlayed(true)
                      }, 2400)
                    }}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'pollinate' && (
                  <PollinateScene
                    stepIdx={i}
                    bee={bee}
                    setBee={setBee}
                    beeDragging={beeDragging}
                    setBeeDragging={setBeeDragging}
                    beeAtFlowerB={beeAtFlowerB}
                    setBeeAtFlowerB={setBeeAtFlowerB}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'seeds' && (
                  <SeedsScene
                    stepIdx={i}
                    bins={seedBins}
                    onPlace={(sk, target) => setSeedBins((b) => ({ ...b, [sk]: target }))}
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
                <li>A flowering plant has roots, a stem, leaves, and flowers — each with a job.</li>
                <li>Plants need water, sunlight, and soil to grow.</li>
                <li>Water travels up from the roots, through the stem, into the leaves.</li>
                <li>Bees move pollen between flowers, which helps plants make seeds.</li>
                <li>Seeds spread by wind, water, or hitching a ride on animals.</li>
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
// Plant diagram — used by Parts (step 0) and Water (step 2).

const PLANT_GROUND_Y = 250
const PLANT_X = 400

function PlantDiagram({
  highlighted,
  growth = 1,
}: {
  highlighted?: PlantPart | null
  growth?: number
}) {
  // growth: 0 = sad/dead, 1 = full
  const stemTop = PLANT_GROUND_Y - 60 - 80 * growth
  const flowerY = stemTop - 18
  const stemColor = growth < 0.4 ? '#a16207' : '#16a34a'
  const leafFill = growth < 0.4 ? '#a3a3a3' : '#22c55e'
  const flowerScale = growth
  const showFlower = growth > 0.5

  return (
    <g>
      {/* Soil */}
      <rect x={PLANT_X - 200} y={PLANT_GROUND_Y} width={400} height={150} fill="#92400e" rx={8} />
      <rect x={PLANT_X - 200} y={PLANT_GROUND_Y} width={400} height={6} fill="#65a30d" />

      {/* Roots */}
      <g
        opacity={highlighted && highlighted !== 'roots' ? 0.55 : 1}
        style={{ transition: 'opacity 200ms' }}
      >
        <path d={`M ${PLANT_X} ${PLANT_GROUND_Y} Q ${PLANT_X - 28} ${PLANT_GROUND_Y + 30} ${PLANT_X - 56} ${PLANT_GROUND_Y + 60}`} stroke="#451a03" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <path d={`M ${PLANT_X} ${PLANT_GROUND_Y} L ${PLANT_X} ${PLANT_GROUND_Y + 70}`} stroke="#451a03" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <path d={`M ${PLANT_X} ${PLANT_GROUND_Y} Q ${PLANT_X + 28} ${PLANT_GROUND_Y + 30} ${PLANT_X + 56} ${PLANT_GROUND_Y + 60}`} stroke="#451a03" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <path d={`M ${PLANT_X - 14} ${PLANT_GROUND_Y + 6} Q ${PLANT_X - 30} ${PLANT_GROUND_Y + 50} ${PLANT_X - 36} ${PLANT_GROUND_Y + 90}`} stroke="#451a03" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <path d={`M ${PLANT_X + 14} ${PLANT_GROUND_Y + 6} Q ${PLANT_X + 30} ${PLANT_GROUND_Y + 50} ${PLANT_X + 36} ${PLANT_GROUND_Y + 90}`} stroke="#451a03" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        {highlighted === 'roots' && (
          <ellipse cx={PLANT_X} cy={PLANT_GROUND_Y + 60} rx={70} ry={45} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeDasharray="6 6" opacity={0.9} />
        )}
      </g>

      {/* Stem */}
      <g
        opacity={highlighted && highlighted !== 'stem' ? 0.55 : 1}
        style={{ transition: 'opacity 200ms' }}
      >
        <line x1={PLANT_X} y1={PLANT_GROUND_Y} x2={PLANT_X} y2={stemTop} stroke={stemColor} strokeWidth={5} strokeLinecap="round" />
        {highlighted === 'stem' && (
          <rect x={PLANT_X - 14} y={stemTop} width={28} height={PLANT_GROUND_Y - stemTop} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeDasharray="6 6" opacity={0.9} rx={6} />
        )}
      </g>

      {/* Leaves */}
      {growth > 0.2 && (
        <g
          opacity={highlighted && highlighted !== 'leaves' ? 0.55 : 1}
          style={{ transition: 'opacity 200ms' }}
        >
          <ellipse cx={PLANT_X - 28} cy={stemTop + 36} rx={26} ry={10} fill={leafFill} stroke="#15803d" strokeWidth={1.5} transform={`rotate(-25 ${PLANT_X - 28} ${stemTop + 36})`} />
          <ellipse cx={PLANT_X + 28} cy={stemTop + 18} rx={26} ry={10} fill={leafFill} stroke="#15803d" strokeWidth={1.5} transform={`rotate(25 ${PLANT_X + 28} ${stemTop + 18})`} />
          {highlighted === 'leaves' && (
            <ellipse cx={PLANT_X} cy={stemTop + 28} rx={70} ry={32} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeDasharray="6 6" opacity={0.9} />
          )}
        </g>
      )}

      {/* Flower */}
      {showFlower && (
        <g
          transform={`translate(${PLANT_X}, ${flowerY}) scale(${flowerScale})`}
          opacity={highlighted && highlighted !== 'flower' ? 0.55 : 1}
          style={{ transition: 'opacity 200ms' }}
        >
          {[0, 1, 2, 3, 4].map((k) => {
            const a = (k / 5) * Math.PI * 2 - Math.PI / 2
            const x = Math.cos(a) * 14
            const y = Math.sin(a) * 14
            return <circle key={k} cx={x} cy={y} r={11} fill="#f9a8d4" stroke="#db2777" strokeWidth={1.5} />
          })}
          <circle cx={0} cy={0} r={7} fill="#fbbf24" stroke="#d97706" strokeWidth={1.5} />
          {highlighted === 'flower' && (
            <circle cx={0} cy={0} r={32} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeDasharray="6 6" opacity={0.9} />
          )}
        </g>
      )}
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTS SCENE — step 0.

function PartsScene({
  stepIdx,
  tapped,
  activePart,
  onTap,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  tapped: Set<PlantPart>
  activePart: PlantPart | null
  onTap: (p: PlantPart) => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const active = activePart ? PLANT_PARTS[activePart] : null

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block touch-none select-none"
      role="img"
      aria-label="A flowering plant. Tap each part to learn what it does."
    >
      <defs>
        <linearGradient id={`parts-sky-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#parts-sky-${stepIdx})`} />

      <PlantDiagram highlighted={activePart} growth={1} />

      {/* Tap targets — large invisible regions over each part. */}
      <g>
        {/* Roots */}
        <rect tabIndex={isCurrent ? 0 : -1} x={PLANT_X - 80} y={PLANT_GROUND_Y} width={160} height={110} fill="transparent" onPointerDown={(e) => { e.preventDefault(); onTap('roots') }} className={TOUCH_TARGET_CLASS} aria-label="Roots" />
        {/* Stem */}
        <rect tabIndex={isCurrent ? 0 : -1} x={PLANT_X - 16} y={PLANT_GROUND_Y - 70} width={32} height={70} fill="transparent" onPointerDown={(e) => { e.preventDefault(); onTap('stem') }} className={TOUCH_TARGET_CLASS} aria-label="Stem" />
        {/* Leaves */}
        <rect tabIndex={isCurrent ? 0 : -1} x={PLANT_X - 80} y={PLANT_GROUND_Y - 90} width={160} height={50} fill="transparent" onPointerDown={(e) => { e.preventDefault(); onTap('leaves') }} className={TOUCH_TARGET_CLASS} aria-label="Leaves" />
        {/* Flower */}
        <rect tabIndex={isCurrent ? 0 : -1} x={PLANT_X - 40} y={PLANT_GROUND_Y - 160} width={80} height={70} fill="transparent" onPointerDown={(e) => { e.preventDefault(); onTap('flower') }} className={TOUCH_TARGET_CLASS} aria-label="Flower" />
      </g>

      {/* Tapped checkmarks */}
      {(['roots', 'stem', 'leaves', 'flower'] as PlantPart[]).map((p) => {
        if (!tapped.has(p)) return null
        const labelPositions: Record<PlantPart, Pt> = {
          roots:  { x: PLANT_X - 110, y: PLANT_GROUND_Y + 50 },
          stem:   { x: PLANT_X + 36, y: PLANT_GROUND_Y - 30 },
          leaves: { x: PLANT_X + 78, y: PLANT_GROUND_Y - 70 },
          flower: { x: PLANT_X - 60, y: PLANT_GROUND_Y - 130 },
        }
        const pos = labelPositions[p]
        return (
          <g key={p} transform={`translate(${pos.x}, ${pos.y})`}>
            <circle cx={0} cy={0} r={11} fill="#22c55e" stroke="white" strokeWidth={2} />
            <path d="M -5 0 L -1 4 L 6 -4" stroke="white" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )
      })}

      {/* Info card */}
      <g>
        <rect x={60} y={H - 90} width={W - 120} height={70} rx={14} fill="white" stroke="#cbd5e1" strokeWidth={1.5} />
        {active ? (
          <>
            <text x={W / 2} y={H - 60} textAnchor="middle" fill="#1f2937" fontSize={18} fontWeight={800}
                  style={{ fontFamily: 'system-ui, sans-serif' }}>
              {active.label}
            </text>
            <text x={W / 2} y={H - 36} textAnchor="middle" fill="#475569" fontSize={14}
                  style={{ fontFamily: 'system-ui, sans-serif' }}>
              {active.description}
            </text>
          </>
        ) : (
          <text x={W / 2} y={H - 50} textAnchor="middle" fill="#94a3b8" fontSize={14} fontStyle="italic"
                style={{ fontFamily: 'system-ui, sans-serif' }}>
            Tap a part of the plant.
          </text>
        )}
      </g>

      {showSparkles && <SparkleBurst />}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// NEEDS SCENE — step 1.

function NeedsScene({
  stepIdx,
  chosen,
  rejected,
  onTap,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  chosen: Set<NeedKey>
  rejected: Set<NeedKey>
  onTap: (k: NeedKey) => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const goodChosen = NEED_OPTIONS.filter((n) => n.good && chosen.has(n.key)).length
  const growth = goodChosen / 3

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${W} ${H - 110}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full block touch-none select-none"
          role="img"
          aria-label="A plant that grows when you give it the right things."
        >
          <defs>
            <linearGradient id={`needs-sky-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#dbeafe" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={H - 110} fill={`url(#needs-sky-${stepIdx})`} />

          <PlantDiagram growth={Math.max(0.15, growth)} />

          {showSparkles && <SparkleBurst />}
        </svg>
      </div>

      {/* Options strip */}
      <div className="shrink-0 bg-white border-t border-slate-200 px-3 py-3">
        <div className="grid grid-cols-6 gap-2 max-w-2xl mx-auto">
          {NEED_OPTIONS.map((opt) => {
            const isChosen = chosen.has(opt.key)
            const isRejected = rejected.has(opt.key)
            return (
              <motion.button
                key={opt.key}
                type="button"
                onClick={() => onTap(opt.key)}
                disabled={!isCurrent || isChosen}
                animate={isRejected ? { x: [-4, 4, -3, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className={`relative flex flex-col items-center justify-center gap-1 aspect-square rounded-2xl border-2 text-2xl transition focus-visible:outline-2 focus-visible:outline-ka-brand-500 ${
                  isChosen
                    ? 'border-ka-year3 bg-ka-year3-light cursor-default'
                    : 'border-slate-200 bg-white hover:border-ka-brand-500'
                }`}
                aria-label={`${opt.label}. ${opt.good ? 'Good for plants.' : 'Not what plants need.'}`}
              >
                <span aria-hidden="true">{opt.emoji}</span>
                <span className="text-[10px] font-ka-body font-semibold text-slate-700">{opt.label}</span>
                {isChosen && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ka-year3 text-white flex items-center justify-center shadow-sm">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
                {isRejected && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ka-year6 text-white flex items-center justify-center shadow-sm">
                    <XIcon size={12} strokeWidth={3} />
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
// WATER SCENE — step 2.

function WaterScene({
  stepIdx,
  wateringNow,
  onWater,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  wateringNow: boolean
  onWater: () => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block touch-none select-none"
      role="img"
      aria-label="A plant being watered. Watch the water travel up."
    >
      <defs>
        <linearGradient id={`water-sky-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#water-sky-${stepIdx})`} />

      <PlantDiagram growth={1} />

      {/* Watering can */}
      <g transform={`translate(${PLANT_X - 200}, ${PLANT_GROUND_Y - 100}) ${wateringNow ? 'rotate(35)' : ''}`} style={{ transformOrigin: `${PLANT_X - 200}px ${PLANT_GROUND_Y - 100}px`, transition: 'transform 400ms' }}>
        <rect x={-30} y={-30} width={60} height={45} rx={8} fill="#0ea5e9" stroke="#0c4a6e" strokeWidth={2} />
        <rect x={-22} y={-40} width={28} height={12} rx={4} fill="#0ea5e9" stroke="#0c4a6e" strokeWidth={2} />
        <path d="M 30 -16 L 56 -28 L 56 -8 L 30 -2 Z" fill="#0ea5e9" stroke="#0c4a6e" strokeWidth={2} />
        <circle
          tabIndex={isCurrent ? 0 : -1}
          cx={0}
          cy={-8}
          r={50}
          fill="transparent"
          onPointerDown={(e) => { e.preventDefault(); onWater() }}
          className={TOUCH_TARGET_CLASS}
          style={{ cursor: 'pointer' }}
          aria-label="Watering can. Tap to water the plant."
        />
      </g>

      {/* Animated water droplets */}
      <AnimatePresence>
        {wateringNow && (
          <>
            {/* Falling drops from spout to soil */}
            {[0, 1, 2].map((k) => (
              <motion.circle
                key={`drop-${k}`}
                cx={PLANT_X - 144}
                cy={PLANT_GROUND_Y - 130}
                r={6}
                fill="#0ea5e9"
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], y: 130 }}
                transition={{ duration: 0.8, delay: k * 0.15, ease: 'easeIn' }}
              />
            ))}

            {/* Water travelling up the stem */}
            {[0, 1, 2, 3].map((k) => (
              <motion.circle
                key={`up-${k}`}
                cx={PLANT_X}
                cy={PLANT_GROUND_Y}
                r={4}
                fill="#0ea5e9"
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 1, 0], y: -90 }}
                transition={{ duration: 1.4, delay: 0.7 + k * 0.18, ease: 'linear' }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {showSparkles && <SparkleBurst />}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// POLLINATE SCENE — step 3.

const FLOWER_A: Pt = { x: 230, y: 230 }
const FLOWER_B: Pt = { x: 580, y: 230 }
const POLLINATE_THRESHOLD = 70

function PollinateScene({
  stepIdx,
  bee,
  setBee,
  beeDragging,
  setBeeDragging,
  beeAtFlowerB,
  setBeeAtFlowerB,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  bee: Pt
  setBee: (p: Pt) => void
  beeDragging: boolean
  setBeeDragging: (b: boolean) => void
  beeAtFlowerB: boolean
  setBeeAtFlowerB: (b: boolean) => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragOffset = useRef<Pt>({ x: 0, y: 0 })

  function startDrag(e: React.PointerEvent<SVGElement>) {
    e.preventDefault()
    const p = svgPointFromEvent(svgRef.current, e.clientX, e.clientY)
    dragOffset.current = { x: p.x - bee.x, y: p.y - bee.y }
    setBeeDragging(true)
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
  }

  function moveDrag(e: React.PointerEvent<SVGElement>) {
    if (!beeDragging) return
    const p = svgPointFromEvent(svgRef.current, e.clientX, e.clientY)
    setBee({
      x: clamp(p.x - dragOffset.current.x, 60, W - 60),
      y: clamp(p.y - dragOffset.current.y, 60, H - 130),
    })
  }

  function endDrag(e: React.PointerEvent<SVGElement>) {
    setBeeDragging(false)
    ;(e.currentTarget as Element).releasePointerCapture?.(e.pointerId)
    const distToB = Math.hypot(bee.x - FLOWER_B.x, bee.y - FLOWER_B.y)
    if (distToB < POLLINATE_THRESHOLD && !beeAtFlowerB) {
      setBee({ x: FLOWER_B.x, y: FLOWER_B.y - 30 })
      setBeeAtFlowerB(true)
    }
  }

  const showPollenTrail = beeAtFlowerB
  const distToA = Math.hypot(bee.x - FLOWER_A.x, bee.y - FLOWER_A.y)
  const beeStartedAtA = distToA < 60 || beeAtFlowerB

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block touch-none select-none"
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="img"
      aria-label="Two flowers and a bee. Drag the bee from one flower to the other."
    >
      <defs>
        <linearGradient id={`pol-sky-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#bae6fd" />
          <stop offset="60%"  stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#bbf7d0" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#pol-sky-${stepIdx})`} />
      <rect x={0} y={H - 80} width={W} height={80} fill="#16a34a" />

      {/* Pollen trail */}
      {showPollenTrail && (
        <>
          {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => (
            <motion.circle
              key={idx}
              cx={FLOWER_A.x + (FLOWER_B.x - FLOWER_A.x) * t}
              cy={FLOWER_A.y - 30 + (FLOWER_B.y - FLOWER_A.y) * t}
              r={3}
              fill="#fbbf24"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, delay: idx * 0.1, repeat: Infinity, repeatDelay: 1 }}
            />
          ))}
        </>
      )}

      {/* Flower A — pink */}
      <g transform={`translate(${FLOWER_A.x}, ${FLOWER_A.y})`}>
        <line x1={0} y1={0} x2={0} y2={H - 80 - FLOWER_A.y} stroke="#16a34a" strokeWidth={4} />
        <ellipse cx={-22} cy={30} rx={14} ry={6} fill="#22c55e" stroke="#15803d" strokeWidth={1} transform="rotate(-25 -22 30)" />
        <g>
          {[0, 1, 2, 3, 4].map((k) => {
            const a = (k / 5) * Math.PI * 2 - Math.PI / 2
            const x = Math.cos(a) * 18
            const y = Math.sin(a) * 18
            return <circle key={k} cx={x} cy={y} r={14} fill="#f9a8d4" stroke="#db2777" strokeWidth={1.5} />
          })}
          <circle cx={0} cy={0} r={9} fill="#fbbf24" stroke="#d97706" strokeWidth={1.5} />
        </g>
      </g>

      {/* Flower B — yellow */}
      <g transform={`translate(${FLOWER_B.x}, ${FLOWER_B.y})`}>
        <line x1={0} y1={0} x2={0} y2={H - 80 - FLOWER_B.y} stroke="#16a34a" strokeWidth={4} />
        <ellipse cx={22} cy={30} rx={14} ry={6} fill="#22c55e" stroke="#15803d" strokeWidth={1} transform="rotate(25 22 30)" />
        <g>
          {[0, 1, 2, 3, 4].map((k) => {
            const a = (k / 5) * Math.PI * 2 - Math.PI / 2
            const x = Math.cos(a) * 18
            const y = Math.sin(a) * 18
            return <circle key={k} cx={x} cy={y} r={14} fill="#fde68a" stroke="#d97706" strokeWidth={1.5} />
          })}
          <circle cx={0} cy={0} r={9} fill={beeAtFlowerB ? '#fbbf24' : '#a16207'} stroke="#d97706" strokeWidth={1.5} />
        </g>
      </g>

      {/* Bee */}
      <motion.g
        animate={{ x: bee.x, y: bee.y }}
        transition={beeDragging ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 20 }}
        style={{ cursor: beeDragging ? 'grabbing' : 'grab' }}
      >
        <ellipse cx={0} cy={0} rx={18} ry={11} fill="#fbbf24" stroke="#1f2937" strokeWidth={2} />
        <line x1={-7} y1={-11} x2={-7} y2={11} stroke="#1f2937" strokeWidth={2.5} />
        <line x1={5}  y1={-11} x2={5}  y2={11} stroke="#1f2937" strokeWidth={2.5} />
        <ellipse cx={-6} cy={-12} rx={11} ry={5} fill="white" opacity={0.85} stroke="#1f2937" strokeWidth={1} />
        <ellipse cx={6}  cy={-12} rx={11} ry={5} fill="white" opacity={0.85} stroke="#1f2937" strokeWidth={1} />
        <circle cx={-12} cy={-2} r={2} fill="#1f2937" />
        <rect
          tabIndex={isCurrent ? 0 : -1}
          x={-26}
          y={-22}
          width={52}
          height={44}
          fill="transparent"
          onPointerDown={startDrag}
          className={TOUCH_TARGET_CLASS}
          style={{ cursor: 'grab' }}
          aria-label="Bee. Drag from flower to flower."
        />
      </motion.g>

      {/* Hint arrow when bee is still near A */}
      {beeStartedAtA && !beeAtFlowerB && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <path
            d={`M ${FLOWER_A.x + 60} ${FLOWER_A.y} L ${FLOWER_B.x - 60} ${FLOWER_B.y}`}
            stroke="#94a3b8"
            strokeWidth={3}
            strokeDasharray="6 8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M ${FLOWER_B.x - 70} ${FLOWER_B.y - 6} L ${FLOWER_B.x - 60} ${FLOWER_B.y} L ${FLOWER_B.x - 70} ${FLOWER_B.y + 6}`}
            stroke="#94a3b8"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
      )}

      {showSparkles && <SparkleBurst />}
    </svg>
      </div>
      <div className="shrink-0 bg-white border-t border-slate-200 px-4 py-3 min-h-[56px] flex items-center">
        {beeAtFlowerB ? (
          <p className="font-ka-body text-sm text-slate-700">
            <strong className="font-ka-display font-bold">Pollen delivered.</strong>{' '}
            Now this flower can make seeds. That&rsquo;s why bees are so important.
          </p>
        ) : (
          <p className="font-ka-body text-sm text-slate-700">
            <strong className="font-ka-display font-bold">Pollen</strong> is the yellow dust on a flower.
            Bees pick it up on their fuzzy bodies and drop it off on the next flower they visit.
          </p>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SEEDS SCENE — step 4.

const SEED_BIN_LAYOUT: Record<DispersalKey, { x: number; w: number }> = {
  wind:   { x: 60,  w: 220 },
  animal: { x: 290, w: 220 },
  water:  { x: 520, w: 220 },
}
const SEED_BIN_TOP = 250
const SEED_BIN_HEIGHT = 200

function SeedsScene({
  stepIdx,
  bins,
  onPlace,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  bins: Record<SeedKey, DispersalKey | 'tray'>
  onPlace: (sk: SeedKey, target: DispersalKey) => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<SeedKey | null>(null)
  const [dragPos, setDragPos] = useState<Pt>({ x: 0, y: 0 })

  function homePosition(sk: SeedKey): Pt {
    const bin = bins[sk]
    const seedKeys = Object.keys(SEEDS) as SeedKey[]
    if (bin === 'tray') {
      const trayItems = seedKeys.filter((k) => bins[k] === 'tray')
      const idx = trayItems.findIndex((k) => k === sk)
      const trayWidth = W - 200
      const slotW = trayWidth / Math.max(trayItems.length, 1)
      return { x: 100 + slotW * idx + slotW / 2, y: 110 }
    }
    const layout = SEED_BIN_LAYOUT[bin]
    const inBin = seedKeys.filter((k) => bins[k] === bin)
    const idx = inBin.findIndex((k) => k === sk)
    const slotW = layout.w / Math.max(inBin.length, 1)
    return { x: layout.x + slotW * idx + slotW / 2, y: SEED_BIN_TOP + 70 }
  }

  function startDrag(sk: SeedKey, e: React.PointerEvent<SVGElement>) {
    e.preventDefault()
    setDragging(sk)
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
    if (target !== null && SEEDS[dragging].method === target) {
      onPlace(dragging, target)
    }
    setDragging(null)
    ;(e.currentTarget as Element).releasePointerCapture?.(e.pointerId)
  }

  function binAtPoint(p: Pt): DispersalKey | null {
    if (p.y < SEED_BIN_TOP) return null
    if (p.y > SEED_BIN_TOP + SEED_BIN_HEIGHT) return null
    if (p.x >= SEED_BIN_LAYOUT.wind.x   && p.x <= SEED_BIN_LAYOUT.wind.x   + SEED_BIN_LAYOUT.wind.w)   return 'wind'
    if (p.x >= SEED_BIN_LAYOUT.animal.x && p.x <= SEED_BIN_LAYOUT.animal.x + SEED_BIN_LAYOUT.animal.w) return 'animal'
    if (p.x >= SEED_BIN_LAYOUT.water.x  && p.x <= SEED_BIN_LAYOUT.water.x  + SEED_BIN_LAYOUT.water.w)  return 'water'
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
      aria-label="Drag each seed to how it travels."
    >
      <defs>
        <linearGradient id={`seeds-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#seeds-bg-${stepIdx})`} />

      <text x={W / 2} y={36} textAnchor="middle" fill="#64748b" fontSize={14} fontWeight={700}
            style={{ fontFamily: 'system-ui, sans-serif' }}>
        Pick up a seed
      </text>

      {/* Bins */}
      {(Object.keys(SEED_BIN_LAYOUT) as DispersalKey[]).map((dk) => {
        const layout = SEED_BIN_LAYOUT[dk]
        const colors = {
          wind:   { fill: '#dbeafe', stroke: '#3b82f6' },
          animal: { fill: '#fef3c7', stroke: '#f59e0b' },
          water:  { fill: '#cffafe', stroke: '#06b6d4' },
        }[dk]
        return (
          <g key={dk}>
            <rect
              x={layout.x}
              y={SEED_BIN_TOP}
              width={layout.w}
              height={SEED_BIN_HEIGHT}
              rx={20}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={2}
              strokeDasharray="6 6"
            />
            <DispersalIcon dk={dk} cx={layout.x + layout.w / 2} cy={SEED_BIN_TOP + 28} />
            <text
              x={layout.x + layout.w / 2}
              y={SEED_BIN_TOP + 60}
              textAnchor="middle"
              fill="#1f2937"
              fontSize={18}
              fontWeight={800}
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              {DISPERSAL_LABEL[dk]}
            </text>
          </g>
        )
      })}

      {/* Seeds */}
      {(Object.keys(SEEDS) as SeedKey[]).map((sk) => {
        const isDragging = dragging === sk
        const home = homePosition(sk)
        const pos = isDragging ? dragPos : home
        return (
          <motion.g
            key={sk}
            animate={{ x: pos.x, y: pos.y }}
            transition={isDragging ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 24 }}
            style={{ cursor: 'grab' }}
          >
            <SeedGraphic kind={sk} />
            <text
              y={48}
              textAnchor="middle"
              fill="#1f2937"
              fontSize={12}
              fontWeight={600}
              style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}
            >
              {SEEDS[sk].label}
            </text>
            <rect
              tabIndex={isCurrent ? 0 : -1}
              x={-44}
              y={-32}
              width={88}
              height={80}
              fill="transparent"
              onPointerDown={(e) => startDrag(sk, e)}
              className={TOUCH_TARGET_CLASS}
              style={{ cursor: 'grab' }}
              aria-label={`${SEEDS[sk].label}. Drag into the right box.`}
            />
          </motion.g>
        )
      })}

      {showSparkles && <SparkleBurst />}
    </svg>
  )
}

function SeedGraphic({ kind }: { kind: SeedKey }) {
  switch (kind) {
    case 'dandelion':
      return (
        <g>
          <circle cx={0} cy={0} r={4} fill="#78350f" />
          {Array.from({ length: 10 }).map((_, k) => {
            const a = (k / 10) * Math.PI * 2
            const x = Math.cos(a) * 22
            const y = Math.sin(a) * 22
            return (
              <g key={k}>
                <line x1={0} y1={0} x2={x * 0.6} y2={y * 0.6} stroke="#cbd5e1" strokeWidth={1} />
                <circle cx={x} cy={y} r={3} fill="white" stroke="#cbd5e1" strokeWidth={1} />
              </g>
            )
          })}
        </g>
      )
    case 'burr':
      return (
        <g>
          <circle cx={0} cy={0} r={14} fill="#a16207" stroke="#78350f" strokeWidth={1.5} />
          {Array.from({ length: 12 }).map((_, k) => {
            const a = (k / 12) * Math.PI * 2
            const x1 = Math.cos(a) * 14
            const y1 = Math.sin(a) * 14
            const x2 = Math.cos(a) * 22
            const y2 = Math.sin(a) * 22
            return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#78350f" strokeWidth={1.5} strokeLinecap="round" />
          })}
        </g>
      )
    case 'coconut':
      return (
        <g>
          <ellipse cx={0} cy={0} rx={20} ry={16} fill="#92400e" stroke="#451a03" strokeWidth={1.5} />
          <ellipse cx={-6} cy={-4} rx={5} ry={3} fill="#78350f" opacity={0.6} />
          <circle cx={-2} cy={-2} r={2} fill="#451a03" />
          <circle cx={4} cy={2} r={2} fill="#451a03" />
          <circle cx={-1} cy={6} r={2} fill="#451a03" />
        </g>
      )
  }
}

function DispersalIcon({ dk, cx, cy }: { dk: DispersalKey; cx: number; cy: number }) {
  switch (dk) {
    case 'wind':
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          <path d="M -16 -4 q 8 -8 16 0 t 16 0" stroke="#3b82f6" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <path d="M -12 4 q 8 -8 16 0 t 12 0" stroke="#3b82f6" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </g>
      )
    case 'animal':
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          <ellipse cx={0} cy={2} rx={9} ry={6} fill="#a16207" />
          <ellipse cx={-9} cy={-7} rx={3.5} ry={4} fill="#a16207" />
          <ellipse cx={9} cy={-7}  rx={3.5} ry={4} fill="#a16207" />
          <ellipse cx={-7} cy={8}  rx={3.5} ry={4} fill="#a16207" />
          <ellipse cx={7} cy={8}   rx={3.5} ry={4} fill="#a16207" />
        </g>
      )
    case 'water':
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          <path d="M -16 0 q 4 -6 8 0 t 8 0 t 8 0 t 8 0" stroke="#06b6d4" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <path d="M -16 8 q 4 -6 8 0 t 8 0 t 8 0 t 8 0" stroke="#06b6d4" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </g>
      )
  }
}
