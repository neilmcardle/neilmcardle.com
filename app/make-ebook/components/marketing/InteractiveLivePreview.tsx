'use client';

import React, { useState } from 'react';

const SAMPLE_CONTENT = [
  '<p>The morning light filtered through the curtains as Eleanor sat at her desk, fingers hovering over the keyboard. She had been staring at the blank page for three days now.</p>',
  '<p>Outside, the city was already alive: horns, laughter, the distant rumble of a delivery truck. But inside her apartment, time moved differently. Thick. Slow. Like honey poured on a cold morning.</p>',
  '<p>She typed a single word: <em>Once.</em></p>',
  '<p>Then deleted it.</p>',
  '<p>Her editor had been patient. Unusually patient. Which, Eleanor knew from experience, was its own kind of warning.</p>',
  '<p>She stood, stretched, and walked to the window. Three floors below, a woman was walking a small dog, a determined creature yanking at the lead, nose glued to the pavement. Eleanor watched them until they disappeared around the corner.</p>',
  '<p>When she sat back down, the cursor was still blinking.</p>',
  '<p><em>Once,</em> she typed again. This time, she didn\u2019t delete it.</p>',
].join('');

const PREVIEW_DEVICES = {
  kindle: { width: 236, height: 332, name: 'Kindle' },
  ipad:   { width: 268, height: 356, name: 'iPad'   },
  phone:  { width: 188, height: 336, name: 'Phone'  },
} as const;

type PreviewDevice = keyof typeof PREVIEW_DEVICES;
type PreviewTheme  = 'light' | 'sepia' | 'dark';

/**
 * Interactive ebook preview shown in the Live Previewer marketing section.
 * Lets visitors switch between Kindle/iPad/Phone form factors and three
 * reading themes to see typography rendering live.
 */
export default function InteractiveLivePreview() {
  const [device, setDevice] = useState<PreviewDevice>('kindle');
  const [theme, setTheme]   = useState<PreviewTheme>('light');

  const d         = PREVIEW_DEVICES[device];
  const bgColor   = theme === 'light' ? '#ffffff' : theme === 'sepia' ? '#f4ecd8' : '#1a1a1a';
  const textColor = theme === 'dark' ? '#e5e5e5' : '#141413';

  return (
    <div className="relative w-full max-w-[360px] h-[580px] flex flex-col bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">

      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3 border-b border-gray-200">
        <p className="text-2xs font-semibold text-gray-600 uppercase tracking-widest mb-2.5">Live Preview</p>
        <div className="flex gap-1.5">
          {(Object.entries(PREVIEW_DEVICES) as [PreviewDevice, typeof PREVIEW_DEVICES.kindle][]).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                device === key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
              }`}
            >
              {val.name}
            </button>
          ))}
        </div>
      </div>

      {/* E-reader area */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 px-4 py-2">
        <div
          className="bg-[#2a2a2a] shadow-2xl transition-all duration-300"
          style={{ borderRadius: 20, padding: 8 }}
        >
          <div
            className="overflow-hidden transition-colors duration-300"
            style={{ width: d.width, height: d.height, backgroundColor: bgColor, borderRadius: 12 }}
          >
            <div
              className="h-full overflow-y-auto px-5 py-5 [&_p]:mb-2.5 [&_em]:italic"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: textColor,
                lineHeight: 1.8,
                fontSize: '12.5px',
                textAlign: 'justify',
              }}
            >
              <h1 className="text-sm font-bold mb-4 text-center" style={{ color: textColor }}>
                Chapter 1
              </h1>
              <div dangerouslySetInnerHTML={{ __html: SAMPLE_CONTENT }} />
            </div>
          </div>
        </div>
      </div>

      {/* Theme controls */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 flex items-center justify-center gap-3">
        {(['light', 'sepia', 'dark'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`w-6 h-6 rounded-full border-2 transition-all ${
              theme === t
                ? 'scale-125 border-gray-900 shadow-md'
                : 'border-gray-300 hover:border-gray-500'
            }`}
            style={{ backgroundColor: t === 'light' ? '#ffffff' : t === 'sepia' ? '#f4ecd8' : '#1a1a1a' }}
            aria-label={`${t} theme`}
            title={t.charAt(0).toUpperCase() + t.slice(1)}
          />
        ))}
      </div>
    </div>
  );
}
