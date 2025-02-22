import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ExternalLink } from "lucide-react"

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <section className="mb-16 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-48 h-48 relative rounded-full overflow-hidden shadow-lg flex-shrink-0">
            <Image src="/me.jpg" alt="Neil McArdle" width={192} height={192} className="object-cover" priority />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">Neil McArdle</h1>
            <p className="text-xl mb-4 font-mono">Design Synthesist</p>
            <p className="text-xl mb-4 font-mono">
              <span className="text-[#86E3CE]">const</span> <span className="text-[#A39BE5] relative">Synthesist</span>{" "}
              = <span className="text-[#86E3CE]">new</span> <span className="text-[#FFB178] relative">Design</span>(
              <span className="text-[#D387F7]">'Code'</span>);
            </p>
            <p className="text-gray-400 leading-relaxed">Elegant designs realized through clean, purposeful code.</p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Passion Project Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: "Make eBook",
              description: "Create, format and export eBooks",
              link: "/make-ebook",
              image: "/makeebook-logo-icon-wordmark.png",
            },
            {
              title: "Vector Paint",
              description: "Create and export vector drawings",
              link: "/vector-paint",
              image: "/vector-paint-banner.png",
            },
          ].map((project, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <Link href={project.link} className="text-blue-600 hover:text-blue-800 inline-flex items-center group">
                  View Project
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">In-House Portfolio and Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: "Figma Portfolio",
              description: "Design projects and UI/UX work",
              link: "https://www.figma.com/proto/zZcc3Li72GhWFVpv1PxC0O/%F0%9F%91%A8%F0%9F%8F%BC%E2%80%8D%F0%9F%9A%80--Neil-McArdle?page-id=7947%3A56485&node-id=7947-56486&viewport=119%2C809%2C0.29&t=9uLN4opTMa6jNFaW-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=7947%3A56486",
              image: "/avis-app-screenshot.png",
              external: true,
            },
            {
              title: "Child's Story Bible",
              description: "My debut as a published illustrator",
              link: "https://banneroftruth.org/uk/store/new-release/the-childs-story-bible/",
              image: "/childs-story-bible.png",
              external: true,
            },
          ].map((project, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-white p-1 rounded-full">
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <Link
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center group"
                >
                  View Work
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Skills & Expertise</h2>
        <div className="flex flex-wrap gap-4">
          {["Figma", "Photoshop", "Illustrator", "JavaScript", "HTML", "CSS", "After Effects", "Adobe Analytics"].map(
            (skill) => (
              <span
                key={skill}
                className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm transition-colors duration-300 hover:bg-gray-200"
              >
                {skill}
              </span>
            ),
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Let's Connect</h2>
        <p className="text-gray-700 mb-4">
          I'm always excited to take on new challenges and help businesses achieve their digital goals. If you have a
          project in mind or want to discuss how we can collaborate, don't hesitate to reach out.
        </p>
        <div className="flex space-x-4">
          <Link
            href="https://www.linkedin.com/in/neilmcardle/"
            className="inline-block bg-[#0077B5] text-white px-6 py-3 rounded-[8px] hover:bg-[#000000] transition-colors duration-300"
          >
            LinkedIn
          </Link>
        </div>
      </section>
    </div>
  )
}

