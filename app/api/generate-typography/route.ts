import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type AIProvider = "auto" | "openai" | "grok" | "gemini";

// Rate limits to protect against abuse.
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const DAILY_LIMIT = 30;

// In-memory; replace with shared store for multi-instance deployments.
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
let dailyCount = 0;
let dailyResetTime = Date.now() + 24 * 60 * 60 * 1000;

function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();

  if (now > dailyResetTime) {
    dailyCount = 0;
    dailyResetTime = now + 24 * 60 * 60 * 1000;
  }

  if (dailyCount >= DAILY_LIMIT) {
    return {
      allowed: false,
      message: "Daily generation limit reached. Please try again tomorrow."
    };
  }

  const record = rateLimitStore.get(ip);
  if (record) {
    if (now > record.resetTime) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    } else if (record.count >= MAX_REQUESTS_PER_WINDOW) {
      const minutesLeft = Math.ceil((record.resetTime - now) / 60000);
      return { 
        allowed: false, 
        message: `Rate limit exceeded. Please try again in ${minutesLeft} minutes.` 
      };
    } else {
      record.count++;
    }
  } else {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  }
  
  dailyCount++;
  return { allowed: true };
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function getGrokClient() {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    baseURL: "https://api.x.ai/v1",
  });
}

function getProviderStatus() {
  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
  return {
    openai: process.env.OPENAI_API_KEY ? "configured" : "not configured",
    grok: process.env.XAI_API_KEY ? "configured" : "not configured",
    gemini: geminiKey && geminiKey !== "your-gemini-api-key-here" ? "configured" : "not configured",
  };
}

// Convert a remote image URL to a base64 data URL to avoid CORS in the browser.
async function fetchImageAsBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error("Failed to fetch image:", response.status);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Error fetching image as base64:", error);
    return null;
  }
}

async function generateWithOpenAI(prompt: string): Promise<string | null> {
  const client = getOpenAIClient();
  if (!client) return null;

  try {
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1792",
      quality: "hd",
      style: "vivid",
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) return null;

    return await fetchImageAsBase64(imageUrl);
  } catch (error) {
    console.error("OpenAI generation error:", error);
    return null;
  }
}

async function generateWithGrok(prompt: string): Promise<string | null> {
  const client = getGrokClient();
  if (!client) return null;

  try {
    // size parameter unsupported by this provider
    const response = await client.images.generate({
      model: "grok-2-image",
      prompt: prompt,
      n: 1,
    });

    const imageData = response.data[0];
    if (!imageData) return null;

    if ("b64_json" in imageData) {
      return `data:image/png;base64,${imageData.b64_json}`;
    } else if ("url" in imageData) {
      return await fetchImageAsBase64(imageData.url as string);
    }

    return null;
  } catch (error) {
    console.error("Grok generation error:", error);
    return null;
  }
}

async function generateWithGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: `${prompt}\n\nIMPORTANT: Create a FLAT 2D book cover design. NOT a 3D book mockup or perspective view. Generate a flat rectangular image in portrait orientation suitable for a book cover.`,
            },
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: "9:16",
            personGeneration: "allow_adult",
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      return null;
    }

    const data = await response.json();
    
    if (data.predictions?.[0]?.bytesBase64Encoded) {
      return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
    }
    
    return null;
  } catch (error) {
    console.error("Gemini generation error:", error);
    return null;
  }
}

async function analyzeSketchWithGemini(sketchBase64: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    console.log("Gemini API key not configured for vision");
    return null;
  }

  try {
    const base64Data = sketchBase64.replace(/^data:image\/\w+;base64,/, "");
    console.log("Sending sketch to Gemini Vision, base64 length:", base64Data.length);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Describe this sketch in detail for an image generation AI. Include:\n- All text/words visible (transcribe exactly as written)\n- The position of elements (top, center, bottom, left, right)\n- Shapes, objects, and drawings\n- The overall scene or concept\n- Layout and composition\n\nBe specific and descriptive. Output only the description, nothing else.`,
                },
                {
                  inline_data: {
                    mime_type: "image/png",
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini Vision API error:", error);
      return null;
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    console.log("Gemini Vision response:", result);
    return result;
  } catch (error) {
    console.error("Gemini vision analysis error:", error);
    return null;
  }
}

async function analyzeSketchWithOpenAI(sketchBase64: string): Promise<string | null> {
  const client = getOpenAIClient();
  if (!client) return null;

  try {
    const visionResponse = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Describe this sketch in detail for an image generation AI. Include:\n- All text/words visible (transcribe exactly as written)\n- The position of elements (top, center, bottom, left, right)\n- Shapes, objects, and drawings\n- The overall scene or concept\n- Layout and composition\n\nBe specific and descriptive. Output only the description, nothing else.`,
            },
            {
              type: "image_url",
              image_url: { url: sketchBase64 },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    return visionResponse.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("OpenAI vision analysis error:", error);
    return null;
  }
}

function buildTypographyPrompt(
  basePrompt: string,
  title: string,
  subtitle?: string,
  author?: string
): string {
  if (basePrompt && basePrompt.trim()) {
    return basePrompt.trim();
  }

  return `Create a visually striking illustration inspired by the theme: "${title}"${subtitle ? `, with the subtitle "${subtitle}"` : ""}. Portrait orientation.`;
}

export async function GET() {
  return NextResponse.json({
    message: "Typography generation API",
    providers: getProviderStatus(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() ||
               request.headers.get("x-real-ip") ||
               "unknown";

    const rateLimitResult = checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, message: rateLimitResult.message },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      prompt,
      title,
      subtitle,
      author,
      provider = "auto",
      sketch,
    } = body as {
      prompt: string;
      title: string;
      subtitle?: string;
      author?: string;
      provider?: AIProvider;
      sketch?: string; // Base64 encoded image data
    };

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    const status = getProviderStatus();
    const hasOpenAI = status.openai === "configured";
    const hasGrok = status.grok === "configured";
    const hasGemini = status.gemini === "configured";

    if (!hasOpenAI && !hasGrok && !hasGemini) {
      return NextResponse.json(
        {
          success: false,
          message: "No AI providers configured. Please add OPENAI_API_KEY, XAI_API_KEY, or GOOGLE_GEMINI_API_KEY to your environment.",
        },
        { status: 500 }
      );
    }

    let enhancedPrompt = prompt || "";
    let sketchAnalyzed = false;

    if (sketch) {
      console.log("Sketch received, attempting vision analysis...");
      let sketchDescription: string | null = null;

      if (hasGemini) {
        console.log("Trying Gemini vision...");
        sketchDescription = await analyzeSketchWithGemini(sketch);
        if (sketchDescription) {
          console.log("Gemini vision result:", sketchDescription);
        }
      }
      
      if (!sketchDescription && hasOpenAI) {
        console.log("Trying OpenAI vision...");
        sketchDescription = await analyzeSketchWithOpenAI(sketch);
        if (sketchDescription) {
          console.log("OpenAI vision result:", sketchDescription);
        }
      }
      
      if (sketchDescription) {
        sketchAnalyzed = true;
        if (enhancedPrompt.trim()) {
          enhancedPrompt = `${enhancedPrompt}\n\nIMPORTANT: Faithfully reproduce this sketch layout: ${sketchDescription}. Keep the same composition, elements, and arrangement as drawn.`;
        } else {
          enhancedPrompt = `Create an illustration that FAITHFULLY matches this sketch: ${sketchDescription}. Keep the exact same elements, positions, and composition as described. Do not add unrelated objects.`;
        }
        console.log("Final enhanced prompt:", enhancedPrompt);
      } else {
        console.log("No sketch description obtained from vision AI");
      }
    }

    const fullPrompt = buildTypographyPrompt(enhancedPrompt, title, subtitle, author);

    let imageUrl: string | null = null;
    let usedProvider: string = "";

    if (provider === "gemini" || (provider === "auto" && hasGemini)) {
      imageUrl = await generateWithGemini(fullPrompt);
      if (imageUrl) usedProvider = "gemini";
    }

    if (!imageUrl && (provider === "openai" || (provider === "auto" && hasOpenAI))) {
      imageUrl = await generateWithOpenAI(fullPrompt);
      if (imageUrl) usedProvider = "openai";
    }

    if (!imageUrl && (provider === "grok" || (provider === "auto" && hasGrok))) {
      imageUrl = await generateWithGrok(fullPrompt);
      if (imageUrl) usedProvider = "grok";
    }

    if (!imageUrl && provider !== "auto") {
      if (provider === "gemini") {
        if (hasOpenAI) {
          imageUrl = await generateWithOpenAI(fullPrompt);
          if (imageUrl) usedProvider = "openai (fallback)";
        }
        if (!imageUrl && hasGrok) {
          imageUrl = await generateWithGrok(fullPrompt);
          if (imageUrl) usedProvider = "grok (fallback)";
        }
      } else if (provider === "openai") {
        if (hasGemini) {
          imageUrl = await generateWithGemini(fullPrompt);
          if (imageUrl) usedProvider = "gemini (fallback)";
        }
        if (!imageUrl && hasGrok) {
          imageUrl = await generateWithGrok(fullPrompt);
          if (imageUrl) usedProvider = "grok (fallback)";
        }
      } else if (provider === "grok") {
        if (hasGemini) {
          imageUrl = await generateWithGemini(fullPrompt);
          if (imageUrl) usedProvider = "gemini (fallback)";
        }
        if (!imageUrl && hasOpenAI) {
          imageUrl = await generateWithOpenAI(fullPrompt);
          if (imageUrl) usedProvider = "openai (fallback)";
        }
      }
    }

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to generate typography with available providers. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      provider: usedProvider,
      title,
    });
  } catch (error) {
    console.error("Typography API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
