"use client"
import { useState, useEffect } from "react"
import { FigmaIcon } from "@/components/FigmaIcon"
import { MediumArticleCard } from "@/components/MediumArticleCard"
import { XPostEmbed } from "@/components/XPostEmbed"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Code, Layout, Lock, Palette, PenTool, Sparkles, Star } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  // Animation states
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const mediumArticles = [
    {
      title: "Navigating Recruiter Pitches on LinkedIn",
      subtitle: "A Designer's UX-Fueled InMail Odyssey",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/navigating-article-2-IJX6TSxHZZ9C3RIw6WqPIBcBQwSrCG.png",
      articleUrl: "https://medium.com/design-bootcamp/navigating-recruiter-pitches-on-linkedin-74cb0bf74a83",
      publishDate: "Mar 6, 2025",
      readTime: "4 min read",
    },
    {
      title: "The Designer and the Peas of Rejection",
      subtitle: "A UX Prince Picks Apart His 27 No-Reply Goodbyes",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/peas-article-1-YAHCa2aOoqJEJoAmkexgTCGXtjiw3R.png",
      articleUrl: "https://medium.com/design-bootcamp/the-designer-and-the-peas-of-rejection-3b2837e96342",
      publishDate: "Feb 27, 2025",
    },
  ]

  const featuredProjects = [
    {
      title: "Better Things",
      description:
        "Subscribe to my elite freelance design services with unlimited design requests and rapid turnaround times.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/betterThingsCardBanner-7mLfmSmu8yYccGaMoIWJG0DO1jEtX1.png",
      link: "/better-things",
      icon: null, // Changed from BetterThingsSquareLogo to null
      skills: ["Brand Identity", "UI/UX Design", "Illustration"],
    },
  ]

  const skills = [
    { name: "UI/UX Design", icon: <Layout className="h-5 w-5" />, level: 95 },
    { name: "Frontend Development", icon: <Code className="h-5 w-5" />, level: 90 },
    { name: "Brand Identity", icon: <Palette className="h-5 w-5" />, level: 85 },
    { name: "Illustration", icon: <PenTool className="h-5 w-5" />, level: 80 },
  ]

  const testimonials = [
    {
      quote:
        "Neil is a talented designer who has an impressive work ethic. He has assisted on number of key design projects for our brand and he over-delivers each and every time!",
      name: "Dan Roberts",
      role: "Founder, NUK SOO",
      avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dan-or2ZMicLq3DNbbnxNnCFXvZP8jsrt5.png",
    },
  ]

  return (
    <div className="flex flex-col items-center min-h-screen overflow-x-hidden px-4 relative">
      {/* Background with subtle gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 z-[-1]"></div>

      <div className="w-full max-w-6xl mx-auto relative z-[15] mt-4 mb-16">
        {/* Hero Section - Two cards side by side */}
        <section
          className={`transition-all duration-1000 ease-out transform ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* Left card - Name section (2/3 width) */}
            <div className="md:col-span-2 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-10">
              <div className="flex flex-col items-start text-left">
                {/* Profile photo above name - increased to 64x64px */}
                <div className="relative rounded-full overflow-hidden shadow-md h-16 w-16 border-2 border-white mb-4">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/profile-dONA7abEaJyCLzMSGtfxbqB76X5jfw.png"
                    alt="Neil McArdle - Design Engineer"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Smaller Design Engineer badge with available indicator */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex items-center py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Design Engineer
                  </div>
                  <div className="flex items-center text-xs text-emerald-600 font-medium">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></div>
                    Available for work
                  </div>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent">
                  Neil McArdle
                </h1>

                <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-full md:max-w-md leading-relaxed">
                  I craft elegant digital experiences through thoughtful design and clean, purposeful code. Specializing
                  in UI/UX design and frontend development.
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-100"
                      style={{
                        transitionDelay: `${index * 100}ms`,
                        animation: isLoaded ? `fadeIn 0.5s ease-out ${index * 100}ms forwards` : "none",
                        opacity: 0,
                      }}
                    >
                      <div className="text-blue-600">{skill.icon}</div>
                      <span className="text-sm font-medium">{skill.name}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="https://www.figma.com/proto/zZcc3Li72GhWFVpv1PxC0O/%F0%9F%91%A8%F0%9F%8F%BC%E2%80%8D%F0%9F%9A%80--Neil-McArdle?page-id=7947%3A56485&node-id=7947-56486&viewport=119%2C809%2C0.29&t=9uLN4opTMa6jNFaW-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=7947%3A56486"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px]"
                  >
                    <FigmaIcon variant="color" className="w-5 h-5 mr-2" />
                    View Portfolio
                    <Lock className="w-4 h-4 ml-2" />
                  </Link>

                  <Link
                    href="/about"
                    className="inline-flex items-center px-6 py-3 rounded-full bg-white text-gray-800 font-medium shadow-md hover:shadow-lg transition-all border border-gray-200"
                  >
                    About Me
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right card - Ready to collaborate (1/3 width) */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-xl p-6 flex flex-col justify-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Ready to collaborate?</h2>
              <p className="text-white/90 mb-6">
                I'm currently available for freelance projects. Let's create something amazing together.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="https://www.linkedin.com/in/neilmcardle/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-2 rounded-full bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors text-sm"
                >
                  Connect on LinkedIn
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center px-5 py-2 rounded-full bg-blue-500/20 text-white font-medium hover:bg-blue-500/30 transition-colors border border-white/30 text-sm"
                >
                  Contact Me
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Freelance Work Section - Renamed from Featured Projects */}
        <section
          className={`mb-10 transition-all duration-1000 ease-out transform delay-300 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Elite Designer</h2>
              <Link
                href="/better-things"
                className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium flex items-center"
              >
                Learn more
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid md:grid-cols-1 max-w-2xl mx-auto">
              {featuredProjects.map((project, index) => (
                <Link
                  key={index}
                  href={project.link}
                  target={project.external ? "_blank" : undefined}
                  rel={project.external ? "noopener noreferrer" : undefined}
                  className="group"
                >
                  <div className="bg-white rounded-xl overflow-hidden">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        fill
                        className="object-contain"
                      />
                      <div className="absolute top-3 left-3">
                        <div className="flex items-center py-1 px-3 rounded-full bg-white/90 backdrop-blur-sm text-emerald-600 text-xs font-medium">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></div>
                          Available for work
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-3">
                        <h3 className="font-bold text-xl text-gray-900">{project.title}</h3>
                      </div>

                      <p className="text-gray-600 text-base mb-4">{project.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill, skillIndex) => (
                          <span key={skillIndex} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials & Content Section */}
        <section
          className={`mb-10 transition-all duration-1000 ease-out transform delay-500 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="grid md:grid-cols-5 gap-6">
            {/* Testimonials */}
            <div className="md:col-span-2">
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-8 h-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Testimonials</h2>

                <div className="space-y-6">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>

                      <p className="text-gray-700 text-sm mb-4 italic">"{testimonial.quote}"</p>

                      <div className="flex items-center">
                        <Image
                          src={testimonial.avatar || "/placeholder.svg"}
                          alt={testimonial.name}
                          width={40}
                          height={40}
                          className="rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{testimonial.name}</p>
                          <p className="text-gray-500 text-xs">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="md:col-span-3">
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-8">
                <Tabs defaultValue="twitter">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Latest Content</h2>
                    <TabsList className="bg-gray-100">
                      <TabsTrigger value="twitter" className="text-xs">
                        Twitter
                      </TabsTrigger>
                      <TabsTrigger value="articles" className="text-xs">
                        Articles
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="twitter" className="mt-0">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                  </TabsContent>

                  <TabsContent value="articles" className="mt-0">
                    <div className="grid md:grid-cols-2 gap-6">
                      {mediumArticles.map((article, index) => (
                        <MediumArticleCard
                          key={index}
                          title={article.title}
                          subtitle={article.subtitle}
                          imageUrl={article.imageUrl}
                          articleUrl={article.articleUrl}
                          publishDate={article.publishDate}
                          readTime={article.readTime}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Add animation keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

