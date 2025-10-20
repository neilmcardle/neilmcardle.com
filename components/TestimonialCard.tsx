import Image from "next/image"
import { Quote } from "lucide-react"

interface TestimonialCardProps {
  quote: string
  author: string
  role?: string
  company?: string
  avatarUrl?: string
}

export function TestimonialCard({ quote, author, role, company, avatarUrl }: TestimonialCardProps) {
  return (
    <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 shadow-sm">
      <Quote className="h-6 w-6 text-blue-400 mb-3" />
      <p className="text-sm text-gray-700 italic mb-4">{quote}</p>
      <div className="flex items-center">
        {avatarUrl && (
          <div className="mr-3 relative w-10 h-10 rounded-full overflow-hidden">
            <Image src={avatarUrl || "/placeholder.svg"} alt={author} fill className="object-cover" />
          </div>
        )}
        <div>
          <p className="font-medium text-gray-800">{author}</p>
          {(role || company) && (
            <p className="text-xs text-gray-500">
              {role}
              {role && company && " · "}
              {company}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
