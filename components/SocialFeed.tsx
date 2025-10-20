import { XPostEmbed } from "./XPostEmbed"

export function SocialFeed() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Center the tweet with flex and justify-center */}
        <div className="flex justify-center">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-center">
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
      </div>
    </section>
  )
}
