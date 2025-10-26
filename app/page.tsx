"use client";

import { useState } from "react";
import { Mail, Copy } from "lucide-react";
import Image from "next/image";

export default function ProfileCardHomepage() {
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState(false);
  const email = "neil@neilmcardle.com";

  const handleReveal = () => setShowEmail(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Profile Card Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full z-10">
          {/* Banner Section - keep grey background, remove SVG icons */}
          <div className="relative h-40 md:h-48 px-6 md:px-[6rem] flex items-center justify-between pointer-events-none" style={{ backgroundColor: '#f2f2f2' }}>
            <div className="flex flex-col items-center w-full pt-6">
              <h1
                className="text-4xl font-extrabold text-gray-900 mb-2"
                style={{ fontFamily: "Inter, sans-serif" }}
                data-testid="text-title"
              >
                Neil McArdle
              </h1>
            </div>
          </div>

          {/* Name above Profile Image */}
          <div className="flex flex-col items-center z-50">
            <div className="relative -mt-8 flex justify-center z-50">
              <div className="w-49 h-49 rounded-full">
                <Image
                  src="/me.png"
                  alt="Neil McArdle"
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                  data-testid="img-profile"
                />
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-6 pt-4 pb-8 text-center">
            {/* Headline & Subheadline */}
            <div className="mb-6">
              <div className="mb-1">
                <span className="text-lg font-normal text-gray-600" data-testid="text-location">
                  Designing for millions.
                </span>
              </div>
              <div className="mb-8">
                <span className="text-lg font-normal text-gray-600" data-testid="text-location">
                  Coding side projects.
                </span>
              </div>
            </div>

            {/* Products Section */}
            <div className="mb-6">
              <h2
                className="text-xs font-semibold text-gray-500 uppercase mb-2 tracking-widest"
                style={{ fontFamily: "Inter, sans-serif" }}
                data-testid="text-products-heading"
              >
                Products
              </h2>
              <div className="flex items-center justify-center gap-8">
                <div style={{
                  borderRadius: '999px',
                  padding: '2.5px',
                  background: 'linear-gradient(90deg, #ebebebff 0%, #F4F4F4 50%, #F4F4F4 100%)',
                  display: 'inline-block',
                }}>
                  <a
                    href="https://vectorpaint.vercel.app/"
                    className="text-gray-900 px-6 py-2 font-medium text-base inline-flex items-center gap-2 transition-transform focus:outline-none"
                    style={{
                      borderRadius: '999px',
                      background:  '#f8f8f8ff',
                      border: 'none',
                      boxShadow: '0 6px 8px 0 rgba(0,0,0,0.16)',
                      transition: 'background 0.2s',
                      display: 'inline-block',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(180deg, #ebebebff 40%, #F4F4F4 100%)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f8f8f8ff'}
                    data-testid="link-vectorpaint"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Vector Paint
                  </a>
                </div>
                <div style={{
                  borderRadius: '999px',
                  padding: '2.5px',
                  background: 'linear-gradient(90deg, #ebebebff 0%, #F4F4F4 50%, #F4F4F4 100%)',
                  display: 'inline-block',
                }}>
                  <a
                    href="https://neilmcardle.com/make-ebook"
                    className="text-gray-900 px-6 py-2 font-medium text-base inline-flex items-center gap-2 transition-transform focus:outline-none"
                    style={{
                      borderRadius: '999px',
                      background:  '#f8f8f8ff',
                      border: 'none',
                      boxShadow: '0 6px 8px 0 rgba(0,0,0,0.16)',
                      transition: 'background 0.2s',
                      display: 'inline-block',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(180deg, #ebebebff 40%, #F4F4F4 100%)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f8f8f8ff'}
                    data-testid="link-makeebook"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    makeEbook
                  </a>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center gap-4 mb-4">
              <a
                href="https://github.com/neilmcardle"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <span className="inline-block w-6 h-6 align-middle">
                  {/* GitHub SVG */}
                  <svg width="24" height="24" viewBox="0 0 98 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="#24292f"/>
                  </svg>
                </span>
              </a>
              <a
                href="https://x.com/BetterNeil"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
              >
                <span className="inline-block w-6 h-6 align-middle">
                  {/* X SVG */}
                  <svg width="24" height="24" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="black"/>
                  </svg>
                </span>
              </a>
            </div>
            {/* Get in Touch Reveal & Copy */}
            <div className="text-center mt-4 flex flex-col items-center">
              {!showEmail ? null : (
                <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full font-medium text-base">
                  <Mail className="w-5 h-5 text-gray-700" />
                  <span className="text-gray-800">{email}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-gray-700 hover:text-green-600 transition-colors focus:outline-none"
                    aria-label="Copy email to clipboard"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  {copied && (
                    <span className="ml-2 text-green-600 font-medium transition-opacity duration-200">
                      Copied
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
