import Link from "next/link"

// Custom solid icons (reused from top-navigation.tsx)
const LinkedInSolid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const XSolid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const DribbbleSolid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073-.244-.563-.497-1.125-.767-1.68 2.31-1 4.165-2.358 5.548-4.082 1.35 1.594 2.197 3.619 2.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68-1.016-1.861-2.178-3.676-3.488-5.438.779-.197 1.591-.314 2.431-.314 2.275 0 4.368.85 5.943 2.072zm-8.228-2.34C10.404 3.61 11.566 5.426 12.577 7.283c-2.813.918-6.199 1.121-10.161.613C3.18 4.9 5.625 2.674 8.615 1.82zm-7.46 10.12c4.432.575 8.371.424 11.817-.518.256.587.484 1.173.692 1.756-4.084 1.704-6.997 4.267-8.745 7.68C2.835 18.812 1.77 15.572 1.855 11.94zm2.555 9.27c1.552-3.209 4.178-5.608 7.926-7.197.737 1.91 1.321 3.885 1.745 5.916-.951.31-1.96.479-3.001.479-2.554 0-4.893-.988-6.67-2.598zm9.994 1.793c-.46-2.184-1.092-4.31-1.894-6.372 2.118-.445 4.125-.506 6.025-.198-.218 2.738-1.667 5.11-3.731 6.57z" />
  </svg>
)

const SubstackSolid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
  </svg>
)

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">About Me</h1>
      <div className="space-y-6">
        <p className="text-lg">
          Hi, I'm Neil, a passionate designer with over a decade of experience in crafting
          thoughtful and engaging digital experiences.
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

      {/* Social Media Links */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Connect with me</h2>
        <div className="flex space-x-6">
          <Link
            href="https://www.linkedin.com/in/neilmcardle/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="sr-only">LinkedIn</span>
            <LinkedInSolid />
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
            href="https://dribbble.com/neilmacdesign"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="sr-only">Dribbble</span>
            <DribbbleSolid />
          </Link>
          <Link
            href="https://neilmcardle.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="sr-only">Substack</span>
            <SubstackSolid />
          </Link>
        </div>
      </div>
    </div>
  )
}

