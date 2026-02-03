import { NextRequest, NextResponse } from "next/server";

// This API route transforms canvas sketches into book covers using AI
// Supports both OpenAI and Grok for image generation

type AIProvider = "openai" | "grok" | "auto";

interface GenerateFromSketchRequest {
  sketch: string; // SVG or base64 image data
  prompt?: string;
  title?: string;
  author?: string;
  provider?: AIProvider;
}

// Generate image using OpenAI DALL-E 3 (with sketch context in prompt)
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
        size: "1024x1792", // Portrait for book covers
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
    return data.data?.[0]?.url || null;
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
    const response = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-2-image",
        prompt: prompt,
        n: 1,
        size: "1024x1536",
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
    if (data.data?.[0]?.b64_json) {
      return `data:image/png;base64,${data.data[0].b64_json}`;
    }
    return null;
  } catch (error) {
    console.error("Grok generation error:", error);
    return null;
  }
}

// Analyze sketch to create a description (basic implementation)
function analyzeSketch(svgContent: string): string {
  // Extract basic info from SVG to enhance the prompt
  const hasText = svgContent.includes("<text") || svgContent.includes("tspan");
  const hasCircle = svgContent.includes("<circle") || svgContent.includes("<ellipse");
  const hasRect = svgContent.includes("<rect");
  const hasPath = svgContent.includes("<path");
  
  const elements: string[] = [];
  if (hasText) elements.push("text elements");
  if (hasCircle) elements.push("circular shapes");
  if (hasRect) elements.push("rectangular elements");
  if (hasPath) elements.push("drawn paths and lines");
  
  if (elements.length === 0) {
    return "a simple composition";
  }
  
  return `a composition with ${elements.join(", ")}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateFromSketchRequest = await request.json();
    const { sketch, prompt, title, author, provider = "auto" } = body;

    if (!sketch) {
      return NextResponse.json(
        { error: "Sketch data is required" },
        { status: 400 }
      );
    }

    // Analyze the sketch to enhance the prompt
    const sketchDescription = analyzeSketch(sketch);

    // Build the transformation prompt
    const fullPrompt = [
      "Transform this sketch concept into a professional book cover design",
      `The sketch shows ${sketchDescription}`,
      prompt || "Create a polished, commercially viable book cover",
      title ? `The book is titled "${title}"` : "",
      author ? `by author ${author}` : "",
      "Keep the general composition and layout from the sketch concept",
      "High quality, print ready, cinematic lighting, publishing industry standard",
      "Professional typography if text is included",
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

    // Fallback placeholder
    const encodedTitle = encodeURIComponent(title || "Sketch").slice(0, 30);
    const placeholderUrl = `https://placehold.co/1024x1536/2d3436/ffffff?text=${encodedTitle}`;

    return NextResponse.json({ 
      imageUrl: placeholderUrl,
      provider: "placeholder",
      success: false,
      message: "No AI API keys configured. Add OPENAI_API_KEY or XAI_API_KEY to .env.local",
    });

  } catch (error) {
    console.error("Sketch transformation error:", error);
    return NextResponse.json(
      { error: "Failed to transform sketch" },
      { status: 500 }
    );
  }
}
