import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type AIProvider = "auto" | "openai" | "grok";

// ============================================
// RATE LIMITING - Protect against API abuse
// ============================================
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 generations per hour per IP
const DAILY_LIMIT = 30; // Max 30 generations per day total (all users)

// In-memory rate limit store (resets on server restart)
// For production with multiple instances, use Redis instead
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
let dailyCount = 0;
let dailyResetTime = Date.now() + 24 * 60 * 60 * 1000;

function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  
  // Reset daily counter if needed
  if (now > dailyResetTime) {
    dailyCount = 0;
    dailyResetTime = now + 24 * 60 * 60 * 1000;
  }
  
  // Check daily limit
  if (dailyCount >= DAILY_LIMIT) {
    return { 
      allowed: false, 
      message: "Daily generation limit reached. Please try again tomorrow." 
    };
  }
  
  // Check per-IP limit
  const record = rateLimitStore.get(ip);
  if (record) {
    if (now > record.resetTime) {
      // Reset window
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

// ============================================

// Initialize clients lazily
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

// Check if providers are configured
function getProviderStatus() {
  return {
    openai: process.env.OPENAI_API_KEY ? "configured" : "not configured",
    grok: process.env.XAI_API_KEY ? "configured" : "not configured",
  };
}

// Generate with OpenAI DALL-E
async function generateWithOpenAI(prompt: string): Promise<string | null> {
  const client = getOpenAIClient();
  if (!client) return null;

  try {
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1792", // Portrait for book covers
      quality: "hd",
      style: "vivid",
    });

    return response.data[0]?.url || null;
  } catch (error) {
    console.error("OpenAI generation error:", error);
    return null;
  }
}

// Generate with Grok
async function generateWithGrok(prompt: string): Promise<string | null> {
  const client = getGrokClient();
  if (!client) return null;

  try {
    // Grok doesn't support size parameter
    const response = await client.images.generate({
      model: "grok-2-image",
      prompt: `${prompt}\n\nCRITICAL: No text or letters in the image. Flat 2D illustration only, portrait orientation. No books or book shapes.`,
      n: 1,
    });

    // Check different response formats from Grok
    const imageData = response.data[0];
    if (!imageData) return null;
    
    if ("url" in imageData) {
      return imageData.url as string;
    } else if ("b64_json" in imageData) {
      return `data:image/png;base64,${imageData.b64_json}`;
    }
    
    return null;
  } catch (error) {
    console.error("Grok generation error:", error);
    return null;
  }
}

// Build optimized prompt - generates artwork only, no text
function buildTypographyPrompt(
  basePrompt: string,
  title: string,
  subtitle?: string,
  author?: string
): string {
  const parts = [
    `Create a stunning ILLUSTRATION for a poster or print.`,
    ``,
    `This is a flat 2D digital artwork - a single rectangular image.`,
    `Portrait orientation (taller than wide, approximately 2:3 ratio).`,
    ``,
    `ARTWORK CONCEPT:`,
    `The illustration should evoke the mood and themes of: "${title}"`,
    basePrompt ? `Style direction: ${basePrompt}` : null,
    ``,
    `IMPORTANT RULES:`,
    `- Create ONLY the background artwork/illustration`,
    `- DO NOT include ANY text, letters, words, titles, or typography`,
    `- DO NOT render any book, book shape, or book mockup`,
    `- Leave space at the top and bottom for text to be added later`,
    `- This is a flat rectangular digital illustration`,
    `- Make it visually striking and suitable as a background for text overlay`,
    ``,
    `OUTPUT: A beautiful flat illustration with NO TEXT, ready for typography to be added on top.`,
  ]
    .filter(Boolean)
    .join("\n");

  return parts;
}

export async function GET() {
  return NextResponse.json({
    message: "Typography generation API",
    providers: getProviderStatus(),
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || 
               request.headers.get("x-real-ip") || 
               "unknown";
    
    // Check rate limit
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
    } = body as {
      prompt: string;
      title: string;
      subtitle?: string;
      author?: string;
      provider?: AIProvider;
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

    if (!hasOpenAI && !hasGrok) {
      return NextResponse.json(
        {
          success: false,
          message: "No AI providers configured. Please add OPENAI_API_KEY or XAI_API_KEY to your environment.",
        },
        { status: 500 }
      );
    }

    // Build the optimized typography prompt
    const fullPrompt = buildTypographyPrompt(prompt, title, subtitle, author);

    let imageUrl: string | null = null;
    let usedProvider: string = "";

    // Try providers based on selection
    if (provider === "openai" || (provider === "auto" && hasOpenAI)) {
      imageUrl = await generateWithOpenAI(fullPrompt);
      if (imageUrl) usedProvider = "openai";
    }

    // Try Grok if OpenAI didn't work or wasn't selected
    if (!imageUrl && (provider === "grok" || (provider === "auto" && hasGrok))) {
      imageUrl = await generateWithGrok(fullPrompt);
      if (imageUrl) usedProvider = "grok";
    }

    // Fallback to the other provider if first choice failed
    if (!imageUrl && provider !== "auto") {
      if (provider === "openai" && hasGrok) {
        imageUrl = await generateWithGrok(fullPrompt);
        if (imageUrl) usedProvider = "grok (fallback)";
      } else if (provider === "grok" && hasOpenAI) {
        imageUrl = await generateWithOpenAI(fullPrompt);
        if (imageUrl) usedProvider = "openai (fallback)";
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
