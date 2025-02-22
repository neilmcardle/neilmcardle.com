import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Better Things | Neil McArdle",
  description:
    "Showcase of freelance projects and professional work by Neil McArdle, including web development, design, and digital solutions.",
}

interface Project {
  title: string
  description: string
  imageUrl: string
  link: string
}

const projects: Project[] = [
  {
    title: "NUK SOO",
    description: "Identity design for Dan Robert's online training that mixes conditioning and martial arts.",
    imageUrl: "/nuksoo-colour-600.png",
    link: "https://danrobertsgroup.com/nuksoo/",
  },
  {
    title: "Gatewick House & Gardens",
    description: "Logo design and signage for a new 6 acre garden in the folds of the South Downs",
    imageUrl:
      "/gatewickHouse-colour-600.png",
    link: "https://www.instagram.com/gatewick_gardens/",
  },
]

export default function BetterThings() {
  return (
    <div className="max-w-4xl mx-auto">
      <section className="mb-16 animate-fade-in">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Better Things</h1>
        <p className="text-xl text-gray-600 mb-6">My freelance projects and professional work</p>
      </section>

      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-md overflow-hidden">
              <Image
                src={project.imageUrl || "/placeholder.svg"}
                alt={project.title}
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <Link href={project.link} className="text-blue-600 hover:text-blue-800 inline-flex items-center group">
                  View Project Details
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
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
            className="inline-block bg-[#000000] text-white px-6 py-3 rounded-[8px] hover:bg-[#595959] transition-colors duration-300"
          >
            Start a Project
          </Link>
        </div>
      </section>
    </div>
  )
}

