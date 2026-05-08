import type { Subject } from '@/app/kids-academy/types/curriculum'
import { Beaker, BookOpen, Calculator, Globe2, Landmark } from 'lucide-react'

const COVER_ASPECT = 'aspect-[2/1]'

type Props = {
  topicId: string
  subject: Subject
  className?: string
}

export function ToolCover({ topicId, subject, className = '' }: Props) {
  let inner: React.ReactNode = <FallbackCover subject={subject} />
  switch (topicId) {
    case 'y3-science-light':
      inner = <LightCover />
      break
    case 'y3-science-forces':
      inner = <ForcesCover />
      break
    case 'y3-science-rocks':
      inner = <RocksCover />
      break
    case 'y3-science-plants':
      inner = <PlantsCover />
      break
    case 'y3-science-animals':
      inner = <AnimalsCover />
      break
    case 'y3-maths-times-tables':
      inner = <TimesTablesCover />
      break
    case 'y3-maths-fractions':
      inner = <FractionsCover />
      break
  }

  return (
    <div className={`relative ${COVER_ASPECT} overflow-hidden ${className}`}>
      {inner}
    </div>
  )
}

const FALLBACK_BY_SUBJECT: Record<Subject, { from: string; to: string; Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> }> = {
  science:   { from: '#e0f2fe', to: '#bae6fd', Icon: Beaker },
  maths:     { from: '#fef3c7', to: '#fde68a', Icon: Calculator },
  english:   { from: '#fce7f3', to: '#fbcfe8', Icon: BookOpen },
  history:   { from: '#ede9fe', to: '#ddd6fe', Icon: Landmark },
  geography: { from: '#d1fae5', to: '#a7f3d0', Icon: Globe2 },
}

function FallbackCover({ subject }: { subject: Subject }) {
  const cfg = FALLBACK_BY_SUBJECT[subject]
  const { Icon } = cfg
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${cfg.from} 0%, ${cfg.to} 100%)` }}
    >
      <Icon size={56} strokeWidth={1.6} className="text-slate-400/70" />
    </div>
  )
}

function LightCover() {
  return (
    <svg viewBox="0 0 280 140" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="cov-light-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id="cov-light-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#86efac" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
        <radialGradient id="cov-light-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#fef3c7" />
          <stop offset="60%"  stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={280} height={108} fill="url(#cov-light-sky)" />
      <rect x={0} y={108} width={280} height={32} fill="url(#cov-light-ground)" />

      {/* Tree */}
      <g transform="translate(180, 70)">
        <rect x={-3} y={6} width={6} height={32} fill="#92400e" rx={1} />
        <circle cx={-9} cy={4} r={11} fill="#15803d" />
        <circle cx={9} cy={4} r={11} fill="#15803d" />
        <circle cx={0} cy={-4} r={14} fill="#16a34a" />
      </g>

      {/* Shadow */}
      <ellipse cx={150} cy={114} rx={42} ry={5} fill="rgba(15, 23, 42, 0.4)" />

      {/* Sun with rays */}
      <g transform="translate(60, 38)">
        {Array.from({ length: 8 }).map((_, k) => {
          const a = (k / 8) * Math.PI * 2
          return (
            <line
              key={k}
              x1={Math.cos(a) * 18}
              y1={Math.sin(a) * 18}
              x2={Math.cos(a) * 26}
              y2={Math.sin(a) * 26}
              stroke="#f59e0b"
              strokeWidth={2.5}
              strokeLinecap="round"
              opacity={0.85}
            />
          )
        })}
        <circle cx={0} cy={0} r={14} fill="url(#cov-light-sun)" stroke="#f59e0b" strokeWidth={1.5} />
      </g>
    </svg>
  )
}

function ForcesCover() {
  return (
    <svg viewBox="0 0 280 140" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="cov-forces-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={280} height={140} fill="url(#cov-forces-bg)" />

      {/* Magnet A — NS, slightly tilted up-left */}
      <g transform="translate(80, 60) rotate(-8)">
        <BarMagnetMini polarity="NS" idPrefix="cov-forces-a" />
      </g>

      {/* Magnet B — SN, slightly tilted up-right */}
      <g transform="translate(200, 80) rotate(8)">
        <BarMagnetMini polarity="SN" idPrefix="cov-forces-b" />
      </g>

      {/* Field arc between them suggesting interaction */}
      <path
        d="M 110 60 Q 140 20 170 60"
        stroke="#ef4444"
        strokeWidth={1.8}
        strokeDasharray="3 4"
        fill="none"
        opacity={0.65}
      />
    </svg>
  )
}

function BarMagnetMini({ polarity, idPrefix }: { polarity: 'NS' | 'SN'; idPrefix: string }) {
  const w = 80
  const h = 26
  const leftLetter = polarity[0] as 'N' | 'S'
  const rightLetter = polarity[1] as 'N' | 'S'
  const leftFill = leftLetter === 'N' ? '#dc2626' : '#2563eb'
  const rightFill = rightLetter === 'N' ? '#dc2626' : '#2563eb'
  return (
    <g transform={`translate(${-w / 2}, ${-h / 2})`}>
      <defs>
        <clipPath id={`${idPrefix}-clip`}>
          <rect x={0} y={0} width={w} height={h} rx={7} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${idPrefix}-clip)`}>
        <rect x={0} y={0} width={w / 2} height={h} fill={leftFill} />
        <rect x={w / 2} y={0} width={w / 2} height={h} fill={rightFill} />
      </g>
      <rect x={0} y={0} width={w} height={h} rx={7} fill="none" stroke="#1f2937" strokeWidth={1.5} />
      <text x={w / 4} y={h / 2 + 4} textAnchor="middle" fill="white" fontSize={12} fontWeight={800}
            style={{ fontFamily: 'system-ui, sans-serif' }}>
        {leftLetter}
      </text>
      <text x={(3 * w) / 4} y={h / 2 + 4} textAnchor="middle" fill="white" fontSize={12} fontWeight={800}
            style={{ fontFamily: 'system-ui, sans-serif' }}>
        {rightLetter}
      </text>
    </g>
  )
}

function RocksCover() {
  return (
    <svg viewBox="0 0 280 140" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="cov-rocks-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={280} height={140} fill="url(#cov-rocks-bg)" />
      {/* Ground line */}
      <line x1={20} y1={108} x2={260} y2={108} stroke="#a16207" strokeWidth={1.2} opacity={0.4} />

      {/* Granite */}
      <g transform="translate(70, 88)">
        <ellipse cx={0} cy={0} rx={32} ry={20} fill="#cbd5e1" stroke="#1f2937" strokeWidth={1.5} />
        {[[-12, -4, 2], [6, -7, 2.5], [-14, 6, 1.6], [12, 4, 2], [0, 8, 1.5]].map(([x, y, r], idx) => (
          <circle key={idx} cx={x as number} cy={y as number} r={r as number} fill="#475569" opacity={0.7} />
        ))}
      </g>

      {/* Marble (centre, slightly raised) */}
      <g transform="translate(150, 78)">
        <ellipse cx={0} cy={0} rx={36} ry={24} fill="#f8fafc" stroke="#1f2937" strokeWidth={1.5} />
        <path d="M -22 -4 Q -10 -12 0 -2 Q 12 8 22 -2" stroke="#94a3b8" strokeWidth={1.4} fill="none" opacity={0.7} />
        <path d="M -18 10 Q -8 4 4 12 Q 16 16 22 8" stroke="#cbd5e1" strokeWidth={1.2} fill="none" opacity={0.7} />
      </g>

      {/* Basalt */}
      <g transform="translate(220, 92)">
        <ellipse cx={0} cy={0} rx={28} ry={17} fill="#1e293b" stroke="#0f172a" strokeWidth={1.5} />
        <ellipse cx={-6} cy={-3} rx={9} ry={3} fill="#334155" opacity={0.6} />
      </g>
    </svg>
  )
}

function FractionsCover() {
  // Inline pie wedge helper so the cover stays self-contained.
  const pie = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
    const sr = ((startDeg - 90) * Math.PI) / 180
    const er = ((endDeg - 90) * Math.PI) / 180
    const x1 = cx + r * Math.cos(sr)
    const y1 = cy + r * Math.sin(sr)
    const x2 = cx + r * Math.cos(er)
    const y2 = cy + r * Math.sin(er)
    const large = endDeg - startDeg > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
  }
  return (
    <svg viewBox="0 0 280 140" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="cov-frac-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={280} height={140} fill="url(#cov-frac-bg)" />

      {/* Half circle */}
      <g transform="translate(70, 70)">
        <path d={pie(0, 0, 32, 0, 180)}   fill="#22c55e" stroke="#1f2937" strokeWidth={2} />
        <path d={pie(0, 0, 32, 180, 360)} fill="white"   stroke="#1f2937" strokeWidth={2} />
        <text x={0} y={62} textAnchor="middle" fill="#1f2937" fontSize={18} fontWeight={900}
              style={{ fontFamily: 'system-ui, sans-serif' }}>
          1/2
        </text>
      </g>

      {/* Three-quarters circle */}
      <g transform="translate(150, 70)">
        <path d={pie(0, 0, 32, 0, 90)}   fill="#22c55e" stroke="#1f2937" strokeWidth={2} />
        <path d={pie(0, 0, 32, 90, 180)} fill="#22c55e" stroke="#1f2937" strokeWidth={2} />
        <path d={pie(0, 0, 32, 180, 270)} fill="#22c55e" stroke="#1f2937" strokeWidth={2} />
        <path d={pie(0, 0, 32, 270, 360)} fill="white"   stroke="#1f2937" strokeWidth={2} />
        <text x={0} y={62} textAnchor="middle" fill="#1f2937" fontSize={18} fontWeight={900}
              style={{ fontFamily: 'system-ui, sans-serif' }}>
          3/4
        </text>
      </g>

      {/* Third circle */}
      <g transform="translate(230, 70)">
        <path d={pie(0, 0, 32, 0, 120)}   fill="#22c55e" stroke="#1f2937" strokeWidth={2} />
        <path d={pie(0, 0, 32, 120, 240)} fill="white"   stroke="#1f2937" strokeWidth={2} />
        <path d={pie(0, 0, 32, 240, 360)} fill="white"   stroke="#1f2937" strokeWidth={2} />
        <text x={0} y={62} textAnchor="middle" fill="#1f2937" fontSize={18} fontWeight={900}
              style={{ fontFamily: 'system-ui, sans-serif' }}>
          1/3
        </text>
      </g>
    </svg>
  )
}

function TimesTablesCover() {
  return (
    <svg viewBox="0 0 280 140" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="cov-times-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={280} height={140} fill="url(#cov-times-bg)" />

      {/* Big multiplication on the left */}
      <text x={75} y={80} textAnchor="middle" fill="#7c2d12" fontSize={36} fontWeight={900}
            style={{ fontFamily: 'system-ui, sans-serif' }}>
        3 × 4
      </text>
      <text x={75} y={108} textAnchor="middle" fill="#92400e" fontSize={20} fontWeight={800}
            style={{ fontFamily: 'system-ui, sans-serif' }}>
        = 12
      </text>

      {/* Array of 12 dots on the right (3 rows × 4 cols) */}
      {Array.from({ length: 3 }).map((_, r) =>
        Array.from({ length: 4 }).map((_, c) => (
          <circle
            key={`${r}-${c}`}
            cx={170 + c * 24}
            cy={50 + r * 24}
            r={8}
            fill="#ef4444"
            stroke="#7f1d1d"
            strokeWidth={1.5}
          />
        )),
      )}
    </svg>
  )
}

function AnimalsCover() {
  return (
    <svg viewBox="0 0 280 140" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="cov-animals-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={280} height={140} fill="url(#cov-animals-bg)" />

      {/* Skull on the left */}
      <g transform="translate(80, 70)">
        <ellipse cx={0} cy={0} rx={32} ry={36} fill="#fafafa" stroke="#1f2937" strokeWidth={2} />
        <circle cx={-10} cy={-2} r={4} fill="#1f2937" />
        <circle cx={10}  cy={-2} r={4} fill="#1f2937" />
        <line x1={-7} y1={18} x2={7} y2={18} stroke="#1f2937" strokeWidth={1.5} />
        <line x1={-5} y1={24} x2={5} y2={24} stroke="#1f2937" strokeWidth={1.5} />
      </g>

      {/* Apple on the right */}
      <g transform="translate(180, 75)">
        <circle cx={0} cy={0} r={26} fill="#ef4444" stroke="#7f1d1d" strokeWidth={2} />
        <path d="M -6 -22 Q 0 -28 8 -22" stroke="#7f1d1d" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <ellipse cx={6} cy={-26} rx={6} ry={3} fill="#16a34a" stroke="#15803d" strokeWidth={1.5} transform="rotate(20 6 -26)" />
        <ellipse cx={-8} cy={-9} rx={5} ry={3} fill="#fca5a5" opacity={0.7} />
      </g>

      {/* Bones around the bottom */}
      <g transform="translate(140, 122)">
        <rect x={-22} y={-3} width={44} height={6} fill="#fafafa" stroke="#1f2937" strokeWidth={1.5} rx={3} />
        <circle cx={-22} cy={0} r={5} fill="#fafafa" stroke="#1f2937" strokeWidth={1.5} />
        <circle cx={22}  cy={0} r={5} fill="#fafafa" stroke="#1f2937" strokeWidth={1.5} />
      </g>
    </svg>
  )
}

function PlantsCover() {
  return (
    <svg viewBox="0 0 280 140" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="cov-plants-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
        <linearGradient id="cov-plants-soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={280} height={104} fill="url(#cov-plants-sky)" />
      <rect x={0} y={104} width={280} height={36} fill="url(#cov-plants-soil)" />

      {/* Sun */}
      <circle cx={42} cy={32} r={14} fill="#fcd34d" stroke="#f59e0b" strokeWidth={1.5} />

      {/* Stem */}
      <path d="M 140 110 L 140 60" stroke="#16a34a" strokeWidth={4} strokeLinecap="round" fill="none" />

      {/* Leaves */}
      <ellipse cx={120} cy={84} rx={14} ry={6} fill="#22c55e" stroke="#15803d" strokeWidth={1} transform="rotate(-25 120 84)" />
      <ellipse cx={160} cy={74} rx={14} ry={6} fill="#22c55e" stroke="#15803d" strokeWidth={1} transform="rotate(25 160 74)" />

      {/* Flower */}
      <g transform="translate(140, 50)">
        {[0, 1, 2, 3, 4].map((k) => {
          const a = (k / 5) * Math.PI * 2 - Math.PI / 2
          const x = Math.cos(a) * 11
          const y = Math.sin(a) * 11
          return <circle key={k} cx={x} cy={y} r={9} fill="#f9a8d4" stroke="#db2777" strokeWidth={1} />
        })}
        <circle cx={0} cy={0} r={6} fill="#fbbf24" stroke="#d97706" strokeWidth={1} />
      </g>

      {/* Roots */}
      <path d="M 140 110 Q 130 122 120 134" stroke="#451a03" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M 140 110 L 140 138" stroke="#451a03" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M 140 110 Q 150 122 160 134" stroke="#451a03" strokeWidth={2} fill="none" strokeLinecap="round" />

      {/* Bee hint */}
      <g transform="translate(212, 56)">
        <ellipse cx={0} cy={0} rx={10} ry={6} fill="#fbbf24" stroke="#1f2937" strokeWidth={1} />
        <line x1={-4} y1={-6} x2={-4} y2={6} stroke="#1f2937" strokeWidth={1.5} />
        <line x1={3}  y1={-6} x2={3}  y2={6} stroke="#1f2937" strokeWidth={1.5} />
        <ellipse cx={-4} cy={-6} rx={6} ry={3} fill="white" opacity={0.85} />
        <ellipse cx={4}  cy={-6} rx={6} ry={3} fill="white" opacity={0.85} />
      </g>
    </svg>
  )
}
