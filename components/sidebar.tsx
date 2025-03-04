import Link from "next/link"
import { Home, Star, PaintBucket, Calculator, Book, Twitter, Linkedin, Database } from "lucide-react"

export function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-background border-r p-6 flex flex-col">
      <Link href="/" className="text-xl font-bold mb-8">
        NM
      </Link>

      <nav className="space-y-8">
        <div>
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90">
            <Home size={16} />
            Home
          </Link>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs text-muted-foreground font-medium">FREELANCE</h2>
          <Link href="/better-things" className="flex items-center gap-2 text-sm hover:text-primary">
            <span className="font-medium">Better Things</span>
          </Link>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs text-muted-foreground font-medium">PERSONAL</h2>
          <div className="space-y-3">
            <Link href="/icon-creator" className="flex items-center gap-2 text-sm hover:text-primary">
              <Star size={16} />
              Icon Creator
            </Link>
            <Link href="/vector-paint" className="flex items-center gap-2 text-sm hover:text-primary">
              <PaintBucket size={16} />
              Vector Paint
            </Link>
            <Link href="/home-move-calculator" className="flex items-center gap-2 text-sm hover:text-primary">
              <Calculator size={16} />
              Home Move Calculator
            </Link>
            <Link href="/property-investment" className="flex items-center gap-2 text-sm hover:text-primary">
              <Database size={16} />
              Property Investment Calculator
            </Link>
            <Link href="/makeebook" className="flex items-center gap-2 text-sm hover:text-primary">
              <Book size={16} />
              makeEbook
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs text-muted-foreground font-medium">ONLINE</h2>
          <div className="space-y-3">
            <Link
              href="https://twitter.com/neilmcardle_"
              className="flex items-center gap-2 text-sm hover:text-primary"
            >
              <Twitter size={16} />X
            </Link>
            <Link
              href="https://www.linkedin.com/in/neilmcardle/"
              className="flex items-center gap-2 text-sm hover:text-primary"
            >
              <Linkedin size={16} />
              LinkedIn
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  )
}

