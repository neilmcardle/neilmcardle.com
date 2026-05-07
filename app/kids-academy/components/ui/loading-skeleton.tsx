type Variant = 'tool' | 'card' | 'card-grid'

type Props = {
  variant?: Variant
  className?: string
}

const SHIMMER = 'animate-pulse bg-slate-100 rounded-2xl'

export function LoadingSkeleton({ variant = 'tool', className = '' }: Props) {
  if (variant === 'card') {
    return <div className={`${SHIMMER} h-44 ${className}`} aria-hidden="true" />
  }

  if (variant === 'card-grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`${SHIMMER} h-44`} aria-hidden="true" />
        ))}
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`} aria-hidden="true">
      <div className={`${SHIMMER} h-8 w-2/3`} />
      <div className={`${SHIMMER} h-4 w-1/2`} />
      <div className={`${SHIMMER} h-[60vh]`} />
    </div>
  )
}
