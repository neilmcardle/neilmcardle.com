import Image from "next/image"
import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"
import { FAQ } from "@/components/FAQ"
import { BetterThingsTopNav } from "@/components/BetterThingsTopNav"
import { GlossyEmailRevealButton } from "@/components/GlossyEmailRevealButton"
import { BetterThingsIcon } from "@/components/BetterThingsIcon"

export default function BetterThings() {
  return (
    <div className="bg-white">
      <BetterThingsTopNav />
      {/* Hero Section - Adjusted padding to be visible without scrolling */}
      <section className="relative overflow-hidden pt-32 pb-8 md:pb-12">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Fast. Dedicated.
              <br />
              Unlimited Design.
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl">
              One designer. Unlimited requests. Lightning-fast turnaround.
            </p>
            <GlossyEmailRevealButton className="mb-8" />
          </div>
        </div>
      </section>

      {/* Logo Cloud - Changed to light grey background with grey text and added small circular images */}
      <section className="pt-6 pb-12 bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 mb-8">Trusted by...</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-gray-200">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nuk-soo-card-banner-Ej605KiiolTu8x60MWYAJMGfLj5AdH.png"
                  alt="NUK SOO"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-gray-600 font-semibold text-xl">NUK SOO</div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-gray-200">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gatewick-house-gardens-card-banner-yPo8986u4vDLre49VxlfSilnAhDCdl.png"
                  alt="Gatewick Gardens"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-gray-600 font-semibold text-xl">Gatewick Gardens</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Changed to white with borders */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Better Things works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get all your design work done for a simple monthly fee — pause or cancel anytime. No team to manage, no
              freelancers to coordinate, just me delivering exceptional design incredibly fast.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div
              className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-lg"
              style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <div className="w-12 h-12 bg-gray-100 text-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Request</h3>
              <p className="text-gray-600">
                Submit your design request and I'll get started immediately. No waiting for team availability.
              </p>
            </div>
            <div
              className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-lg"
              style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <div className="w-12 h-12 bg-gray-100 text-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Design</h3>
              <p className="text-gray-600">
                I'll work on your design with rapid turnaround. Most projects delivered within 24-48 hours.
              </p>
            </div>
            <div
              className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-lg"
              style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <div className="w-12 h-12 bg-gray-100 text-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Revise</h3>
              <p className="text-gray-600">
                Quick revisions until you're 100% satisfied. Direct communication means faster iterations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services - Changed to white with borders */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">All included in your subscription</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              One monthly fee covers all your design needs. No extra charges, no surprise fees.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              className="bg-white p-8 rounded-xl shadow-lg border border-gray-200"
              style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <div className="w-12 h-12 bg-gray-100 text-black rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M12 19l9 2-9-18-9 18 9-2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Brand Identity</h3>
              <p className="text-gray-600">
                Logo design, brand guidelines, visual identity systems, and brand strategy.
              </p>
            </div>
            <div
              className="bg-white p-8 rounded-xl shadow-lg border border-gray-200"
              style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <div className="w-12 h-12 bg-gray-100 text-black rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">UI/UX Design</h3>
              <p className="text-gray-600">
                User interfaces, user experience, wireframes, prototypes, and usability testing.
              </p>
            </div>
            <div
              className="bg-white p-8 rounded-xl shadow-lg border border-gray-200"
              style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <div className="w-12 h-12 bg-gray-100 text-black rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                  <path d="M2 2l7.586 7.586"></path>
                  <circle cx="11" cy="11" r="2"></circle>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Illustration</h3>
              <p className="text-gray-600">Custom illustrations, icons, infographics, and visual storytelling.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects - Updated with circular images and subtle design */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured projects</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A selection of recent work that showcases my design approach and capabilities.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-16">
            {/* NUK SOO Project */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div
                className="w-48 h-48 rounded-full overflow-hidden flex-shrink-0 border border-gray-100 shadow-lg"
                style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              >
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nuk-soo-card-banner-Ej605KiiolTu8x60MWYAJMGfLj5AdH.png"
                  alt="NUK SOO - Bold geometric branding"
                  width={256}
                  height={256}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="text-gray-500 mb-2">Brand Identity</div>
                <h3 className="text-3xl font-bold mb-3">NUK SOO</h3>
                <p className="text-gray-600 mb-4">
                  Collaborated with Dan Roberts to create a striking visual identity for NUK SOO, enhancing their brand
                  presence in the industry with bold geometric patterns and distinctive typography.
                </p>
                <Link
                  href="https://danrobertsgroup.com/nuksoo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-black hover:text-gray-700 transition-colors"
                >
                  View on Dan Roberts Group
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Gatewick Gardens Project */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div
                className="w-48 h-48 rounded-full overflow-hidden flex-shrink-0 border border-gray-100 shadow-lg"
                style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              >
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gatewick-house-gardens-card-banner-yPo8986u4vDLre49VxlfSilnAhDCdl.png"
                  alt="Gatewick Gardens - Elegant architectural illustration"
                  width={256}
                  height={256}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="text-gray-500 mb-2">Brand & Digital</div>
                <h3 className="text-3xl font-bold mb-3">Gatewick House & Gardens</h3>
                <p className="text-gray-600 mb-4">
                  Developed an elegant and timeless design for Gatewick House & Gardens, showcasing their beautiful
                  landscapes and historic architecture through refined typography and a sophisticated color palette.
                </p>
                <Link
                  href="https://www.instagram.com/gatewick_gardens/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-black hover:text-gray-700 transition-colors"
                >
                  View on Instagram
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Changed to white with borders */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What clients say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't just take my word for it - hear from the brands I've worked with.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div
              className="bg-white p-8 rounded-xl shadow-lg border border-gray-200"
              style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-black fill-black" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "Neil is a talented designer who has an impressive work ethic. He has assisted on number of key design
                projects for our brand and he over-delivers each and every time! Neil is a delight to work with and I
                can't recommend him enough."
              </p>
              <div className="flex items-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dan-or2ZMicLq3DNbbnxNnCFXvZP8jsrt5.png"
                  alt="Dan Roberts"
                  width={48}
                  height={48}
                  className="rounded-full mr-4"
                />
                <div>
                  <p className="font-bold">Dan Roberts</p>
                  <p className="text-gray-600 text-sm">NUK SOO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Better Things is different</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              No agencies. No junior designers. No complex pricing. Just one experienced designer dedicated to your
              success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-5xl mx-auto">
            <div
              className="flex gap-4 p-6 rounded-xl shadow-lg border border-gray-200"
              style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <CheckCircle className="h-6 w-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Lightning Fast Turnaround</h3>
                <p className="text-gray-600">
                  Most requests completed within 24-48 hours. No waiting for team availability or agency approvals.
                </p>
              </div>
            </div>
            <div
              className="flex gap-4 p-6 rounded-xl shadow-lg border border-gray-200"
              style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <CheckCircle className="h-6 w-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">One Dedicated Designer</h3>
                <p className="text-gray-600">
                  Work directly with me — no account managers, no junior designers, no miscommunication.
                </p>
              </div>
            </div>
            <div
              className="flex gap-4 p-6 rounded-xl shadow-lg border border-gray-200"
              style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <CheckCircle className="h-6 w-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Simple Monthly Pricing</h3>
                <p className="text-gray-600">
                  Predictable cost with no hidden fees. Pause or cancel anytime — no long-term contracts.
                </p>
              </div>
            </div>
            <div
              className="flex gap-4 p-6 rounded-xl shadow-lg border border-gray-200"
              style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <CheckCircle className="h-6 w-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Unlimited Requests</h3>
                <p className="text-gray-600">
                  Submit as many design requests as you need. I'll tackle them one by one, quickly and efficiently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Changed to white with borders */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently asked questions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Answers to common questions about working with Better Things.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <FAQ
              questions={[
                {
                  question: "What is your design process?",
                  answer:
                    "My design process typically involves understanding your requirements, researching your industry and competitors, creating initial concepts, refining based on your feedback, and delivering final assets. I maintain clear communication throughout to ensure your vision is realized.",
                },
                {
                  question: "How long does a typical project take?",
                  answer:
                    "Project timelines vary depending on scope and complexity. A logo design might take 1-2 weeks, while a comprehensive brand identity could take 4-6 weeks. Website designs typically range from 2-8 weeks depending on the number of pages and functionality required.",
                },
                {
                  question: "Do you offer revisions?",
                  answer:
                    "Yes, revisions are an integral part of the design process. I work collaboratively with clients to refine designs until they're completely satisfied. My goal is to create designs that not only look great but also meet your strategic objectives.",
                },
                {
                  question: "What information do you need to start a project?",
                  answer:
                    "To get started, I'll need information about your business, target audience, project goals, design preferences, and any existing brand materials. The more detailed information you can provide, the better I can tailor the design to your specific needs.",
                },
                {
                  question: "How do we communicate during the project?",
                  answer:
                    "I'm flexible with communication methods and can adapt to your preferences. Typically, I use a combination of email, video calls, and project management tools to ensure clear and efficient communication throughout the design process.",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">Ready for faster design?</h2>
            <p className="text-xl mb-10 text-gray-600">
              Get all your design work done for one monthly fee. Fast turnaround, dedicated service, and the flexibility
              to pause or cancel anytime. No risk, just results.
            </p>
            <GlossyEmailRevealButton />
          </div>
        </div>
      </section>

      {/* Footer - Changed to white background with black text */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <BetterThingsIcon className="w-8 h-8" />
              <span className="text-xl font-bold text-black">Better Things</span>
            </div>
            <div className="flex gap-6">
              <Link href="/" className="text-gray-600 hover:text-black">
                neilmcardle.com
              </Link>
              <Link
                href="https://www.linkedin.com/in/neilmcardle/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black"
              >
                LinkedIn
              </Link>
              <Link
                href="https://x.com/betterneil"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black"
              >
                Twitter
              </Link>
              <Link
                href="https://dribbble.com/neilmacdesign"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black"
              >
                Dribbble
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center md:text-left">
            <p className="text-gray-600">© {new Date().getFullYear()} Better Things. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Star component for testimonials
function Star(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

