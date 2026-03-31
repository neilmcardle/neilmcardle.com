"use client";
import { useState, useRef, useEffect } from "react";

const DEMO_CONTENT = `<p>The rain hadn't stopped in four days. Somewhere below the eight-hundredth floor, a noodle vendor was still open — his cart a smear of orange light in the grey. Kovacs watched him from the window and wondered if the man dreamed.</p><p>Most people didn't, anymore. Dreams cost something you couldn't buy back.</p><p>He lit a cigarette and pulled up the file. The subject's name was <em>Roy.</em> Manufactured. Retired. Reported.</p><p>Kovacs had stopped believing reports a long time ago.</p>`;

function NavBtn({
  active,
  label,
  children,
}: {
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button className="flex flex-col items-center w-full py-1.5 gap-0.5 group" tabIndex={-1}>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          active ? "text-[#4070ff]" : "text-[#424242] group-hover:text-[#525252]"
        }`}
        style={{ background: active ? "rgba(64,112,255,0.1)" : "transparent" }}
      >
        {children}
      </div>
      <span
        className="text-[9px] font-medium"
        style={{ color: active ? "#4070ff" : "#363636" }}
      >
        {label}
      </span>
    </button>
  );
}

function TBtn({
  children,
  cmd,
}: {
  children: React.ReactNode;
  cmd?: string;
}) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cmd) document.execCommand(cmd, false);
  };
  return (
    <button
      type="button"
      onMouseDown={handleMouseDown}
      tabIndex={-1}
      className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
      style={{ background: "#1e1e1e", color: "#525252" }}
      onMouseEnter={e => (e.currentTarget.style.color = "#a3a3a3")}
      onMouseLeave={e => (e.currentTarget.style.color = "#525252")}
    >
      {children}
    </button>
  );
}

export default function PortfolioEditorDemo() {
  const [title, setTitle] = useState("Neon & Rain");
  const [author, setAuthor] = useState("J. Kovacs");
  const [previewHtml, setPreviewHtml] = useState(DEMO_CONTENT);
  const [hasTyped, setHasTyped] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = DEMO_CONTENT;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      setPreviewHtml(editorRef.current.innerHTML);
      if (!hasTyped) setHasTyped(true);
    }
  };

  return (
    <div
      className="flex overflow-hidden rounded-2xl w-full"
      style={{
        height: "520px",
        background: "#161616",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.2)",
      }}
    >
      {/* Col 1: Slim sidebar */}
      <div
        className="w-14 flex-shrink-0 flex-col items-center py-4 gap-0.5 hidden sm:flex"
        style={{ background: "#1e1e1e", borderRight: "1px solid #2f2f2f" }}
      >
        <div className="mb-3 w-8 h-8 flex items-center justify-center opacity-50">
          <img src="/make-ebook-logo.svg" alt="" className="w-6 h-6 invert" />
        </div>
        <nav className="flex flex-col w-full px-2 gap-0.5 pt-1">
          <NavBtn label="Library">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <rect x="4" y="4" width="3" height="16" rx="0.5" />
              <rect x="10" y="7" width="3" height="13" rx="0.5" />
              <rect x="16" y="5" width="3" height="15" rx="0.5" />
              <path d="M3 20h18" />
            </svg>
          </NavBtn>
          <NavBtn label="Book" active>
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M8 7h8M8 11h8M8 15h5" />
            </svg>
          </NavBtn>
          <NavBtn label="Chapters">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8M16 17H8M10 9H8" />
            </svg>
          </NavBtn>
          <NavBtn label="Notes">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </NavBtn>
        </nav>
      </div>

      {/* Col 2: Left panel */}
      <div
        className="w-[192px] flex-shrink-0 flex-col hidden md:flex"
        style={{ background: "#1e1e1e", borderRight: "1px solid #2f2f2f" }}
      >
        {/* Book details */}
        <div className="px-4 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid #2f2f2f" }}>
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-4 select-none"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Book Details
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <div
                className="text-[10px] font-medium uppercase tracking-wider mb-1"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Title
              </div>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.85)", caretColor: "#4070ff" }}
              />
            </div>
            <div style={{ height: "1px", background: "#2a2a2a" }} />
            <div>
              <div
                className="text-[10px] font-medium uppercase tracking-wider mb-1"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Author
              </div>
              <input
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm"
                style={{ color: "rgba(255,255,255,0.6)", caretColor: "#4070ff" }}
              />
            </div>
          </div>
        </div>

        {/* Chapter list */}
        <div className="px-4 pt-4">
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-3 select-none"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Chapters
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="relative flex items-center">
              <div
                className="absolute left-[-12px] w-1.5 rounded-full"
                style={{ background: "#4070ff", top: 6, height: 24 }}
              />
              <div
                className="flex-1 px-3 py-2 rounded-2xl text-xs font-semibold"
                style={{ background: "rgba(64,112,255,0.12)", color: "rgba(255,255,255,0.9)" }}
              >
                Chapter 1
              </div>
            </div>
            <div
              className="px-3 py-2 rounded-2xl text-xs"
              style={{ background: "#1a1a1a", color: "rgba(255,255,255,0.35)" }}
            >
              Chapter 2
            </div>
            <div
              className="px-3 py-2 rounded-2xl text-xs"
              style={{ background: "#1a1a1a", color: "rgba(255,255,255,0.35)" }}
            >
              Epilogue
            </div>
          </div>
        </div>
      </div>

      {/* Col 3: Editor */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: "#1e1e1e" }}>
        {/* Toolbar */}
        <div
          className="flex items-center px-6 py-2 gap-1 flex-shrink-0 overflow-x-auto"
          style={{ background: "#262626", borderBottom: "1px solid #2f2f2f" }}
        >
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <TBtn cmd="bold"><span className="font-bold">B</span></TBtn>
            <TBtn cmd="italic"><span className="italic">I</span></TBtn>
            <TBtn cmd="underline"><span className="underline">U</span></TBtn>
            <TBtn cmd="strikeThrough"><span className="line-through">S</span></TBtn>
          </div>
          <div className="w-px h-5 mx-1 flex-shrink-0" style={{ background: "#2f2f2f" }} />
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {["P", "H1", "H2", "H3"].map(h => (
              <TBtn key={h}><span className="text-xs">{h}</span></TBtn>
            ))}
          </div>
          <div className="w-px h-5 mx-1 flex-shrink-0" style={{ background: "#2f2f2f" }} />
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <TBtn cmd="justifyLeft">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <rect x="1" y="2.5" width="14" height="1.5" rx="0.5" />
                <rect x="1" y="6.5" width="9" height="1.5" rx="0.5" />
                <rect x="1" y="10.5" width="14" height="1.5" rx="0.5" />
              </svg>
            </TBtn>
            <TBtn cmd="justifyCenter">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <rect x="1" y="2.5" width="14" height="1.5" rx="0.5" />
                <rect x="3.5" y="6.5" width="9" height="1.5" rx="0.5" />
                <rect x="1" y="10.5" width="14" height="1.5" rx="0.5" />
              </svg>
            </TBtn>
          </div>
        </div>

        {/* Chapter title */}
        <div className="px-6 pt-5 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid #2f2f2f" }}>
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-2 select-none"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Chapter
          </div>
          <div
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "1.375rem",
              fontWeight: 700,
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            The Eighth Tier
          </div>
        </div>

        {/* Contenteditable */}
        <div className="flex-1 relative overflow-y-auto">
          {!hasTyped && (
            <div
              className="absolute top-6 right-6 text-[11px] pointer-events-none select-none animate-pulse"
              style={{ color: "rgba(255,255,255,0.15)" }}
            >
              try typing ↑
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            spellCheck={false}
            className="px-6 py-6 outline-none min-h-full"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "15px",
              lineHeight: "1.75",
              color: "rgba(255,255,255,0.72)",
              caretColor: "#4070ff",
            }}
          />
        </div>
      </div>

      {/* Col 4: Live preview */}
      <div
        className="w-[232px] flex-shrink-0 flex-col hidden lg:flex"
        style={{ background: "#1e1e1e", borderLeft: "1px solid #2f2f2f" }}
      >
        <div
          className="px-4 py-3 flex-shrink-0 flex items-center"
          style={{ borderBottom: "1px solid #2f2f2f" }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.15em] select-none"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Preview
          </span>
        </div>
        <div className="flex-1 p-3 overflow-hidden">
          <div
            className="h-full rounded-xl overflow-auto"
            style={{ background: "#ffffff", padding: "20px 16px" }}
          >
            <div
              style={{
                fontSize: "8px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#bbb",
                marginBottom: "12px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: "12px",
                fontWeight: 700,
                color: "#111",
                marginBottom: "10px",
                lineHeight: 1.3,
              }}
            >
              The Eighth Tier
            </div>
            <div
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: "10.5px",
                color: "#222",
                lineHeight: "1.85",
              }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
