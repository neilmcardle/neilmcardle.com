import Image from "next/image"
import Link from "next/link"

interface MediumArticleCardProps {
  title: string
  subtitle?: string
  imageUrl: string
  articleUrl: string
  publishDate?: string
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
    <Link href={articleUrl} target="_blank" rel="noopener noreferrer" className="block group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            width={400}
            height={200}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          {subtitle && <p className="text-gray-600 text-sm mb-2 line-clamp-2">{subtitle}</p>}
          <div className="flex items-center text-xs text-gray-500 mt-2">
            {publishDate && <span className="mr-2">{publishDate}</span>}
            {readTime && (
              <>
                <span className="mx-1">•</span>
                <span>{readTime}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
