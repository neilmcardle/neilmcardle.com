'use client'

import { useEffect, useRef, useState } from 'react'
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
type SceneType = 'compare' | 'meal' | 'skeleton' | 'muscle' | 'jobs'

type CompareSubject = 'plant' | 'human'
type FoodGroup = 'energy' | 'building' | 'healthy'
type SkeletonPart = 'skull' | 'ribs' | 'spine' | 'arms' | 'legs'
type BoneKey = 'skull' | 'ribs' | 'spine' | 'pelvis' | 'arm' | 'leg'
type BoneJob = 'protect' | 'support' | 'move'
type JobBin = 'tray' | BoneJob

type Step = { key: string; scene: SceneType; prompt: string; hint: string }

const STEPS: Step[] = [
  { key: 'compare',  scene: 'compare',  prompt: 'Tap the plant and the kid.',                       hint: 'Find out who makes their own food.' },
  { key: 'meal',     scene: 'meal',     prompt: 'Build a balanced meal. Pick one from each group.', hint: 'Your body needs all three.' },
  { key: 'skeleton', scene: 'skeleton', prompt: 'Tap each part of the skeleton.',                   hint: 'Every bone has a job.' },
  { key: 'muscle',   scene: 'muscle',   prompt: 'Tap to bend the arm. Watch the muscle.',           hint: 'Muscles tighten to make you move.' },
  { key: 'jobs',     scene: 'jobs',     prompt: 'Match each bone to its main job.',                 hint: 'Some bones protect. Some support. Some help you move.' },
]

const COMPARE_SUBJECTS: Record<CompareSubject, { name: string; description: string }> = {
  plant: { name: 'Plants',        description: 'Plants soak up sunlight and use it to make their own food. They don’t need to eat.' },
  human: { name: 'You and other animals', description: 'You can’t make food from sunlight. You need to eat to grow, run, and think.' },
}

type FoodConfig = { key: string; label: string; group: FoodGroup; emoji: string }
const FOODS: FoodConfig[] = [
  { key: 'bread',    label: 'Bread',    group: 'energy',   emoji: '🍞' },
  { key: 'pasta',    label: 'Pasta',    group: 'energy',   emoji: '🍝' },
  { key: 'chicken',  label: 'Chicken',  group: 'building', emoji: '🍗' },
  { key: 'fish',     label: 'Fish',     group: 'building', emoji: '🐟' },
  { key: 'apple',    label: 'Apple',    group: 'healthy',  emoji: '🍎' },
  { key: 'broccoli', label: 'Broccoli', group: 'healthy',  emoji: '🥦' },
]

const FOOD_GROUP_LABEL: Record<FoodGroup, string> = {
  energy:   'Energy foods',
  building: 'Building foods',
  healthy:  'Healthy foods',
}

const FOOD_GROUP_TINT: Record<FoodGroup, { bg: string; border: string; text: string }> = {
  energy:   { bg: '#fef3c7', border: '#f59e0b', text: '#78350f' },
  building: { bg: '#fee2e2', border: '#ef4444', text: '#7f1d1d' },
  healthy:  { bg: '#bbf7d0', border: '#22c55e', text: '#14532d' },
}

const SKELETON_PARTS: Record<SkeletonPart, { label: string; description: string }> = {
  skull: { label: 'Skull',  description: 'A hard helmet of bone. It keeps your brain safe.' },
  ribs:  { label: 'Ribs',   description: 'A curved cage that protects your heart and lungs.' },
  spine: { label: 'Spine',  description: 'Stacked bones that hold you upright and let you bend.' },
  arms:  { label: 'Arms',   description: 'Long bones with joints, so you can reach, hold, and throw.' },
  legs:  { label: 'Legs',   description: 'Strong bones that carry your weight and let you walk and run.' },
}

const BONE_LABEL: Record<BoneKey, string> = {
  skull:  'Skull',
  ribs:   'Ribs',
  spine:  'Spine',
  pelvis: 'Pelvis',
  arm:    'Arm',
  leg:    'Leg',
}
const BONE_JOB: Record<BoneKey, BoneJob> = {
  skull:  'protect',
  ribs:   'protect',
  spine:  'support',
  pelvis: 'support',
  arm:    'move',
  leg:    'move',
}
const JOB_LABEL: Record<BoneJob, string> = {
  protect: 'Protect',
  support: 'Support',
  move:    'Move',
}

function svgPointFromEvent(svg: SVGSVGElement | null, clientX: number, clientY: number): Pt {
  if (!svg) return { x: 0, y: 0 }
  const rect = svg.getBoundingClientRect()
  return {
    x: ((clientX - rect.left) / rect.width) * W,
    y: ((clientY - rect.top) / rect.height) * H,
  }
}

export default function AnimalsTool({ onProgress }: ToolProps) {
  const startedAt = useRef<number>(Date.now())
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const completedRef = useRef<Set<number>>(new Set())
  const moduleCompletePlayed = useRef<boolean>(false)

  const [activeStep, setActiveStep] = useState(0)
  const [unlockedUpTo, setUnlockedUpTo] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [justCompleted, setJustCompleted] = useState<number | null>(null)

  // Step 0: compare.
  const [tappedSubjects, setTappedSubjects] = useState<Set<CompareSubject>>(new Set())
  const [activeSubject, setActiveSubject] = useState<CompareSubject | null>(null)

  // Step 1: meal builder.
  const [meal, setMeal] = useState<Partial<Record<FoodGroup, string>>>({})

  // Step 2: skeleton tour.
  const [tappedParts, setTappedParts] = useState<Set<SkeletonPart>>(new Set())
  const [activePart, setActivePart] = useState<SkeletonPart | null>(null)

  // Step 3: muscle.
  const [armBent, setArmBent] = useState(false)
  const [armBentOnce, setArmBentOnce] = useState(false)

  // Step 4: bone jobs sort.
  const [boneBins, setBoneBins] = useState<Record<BoneKey, JobBin>>({
    skull: 'tray', ribs: 'tray', spine: 'tray', pelvis: 'tray', arm: 'tray', leg: 'tray',
  })

  function markStepComplete(idx: number) {
    if (completedRef.current.has(idx)) return
    completedRef.current.add(idx)
    setCompletedSteps(Array.from(completedRef.current).sort((a, b) => a - b))
    if (idx + 1 > unlockedUpTo) setUnlockedUpTo(idx + 1)
  }

  // Step 0 test: both subjects tapped.
  useEffect(() => {
    if (activeStep !== 0) return
    if (tappedSubjects.size >= 2) markStepComplete(0)
  }, [activeStep, tappedSubjects])

  // Step 1 test: one food from each group.
  useEffect(() => {
    if (activeStep !== 1) return
    if (Object.keys(meal).length >= 3) markStepComplete(1)
  }, [activeStep, meal])

  // Step 2 test: all skeleton parts tapped.
  useEffect(() => {
    if (activeStep !== 2) return
    if (tappedParts.size >= 5) markStepComplete(2)
  }, [activeStep, tappedParts])

  // Step 3 test: arm bent at least once.
  useEffect(() => {
    if (activeStep !== 3) return
    if (armBentOnce) markStepComplete(3)
  }, [activeStep, armBentOnce])

  // Step 4 test: all bones placed correctly.
  useEffect(() => {
    if (activeStep !== 4) return
    const allCorrect = (Object.keys(BONE_JOB) as BoneKey[]).every(
      (bk) => boneBins[bk] === BONE_JOB[bk],
    )
    if (allCorrect) markStepComplete(4)
  }, [activeStep, boneBins])

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
    setTappedSubjects(new Set())
    setActiveSubject(null)
    setMeal({})
    setTappedParts(new Set())
    setActivePart(null)
    setArmBent(false)
    setArmBentOnce(false)
    setBoneBins({ skull: 'tray', ribs: 'tray', spine: 'tray', pelvis: 'tray', arm: 'tray', leg: 'tray' })
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
                {step.scene === 'compare' && (
                  <CompareScene
                    stepIdx={i}
                    tapped={tappedSubjects}
                    activeSubject={activeSubject}
                    onTap={(s) => {
                      setTappedSubjects((set) => new Set(set).add(s))
                      setActiveSubject(s)
                    }}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'meal' && (
                  <MealScene
                    stepIdx={i}
                    meal={meal}
                    onPick={(food) => setMeal((m) => ({ ...m, [food.group]: food.key }))}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'skeleton' && (
                  <SkeletonScene
                    stepIdx={i}
                    tapped={tappedParts}
                    activePart={activePart}
                    onTap={(p) => {
                      setTappedParts((s) => new Set(s).add(p))
                      setActivePart(p)
                    }}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'muscle' && (
                  <MuscleScene
                    stepIdx={i}
                    bent={armBent}
                    onToggle={() => {
                      setArmBent((b) => !b)
                      setArmBentOnce(true)
                    }}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'jobs' && (
                  <JobsScene
                    stepIdx={i}
                    bins={boneBins}
                    onPlace={(bk, target) => setBoneBins((b) => ({ ...b, [bk]: target }))}
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
                <li>Plants make their own food. You and other animals have to eat.</li>
                <li>A balanced meal has energy foods, building foods, and healthy foods.</li>
                <li>Your skeleton holds you up and protects your soft parts inside.</li>
                <li>Muscles tighten and pull on your bones to make you move.</li>
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
// COMPARE SCENE — step 0.

function CompareScene({
  stepIdx,
  tapped,
  activeSubject,
  onTap,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  tapped: Set<CompareSubject>
  activeSubject: CompareSubject | null
  onTap: (s: CompareSubject) => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const active = activeSubject ? COMPARE_SUBJECTS[activeSubject] : null

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block touch-none select-none"
      role="img"
      aria-label="A plant and a child. Tap each to find out who makes their own food."
    >
      <defs>
        <linearGradient id={`compare-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
        <linearGradient id={`compare-ground-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#86efac" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={300} fill={`url(#compare-bg-${stepIdx})`} />
      <rect x={0} y={300} width={W} height={H - 300} fill={`url(#compare-ground-${stepIdx})`} />

      {/* Sun */}
      <g transform="translate(120, 80)">
        {Array.from({ length: 8 }).map((_, k) => {
          const a = (k / 8) * Math.PI * 2
          return (
            <line
              key={k}
              x1={Math.cos(a) * 24}
              y1={Math.sin(a) * 24}
              x2={Math.cos(a) * 36}
              y2={Math.sin(a) * 36}
              stroke="#f59e0b"
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.85}
            />
          )
        })}
        <circle cx={0} cy={0} r={20} fill="#fbbf24" stroke="#f59e0b" strokeWidth={2} />
      </g>

      {/* Plant on the left */}
      <g
        transform="translate(220, 280)"
        opacity={activeSubject && activeSubject !== 'plant' ? 0.55 : 1}
        style={{ transition: 'opacity 200ms' }}
      >
        {/* stem */}
        <line x1={0} y1={0} x2={0} y2={-100} stroke="#16a34a" strokeWidth={5} strokeLinecap="round" />
        {/* leaves */}
        <ellipse cx={-22} cy={-66} rx={20} ry={8} fill="#22c55e" stroke="#15803d" strokeWidth={1.5} transform="rotate(-25 -22 -66)" />
        <ellipse cx={22} cy={-46} rx={20} ry={8} fill="#22c55e" stroke="#15803d" strokeWidth={1.5} transform="rotate(25 22 -46)" />
        {/* flower */}
        <g transform="translate(0, -118)">
          {[0, 1, 2, 3, 4].map((k) => {
            const a = (k / 5) * Math.PI * 2 - Math.PI / 2
            const x = Math.cos(a) * 16
            const y = Math.sin(a) * 16
            return <circle key={k} cx={x} cy={y} r={12} fill="#f9a8d4" stroke="#db2777" strokeWidth={1.5} />
          })}
          <circle cx={0} cy={0} r={7} fill="#fbbf24" stroke="#d97706" strokeWidth={1.5} />
        </g>
        {/* highlight */}
        {activeSubject === 'plant' && (
          <circle cx={0} cy={-60} r={90} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeDasharray="6 6" opacity={0.9} />
        )}
        {tapped.has('plant') && (
          <g transform="translate(40, -110)">
            <circle cx={0} cy={0} r={11} fill="#22c55e" stroke="white" strokeWidth={2} />
            <path d="M -5 0 L -1 4 L 6 -4" stroke="white" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
        {/* tap target */}
        <rect
          tabIndex={isCurrent ? 0 : -1}
          x={-60}
          y={-140}
          width={120}
          height={150}
          fill="transparent"
          onPointerDown={(e) => { e.preventDefault(); onTap('plant') }}
          className={TOUCH_TARGET_CLASS}
          style={{ cursor: 'pointer' }}
          aria-label="A plant. Tap to learn."
        />
      </g>

      {/* Human on the right */}
      <g
        transform="translate(580, 280)"
        opacity={activeSubject && activeSubject !== 'human' ? 0.55 : 1}
        style={{ transition: 'opacity 200ms' }}
      >
        {/* legs */}
        <line x1={-12} y1={0} x2={-12} y2={-50} stroke="#1e3a8a" strokeWidth={10} strokeLinecap="round" />
        <line x1={12} y1={0} x2={12} y2={-50} stroke="#1e3a8a" strokeWidth={10} strokeLinecap="round" />
        {/* torso */}
        <rect x={-22} y={-100} width={44} height={56} fill="#3b82f6" stroke="#1e3a8a" strokeWidth={2} rx={8} />
        {/* arms */}
        <line x1={-22} y1={-92} x2={-40} y2={-60} stroke="#fcd34d" strokeWidth={9} strokeLinecap="round" />
        <line x1={22} y1={-92} x2={42} y2={-72} stroke="#fcd34d" strokeWidth={9} strokeLinecap="round" />
        {/* apple in hand */}
        <circle cx={48} cy={-72} r={9} fill="#ef4444" stroke="#7f1d1d" strokeWidth={1.5} />
        <line x1={48} y1={-78} x2={48} y2={-83} stroke="#15803d" strokeWidth={2} strokeLinecap="round" />
        {/* head */}
        <circle cx={0} cy={-118} r={20} fill="#fcd34d" stroke="#92400e" strokeWidth={2} />
        {/* face */}
        <circle cx={-6} cy={-122} r={1.6} fill="#1f2937" />
        <circle cx={6}  cy={-122} r={1.6} fill="#1f2937" />
        <path d="M -6 -113 Q 0 -109 6 -113" stroke="#1f2937" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        {/* highlight */}
        {activeSubject === 'human' && (
          <circle cx={0} cy={-70} r={90} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeDasharray="6 6" opacity={0.9} />
        )}
        {tapped.has('human') && (
          <g transform="translate(-44, -110)">
            <circle cx={0} cy={0} r={11} fill="#22c55e" stroke="white" strokeWidth={2} />
            <path d="M -5 0 L -1 4 L 6 -4" stroke="white" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
        {/* tap target */}
        <rect
          tabIndex={isCurrent ? 0 : -1}
          x={-50}
          y={-140}
          width={110}
          height={150}
          fill="transparent"
          onPointerDown={(e) => { e.preventDefault(); onTap('human') }}
          className={TOUCH_TARGET_CLASS}
          style={{ cursor: 'pointer' }}
          aria-label="A child. Tap to learn."
        />
      </g>

      {/* Info card */}
      <g>
        <rect x={60} y={H - 90} width={W - 120} height={70} rx={14} fill="white" stroke="#cbd5e1" strokeWidth={1.5} />
        {active ? (
          <>
            <text x={W / 2} y={H - 60} textAnchor="middle" fill="#1f2937" fontSize={18} fontWeight={800}
                  style={{ fontFamily: 'system-ui, sans-serif' }}>
              {active.name}
            </text>
            <text x={W / 2} y={H - 36} textAnchor="middle" fill="#475569" fontSize={14}
                  style={{ fontFamily: 'system-ui, sans-serif' }}>
              {active.description}
            </text>
          </>
        ) : (
          <text x={W / 2} y={H - 50} textAnchor="middle" fill="#94a3b8" fontSize={14} fontStyle="italic"
                style={{ fontFamily: 'system-ui, sans-serif' }}>
            Tap the plant or the kid.
          </text>
        )}
      </g>

      {showSparkles && <SparkleBurst />}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MEAL SCENE — step 1.

function MealScene({
  stepIdx,
  meal,
  onPick,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  meal: Partial<Record<FoodGroup, string>>
  onPick: (food: FoodConfig) => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const groups: FoodGroup[] = ['energy', 'building', 'healthy']

  // Plate position
  const plateX = W / 2
  const plateY = 220
  const plateR = 90

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0 relative">
        <svg
          viewBox={`0 0 ${W} 320`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full block touch-none select-none"
          role="img"
          aria-label="A plate. Pick a food from each group."
        >
          <defs>
            <linearGradient id={`meal-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={320} fill={`url(#meal-bg-${stepIdx})`} />

          {/* Plate */}
          <ellipse cx={plateX} cy={plateY + 14} rx={plateR + 4} ry={20} fill="rgba(0,0,0,0.06)" />
          <circle cx={plateX} cy={plateY} r={plateR} fill="white" stroke="#cbd5e1" strokeWidth={3} />
          <circle cx={plateX} cy={plateY} r={plateR - 12} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1.5} />

          {/* Food items on the plate, arranged in 3 zones (one per group) */}
          {groups.map((group, gIdx) => {
            const foodKey = meal[group]
            if (!foodKey) return null
            const food = FOODS.find((f) => f.key === foodKey)
            if (!food) return null
            const angle = -Math.PI / 2 + (gIdx - 1) * (Math.PI / 2.4)
            const cx = plateX + Math.cos(angle) * 38
            const cy = plateY + Math.sin(angle) * 38
            const tint = FOOD_GROUP_TINT[group]
            return (
              <motion.g
                key={`plate-${group}-${foodKey}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                style={{ x: cx, y: cy }}
              >
                <circle cx={0} cy={0} r={26} fill={tint.bg} stroke={tint.border} strokeWidth={2} />
                <text x={0} y={9} textAnchor="middle" fontSize={26} style={{ fontFamily: 'system-ui, sans-serif' }}>
                  {food.emoji}
                </text>
              </motion.g>
            )
          })}

          {/* Caption above plate */}
          <text x={plateX} y={88} textAnchor="middle" fill="#1f2937" fontSize={18} fontWeight={800}
                style={{ fontFamily: 'system-ui, sans-serif' }}>
            Your plate
          </text>
          <text x={plateX} y={108} textAnchor="middle" fill="#64748b" fontSize={13}
                style={{ fontFamily: 'system-ui, sans-serif' }}>
            {Object.keys(meal).length} of 3 groups picked
          </text>

          {showSparkles && <SparkleBurst />}
        </svg>
      </div>

      {/* Food groups strip */}
      <div className="shrink-0 bg-white border-t border-slate-200 p-3">
        <div className="grid grid-cols-3 gap-3 max-w-3xl mx-auto">
          {groups.map((group) => {
            const tint = FOOD_GROUP_TINT[group]
            const groupFoods = FOODS.filter((f) => f.group === group)
            const selectedKey = meal[group]
            return (
              <div key={group} className="flex flex-col gap-1.5">
                <p
                  className="text-[10px] sm:text-xs font-ka-display font-bold uppercase tracking-wide text-center"
                  style={{ color: tint.text }}
                >
                  {FOOD_GROUP_LABEL[group]}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {groupFoods.map((food) => {
                    const isSelected = selectedKey === food.key
                    return (
                      <button
                        key={food.key}
                        type="button"
                        onClick={() => onPick(food)}
                        disabled={!isCurrent}
                        tabIndex={isCurrent ? 0 : -1}
                        className={`relative flex flex-col items-center gap-0.5 py-2 rounded-xl border-2 text-2xl transition focus-visible:outline-2 focus-visible:outline-ka-brand-500 ${
                          isSelected ? 'cursor-default' : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: isSelected ? tint.bg : 'white',
                          borderColor: isSelected ? tint.border : '#e2e8f0',
                        }}
                        aria-label={`${food.label}, a ${FOOD_GROUP_LABEL[group].toLowerCase()}`}
                      >
                        <span aria-hidden="true">{food.emoji}</span>
                        <span className="text-[10px] font-ka-body font-semibold text-slate-700">{food.label}</span>
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-ka-year3 text-white flex items-center justify-center shadow-sm">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON SCENE — step 2.

const SKELETON_CENTER_X = 400
const SKELETON_TOP_Y = 60

function SkeletonScene({
  stepIdx,
  tapped,
  activePart,
  onTap,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  tapped: Set<SkeletonPart>
  activePart: SkeletonPart | null
  onTap: (p: SkeletonPart) => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const active = activePart ? SKELETON_PARTS[activePart] : null

  function partOpacity(p: SkeletonPart): number {
    if (!activePart) return 1
    return activePart === p ? 1 : 0.55
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block touch-none select-none"
      role="img"
      aria-label="A simplified skeleton. Tap each part to learn what it does."
    >
      <defs>
        <linearGradient id={`skel-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#skel-bg-${stepIdx})`} />

      {/* Skull */}
      <g style={{ transition: 'opacity 200ms', opacity: partOpacity('skull') }}>
        <ellipse cx={SKELETON_CENTER_X} cy={SKELETON_TOP_Y + 30} rx={36} ry={42} fill="#fafafa" stroke="#1f2937" strokeWidth={2} />
        <circle cx={SKELETON_CENTER_X - 12} cy={SKELETON_TOP_Y + 30} r={4} fill="#1f2937" />
        <circle cx={SKELETON_CENTER_X + 12} cy={SKELETON_TOP_Y + 30} r={4} fill="#1f2937" />
        <line x1={SKELETON_CENTER_X - 8} y1={SKELETON_TOP_Y + 50} x2={SKELETON_CENTER_X + 8} y2={SKELETON_TOP_Y + 50} stroke="#1f2937" strokeWidth={1.5} />
        <line x1={SKELETON_CENTER_X - 6} y1={SKELETON_TOP_Y + 56} x2={SKELETON_CENTER_X + 6} y2={SKELETON_TOP_Y + 56} stroke="#1f2937" strokeWidth={1.5} />
        {activePart === 'skull' && (
          <ellipse cx={SKELETON_CENTER_X} cy={SKELETON_TOP_Y + 30} rx={50} ry={56} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeDasharray="6 6" />
        )}
      </g>

      {/* Spine */}
      <g style={{ transition: 'opacity 200ms', opacity: partOpacity('spine') }}>
        {[0, 1, 2, 3, 4, 5, 6].map((k) => (
          <ellipse
            key={k}
            cx={SKELETON_CENTER_X}
            cy={SKELETON_TOP_Y + 90 + k * 22}
            rx={12}
            ry={9}
            fill="#fafafa"
            stroke="#1f2937"
            strokeWidth={2}
          />
        ))}
        {activePart === 'spine' && (
          <rect x={SKELETON_CENTER_X - 24} y={SKELETON_TOP_Y + 80} width={48} height={170} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeDasharray="6 6" rx={10} />
        )}
      </g>

      {/* Ribs */}
      <g style={{ transition: 'opacity 200ms', opacity: partOpacity('ribs') }}>
        {[0, 1, 2, 3].map((k) => {
          const y = SKELETON_TOP_Y + 100 + k * 20
          return (
            <g key={k}>
              <path d={`M ${SKELETON_CENTER_X - 12} ${y} Q ${SKELETON_CENTER_X - 70} ${y + 8} ${SKELETON_CENTER_X - 80} ${y + 22}`} stroke="#1f2937" strokeWidth={3.5} fill="none" strokeLinecap="round" />
              <path d={`M ${SKELETON_CENTER_X + 12} ${y} Q ${SKELETON_CENTER_X + 70} ${y + 8} ${SKELETON_CENTER_X + 80} ${y + 22}`} stroke="#1f2937" strokeWidth={3.5} fill="none" strokeLinecap="round" />
            </g>
          )
        })}
        {activePart === 'ribs' && (
          <ellipse cx={SKELETON_CENTER_X} cy={SKELETON_TOP_Y + 140} rx={100} ry={70} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeDasharray="6 6" />
        )}
      </g>

      {/* Arms */}
      <g style={{ transition: 'opacity 200ms', opacity: partOpacity('arms') }}>
        {/* Left arm */}
        <line x1={SKELETON_CENTER_X - 26} y1={SKELETON_TOP_Y + 100} x2={SKELETON_CENTER_X - 110} y2={SKELETON_TOP_Y + 170} stroke="#1f2937" strokeWidth={5} strokeLinecap="round" />
        <circle cx={SKELETON_CENTER_X - 110} cy={SKELETON_TOP_Y + 170} r={6} fill="#fafafa" stroke="#1f2937" strokeWidth={2} />
        <line x1={SKELETON_CENTER_X - 110} y1={SKELETON_TOP_Y + 170} x2={SKELETON_CENTER_X - 130} y2={SKELETON_TOP_Y + 250} stroke="#1f2937" strokeWidth={5} strokeLinecap="round" />
        {/* Right arm */}
        <line x1={SKELETON_CENTER_X + 26} y1={SKELETON_TOP_Y + 100} x2={SKELETON_CENTER_X + 110} y2={SKELETON_TOP_Y + 170} stroke="#1f2937" strokeWidth={5} strokeLinecap="round" />
        <circle cx={SKELETON_CENTER_X + 110} cy={SKELETON_TOP_Y + 170} r={6} fill="#fafafa" stroke="#1f2937" strokeWidth={2} />
        <line x1={SKELETON_CENTER_X + 110} y1={SKELETON_TOP_Y + 170} x2={SKELETON_CENTER_X + 130} y2={SKELETON_TOP_Y + 250} stroke="#1f2937" strokeWidth={5} strokeLinecap="round" />
        {activePart === 'arms' && (
          <rect x={SKELETON_CENTER_X - 150} y={SKELETON_TOP_Y + 90} width={300} height={170} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeDasharray="6 6" rx={20} />
        )}
      </g>

      {/* Legs */}
      <g style={{ transition: 'opacity 200ms', opacity: partOpacity('legs') }}>
        {/* Pelvis */}
        <path d={`M ${SKELETON_CENTER_X - 35} ${SKELETON_TOP_Y + 250} L ${SKELETON_CENTER_X + 35} ${SKELETON_TOP_Y + 250} L ${SKELETON_CENTER_X + 30} ${SKELETON_TOP_Y + 280} L ${SKELETON_CENTER_X - 30} ${SKELETON_TOP_Y + 280} Z`} fill="#fafafa" stroke="#1f2937" strokeWidth={2} />
        {/* Left leg */}
        <line x1={SKELETON_CENTER_X - 18} y1={SKELETON_TOP_Y + 280} x2={SKELETON_CENTER_X - 26} y2={SKELETON_TOP_Y + 350} stroke="#1f2937" strokeWidth={6} strokeLinecap="round" />
        <circle cx={SKELETON_CENTER_X - 26} cy={SKELETON_TOP_Y + 350} r={7} fill="#fafafa" stroke="#1f2937" strokeWidth={2} />
        <line x1={SKELETON_CENTER_X - 26} y1={SKELETON_TOP_Y + 350} x2={SKELETON_CENTER_X - 30} y2={SKELETON_TOP_Y + 410} stroke="#1f2937" strokeWidth={6} strokeLinecap="round" />
        {/* Right leg */}
        <line x1={SKELETON_CENTER_X + 18} y1={SKELETON_TOP_Y + 280} x2={SKELETON_CENTER_X + 26} y2={SKELETON_TOP_Y + 350} stroke="#1f2937" strokeWidth={6} strokeLinecap="round" />
        <circle cx={SKELETON_CENTER_X + 26} cy={SKELETON_TOP_Y + 350} r={7} fill="#fafafa" stroke="#1f2937" strokeWidth={2} />
        <line x1={SKELETON_CENTER_X + 26} y1={SKELETON_TOP_Y + 350} x2={SKELETON_CENTER_X + 30} y2={SKELETON_TOP_Y + 410} stroke="#1f2937" strokeWidth={6} strokeLinecap="round" />
        {activePart === 'legs' && (
          <rect x={SKELETON_CENTER_X - 60} y={SKELETON_TOP_Y + 240} width={120} height={180} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeDasharray="6 6" rx={10} />
        )}
      </g>

      {/* Tap targets — invisible rects on top of each region */}
      <g>
        <rect tabIndex={isCurrent ? 0 : -1} x={SKELETON_CENTER_X - 50} y={SKELETON_TOP_Y - 10} width={100} height={80} fill="transparent" onPointerDown={(e) => { e.preventDefault(); onTap('skull') }} className={TOUCH_TARGET_CLASS} aria-label="Skull" />
        <rect tabIndex={isCurrent ? 0 : -1} x={SKELETON_CENTER_X - 110} y={SKELETON_TOP_Y + 90} width={220} height={70} fill="transparent" onPointerDown={(e) => { e.preventDefault(); onTap('ribs') }} className={TOUCH_TARGET_CLASS} aria-label="Ribs" />
        <rect tabIndex={isCurrent ? 0 : -1} x={SKELETON_CENTER_X - 22} y={SKELETON_TOP_Y + 160} width={44} height={90} fill="transparent" onPointerDown={(e) => { e.preventDefault(); onTap('spine') }} className={TOUCH_TARGET_CLASS} aria-label="Spine" />
        <rect tabIndex={isCurrent ? 0 : -1} x={SKELETON_CENTER_X - 150} y={SKELETON_TOP_Y + 95} width={70}  height={170} fill="transparent" onPointerDown={(e) => { e.preventDefault(); onTap('arms') }} className={TOUCH_TARGET_CLASS} aria-label="Left arm" />
        <rect tabIndex={isCurrent ? 0 : -1} x={SKELETON_CENTER_X + 80}  y={SKELETON_TOP_Y + 95} width={70}  height={170} fill="transparent" onPointerDown={(e) => { e.preventDefault(); onTap('arms') }} className={TOUCH_TARGET_CLASS} aria-label="Right arm" />
        <rect tabIndex={isCurrent ? 0 : -1} x={SKELETON_CENTER_X - 60}  y={SKELETON_TOP_Y + 280} width={120} height={140} fill="transparent" onPointerDown={(e) => { e.preventDefault(); onTap('legs') }} className={TOUCH_TARGET_CLASS} aria-label="Legs" />
      </g>

      {/* Tapped checkmarks */}
      {(['skull', 'ribs', 'spine', 'arms', 'legs'] as SkeletonPart[]).map((p) => {
        if (!tapped.has(p)) return null
        const labelPositions: Record<SkeletonPart, Pt> = {
          skull: { x: SKELETON_CENTER_X + 50, y: SKELETON_TOP_Y + 14 },
          ribs:  { x: SKELETON_CENTER_X + 100, y: SKELETON_TOP_Y + 110 },
          spine: { x: SKELETON_CENTER_X + 36, y: SKELETON_TOP_Y + 200 },
          arms:  { x: SKELETON_CENTER_X - 156, y: SKELETON_TOP_Y + 130 },
          legs:  { x: SKELETON_CENTER_X + 60, y: SKELETON_TOP_Y + 380 },
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
            Tap a part of the skeleton.
          </text>
        )}
      </g>

      {showSparkles && <SparkleBurst />}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MUSCLE SCENE — step 3.

function MuscleScene({
  stepIdx,
  bent,
  onToggle,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  bent: boolean
  onToggle: () => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  // Shoulder pivot for the upper arm.
  const shoulderX = 280
  const shoulderY = 200
  // Forearm rotates around the elbow when bent.
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${W} 360`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full block touch-none select-none"
          role="img"
          aria-label="An arm with a bicep muscle. Tap to bend."
        >
          <defs>
            <linearGradient id={`muscle-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={360} fill={`url(#muscle-bg-${stepIdx})`} />

          {/* Shoulder dot */}
          <circle cx={shoulderX} cy={shoulderY} r={20} fill="#fcd34d" stroke="#92400e" strokeWidth={2} />

          {/* Upper arm — fixed horizontal */}
          <g>
            <rect
              x={shoulderX}
              y={shoulderY - 20}
              width={160}
              height={40}
              fill="#fcd34d"
              stroke="#92400e"
              strokeWidth={2}
              rx={20}
            />
            {/* Bicep — sits on top of the upper arm, swells when bent */}
            <motion.ellipse
              cx={shoulderX + 70}
              cy={shoulderY - 22}
              rx={36}
              animate={{ ry: bent ? 24 : 12, cy: bent ? shoulderY - 28 : shoulderY - 22 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              fill={bent ? '#ef4444' : '#f97316'}
              stroke="#7f1d1d"
              strokeWidth={2}
            />
            <text
              x={shoulderX + 70}
              y={shoulderY - 36}
              textAnchor="middle"
              fill="#7f1d1d"
              fontSize={13}
              fontWeight={800}
              style={{ fontFamily: 'system-ui, sans-serif', pointerEvents: 'none' }}
            >
              Bicep
            </text>
          </g>

          {/* Forearm — rotates around the elbow */}
          <motion.g
            animate={{ rotate: bent ? -120 : 0 }}
            transition={{ type: 'spring', stiffness: 110, damping: 14 }}
            style={{ transformOrigin: `${shoulderX + 160}px ${shoulderY}px`, originX: '50%', originY: '50%' }}
            transform={`translate(${shoulderX + 160} ${shoulderY})`}
          >
            <rect x={0} y={-18} width={140} height={36} fill="#fcd34d" stroke="#92400e" strokeWidth={2} rx={18} />
            {/* Hand */}
            <circle cx={140} cy={0} r={20} fill="#fcd34d" stroke="#92400e" strokeWidth={2} />
            {/* Knuckles */}
            <circle cx={150} cy={-6} r={2} fill="#92400e" />
            <circle cx={150} cy={6} r={2} fill="#92400e" />
          </motion.g>

          {/* Tap target on the arm */}
          <rect
            tabIndex={isCurrent ? 0 : -1}
            x={shoulderX - 30}
            y={shoulderY - 50}
            width={460}
            height={90}
            fill="transparent"
            onPointerDown={(e) => { e.preventDefault(); onToggle() }}
            className={TOUCH_TARGET_CLASS}
            style={{ cursor: 'pointer' }}
            aria-label={bent ? 'Tap to straighten the arm' : 'Tap to bend the arm'}
          />

          {showSparkles && <SparkleBurst />}
        </svg>
      </div>

      <div className="shrink-0 bg-white border-t border-slate-200 px-4 py-3 min-h-[64px] flex items-center">
        <p className="font-ka-body text-sm text-slate-700">
          {bent ? (
            <>
              <strong className="font-ka-display font-bold">The bicep is tightening.</strong>{' '}
              When a muscle tightens, it pulls on the bone and your arm bends.
            </>
          ) : (
            <>
              <strong className="font-ka-display font-bold">The bicep is relaxed.</strong>{' '}
              Tap the arm to bend it. Watch what happens to the muscle.
            </>
          )}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// JOBS SCENE — step 4.

const JOB_BIN_TOP = 250
const JOB_BIN_HEIGHT = 200
const JOB_BIN_LAYOUT: Record<BoneJob, { x: number; w: number }> = {
  protect: { x: 40,  w: 230 },
  support: { x: 285, w: 230 },
  move:    { x: 530, w: 230 },
}
const JOB_BIN_TINT: Record<BoneJob, { fill: string; stroke: string }> = {
  protect: { fill: '#dbeafe', stroke: '#3b82f6' },
  support: { fill: '#fef3c7', stroke: '#f59e0b' },
  move:    { fill: '#bbf7d0', stroke: '#22c55e' },
}

function JobsScene({
  stepIdx,
  bins,
  onPlace,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  bins: Record<BoneKey, JobBin>
  onPlace: (bk: BoneKey, target: BoneJob) => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<BoneKey | null>(null)
  const [dragPos, setDragPos] = useState<Pt>({ x: 0, y: 0 })

  function homePosition(bk: BoneKey): Pt {
    const bin = bins[bk]
    const allKeys = Object.keys(BONE_JOB) as BoneKey[]
    if (bin === 'tray') {
      const trayItems = allKeys.filter((k) => bins[k] === 'tray')
      const idx = trayItems.findIndex((k) => k === bk)
      const trayWidth = W - 120
      const slotW = trayWidth / Math.max(trayItems.length, 1)
      return { x: 60 + slotW * idx + slotW / 2, y: 110 }
    }
    const layout = JOB_BIN_LAYOUT[bin]
    const inBin = allKeys.filter((k) => bins[k] === bin)
    const idx = inBin.findIndex((k) => k === bk)
    const slotW = layout.w / Math.max(inBin.length, 1)
    return { x: layout.x + slotW * idx + slotW / 2, y: JOB_BIN_TOP + 80 }
  }

  function startDrag(bk: BoneKey, e: React.PointerEvent<SVGElement>) {
    e.preventDefault()
    setDragging(bk)
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
    if (target !== null && BONE_JOB[dragging] === target) {
      onPlace(dragging, target)
    }
    setDragging(null)
    ;(e.currentTarget as Element).releasePointerCapture?.(e.pointerId)
  }

  function binAtPoint(p: Pt): BoneJob | null {
    if (p.y < JOB_BIN_TOP) return null
    if (p.y > JOB_BIN_TOP + JOB_BIN_HEIGHT) return null
    if (p.x >= JOB_BIN_LAYOUT.protect.x && p.x <= JOB_BIN_LAYOUT.protect.x + JOB_BIN_LAYOUT.protect.w) return 'protect'
    if (p.x >= JOB_BIN_LAYOUT.support.x && p.x <= JOB_BIN_LAYOUT.support.x + JOB_BIN_LAYOUT.support.w) return 'support'
    if (p.x >= JOB_BIN_LAYOUT.move.x    && p.x <= JOB_BIN_LAYOUT.move.x    + JOB_BIN_LAYOUT.move.w)    return 'move'
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
      aria-label="Drag each bone to its main job."
    >
      <defs>
        <linearGradient id={`jobs-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#jobs-bg-${stepIdx})`} />

      <text x={W / 2} y={36} textAnchor="middle" fill="#64748b" fontSize={14} fontWeight={700}
            style={{ fontFamily: 'system-ui, sans-serif' }}>
        Pick up a bone
      </text>

      {/* Bins */}
      {(Object.keys(JOB_BIN_LAYOUT) as BoneJob[]).map((job) => {
        const layout = JOB_BIN_LAYOUT[job]
        const tint = JOB_BIN_TINT[job]
        return (
          <g key={job}>
            <rect
              x={layout.x}
              y={JOB_BIN_TOP}
              width={layout.w}
              height={JOB_BIN_HEIGHT}
              rx={20}
              fill={tint.fill}
              stroke={tint.stroke}
              strokeWidth={2}
              strokeDasharray="6 6"
            />
            <text
              x={layout.x + layout.w / 2}
              y={JOB_BIN_TOP + 30}
              textAnchor="middle"
              fill="#1f2937"
              fontSize={20}
              fontWeight={800}
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              {JOB_LABEL[job]}
            </text>
          </g>
        )
      })}

      {/* Bones */}
      {(Object.keys(BONE_JOB) as BoneKey[]).map((bk) => {
        const isDragging = dragging === bk
        const home = homePosition(bk)
        const pos = isDragging ? dragPos : home
        return (
          <motion.g
            key={bk}
            animate={{ x: pos.x, y: pos.y }}
            transition={isDragging ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 24 }}
            style={{ cursor: 'grab' }}
          >
            <BoneIcon kind={bk} />
            <text
              y={48}
              textAnchor="middle"
              fill="#1f2937"
              fontSize={12}
              fontWeight={600}
              style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}
            >
              {BONE_LABEL[bk]}
            </text>
            <rect
              tabIndex={isCurrent ? 0 : -1}
              x={-44}
              y={-32}
              width={88}
              height={80}
              fill="transparent"
              onPointerDown={(e) => startDrag(bk, e)}
              className={TOUCH_TARGET_CLASS}
              style={{ cursor: 'grab' }}
              aria-label={`${BONE_LABEL[bk]}. Drag to its job.`}
            />
          </motion.g>
        )
      })}

      {showSparkles && <SparkleBurst />}
    </svg>
  )
}

function BoneIcon({ kind }: { kind: BoneKey }) {
  switch (kind) {
    case 'skull':
      return (
        <g>
          <ellipse cx={0} cy={0} rx={20} ry={22} fill="#fafafa" stroke="#1f2937" strokeWidth={1.5} />
          <circle cx={-7} cy={-2} r={3} fill="#1f2937" />
          <circle cx={7}  cy={-2} r={3} fill="#1f2937" />
          <line x1={-5} y1={10} x2={5} y2={10} stroke="#1f2937" strokeWidth={1.4} />
        </g>
      )
    case 'ribs':
      return (
        <g>
          <line x1={0} y1={-18} x2={0} y2={18} stroke="#1f2937" strokeWidth={3} strokeLinecap="round" />
          {[-12, -4, 4, 12].map((y, idx) => (
            <g key={idx}>
              <path d={`M 0 ${y} Q -10 ${y + 4} -16 ${y + 10}`} stroke="#1f2937" strokeWidth={2.5} fill="none" strokeLinecap="round" />
              <path d={`M 0 ${y} Q 10 ${y + 4} 16 ${y + 10}`}  stroke="#1f2937" strokeWidth={2.5} fill="none" strokeLinecap="round" />
            </g>
          ))}
        </g>
      )
    case 'spine':
      return (
        <g>
          {[-18, -9, 0, 9, 18].map((y, idx) => (
            <ellipse key={idx} cx={0} cy={y} rx={9} ry={5} fill="#fafafa" stroke="#1f2937" strokeWidth={1.5} />
          ))}
        </g>
      )
    case 'pelvis':
      return (
        <g>
          <path d="M -22 -8 L 22 -8 L 18 14 L -18 14 Z" fill="#fafafa" stroke="#1f2937" strokeWidth={1.5} />
          <ellipse cx={-10} cy={4} rx={4} ry={5} fill="#cbd5e1" />
          <ellipse cx={10}  cy={4} rx={4} ry={5} fill="#cbd5e1" />
        </g>
      )
    case 'arm':
      return (
        <g transform="rotate(-15)">
          <ellipse cx={-14} cy={0} rx={6} ry={4} fill="#fafafa" stroke="#1f2937" strokeWidth={1.5} />
          <rect x={-10} y={-4} width={20} height={8} fill="#fafafa" stroke="#1f2937" strokeWidth={1.5} rx={2} />
          <ellipse cx={14}  cy={0} rx={6} ry={4} fill="#fafafa" stroke="#1f2937" strokeWidth={1.5} />
        </g>
      )
    case 'leg':
      return (
        <g>
          <ellipse cx={0} cy={-16} rx={6} ry={4} fill="#fafafa" stroke="#1f2937" strokeWidth={1.5} />
          <rect x={-4} y={-12} width={8} height={28} fill="#fafafa" stroke="#1f2937" strokeWidth={1.5} rx={2} />
          <ellipse cx={0}  cy={18}  rx={6} ry={4} fill="#fafafa" stroke="#1f2937" strokeWidth={1.5} />
        </g>
      )
  }
}
