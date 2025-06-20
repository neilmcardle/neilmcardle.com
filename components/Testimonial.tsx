import Image from "next/image"
import { Star } from "lucide-react"

interface TestimonialProps {
  quote: string
  author: string
  company: string
  avatarUrl: string
}

export function Testimonial({ quote, author, company, avatarUrl }: TestimonialProps) {
  return (
    <div
      className="bg-white p-8 rounded-xl shadow-lg border border-gray-200"
      style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
    >
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-black fill-black" />
        ))}
      </div>
      <p className="text-gray-700 mb-6">"{quote}"</p>
      <div className="flex items-center">
        <Image
          src={avatarUrl || "/placeholder.svg"}
          alt={author}
          width={48}
          height={48}
          className="rounded-full mr-4"
        />
        <div>
          <p className="font-bold">{author}</p>
          <p className="text-gray-600 text-sm">{company}</p>
        </div>
      </div>
    </div>
  )
}
