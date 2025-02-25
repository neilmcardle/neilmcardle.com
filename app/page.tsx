import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-4 -mt-20">
      <div className="w-full max-w-4xl mx-auto text-center space-y-8">
        {/* Top button - removed ArrowRight icon */}
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition-colors"
        >
          Neil McArdle | Digital Designer
        </Link>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Building Better Things</h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto">
          Elegant designs realised through clean, purposeful code.
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="https://www.figma.com/proto/zZcc3Li72GhWFVpv1PxC0O/%F0%9F%91%A8%F0%9F%8F%BC%E2%80%8D%F0%9F%9A%80--Neil-McArdle?page-id=7947%3A56485&node-id=7947-56486&viewport=119%2C809%2C0.29&t=9uLN4opTMa6jNFaW-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=7947%3A56486"
            className="inline-flex items-center px-6 py-3 rounded-full bg-black text-white font-medium hover:bg-gray-800 transition-colors"
          >
            View Figma Portfolio
          </Link>
          <Link
            href="https://www.linkedin.com/in/neilmcardle/"
            className="inline-flex items-center px-6 py-3 rounded-full border border-gray-200 text-gray-900 font-medium hover:bg-gray-50 transition-colors"
          >
            Connect on LinkedIn
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

