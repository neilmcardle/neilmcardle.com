'use client';

import React, { forwardRef, useState } from 'react';

import FadeIn from '../FadeIn';
import { SECTION_TIERS } from '../sectionTiers';
import { useIsMac } from './PlatformKey';

/**
 * v2 Editor Showcase — hover chapters to re-render a live Kindle-style reader.
 *
 * Replaces the 3-card grid in v1 with a single interactive two-pane layout:
 *  • Left: dark chapter picker (drag-grip, word counts, ⌘K hint)
 *  • Right: cream paper reader with chapter heading, drop-cap, justified prose
 *
 * Hover a chapter → the reader fades-swaps to that chapter's content.
 */

type Chapter = {
  n: string;
  title: string;
  words: string;
  pages: string;
  ch: string;
  heading: string;
  body: string[];
};

const CHAPTERS: Chapter[] = [
  {
    n: '01', title: 'Prologue', words: '420', pages: '1 / 312', ch: 'Prologue',
    heading: 'Before the Garden',
    body: [
      'The first page is the hardest one. Not because the writer has no words. They have too many. It is the tyranny of every possible beginning crowding the narrow mouth of the one they must choose.',
      'She had been writing this book in her head for nine years. On the morning the story finally left her, the kettle was still boiling. She let it.',
      'There are books a person carries the way other people carry grief. Not as a weight, but as a shape. Something to hold against.',
    ],
  },
  {
    n: '02', title: 'A small inheritance', words: '1,842', pages: '14 / 312', ch: 'Chapter One',
    heading: 'A Small Inheritance',
    body: [
      'The house on Orchard Lane was left to her because no one else had the patience for it. It leaned. It creaked. It remembered, in its crooked way, the people who had lived in it before.',
      'Sarah arrived in October, when the apples had already rotted at the roots of the trees.',
      'The key turned in the lock as if it had been waiting, which, of course, it had.',
    ],
  },
  {
    n: '03', title: 'Green and blue', words: '2,103', pages: '37 / 312', ch: 'Chapter Two',
    heading: 'Green and Blue',
    body: [
      'Her green eyes sparkled in the morning light, though she would never have said so of herself. She was not a person given to admiring her own reflection.',
      'The kitchen was the heart of the house, as kitchens always are. There was a long table, scuffed white, and a window that looked out over an ungovernable patch of mint.',
      'Sarah sat at the table and opened the typewriter. The keys made a sound like the house exhaling.',
    ],
  },
  {
    n: '04', title: 'The letter, again', words: '1,567', pages: '64 / 312', ch: 'Chapter Three',
    heading: 'The Letter, Again',
    body: [
      'She read the letter for the seventh time. The same sentences. The same carefully chosen words, as if the solicitor had feared telling her too plainly.',
      'It was not a question of property. It never was. It was a question of inheritance, of the slow, shaped thing that a life becomes when it has been lived inside certain walls.',
    ],
  },
  {
    n: '05', title: 'Pages, stacked', words: '2,284', pages: '92 / 312', ch: 'Chapter Four',
    heading: 'Pages, Stacked',
    body: [
      'They were in the attic, in a biscuit tin, tied with a length of garden twine. One hundred and forty-two typed pages, some still with the pencil marks of an old editor.',
      'Her mother had written a novel. She had written it, and never told anyone.',
    ],
  },
  {
    n: '06', title: 'Small grammars', words: '891', pages: '131 / 312', ch: 'Chapter Five',
    heading: 'Small Grammars',
    body: [
      'Editing, she came to believe, is the second writing. The first is hope; the second is clarity; the third, if one is lucky enough to have a third, is music.',
      'She worked through the pages slowly. The grammar was good. The sentences were good.',
    ],
  },
  {
    n: '07', title: 'The Midnight Garden', words: '3,104', pages: '172 / 312', ch: 'Chapter Seven',
    heading: 'The Midnight Garden',
    body: [
      'The morning light fell across the old manuscript pages, illuminating years of careful revision. She had written this story a hundred times in her mind before committing a single word to paper.',
      'Sarah pressed on, even as the familiar doubt crept in. The story had been waiting too long, and she could feel it in her bones like a forgotten promise.',
      'There was no going back now.',
    ],
  },
  {
    n: '08', title: 'Twelve hundred words', words: '1,912', pages: '214 / 312', ch: 'Chapter Eight',
    heading: 'Twelve Hundred Words',
    body: [
      'She set a small target and met it. Twelve hundred words, before breakfast, before the post arrived, before the day got its teeth into her.',
      'It is not the writing that is difficult. It is the agreeing to be the kind of person who writes.',
    ],
  },
  {
    n: '09', title: 'A visit', words: '1,403', pages: '246 / 312', ch: 'Chapter Nine',
    heading: 'A Visit',
    body: [
      'Her brother came in November, stamping the cold from his boots. He looked at the tin, and at the neat stack of annotated pages beside it, and said only, &ldquo;She would have been glad.&rdquo;',
    ],
  },
  {
    n: '10', title: 'On finishing', words: '1,621', pages: '278 / 312', ch: 'Chapter Ten',
    heading: 'On Finishing',
    body: [
      'A book ends before it ends. There is the last sentence, and then there is the letting-go, which takes longer.',
      'She typed the final paragraph at 3:14 in the afternoon. She put the kettle on. This time, she let it whistle.',
    ],
  },
  {
    n: '11', title: 'Epilogue', words: '345', pages: '309 / 312', ch: 'Epilogue',
    heading: 'Epilogue',
    body: [
      'She never published the book under her own name. It was not that sort of inheritance.',
      'She published it under her mother&rsquo;s, and sent the first printed copy to the solicitor, who read it, cried quietly, and did not write back.',
    ],
  },
];

const EditorShowcaseSection = forwardRef<HTMLElement>(function EditorShowcaseSection(_, ref) {
  const [active, setActive] = useState(6);
  const [key, setKey] = useState(6);
  const isMac = useIsMac();

  const onHover = (i: number) => {
    if (i === active) return;
    setActive(i);
    setKey((k) => k + 1);
  };

  const c = CHAPTERS[active];

  return (
    <section id="features" ref={ref} className={SECTION_TIERS.standard.section} style={{ scrollMarginTop: '6rem' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <FadeIn>
          <div className="max-w-3xl mb-14 sm:mb-16">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">01 &middot; The Editor</div>
            <h2 className="mt-3 font-serif font-bold text-gray-900 text-balance" style={SECTION_TIERS.standard.title}>
              Hover over a chapter.<br />
              Preview your ebook.
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-gray-600 max-w-xl text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.55 }}>
              A preview of your book as it will appear on Kindle, Kobo, and Apple Books. Not a rough approximation. Real typography, real margins, real eReader feel.
            </p>
            <div className="mt-6 text-sm text-gray-500" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              &darr; Try it
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6 items-stretch">
            {/* Chapter picker */}
            <div className="bg-[#1e1e1e] text-white rounded-[20px] overflow-hidden border border-[#2f2f2f] flex flex-col min-h-[540px]">
              <header className="flex justify-between items-center px-5 py-4 border-b border-[#2f2f2f]">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">Your Library &middot; The Midnight Garden</span>
                <span className="text-[10px] text-white/30 flex items-center gap-1.5">
                  <kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 font-mono text-[9px]">{isMac ? '⌘' : 'Ctrl'}</kbd>
                  <span>+</span>
                  <kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 font-mono text-[9px]">K</kbd>
                </span>
              </header>
              <div className="flex-1" onMouseLeave={() => { /* keep last hover */ }}>
                {CHAPTERS.map((ch, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => onHover(i)}
                    onFocus={() => onHover(i)}
                    tabIndex={0}
                    className={`flex items-center gap-2.5 px-4 py-2.5 cursor-pointer border-l-2 transition-colors ${
                      i === active ? 'bg-blue-600/10 border-blue-600' : 'border-transparent hover:bg-white/5'
                    }`}
                  >
                    <span className="text-white/20 text-[11px] select-none">⋮⋮</span>
                    <span className="font-mono text-[10px] text-white/30 w-5">{ch.n}</span>
                    <span className={`flex-1 text-[13px] ${i === active ? 'text-white font-medium' : 'text-white/55'}`}>{ch.title}</span>
                    <span className={`font-mono text-[10px] ${i === active ? 'text-white/60' : 'text-white/25'}`}>{ch.words}w</span>
                  </div>
                ))}
              </div>
              <footer className="px-4 py-3.5 border-t border-[#2f2f2f] flex justify-between text-[11px] text-white/30">
                <span>12 chapters &middot; 86,430 words</span>
                <span className="text-white/70 font-mono font-semibold">78%</span>
              </footer>
            </div>

            {/* Reader */}
            <div className="bg-[#f7f4ea] border border-gray-200 rounded-[20px] overflow-hidden flex flex-col relative shadow-[0_24px_40px_-24px_rgba(20,20,19,.22),0_2px_4px_rgba(20,20,19,.04)]">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-white/60">
                <span className="font-mono text-[12px] text-gray-500 font-semibold">9:42</span>
                <span className="text-[13px] text-gray-500 italic" style={{ fontFamily: 'Georgia, serif' }}>Paperwhite &middot; Libre Baskerville &middot; 11pt</span>
                <span className="text-[11px] text-gray-400 tracking-[0.12em]">●●●●○ 84%</span>
              </div>

              <div className="absolute top-4 right-5 bg-gray-900 text-[#faf9f5] text-[10px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10">
                <span className="relative inline-flex w-1.5 h-1.5">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-blue-500 opacity-60 animate-ping" />
                  <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-blue-500" />
                </span>
                Live preview
              </div>

              <div key={key} className="flex-1 px-8 sm:px-12 lg:px-18 py-12 relative animate-[pageSwap_.45s_ease]">
                <style>{`@keyframes pageSwap { 0%{opacity:.4;transform:translateX(10px)} 100%{opacity:1;transform:none} }`}</style>
                <h3 className="font-serif text-[13px] tracking-[0.35em] uppercase font-medium text-center text-gray-400 mb-2">{c.ch}</h3>
                <h2 className="font-serif font-bold text-[30px] sm:text-[34px] text-center mb-8 sm:mb-10 leading-[1.1] text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                  {c.heading}
                </h2>
                <div className="max-w-[52ch] mx-auto" style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '15.5px', lineHeight: 1.75, color: '#2a2a28' }}>
                  {c.body.map((p, i) => (
                    <p
                      key={i}
                      className={`mb-3.5 text-justify ${i === 0 ? 'indent-0 first-letter:font-serif first-letter:font-bold first-letter:text-[62px] first-letter:float-left first-letter:leading-[0.8] first-letter:mr-2.5 first-letter:mt-1 first-letter:text-gray-900' : 'indent-[1.5em]'}`}
                      dangerouslySetInnerHTML={{ __html: p }}
                    />
                  ))}
                </div>
              </div>

              <footer className="px-5 py-3.5 border-t border-gray-200 bg-white/60 flex justify-between font-mono text-[11px] text-gray-400">
                <span>{c.ch}</span>
                <span>{c.pages}</span>
              </footer>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
});

export default EditorShowcaseSection;
