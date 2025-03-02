import Image from "next/image"
import Link from "next/link"
import { BetterThingsIcon } from "@/components/BetterThingsIcon"

export default function BetterThings() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 flex items-center gap-4">
        <BetterThingsIcon className="w-10 h-10 text-black" />
        Better Things
      </h1>
      <p className="text-lg mb-8">
        BetterThings is my freelance design studio where I bring the perfect blend of creativity, attention to detail,
        and strategic thinking to every project. Through my work I've had the privilege of collaborating with brands to
        create designs that stand out and resonate deeply in their respective industries.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nuk-soo-card-banner-Ej605KiiolTu8x60MWYAJMGfLj5AdH.png"
            alt="NUK SOO - Bold geometric branding and portrait photography"
            width={600}
            height={400}
            className="w-full h-64 object-cover"
          />
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">NUK SOO</h2>
            <p className="text-gray-600 mb-4">
              Collaborated with Dan Roberts to create a striking visual identity for NUK SOO, enhancing their brand
              presence in the industry.
            </p>
            <Link
              href="https://danrobertsgroup.com/nuksoo/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              View on Dan Roberts Group
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gatewick-house-gardens-card-banner-yPo8986u4vDLre49VxlfSilnAhDCdl.png"
            alt="Gatewick Gardens - Elegant architectural illustration of a grand house"
            width={600}
            height={400}
            className="w-full h-64 object-cover"
          />
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Gatewick House & Gardens</h2>
            <p className="text-gray-600 mb-4">
              Developed a elegant and timeless design for Gatewick House & Gardens, showcasing their beautiful
              landscapes and historic architecture.
            </p>
            <Link
              href="https://www.instagram.com/gatewick_gardens/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              View on Instagram
            </Link>
          </div>
        </div>
      </div>

      <p className="text-lg mt-8">
        Whether it's crafting a bold visual identity or enhancing an established brand's presence, my goal is to create
        work that doesn't just look good but communicates your unique story effectively. Connect with me on{" "}
        <Link
          href="https://www.linkedin.com/in/neilmcardle/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          LinkedIn
        </Link>{" "}
        to make something better for your brand.
      </p>
    </div>
  )
}

