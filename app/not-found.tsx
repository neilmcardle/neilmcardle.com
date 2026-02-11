import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 relative overflow-hidden">
      {/* Background gradient matching the make-ebook landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e2836] via-[#0a0a0a] to-[#1a2230]" />

      <div className="relative flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-16">
          <Image
            src="/make-ebook-logo.svg"
            alt="MakeEbook"
            width={32}
            height={32}
            className="w-8 h-8 invert"
          />
          <span className="font-semibold text-lg text-white">makeEbook</span>
        </div>

        {/* 404 */}
        <p className="text-[10rem] sm:text-[12rem] font-bold leading-none text-white/[0.03] select-none -mb-8">
          404
        </p>

        {/* Quote */}
        <p className="text-xl sm:text-2xl italic text-gray-400 text-center max-w-lg mb-3">
          &ldquo;Not all those who wander are lost.&rdquo;
        </p>
        <p className="text-sm text-gray-600 mb-12">
          &mdash; J.R.R. Tolkien
        </p>

        {/* Button */}
        <a
          href="/"
          className="px-8 py-3 text-base font-semibold bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
        >
          Go back home
        </a>
      </div>
    </div>
  );
}
