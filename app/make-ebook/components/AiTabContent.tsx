import React from "react";

export default function AiTabContent() {
  return (
        <div className="space-y-6">
      <section className="p-4 rounded bg-white">
        <h3 className="font-semibold text-[#23242a] mb-3">AI Writing Assistant</h3>
        <div className="mb-4 text-xs text-[#737373]">
          Get help with writing, editing, and brainstorming
        </div>
        <div className="space-y-3 mb-4">
                  <div className="mb-4">
          <button className="w-full mb-2 px-3 py-2 rounded bg-[#15161a] text-white text-sm font-semibold hover:bg-[#23242a] flex items-center gap-2 justify-center shadow">
            <Sparkles className="w-4 h-4" />
          <div className="mb-4 text-xs text-[#737373]">
            Requires an active subscription with ChatGPT, Grok etc.
          </div>
        </div>
      </section>
    </div>
  );
}