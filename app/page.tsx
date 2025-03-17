"use client"
import { FigmaIcon } from "@/components/FigmaIcon"
import { Lock } from "lucide-react"
import { Glossy3DButton } from "@/components/Glossy3DButton"
import { XPostEmbed } from "@/components/XPostEmbed"
import { CustomXPost } from "@/components/CustomXPost"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-6">
      <div className="w-full max-w-4xl mx-auto text-center relative z-[15]">
        {/* Pre-title */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white text-gray-600 text-sm font-medium mb-2">
          Design Engineer
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">Neil McArdle</h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-8">
          Elegant designs realised through clean, purposeful code.
        </p>

        {/* Action button */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <Glossy3DButton
            href="https://www.figma.com/proto/zZcc3Li72GhWFVpv1PxC0O/%F0%9F%91%A8%F0%9F%8F%BC%E2%80%8D%F0%9F%9A%80--Neil-McArdle?page-id=7947%3A56485&node-id=7947-56486&viewport=119%2C809%2C0.29&t=9uLN4opTMa6jNFaW-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=7947%3A56486"
            external={true}
            className="text-sm px-5 py-2.5"
          >
            <FigmaIcon variant="color" className="w-4 h-4 mr-2" />
            Access Figma Portfolio
            <Lock className="w-3.5 h-3.5 ml-2" />
          </Glossy3DButton>
        </div>

        {/* Custom X Post - Updated to use the profile image and removed timestamp */}
        <CustomXPost
          profileImage="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/profile-dONA7abEaJyCLzMSGtfxbqB76X5jfw.png"
          name="Neil McArdle"
          handle="@BetterNeil"
          handleUrl="https://x.com/BetterNeil"
          content="This is a glossy, resizable button 🔥 ;P 🔥"
          additionalContent={[
            "Grab the @Figma file: https://figma.com/community/file/1483263624716244248",
            "Vibes: Oleksandr Stepanov https://pixabay.com/users/penguinmusic-24940186/",
            "Fire Emoji: https://emojipedia.org/fire",
          ]}
          hashtags={["UI", "Design"]}
        />

        {/* X Post Embed */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl pt-2 px-6 pb-6">
          <XPostEmbed
            tweetUrl="https://twitter.com/BetterNeil/status/1901435678375972971"
            mediaMaxWidth={550}
            align="center"
            cards="visible"
            conversation="none"
            theme="light"
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

