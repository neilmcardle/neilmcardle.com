import { Mail, MapPin, Calendar } from "lucide-react";
import Image from "next/image";

export default function ProfileCardHomepage() {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Massive Name in Background (Desktop Only) */}
      <div className="absolute inset-0 hidden lg:block pointer-events-none">
        <Image
          src="/neil-mcardle.svg" /* Points to the SVG file in the public folder */
          alt="Neil McArdle"
          fill
          className="object-contain opacity-10"
        />
      </div>
      {/* Profile Card Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full">
          {/* Banner Section */}
          <div className="relative h-40 md:h-48 px-6 md:px-[6rem] flex items-center justify-between pointer-events-none">
            <Image
              src="/baner-top-split-icons.png" /* Points to the banner image in public folder */
              alt="Banner"
              fill
              className="object-cover"
            />
          </div>

          {/* Profile Image Section */}
          <div className="relative -mt-16 flex flex-col items-center z-50">
            {/* Profile Image */}
            <div className="relative -mt-16 flex justify-center z-50"> {/* Increased z-index */}
              <div className="w-49 h-49 rounded-full"> {/* Increased size and removed border */}
                <Image
                  src="/illustration-600.png" /* Points to the profile image in public folder */
                  alt="Neil McArdle"
                  width={144}
                  height={144} /* Increased size of the profile image */
                  className="w-full h-full object-cover"
                  data-testid="img-profile"
                />
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-6 pt-4 pb-8 text-center"> {/* Adjusted padding */}
            {/* Name and Title */}
            <div className="mb-4"> {/* Reduced bottom margin */}
              <p
                className="text-gray-400 text-lg font-semibold"
                style={{ fontFamily: "Inter, sans-serif" }}
                data-testid="text-title"
              >
                Artist & Designer
              </p>
            </div>

            {/* Products Section */}
            <div className="mb-6"> {/* Adjusted bottom margin */}
              <h2
                className="text-xs font-bold text-gray-900 uppercase mb-4"
                style={{ fontFamily: "Inter, sans-serif" }}
                data-testid="text-products-heading"
              >
                Products
              </h2>
              <div className="flex items-center justify-center gap-8">
                <a
                  href="https://vectorpaint.vercel.app/"
                  className="text-gray-900 hover:text-orange-500 font-medium border-b border-gray-300 hover:border-gray-600 transition-colors"
                  data-testid="link-vectorpaint"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Vector Paint
                </a>
                <a
                  href="https://neilmcardle.com/make-ebook"
                  className="text-gray-900 hover:text-orange-500 font-medium border-b border-gray-300 hover:border-gray-600 transition-colors"
                  data-testid="link-makeebook"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  makeEbook
                </a>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-2 text-sm text-gray-600 mb-8">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span data-testid="text-location">United Kingdom</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span data-testid="text-joined">
                  Painting since 2007. Designing since 2017.
                </span>
              </div>
            </div>

            {/* Get in Touch Button */}
            <div className="text-center mt-4"> {/* Added top margin */}
              <a
                href="mailto:neil@neilmcardle.com"
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium inline-flex items-center gap-2 transition-transform shadow-md"
                data-testid="button-contact"
                style={{
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              >
                <Mail className="w-5 h-5" />
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
