import React, { useRef, useEffect, useState } from "react";

type AIMsgType = "general" | "single-title" | "title-list" | "outline-json" | "chapter-content";

type Msg = {
  from: "ai" | "user";
  text: string;
  aiMsgType?: AIMsgType;
  aiTitle?: string;
  aiTitles?: string[];
  aiOutline?: { title: string }[];
};

type ChatPanelProps = {
  messages: Msg[];
  onSendMessage: (text: string, action?: string) => void;
  onAIAction: (action: string) => void;
  loading?: boolean;
  onStopStreaming?: () => void;
  onInsertAIContent: (msg: Msg, type: AIMsgType, data?: any) => void;
  selectedChapterIdx: number;
};

export default function ChatPanel({
  messages,
  onSendMessage,
  onAIAction,
  loading,
  onStopStreaming,
  onInsertAIContent,
  selectedChapterIdx,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <div
        className="flex-1 overflow-y-auto space-y-2"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        {messages.map((msg, i) => (
          <div key={i} className={`rounded-lg px-3 py-2 max-w-xs ${msg.from === "ai" ? "bg-[#E5E9F2] text-black self-start" : "bg-[#1D1D1F] text-white self-end"}`}>
            <div>
              {msg.aiMsgType === "single-title" && msg.aiTitle ? (
                <div className="font-semibold">{msg.aiTitle}</div>
              ) : msg.aiMsgType === "title-list" && msg.aiTitles ? (
                <>
                  <div className="mb-1">Book title suggestions:</div>
                  <ul>
                    {msg.aiTitles.map((title, idx) => (
                      <li key={idx} className="flex items-center gap-2 my-1">
                        <span>{title}</span>
                        <button
                          className="text-xs bg-green-100 text-green-700 rounded px-2 py-1 ml-2"
                          onClick={() => onInsertAIContent(msg, "title-list", title)}
                          title={`Set as Book Title`}
                        >Set as Title</button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : msg.aiMsgType === "outline-json" && msg.aiOutline ? (
                <>
                  <div className="mb-1">Outline:</div>
                  <ul>
                    {msg.aiOutline.map((ch, idx) => (
                      <li key={idx}>{ch.title}</li>
                    ))}
                  </ul>
                  <button
                    className="mt-2 text-xs bg-blue-100 text-blue-700 rounded px-2 py-1"
                    onClick={() => onInsertAIContent(msg, "outline-json", msg.aiOutline)}
                  >
                    Set as Chapters
                  </button>
                </>
              ) : msg.aiMsgType === "chapter-content" && msg.text.trim() ? (
                <>
                  <div>{msg.text}</div>
                  <button
                    className="mt-2 text-xs bg-green-100 text-green-700 rounded px-2 py-1"
                    onClick={() => onInsertAIContent(msg, "chapter-content")}
                    title={`Add to Chapter ${selectedChapterIdx + 1}`}
                  >
                    Add to Chapter {selectedChapterIdx + 1}
                  </button>
                </>
              ) : (
                <div>{msg.text}</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        className="flex gap-2 mt-4"
        onSubmit={e => { e.preventDefault(); onSendMessage(input); setInput(""); }}
      >
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded border focus:outline-none focus:border-blue-400"
          placeholder="Ask for an outline, chapter, or help…"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button className="px-4 py-2 bg-[#1D1D1F] text-white rounded" type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
        {loading && onStopStreaming && (
          <button className="px-2 py-2 bg-gray-200 text-gray-700 rounded" type="button" onClick={onStopStreaming}>
            Stop
          </button>
        )}
      </form>
      <div className="flex gap-2 mt-2 flex-wrap">
        <button className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1" onClick={() => onAIAction("suggest-title")} disabled={loading}>Suggest Title</button>
        <button className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1" onClick={() => onAIAction("generate-outline")} disabled={loading}>Generate Outline</button>
        <button className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1" onClick={() => onAIAction("spellcheck")} disabled={loading}>Spellcheck</button>
        <button className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1" onClick={() => onAIAction("generate-cover")} disabled={loading}>Generate Cover</button>
      </div>
    </div>
  );
}