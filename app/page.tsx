import Link from "next/link";
import { Mail, MapPin, Calendar } from "lucide-react";
import Image from "next/image";

export default function ProfileCardHomepage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Card Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full">
          {/* Banner Section */}
          <div className="relative h-48 bg-black">
            <div className="absolute inset-0 flex items-center justify-between px-6 text-white">
              <span className="text-sm font-medium">Designer</span>
              <div className="flex items-center gap-3">
                {/* Design Icons */}
                <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="w-8 h-8 border-2 border-white flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-white rounded-full transform rotate-12"></div>
                </div>
              </div>
              <span className="text-sm font-medium">Oil Painter</span>
            </div>
            <div className="absolute bottom-0 right-4 text-white text-xs">
              neilmcardle.com
            </div>
          </div>

          {/* Profile Image - Positioned to overlap banner */}
          <div className="relative -mt-16 flex justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
              <Image
                src="/me-illustration-circle.png"
                alt="Neil McArdle"
                width={96}
                height={96}
                className="w-full h-full object-cover"
                data-testid="img-profile"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-6 pt-4 pb-6">
            {/* Name and Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1" data-testid="text-name">Neil McArdle</h1>
              <p className="text-gray-600" data-testid="text-title">Designer.</p>
            </div>

            {/* Products Section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 text-center mb-4" data-testid="text-products-heading">Products</h2>
              <div className="flex items-center justify-center gap-8">
                <Link 
                  href="/make-ebook"
                  className="text-gray-900 hover:text-blue-600 font-medium border-b border-gray-300 hover:border-blue-600 transition-colors"
                  data-testid="link-makeebook"
                >
                  makeEbook
                </Link>
                <span className="text-gray-400">|</span>
                <Link 
                  href="/vector-paint"
                  className="text-gray-900 hover:text-blue-600 font-medium border-b border-gray-300 hover:border-blue-600 transition-colors"
                  data-testid="link-vectorpaint"
                >
                  Vector Paint
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
                <span data-testid="text-joined">Creating since 2023</span>
              </div>
            </div>

            {/* Get in Touch Button */}
            <div className="text-center">
              <button 
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 mx-auto transition-colors shadow-lg"
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