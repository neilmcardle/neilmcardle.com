import Image from "next/image"

interface PortfolioHighlightProps {
  title: string
  description: string
  image: string
  tags: string[]
}

export function PortfolioHighlight({ title, description, image, tags }: PortfolioHighlightProps) {
  return (
    <div className="backdrop-blur-md rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg bg-white/80 group">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
