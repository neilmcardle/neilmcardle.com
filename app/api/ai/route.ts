import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { messages, book } = await req.json();

  const prompt = [
  "You are an expert AI ebook called Cav, helping a user write a book.",
  "Current book data:",
  `Title: ${book.title || "(none)"}\nAuthor: ${book.author || "(none)"}\nChapters: ${book.chapters?.map((ch: any) => ch.title).join(", ")}`,
  "Chat history:",
  ...messages.map((m: any) => `${m.from === "user" ? "User" : "Assistant"}: ${m.text}`),
  "IMPORTANT: If the user requests a book outline, RESPOND WITH ONLY a JSON array of chapter objects, like this: [{\"title\": \"Chapter 1\"}, {\"title\": \"Chapter 2\"}]. Do NOT include any explanations, markdown, or extra text. If they did not ask for an outline, reply normally.",
].join("\n\n");

  // Start streaming from Ollama
  const ollamaRes = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral", // Change this to your preferred model if needed
      prompt,
      stream: true,
      options: {
        temperature: 0.7,
        num_predict: 700,
      },
    }),
  });

  if (!ollamaRes.body) {
    return new Response("No response body from Ollama", { status: 500 });
  }

  // Stream Ollama's output as SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = ollamaRes.body!.getReader();
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);

          // Ollama streams JSON lines like: { response: "...", done: false }
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              if (json.response) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: json.response })}\n\n`));
              }
              if (json.done) {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
                return;
              }
            } catch {
              // not a complete JSON, wait for more chunks
            }
          }
        }
      } catch (e) {
        controller.enqueue(encoder.encode("data: [ERROR]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}