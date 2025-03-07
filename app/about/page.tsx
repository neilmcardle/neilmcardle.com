import Link from "next/link"
import { LinkedInIcon } from "@/components/LinkedInIcon"
import { MediumIcon } from "@/components/MediumIcon"
import { SecureEmailLink } from "@/components/SecureEmailLink"

// Custom solid icons (reused from top-navigation.tsx)
const XSolid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">About Me</h1>
      <div className="space-y-6">
        <p className="text-lg">
          Hi, I'm Neil, a passionate designer with over a decade of experience in crafting thoughtful and engaging
          digital experiences.
        </p>
        <p className="text-lg">
          My journey in the world of design and development has been driven by a relentless curiosity and a desire to
          create solutions that not only look great but also solve real problems for users.
        </p>
        <p className="text-lg">
          I specialise in creating elegant designs and bringing them to life through clean, purposeful code. My approach
          combines aesthetic sensibility with technical expertise, ensuring that every project I work on is both
          visually appealing and functionally robust.
        </p>
        <p className="text-lg">
          When I'm not designing or coding, you can find me painting or sharing my knowledge through writing.
        </p>
        <p className="text-lg">
          I'm always excited about new challenges and opportunities to create impactful digital experiences. If you're
          interested in collaborating or just want to chat about design and technology, feel free to reach out!
        </p>
      </div>

      {/* Contact Information */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
        <div className="space-y-4">
          <SecureEmailLink className="mb-6" />
        </div>
      </div>

      {/* Social Media Links */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Elsewhere</h2>
        <div className="flex space-x-6">
          <Link
            href="https://www.linkedin.com/in/neilmcardle/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="sr-only">LinkedIn</span>
            <LinkedInIcon className="w-6 h-6" />
          </Link>
          <Link
            href="https://x.com/betterneil"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="sr-only">X</span>
            <XSolid />
          </Link>
          <Link
            href="https://medium.com/@BetterNeil"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="sr-only">Medium</span>
            <MediumIcon className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </div>
  )
}

