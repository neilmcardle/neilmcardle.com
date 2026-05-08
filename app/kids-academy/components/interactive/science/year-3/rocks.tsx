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
type SceneType = 'gallery' | 'sort' | 'fossil' | 'soil'
type SortBin = 'tray' | 'hard' | 'soft'

type RockKey = 'granite' | 'slate' | 'sandstone' | 'marble' | 'basalt' | 'chalk' | 'pumice'

type RockConfig = {
  key: RockKey
  name: string
  property: string
  hard: boolean
}

const ROCKS: Record<RockKey, RockConfig> = {
  granite:   { key: 'granite',   name: 'Granite',   property: 'Speckled and very hard. Used for kitchen counters.', hard: true },
  slate:     { key: 'slate',     name: 'Slate',     property: 'Splits into thin, flat pieces. Used for roofs.',      hard: true },
  sandstone: { key: 'sandstone', name: 'Sandstone', property: 'Made of tiny grains stuck together. Quite soft.',     hard: false },
  marble:    { key: 'marble',    name: 'Marble',    property: 'Smooth, swirly, polishes shiny. Used for statues.',   hard: true },
  basalt:    { key: 'basalt',    name: 'Basalt',    property: 'Very dark and dense. Made from cooled lava.',         hard: true },
  chalk:     { key: 'chalk',     name: 'Chalk',     property: 'Soft, white, crumbles in your hand.',                 hard: false },
  pumice:    { key: 'pumice',    name: 'Pumice',    property: 'Full of holes and so light it can float on water.',   hard: false },
}

const GALLERY_ROCKS: RockKey[] = ['granite', 'slate', 'sandstone', 'marble', 'basalt', 'chalk']
const SORT_ROCKS: RockKey[] = ['granite', 'basalt', 'marble', 'chalk', 'sandstone', 'pumice']

type Step = {
  key: string
  scene: SceneType
  prompt: string
  hint: string
}

const STEPS: Step[] = [
  {
    key: 'gallery',
    scene: 'gallery',
    prompt: 'Tap each rock to find out about it.',
    hint: 'Every rock has its own story.',
  },
  {
    key: 'sort',
    scene: 'sort',
    prompt: 'Sort the rocks. Hard ones one side, soft ones the other.',
    hint: 'Drag each rock into the right box.',
  },
  {
    key: 'fossil',
    scene: 'fossil',
    prompt: 'See how a fossil is made. Tap Next to watch.',
    hint: 'It happens slowly, over millions of years.',
  },
  {
    key: 'soil',
    scene: 'soil',
    prompt: 'Soil is made of layers. Tap each layer to find out.',
    hint: 'Look at what\'s on top, and what\'s deep down.',
  },
]

const FOSSIL_STAGES = [
  'A small sea creature dies and falls to the seabed.',
  'Sand and mud cover its body, layer by layer.',
  'The layers harden into rock. The creature is hidden.',
  'Then, the rock wears away and we see the fossil.',
]

const SOIL_LAYERS = [
  { key: 'litter',  label: 'Leaves and bits',     description: 'Dead leaves, twigs, and bugs at the very top.', y0: 60,  y1: 120, fill: '#4ade80' },
  { key: 'topsoil', label: 'Topsoil',              description: 'Dark, rich soil where roots grow.',             y0: 120, y1: 220, fill: '#3f1f0c' },
  { key: 'subsoil', label: 'Subsoil',              description: 'Lighter soil with bits of broken-up rock.',     y0: 220, y1: 340, fill: '#92563b' },
  { key: 'bedrock', label: 'Bedrock',              description: 'Solid rock, deep down. Soil is made from this.', y0: 340, y1: 440, fill: '#475569' },
]

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function svgPointFromEvent(svg: SVGSVGElement | null, clientX: number, clientY: number): Pt {
  if (!svg) return { x: 0, y: 0 }
  const rect = svg.getBoundingClientRect()
  return {
    x: ((clientX - rect.left) / rect.width) * W,
    y: ((clientY - rect.top) / rect.height) * H,
  }
}

export default function RocksTool({ onProgress }: ToolProps) {
  const startedAt = useRef<number>(Date.now())
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const completedRef = useRef<Set<number>>(new Set())
  const moduleCompletePlayed = useRef<boolean>(false)

  const [activeStep, setActiveStep] = useState(0)
  const [unlockedUpTo, setUnlockedUpTo] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [justCompleted, setJustCompleted] = useState<number | null>(null)

  // Step 0: Gallery — track tapped rocks.
  const [tappedRocks, setTappedRocks] = useState<Set<RockKey>>(new Set())
  const [highlightedRock, setHighlightedRock] = useState<RockKey | null>(null)

  // Step 1: Sort — track which bin each rock is in.
  const [sortBins, setSortBins] = useState<Record<RockKey, SortBin>>(() =>
    Object.fromEntries(SORT_ROCKS.map((k) => [k, 'tray'])) as Record<RockKey, SortBin>,
  )

  // Step 2: Fossil — current stage.
  const [fossilStage, setFossilStage] = useState(0)

  // Step 3: Soil — track tapped layers.
  const [revealedLayers, setRevealedLayers] = useState<Set<string>>(new Set())
  const [activeLayer, setActiveLayer] = useState<string | null>(null)

  function markStepComplete(idx: number) {
    if (completedRef.current.has(idx)) return
    completedRef.current.add(idx)
    setCompletedSteps(Array.from(completedRef.current).sort((a, b) => a - b))
    if (idx + 1 > unlockedUpTo) setUnlockedUpTo(idx + 1)
  }

  // Step 0 test: all gallery rocks tapped.
  useEffect(() => {
    if (activeStep !== 0) return
    if (tappedRocks.size >= GALLERY_ROCKS.length) markStepComplete(0)
  }, [activeStep, tappedRocks])

  // Step 1 test: all sort rocks correctly placed.
  useEffect(() => {
    if (activeStep !== 1) return
    const allCorrect = SORT_ROCKS.every((rk) => {
      const bin = sortBins[rk]
      const isHard = ROCKS[rk].hard
      return (isHard && bin === 'hard') || (!isHard && bin === 'soft')
    })
    if (allCorrect) markStepComplete(1)
  }, [activeStep, sortBins])

  // Step 2 test: reached the final fossil stage.
  useEffect(() => {
    if (activeStep !== 2) return
    if (fossilStage >= FOSSIL_STAGES.length - 1) markStepComplete(2)
  }, [activeStep, fossilStage])

  // Step 3 test: all soil layers tapped.
  useEffect(() => {
    if (activeStep !== 3) return
    if (revealedLayers.size >= SOIL_LAYERS.length) markStepComplete(3)
  }, [activeStep, revealedLayers])

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
    setTappedRocks(new Set())
    setHighlightedRock(null)
    setSortBins(Object.fromEntries(SORT_ROCKS.map((k) => [k, 'tray'])) as Record<RockKey, SortBin>)
    setFossilStage(0)
    setRevealedLayers(new Set())
    setActiveLayer(null)
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
                {step.scene === 'gallery' && (
                  <GalleryScene
                    stepIdx={i}
                    tapped={tappedRocks}
                    onTap={(k) => {
                      setTappedRocks((s) => new Set(s).add(k))
                      setHighlightedRock(k)
                    }}
                    highlightedRock={highlightedRock}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'sort' && (
                  <RockSortScene
                    stepIdx={i}
                    bins={sortBins}
                    onPlace={(k, target) => setSortBins((b) => ({ ...b, [k]: target }))}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'fossil' && (
                  <FossilScene
                    stepIdx={i}
                    stage={fossilStage}
                    onAdvance={() => setFossilStage((s) => Math.min(FOSSIL_STAGES.length - 1, s + 1))}
                    isCurrent={isCurrent}
                    showSparkles={justCompleted === i}
                  />
                )}
                {step.scene === 'soil' && (
                  <SoilScene
                    stepIdx={i}
                    revealed={revealedLayers}
                    activeLayer={activeLayer}
                    onTap={(k) => {
                      setRevealedLayers((s) => new Set(s).add(k))
                      setActiveLayer(k)
                    }}
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
                <li>Rocks come in many colours, textures, and hardness.</li>
                <li>Some rocks are hard and tough. Others are soft and crumbly.</li>
                <li>Fossils form when creatures get buried and turn to stone over millions of years.</li>
                <li>Soil is made from broken rocks mixed with dead leaves and tiny living things.</li>
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
// Rock visual — a small 80x60 graphic per rock type. Used in gallery and sort.

function RockGraphic({ rock, size = 1 }: { rock: RockKey; size?: number }) {
  const s = size
  const w = 64 * s
  const h = 44 * s
  const r = w / 2

  switch (rock) {
    case 'granite':
      return (
        <g>
          <ellipse cx={0} cy={0} rx={r} ry={h / 2} fill="#cbd5e1" stroke="#1f2937" strokeWidth={1.5} />
          {[[-10, -6, 2], [6, -8, 2.5], [-14, 6, 1.5], [12, 4, 2], [0, 8, 1.5], [-6, 0, 1.5], [10, -2, 1.5]].map(([x, y, rr], idx) => (
            <circle key={idx} cx={x as number} cy={y as number} r={rr as number} fill="#475569" opacity={0.7} />
          ))}
        </g>
      )
    case 'slate':
      return (
        <g>
          <ellipse cx={0} cy={0} rx={r} ry={h / 2} fill="#475569" stroke="#1f2937" strokeWidth={1.5} />
          {[-8, -2, 4, 10].map((y, idx) => (
            <line key={idx} x1={-r + 6} y1={y} x2={r - 6} y2={y - 4} stroke="#1f2937" strokeWidth={0.8} opacity={0.5} />
          ))}
        </g>
      )
    case 'sandstone':
      return (
        <g>
          <ellipse cx={0} cy={0} rx={r} ry={h / 2} fill="#d97706" stroke="#1f2937" strokeWidth={1.5} />
          {[-10, -4, 4, 10].map((y, idx) => (
            <line key={idx} x1={-r + 4} y1={y} x2={r - 4} y2={y + 1} stroke="#92400e" strokeWidth={1} opacity={0.6} />
          ))}
        </g>
      )
    case 'marble':
      return (
        <g>
          <ellipse cx={0} cy={0} rx={r} ry={h / 2} fill="#f8fafc" stroke="#1f2937" strokeWidth={1.5} />
          <path d="M -22 -4 Q -10 -10 0 -2 Q 12 6 22 -2" stroke="#94a3b8" strokeWidth={1.2} fill="none" opacity={0.7} />
          <path d="M -18 8 Q -8 4 4 10 Q 16 14 22 6" stroke="#cbd5e1" strokeWidth={1} fill="none" opacity={0.7} />
        </g>
      )
    case 'basalt':
      return (
        <g>
          <ellipse cx={0} cy={0} rx={r} ry={h / 2} fill="#1e293b" stroke="#0f172a" strokeWidth={1.5} />
          <ellipse cx={-6} cy={-4} rx={10} ry={4} fill="#334155" opacity={0.6} />
        </g>
      )
    case 'chalk':
      return (
        <g>
          <ellipse cx={0} cy={0} rx={r} ry={h / 2} fill="#fafaf9" stroke="#9ca3af" strokeWidth={1.5} />
          {[[-12, -3], [-4, 6], [8, -5], [14, 3], [0, -8]].map(([x, y], idx) => (
            <circle key={idx} cx={x as number} cy={y as number} r={1.2} fill="#d4d4d8" />
          ))}
        </g>
      )
    case 'pumice':
      return (
        <g>
          <ellipse cx={0} cy={0} rx={r} ry={h / 2} fill="#e7e5e4" stroke="#1f2937" strokeWidth={1.5} />
          {[[-10, -4], [-2, 4], [8, -2], [12, 6], [4, -8], [-14, 2], [16, 0], [-4, -2]].map(([x, y], idx) => (
            <circle key={idx} cx={x as number} cy={y as number} r={1.6} fill="#78716c" />
          ))}
        </g>
      )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GALLERY SCENE — step 0.

function GalleryScene({
  stepIdx,
  tapped,
  onTap,
  highlightedRock,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  tapped: Set<RockKey>
  onTap: (k: RockKey) => void
  highlightedRock: RockKey | null
  isCurrent: boolean
  showSparkles: boolean
}) {
  // 6 rocks in a 3x2 grid.
  const cols = 3
  const cellW = 220
  const cellH = 130
  const gridW = cols * cellW
  const gridX0 = (W - gridW) / 2 + cellW / 2
  const gridY0 = 90

  const positions = GALLERY_ROCKS.map((rk, idx) => {
    const col = idx % cols
    const row = Math.floor(idx / cols)
    return { rk, x: gridX0 + col * cellW, y: gridY0 + row * cellH }
  })

  const highlighted = highlightedRock ? ROCKS[highlightedRock] : null

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block touch-none select-none"
      role="img"
      aria-label="A gallery of six rocks. Tap each to learn about it."
    >
      <defs>
        <linearGradient id={`gallery-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#gallery-bg-${stepIdx})`} />

      {positions.map(({ rk, x, y }) => {
        const isTapped = tapped.has(rk)
        const isActive = highlightedRock === rk
        return (
          <g key={rk} transform={`translate(${x}, ${y})`}>
            {isTapped && (
              <circle cx={0} cy={0} r={48} fill="none" stroke="#22c55e" strokeWidth={2.5} opacity={isActive ? 0.9 : 0.45} />
            )}
            <RockGraphic rock={rk} size={1.2} />
            <text
              y={50}
              textAnchor="middle"
              fill={isTapped ? '#1f2937' : '#64748b'}
              fontSize={14}
              fontWeight={700}
              style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}
            >
              {ROCKS[rk].name}
            </text>
            <circle
              tabIndex={isCurrent ? 0 : -1}
              cx={0}
              cy={5}
              r={56}
              fill="transparent"
              onPointerDown={(e) => {
                e.preventDefault()
                onTap(rk)
              }}
              className={TOUCH_TARGET_CLASS}
              style={{ cursor: 'pointer' }}
              aria-label={`${ROCKS[rk].name}. Tap to learn.`}
            />
          </g>
        )
      })}

      {/* Info card at the bottom. */}
      <g>
        <rect x={60} y={H - 90} width={W - 120} height={70} rx={14} fill="white" stroke="#cbd5e1" strokeWidth={1.5} />
        {highlighted ? (
          <>
            <text x={W / 2} y={H - 60} textAnchor="middle" fill="#1f2937" fontSize={18} fontWeight={800}
                  style={{ fontFamily: 'system-ui, sans-serif' }}>
              {highlighted.name}
            </text>
            <text x={W / 2} y={H - 36} textAnchor="middle" fill="#475569" fontSize={14}
                  style={{ fontFamily: 'system-ui, sans-serif' }}>
              {highlighted.property}
            </text>
          </>
        ) : (
          <text x={W / 2} y={H - 50} textAnchor="middle" fill="#94a3b8" fontSize={14} fontStyle="italic"
                style={{ fontFamily: 'system-ui, sans-serif' }}>
            Tap a rock to read about it.
          </text>
        )}
      </g>

      {showSparkles && <SparkleBurst />}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SORT SCENE — step 1.

const SORT_BIN_TOP = 240
const SORT_BIN_HEIGHT = 200
const SORT_BIN_LAYOUT: Record<Exclude<SortBin, 'tray'>, { x: number; w: number; label: string }> = {
  hard: { x: 60,  w: 320, label: 'Hard rocks' },
  soft: { x: 420, w: 320, label: 'Soft rocks' },
}

function RockSortScene({
  stepIdx,
  bins,
  onPlace,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  bins: Record<RockKey, SortBin>
  onPlace: (k: RockKey, target: SortBin) => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<RockKey | null>(null)
  const [dragPos, setDragPos] = useState<Pt>({ x: 0, y: 0 })

  function homePosition(rk: RockKey): Pt {
    const bin = bins[rk]
    if (bin === 'tray') {
      const trayItems = SORT_ROCKS.filter((k) => bins[k] === 'tray')
      const idx = trayItems.findIndex((k) => k === rk)
      const trayWidth = W - 120
      const slotW = trayWidth / Math.max(trayItems.length, 1)
      return { x: 60 + slotW * idx + slotW / 2, y: 100 }
    }
    const layout = SORT_BIN_LAYOUT[bin]
    const inBin = SORT_ROCKS.filter((k) => bins[k] === bin)
    const idx = inBin.findIndex((k) => k === rk)
    const slotW = layout.w / Math.max(inBin.length, 1)
    return { x: layout.x + slotW * idx + slotW / 2, y: SORT_BIN_TOP + 70 }
  }

  function startDrag(rk: RockKey, e: React.PointerEvent<SVGElement>) {
    e.preventDefault()
    setDragging(rk)
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
      const isHard = ROCKS[dragging].hard
      const correct = (isHard && target === 'hard') || (!isHard && target === 'soft')
      if (correct) onPlace(dragging, target)
    }
    setDragging(null)
    ;(e.currentTarget as Element).releasePointerCapture?.(e.pointerId)
  }

  function binAtPoint(p: Pt): Exclude<SortBin, 'tray'> | null {
    if (p.y < SORT_BIN_TOP) return null
    if (p.y > SORT_BIN_TOP + SORT_BIN_HEIGHT) return null
    if (p.x >= SORT_BIN_LAYOUT.hard.x && p.x <= SORT_BIN_LAYOUT.hard.x + SORT_BIN_LAYOUT.hard.w) return 'hard'
    if (p.x >= SORT_BIN_LAYOUT.soft.x && p.x <= SORT_BIN_LAYOUT.soft.x + SORT_BIN_LAYOUT.soft.w) return 'soft'
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
      aria-label="Drag each rock into the right box."
    >
      <defs>
        <linearGradient id={`rsort-bg-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#rsort-bg-${stepIdx})`} />

      <text x={W / 2} y={36} textAnchor="middle" fill="#64748b" fontSize={14} fontWeight={700}
            style={{ fontFamily: 'system-ui, sans-serif' }}>
        Pick up a rock
      </text>

      {(Object.keys(SORT_BIN_LAYOUT) as Array<Exclude<SortBin, 'tray'>>).map((binKey) => {
        const layout = SORT_BIN_LAYOUT[binKey]
        const isHard = binKey === 'hard'
        const fill = isHard ? '#dbeafe' : '#fef3c7'
        const stroke = isHard ? '#3b82f6' : '#f59e0b'
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

      {SORT_ROCKS.map((rk) => {
        const isDragging = dragging === rk
        const home = homePosition(rk)
        const pos = isDragging ? dragPos : home
        return (
          <motion.g
            key={rk}
            animate={{ x: pos.x, y: pos.y }}
            transition={isDragging ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 24 }}
            style={{ cursor: 'grab' }}
          >
            <RockGraphic rock={rk} size={1.1} />
            <text
              y={42}
              textAnchor="middle"
              fill="#1f2937"
              fontSize={12}
              fontWeight={600}
              style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}
            >
              {ROCKS[rk].name}
            </text>
            <rect
              tabIndex={isCurrent ? 0 : -1}
              x={-44}
              y={-32}
              width={88}
              height={80}
              fill="transparent"
              onPointerDown={(e) => startDrag(rk, e)}
              className={TOUCH_TARGET_CLASS}
              style={{ cursor: 'grab' }}
              aria-label={`${ROCKS[rk].name}. Drag into the right box.`}
            />
          </motion.g>
        )
      })}

      {showSparkles && <SparkleBurst />}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FOSSIL SCENE — step 2.

function FossilScene({
  stepIdx,
  stage,
  onAdvance,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  stage: number
  onAdvance: () => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const isLastStage = stage >= FOSSIL_STAGES.length - 1

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${W} ${H - 90}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full block touch-none select-none"
          role="img"
          aria-label="A fossil forming over millions of years."
        >
          <defs>
            <linearGradient id={`fossil-water-${stepIdx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>

          {/* Stage 0: alive on seabed */}
          {stage === 0 && (
            <>
              <rect x={0} y={0} width={W} height={H - 200} fill={`url(#fossil-water-${stepIdx})`} />
              <rect x={0} y={H - 200} width={W} height={120} fill="#fde68a" />
              <FishCreature x={W / 2} y={H - 220} alive />
            </>
          )}

          {/* Stage 1: getting buried */}
          {stage === 1 && (
            <>
              <rect x={0} y={0} width={W} height={H - 240} fill={`url(#fossil-water-${stepIdx})`} />
              <rect x={0} y={H - 240} width={W} height={160} fill="#fde68a" />
              <rect x={0} y={H - 200} width={W} height={120} fill="#facc15" opacity={0.7} />
              <FishCreature x={W / 2} y={H - 200} buried />
            </>
          )}

          {/* Stage 2: hidden in rock layers */}
          {stage === 2 && (
            <>
              <rect x={0} y={0} width={W} height={H - 90} fill="#a16207" />
              <rect x={0} y={70}  width={W} height={28} fill="#78350f" opacity={0.6} />
              <rect x={0} y={150} width={W} height={20} fill="#78350f" opacity={0.5} />
              <rect x={0} y={210} width={W} height={24} fill="#78350f" opacity={0.7} />
              <rect x={0} y={270} width={W} height={18} fill="#78350f" opacity={0.4} />
              <text x={W / 2} y={48} textAnchor="middle" fill="white" fontSize={16} fontWeight={700} opacity={0.85}
                    style={{ fontFamily: 'system-ui, sans-serif' }}>
                Time passes…
              </text>
            </>
          )}

          {/* Stage 3: fossil revealed */}
          {stage === 3 && (
            <>
              <rect x={0} y={0} width={W} height={H - 90} fill="#a16207" />
              <rect x={0} y={70}  width={W} height={28} fill="#78350f" opacity={0.6} />
              <rect x={0} y={150} width={W} height={20} fill="#78350f" opacity={0.5} />
              <rect x={0} y={210} width={W} height={24} fill="#78350f" opacity={0.7} />
              <FishCreature x={W / 2} y={(H - 90) / 2 + 40} fossil />
            </>
          )}
        </svg>
      </div>

      {/* Caption + advance */}
      <div className="shrink-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
        <p className="font-ka-body text-sm text-slate-700 flex-1">
          {FOSSIL_STAGES[stage]}
        </p>
        <button
          type="button"
          onClick={onAdvance}
          disabled={isLastStage || !isCurrent}
          className={`shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-full font-ka-display font-semibold text-sm transition focus-visible:outline-2 focus-visible:outline-ka-brand-500 ${
            isLastStage
              ? 'bg-ka-year3-light text-green-900 cursor-default'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {isLastStage ? 'All done' : 'Next'}
          {!isLastStage && <ArrowRight size={14} strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  )
}

function FishCreature({ x, y, alive, buried, fossil }: {
  x: number
  y: number
  alive?: boolean
  buried?: boolean
  fossil?: boolean
}) {
  const bodyFill = fossil ? '#fef3c7' : alive ? '#fb7185' : '#f59e0b'
  const stroke = fossil ? '#78350f' : '#1f2937'
  return (
    <g transform={`translate(${x}, ${y})`} opacity={buried ? 0.5 : 1}>
      <ellipse cx={0} cy={0} rx={50} ry={20} fill={bodyFill} stroke={stroke} strokeWidth={2} />
      <path d={`M 50 0 L 70 -16 L 70 16 Z`} fill={bodyFill} stroke={stroke} strokeWidth={2} />
      {!fossil && <circle cx={-20} cy={-4} r={3} fill="#1f2937" />}
      {fossil && (
        <>
          <circle cx={-20} cy={-4} r={3} fill="none" stroke={stroke} strokeWidth={1.5} />
          {[-30, -14, 0, 14, 28].map((rx, idx) => (
            <line key={idx} x1={rx} y1={-15} x2={rx} y2={15} stroke={stroke} strokeWidth={1.2} opacity={0.65} />
          ))}
        </>
      )}
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SOIL SCENE — step 3.

function SoilScene({
  stepIdx,
  revealed,
  activeLayer,
  onTap,
  isCurrent,
  showSparkles,
}: {
  stepIdx: number
  revealed: Set<string>
  activeLayer: string | null
  onTap: (k: string) => void
  isCurrent: boolean
  showSparkles: boolean
}) {
  const active = activeLayer ? SOIL_LAYERS.find((l) => l.key === activeLayer) : null

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${W} ${H - 90}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full block touch-none select-none"
          role="img"
          aria-label="A cross-section of soil. Tap each layer."
        >
          <rect x={0} y={0} width={W} height={H - 90} fill="#e0f2fe" />

          {SOIL_LAYERS.map((layer) => {
            const isRevealed = revealed.has(layer.key)
            const isActive = activeLayer === layer.key
            const yMid = (layer.y0 + layer.y1) / 2
            return (
              <g key={layer.key}>
                <rect x={120} y={layer.y0} width={W - 240} height={layer.y1 - layer.y0} fill={layer.fill} stroke="#1f2937" strokeWidth={1} />

                {/* Decorative bits in each layer. */}
                {layer.key === 'litter' && (
                  <>
                    <ellipse cx={220} cy={yMid - 10} rx={14} ry={4} fill="#b45309" />
                    <ellipse cx={300} cy={yMid + 4}  rx={10} ry={3} fill="#65a30d" />
                    <ellipse cx={400} cy={yMid - 6}  rx={12} ry={4} fill="#b45309" />
                    <ellipse cx={500} cy={yMid + 6}  rx={10} ry={3} fill="#a16207" />
                    <ellipse cx={580} cy={yMid - 4}  rx={12} ry={4} fill="#65a30d" />
                  </>
                )}
                {layer.key === 'topsoil' && (
                  <>
                    <path d="M 240 168 q 6 -10 14 0 q 6 10 14 0" stroke="#fef3c7" strokeWidth={2.5} fill="none" />
                    <path d="M 420 178 q 6 -10 14 0 q 6 10 14 0" stroke="#fef3c7" strokeWidth={2.5} fill="none" />
                    <path d="M 520 162 q 6 -10 14 0 q 6 10 14 0" stroke="#fef3c7" strokeWidth={2.5} fill="none" />
                  </>
                )}
                {layer.key === 'subsoil' && (
                  <>
                    {[[200, 250], [320, 290], [440, 260], [540, 300], [600, 280]].map(([cx, cy], idx) => (
                      <ellipse key={idx} cx={cx} cy={cy} rx={10} ry={6} fill="#64748b" stroke="#1f2937" strokeWidth={1} />
                    ))}
                  </>
                )}
                {layer.key === 'bedrock' && (
                  <>
                    <line x1={120} y1={layer.y0 + 14} x2={W - 120} y2={layer.y0 + 14} stroke="#1f2937" strokeWidth={0.6} opacity={0.4} />
                    <line x1={120} y1={layer.y0 + 32} x2={W - 120} y2={layer.y0 + 32} stroke="#1f2937" strokeWidth={0.6} opacity={0.4} />
                    <line x1={120} y1={layer.y0 + 56} x2={W - 120} y2={layer.y0 + 56} stroke="#1f2937" strokeWidth={0.6} opacity={0.4} />
                  </>
                )}

                {/* Whole-layer tap target — sits above decorations so taps anywhere on the
                    layer trigger reveal, not just on the "?" button. */}
                <rect
                  tabIndex={isCurrent ? 0 : -1}
                  x={120}
                  y={layer.y0}
                  width={W - 240}
                  height={layer.y1 - layer.y0}
                  fill="transparent"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    onTap(layer.key)
                  }}
                  className={TOUCH_TARGET_CLASS}
                  style={{ cursor: 'pointer' }}
                  aria-label={`${isRevealed ? layer.label : 'Soil layer'}. Tap to learn about it.`}
                />

                {/* Question button — visual hint, also tappable for redundancy. Not in the
                    keyboard tab order (the layer rect handles that). */}
                <g transform={`translate(${W - 90}, ${yMid})`}>
                  {!isRevealed ? (
                    <>
                      <circle cx={0} cy={0} r={20} fill="white" stroke="#1f2937" strokeWidth={2} />
                      <text x={0} y={6} textAnchor="middle" fill="#1f2937" fontSize={20} fontWeight={800}
                            style={{ fontFamily: 'system-ui, sans-serif', pointerEvents: 'none' }}>
                        ?
                      </text>
                    </>
                  ) : (
                    <>
                      <circle cx={0} cy={0} r={20} fill={isActive ? '#22c55e' : '#bbf7d0'} stroke="#15803d" strokeWidth={2} />
                      <path d="M -7 0 L -2 5 L 8 -5" stroke={isActive ? 'white' : '#15803d'} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
                    </>
                  )}
                  <circle
                    tabIndex={-1}
                    cx={0}
                    cy={0}
                    r={28}
                    fill="transparent"
                    onPointerDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onTap(layer.key)
                    }}
                    className={TOUCH_TARGET_CLASS}
                    style={{ cursor: 'pointer' }}
                    aria-hidden="true"
                  />
                </g>

                {/* Inline label once revealed — pointer-events:none so it doesn't block taps. */}
                {isRevealed && (
                  <text
                    x={140}
                    y={yMid + 5}
                    fill={layer.key === 'topsoil' || layer.key === 'bedrock' ? 'white' : '#1f2937'}
                    fontSize={16}
                    fontWeight={800}
                    style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none', pointerEvents: 'none' }}
                  >
                    {layer.label}
                  </text>
                )}
              </g>
            )
          })}

          {showSparkles && <SparkleBurst />}
        </svg>
      </div>

      <div className="shrink-0 bg-white border-t border-slate-200 px-4 py-3 min-h-[56px] flex items-center">
        {active ? (
          <p className="font-ka-body text-sm text-slate-700">
            <strong className="font-ka-display font-bold">{active.label}.</strong>{' '}
            {active.description}
          </p>
        ) : (
          <p className="font-ka-body text-sm text-slate-500 italic">
            Tap a question mark on each layer.
          </p>
        )}
      </div>
    </div>
  )
}
