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
      size: "1024x1792", // Portrait orientation
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
      prompt: prompt,
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

// Build prompt - uses user's prompt directly, adds minimal context
function buildTypographyPrompt(
  basePrompt: string,
  title: string,
  subtitle?: string,
  author?: string
): string {
  // If user provided a description, use it directly
  if (basePrompt && basePrompt.trim()) {
    return basePrompt.trim();
  }
  
  // Fallback: generate based on title if no prompt provided
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

    if (!hasOpenAI && !hasGrok) {
      return NextResponse.json(
        {
          success: false,
          message: "No AI providers configured. Please add OPENAI_API_KEY or XAI_API_KEY to your environment.",
        },
        { status: 500 }
      );
    }

    // If a sketch is provided, analyze it with GPT-4 Vision to enhance the prompt
    let enhancedPrompt = prompt;
    if (sketch && hasOpenAI) {
      try {
        const client = getOpenAIClient();
        if (client) {
          const visionResponse = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Analyze this sketch and describe the composition, layout, and key visual elements in detail. Focus on:
- Position of main elements (top, center, bottom, left, right)
- Shapes and objects depicted
- The general scene or concept being illustrated
- Any spatial relationships between elements

Provide a concise description (2-3 sentences) that could be used to recreate this composition. Do NOT mention any text, words, or letters you might see.`,
                  },
                  {
                    type: "image_url",
                    image_url: { url: sketch },
                  },
                ],
              },
            ],
            max_tokens: 200,
          });

          const sketchDescription = visionResponse.choices[0]?.message?.content;
          if (sketchDescription) {
            enhancedPrompt = `${prompt}\n\nCOMPOSITION REFERENCE (follow this layout): ${sketchDescription}`;
          }
        }
      } catch (e) {
        console.error("Vision analysis failed:", e);
        // Continue without sketch analysis
      }
    }

    // Build the optimized typography prompt
    const fullPrompt = buildTypographyPrompt(enhancedPrompt, title, subtitle, author);

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
