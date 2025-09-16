import Link from "next/link";
import { Mail, MapPin, Calendar } from "lucide-react";
import Image from "next/image";

export default function ProfileCardHomepage() {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Massive Name in Background (Desktop Only) */}
      <div className="absolute inset-0 hidden lg:block">
        <Image
          src="/neil-mcardle.svg" /* Points to the SVG file in the public folder */
          alt="Neil McArdle"
          layout="fill"
          objectFit="contain"
          className="opacity-10"
        />
      </div>
      {/* Profile Card Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full">
          {/* Banner Section */}
          <div className="relative h-40 md:h-48 px-6 md:px-[6rem] flex items-center justify-between">
            <Image
              src="/baner-top-split-icons.png" /* Points to the banner image in public folder */
              alt="Banner"
              layout="fill"
              objectFit="cover"
            />
          </div>

          {/* Profile Image Section */}
          <div className="relative -mt-16 flex flex-col items-center z-50">
            {/* Name in white above the profile image */}
          
            {/* Profile Image - Positioned to overlap banner */}
<div className="relative -mt-16 flex justify-center z-50"> {/* Increased z-index */}
  <div className="w-49 h-49 rounded-full "> {/* Increased size and removed border */}
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
          <div className="px-6 pt-4 pb-6">
            {/* Name and Title */}
            <div className="text-center mb-6">
              <p className="text-gray-900 text-lg font-semibold mb-2" data-testid="text-title">Designer | Oil painter</p>
            </div>

            {/* Products Section */}
            <div className="mb-4"> {/* Reduced bottom margin */}
              <h2 className="text-xs font-bold text-gray-900 text-center mb-2 uppercase" data-testid="text-products-heading">Products</h2> {/* Reduced font size */}
              <div className="flex items-center justify-center gap-8">
                <Link 
                  href="/vector-paint"
                  className="text-gray-900 hover:text-orange-600 font-medium border-b border-gray-300 hover:border-grey-600 transition-colors"
                  data-testid="link-vectorpaint"
                >
                  Vector Paint
                </Link>
                <Link 
                  href="/make-ebook"
                  className="text-gray-900 hover:text-orange-600 font-medium border-b border-gray-300 hover:border-grey-600 transition-colors"
                  data-testid="link-makeebook"
                >
                  makeEbook
                </Link>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span data-testid="text-location">United Kingdom</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span data-testid="text-joined">Oil Painting since 2007. Designing since 2014.</span>
              </div>
            </div>

            {/* Get in Touch Button */}
            <div className="text-center">
              <button 
                className="bg-gray-900 hover:bg-gray-800 hover:scale-105 text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 mx-auto transition-transform shadow-lg"
                data-testid="button-contact"
              >
                <Mail className="w-4 h-4" />
                Get in Touch
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}