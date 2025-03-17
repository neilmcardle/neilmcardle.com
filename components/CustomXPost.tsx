import Image from "next/image"
import Link from "next/link"

interface CustomXPostProps {
  content: string
  additionalContent?: string[]
  hashtags?: string[]
  profileImage?: string
  name?: string
  handle?: string
  handleUrl?: string
}

export function CustomXPost({
  content = "This is a glossy, resizable button 🔥 ;P 🔥",
  additionalContent = [
    "Grab the @Figma file: https://figma.com/community/file/1483263624716244248",
    "Vibes: Oleksandr Stepanov https://pixabay.com/users/penguinmusic-24940186/",
    "Fire Emoji: https://emojipedia.org/fire",
  ],
  hashtags = ["UI", "Design"],
  profileImage = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/profile-dONA7abEaJyCLzMSGtfxbqB76X5jfw.png",
  name = "Neil McArdle",
  handle = "@BetterNeil",
  handleUrl = "https://x.com/BetterNeil",
}: CustomXPostProps) {
  // Function to convert URLs to clickable links and handle @ mentions
  const formatText = (text: string) => {
    // Split the text by spaces to process each word
    return text.split(" ").map((word, index, array) => {
      // Check if the word is a URL
      if (word.startsWith("http://") || word.startsWith("https://")) {
        return (
          <Link
            key={index}
            href={word}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {word}
            {index < array.length - 1 ? " " : ""}
          </Link>
        )
      }
      // Check if the word is a mention (@username)
      else if (word.startsWith("@")) {
        // Special case for @BetterNeil
        if (word === "@BetterNeil") {
          return (
            <Link
              key={index}
              href="https://x.com/BetterNeil"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {word}
              {index < array.length - 1 ? " " : ""}
            </Link>
          )
        }
        // For other mentions
        return (
          <span key={index} className="text-blue-500">
            {word}
            {index < array.length - 1 ? " " : ""}
          </span>
        )
      }
      // Return the word as is if it's not a URL or mention
      return (
        <span key={index}>
          {word}
          {index < array.length - 1 ? " " : ""}
        </span>
      )
    })
  }

  return (
    <div className="bg-white rounded-xl p-6 mb-2 text-left">
      <div className="flex items-start">
        {/* Profile Image */}
        <div className="flex-shrink-0 mr-3">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={profileImage || "/placeholder.svg"}
              alt={name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Post Content */}
        <div className="flex-1">
          {/* User Info - Removed timestamp and more icon */}
          <div className="flex items-center">
            <span className="font-bold text-[#0f1419]">{name}</span>
            <Link
              href={handleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#536471] ml-1 hover:underline"
            >
              {handle}
            </Link>
          </div>

          {/* Main Content */}
          <div className="mt-1 text-[#0f1419] whitespace-pre-wrap">
            <p className="mb-2">{content}</p>

            {/* Additional Content */}
            {additionalContent.map((line, index) => (
              <p key={index} className="mb-2">
                {formatText(line)}
              </p>
            ))}

            {/* Hashtags */}
            <p className="text-blue-500">
              {hashtags.map((tag, index) => (
                <span key={index} className="mr-2">
                  #{tag}
                </span>
              ))}
            </p>
          </div>

          {/* Removed all interaction buttons */}
        </div>
      </div>
    </div>
  )
}

