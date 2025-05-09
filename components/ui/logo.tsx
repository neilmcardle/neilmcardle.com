import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <div className="relative h-10 w-10 mr-3">
        {/* Square outline logo - updated to be transparent inside */}
        <svg
          viewBox="0 0 73.68 73.68"
          className="h-full w-full text-gold"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
        >
          <rect x="4" y="4" width="65.68" height="65.68" />
        </svg>
      </div>

      <div className="flex flex-col">
        {/* Static logo text - no hover effects */}
        <div className="text-xl font-medium tracking-wider">
          <span className="text-white">BETTER</span>
          <span className="text-gold">THINGS</span>
        </div>
      </div>
    </Link>
  )
}
