import { NextRequest, NextResponse } from "next/server";

// This API route generates book covers using AI
// Supports both OpenAI DALL-E and Grok (xAI) for image generation

type AIProvider = "openai" | "grok" | "auto";

interface GenerateCoverRequest {
  prompt: string;
  title?: string;
  author?: string;
  provider?: AIProvider; // Which AI to use: "openai", "grok", or "auto" (tries both)
}

// Generate image using OpenAI DALL-E 3
async function generateWithOpenAI(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === "your-openai-api-key-here") {
    console.log("OpenAI API key not configured");
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1792", // Portrait orientation for book covers (DALL-E 3 supported size)
        quality: "hd",
        style: "vivid",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      return null;
    }

    const data = await response.json();
    if (data.data?.[0]?.url) {
      return data.data[0].url;
    }
    return null;
  } catch (error) {
    console.error("OpenAI generation error:", error);
    return null;
  }
}

// Generate image using Grok (xAI)
async function generateWithGrok(prompt: string): Promise<string | null> {
  const apiKey = process.env.XAI_API_KEY;
  
  if (!apiKey) {
    console.log("Grok API key not configured");
    return null;
  }

  try {
    // xAI Grok image generation endpoint - note: size parameter not supported
    const response = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-2-image",
        prompt: `${prompt}\n\nIMPORTANT: Create a FLAT 2D book cover design. NOT a 3D book mockup or perspective view. Generate a flat rectangular image in portrait orientation (approximately 1024x1536 pixels).`,
        n: 1,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Grok API error:", error);
      return null;
    }

    const data = await response.json();
    if (data.data?.[0]?.url) {
      return data.data[0].url;
    }
    // Some APIs return b64_json instead of url
    if (data.data?.[0]?.b64_json) {
      return `data:image/png;base64,${data.data[0].b64_json}`;
    }
    return null;
  } catch (error) {
    console.error("Grok generation error:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateCoverRequest = await request.json();
    const { prompt, title, author, provider = "auto" } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Build an optimized prompt for book cover generation
    const fullPrompt = [
      "Professional book cover design, high quality, print ready",
      prompt,
      title ? `Title: "${title}"` : "",
      author ? `Author: ${author}` : "",
      "Cinematic lighting, detailed, commercial quality, publishing industry standard",
    ].filter(Boolean).join(". ");

    let imageUrl: string | null = null;
    let usedProvider: string = "none";

    // Try to generate based on selected provider
    if (provider === "openai") {
      imageUrl = await generateWithOpenAI(fullPrompt);
      usedProvider = "openai";
    } else if (provider === "grok") {
      imageUrl = await generateWithGrok(fullPrompt);
      usedProvider = "grok";
    } else {
      // Auto mode: try OpenAI first, then Grok
      imageUrl = await generateWithOpenAI(fullPrompt);
      if (imageUrl) {
        usedProvider = "openai";
      } else {
        imageUrl = await generateWithGrok(fullPrompt);
        if (imageUrl) {
          usedProvider = "grok";
        }
      }
    }

    // If we got an image, return it
    if (imageUrl) {
      return NextResponse.json({ 
        imageUrl,
        provider: usedProvider,
        success: true,
      });
    }

    // Fallback: Return a placeholder with instructions
    const encodedTitle = encodeURIComponent(title || "Book Title").slice(0, 30);
    const placeholderUrl = `https://placehold.co/1024x1536/1a1a2e/ffffff?text=${encodedTitle}`;

    return NextResponse.json({ 
      imageUrl: placeholderUrl,
      provider: "placeholder",
      success: false,
      message: "No AI API keys configured. Add OPENAI_API_KEY or XAI_API_KEY to .env.local",
    });

  } catch (error) {
    console.error("Cover generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover" },
      { status: 500 }
    );
  }
}

// Also support GET for testing
export async function GET() {
  const openaiConfigured = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your-openai-api-key-here";
  const grokConfigured = !!process.env.XAI_API_KEY;

  return NextResponse.json({
    status: "ok",
    providers: {
      openai: openaiConfigured ? "configured" : "not configured",
      grok: grokConfigured ? "configured" : "not configured",
    },
    message: "POST to this endpoint with { prompt, title?, author?, provider? }",
  });
}
