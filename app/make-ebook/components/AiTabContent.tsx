import React from "react";

export default function AiTabContent() {
  return (
    <div className="space-y-4">
      <section className="p-4 rounded-xl border border-[#ececec] bg-white">
        <h2 className="text-sm font-semibold mb-4">AI Writing Assistant</h2>
        <div className="mb-4 text-xs text-[#86868B]">
          Get help with writing, editing, and brainstorming
        </div>
        <div className="space-y-3 mb-4">
          <button className="w-full mb-2 px-3 py-2 rounded-full bg-[#15161a] text-white text-sm font-semibold hover:bg-[#23242a] flex items-center gap-2 justify-center shadow">
            Plugin my favourite AI tool
          </button>
          <div className="mb-4 text-xs text-[#86868B]">
            Requires an active subscription with ChatGPT, Grok etc.
          </div>
        </div>
      </section>
    </div>
  );
}