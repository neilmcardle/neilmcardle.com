import Image from "next/image"
import Link from "next/link"
import { BookOpen } from "lucide-react"

interface MediumArticleCardProps {
  title: string
  subtitle: string
  imageUrl: string
  articleUrl: string
  publishDate: string
  readTime?: string
}

export function MediumArticleCard({
  title,
  subtitle,
  imageUrl,
  articleUrl,
  publishDate,
  readTime,
}: MediumArticleCardProps) {
  return (
    <Link href={articleUrl} target="_blank" rel="noopener noreferrer" className="group">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden">
          <Image src={imageUrl || "/placeholder.svg"} alt={title} fill className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center text-white text-xs mb-2">
              <BookOpen className="w-4 h-4 mr-1" />
              <span>{publishDate}</span>
              {readTime && (
                <>
                  <span className="mx-2">•</span>
                  <span>{readTime}</span>
                </>
              )}
              <span className="mx-2">•</span>
              <span>Published in Bootcamp</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
          <p className="text-gray-600 text-sm">{subtitle}</p>
        </div>
      </div>
    </Link>
  )
}

