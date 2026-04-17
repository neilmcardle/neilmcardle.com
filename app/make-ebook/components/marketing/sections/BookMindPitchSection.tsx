'use client';

import React, { useState, useRef, useEffect } from 'react';

import FadeIn from '../FadeIn';
import { SECTION_TIERS } from '../sectionTiers';

const BULLETS = [
  'Select text and press \u2318K for instant rewrites, right where you are',
  'Amazon KDP pre-flight catches what would get your book delisted',
  'Themes, characters, pacing, and issues, all pre-computed and instant',
  'Type / to draft, continue, or transition, right in the editor',
  'Book Mind remembers your rules, characters, and editorial decisions',
  'Flow mode suggests the next sentence as you write',
];

// Inline sparkle icon — used as the avatar in the chat demo. Kept inline to
// avoid pulling lucide-react into a section that only needs one glyph.
function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

export default function BookMindPitchSection() {
  const chatRef = useRef<HTMLDivElement>(null);
  const [chatStep, setChatStep] = useState(0);

  // Stagger the chat-message reveal as the section scrolls into view.
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setChatStep(1), 400);
          setTimeout(() => setChatStep(2), 1400);
          setTimeout(() => setChatStep(3), 2600);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="book-mind" className={SECTION_TIERS.cinematic.section}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <FadeIn className="lg:col-span-7">
            <div>
              <h2 className="font-serif font-bold text-gray-900 text-balance" style={SECTION_TIERS.cinematic.title}>
                An editorial brain that lives inside your editor.
              </h2>
              <p className="mt-6 text-xl sm:text-2xl text-gray-600 max-w-xl text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.5 }}>
                Book Mind doesn't just chat about your manuscript. It edits inline, catches inconsistencies, guards against Amazon delisting, and remembers every decision you've made.
              </p>
              <ul className="mt-8 space-y-4">
                {BULLETS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
          <FadeIn delay={150} className="lg:col-span-5">
            <div className="relative">
              <div ref={chatRef} className="bg-gray-50 rounded-2xl p-8 shadow-xl border border-gray-200 min-h-[260px]">
                <div className="space-y-4">
                  {/* Message 1 */}
                  <div
                    className="flex items-start gap-3"
                    style={{ opacity: chatStep >= 1 ? 1 : 0, transform: chatStep >= 1 ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
                  >
                    <SparkleIcon className="w-6 h-6 text-gray-600 flex-shrink-0" />
                    <div className="flex-1 bg-gray-100 rounded-2xl rounded-tl-none p-4">
                      <p className="text-gray-700 text-sm">I&rsquo;ve analyzed your manuscript. Chapter 7 mentions Sarah having blue eyes, but in Chapter 3 they were described as green. Would you like me to show you the exact passages?</p>
                    </div>
                  </div>
                  {/* Message 2 */}
                  <div
                    className="flex items-start gap-3 justify-end"
                    style={{ opacity: chatStep >= 2 ? 1 : 0, transform: chatStep >= 2 ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
                  >
                    <div className="bg-gray-900 rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                      <p className="text-white text-sm">Yes, show me the inconsistencies</p>
                    </div>
                  </div>
                  {/* Message 3 */}
                  <div
                    className="flex items-start gap-3"
                    style={{ opacity: chatStep >= 3 ? 1 : 0, transform: chatStep >= 3 ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
                  >
                    <SparkleIcon className="w-6 h-6 text-gray-600 flex-shrink-0" />
                    <div className="flex-1 bg-gray-100 rounded-2xl rounded-tl-none p-4">
                      <p className="text-gray-700 text-sm mb-2"><strong>Chapter 3, paragraph 12:</strong></p>
                      <p className="text-gray-600 text-sm italic">&ldquo;Her green eyes sparkled in the morning light&hellip;&rdquo;</p>
                      <p className="text-gray-700 text-sm mt-3 mb-2"><strong>Chapter 7, paragraph 5:</strong></p>
                      <p className="text-gray-600 text-sm italic">&ldquo;Sarah&rsquo;s blue eyes narrowed&hellip;&rdquo;</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
