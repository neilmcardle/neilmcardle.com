import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type AIProvider = "auto" | "openai" | "grok";

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
  return {
    openai: process.env.OPENAI_API_KEY ? "configured" : "not configured",
    grok: process.env.XAI_API_KEY ? "configured" : "not configured",
  };
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

    return response.data[0]?.url || null;
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
      prompt: `${prompt}\n\nIMPORTANT: Create a FLAT 2D book cover design. NOT a 3D book mockup. Portrait orientation, taller than wide.`,
      n: 1,
    });

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

function buildSketchTransformPrompt(
  sketchDescription: string,
  title: string,
  stylePrompt: string,
  customNotes?: string
): string {
  return [
    `TRANSFORM SKETCH TO PROFESSIONAL BOOK COVER`,
    ``,
    `I have a rough sketch/wireframe of a book cover layout. Transform this into professional book cover typography:`,
    ``,
    `SKETCH/LAYOUT DESCRIPTION:`,
    sketchDescription,
    ``,
    `TEXT TO STYLIZE: "${title}"`,
    ``,
    `STYLE: ${stylePrompt}`,
    customNotes ? `ADDITIONAL REQUIREMENTS: ${customNotes}` : "",
    ``,
    `TRANSFORMATION RULES:`,
    `- Keep the general layout and composition from the sketch`,
    `- Transform any rough text into beautiful, artistic typography`,
    `- Make plain letters become illustrative and genre-appropriate`,
    `- Add professional textures, effects, and depth`,
    `- Turn amateur elements into polished, publishable design`,
    `- Maintain book cover proportions (portrait orientation)`,
    `- The result should look like a professional book cover`,
    ``,
    `The goal is to show how a basic sketch can become a stunning book cover.`,
    `Make the typography the hero - it should be artistic and hand-crafted looking.`,
  ]
    .filter(Boolean)
    .join("\n");
}

function parseSVGContent(svg: string): string {
  const textMatches = svg.match(/<text[^>]*>([^<]*)<\/text>/gi) || [];
  const texts = textMatches.map((t) =>
    t.replace(/<\/?[^>]+>/g, "").trim()
  );

  const hasRectangles = svg.includes("<rect");
  const hasCircles = svg.includes("<circle") || svg.includes("<ellipse");
  const hasLines = svg.includes("<line") || svg.includes("<path");

  const description = [
    texts.length > 0 ? `Contains text elements: ${texts.join(", ")}` : "",
    hasRectangles ? "Has rectangular/box shapes (possibly layout guides)" : "",
    hasCircles ? "Has circular elements" : "",
    hasLines ? "Has lines/paths (possibly decorative elements or underlines)" : "",
    "General layout shows positioning of elements for a book cover design",
  ]
    .filter(Boolean)
    .join(". ");

  return description || "A rough sketch layout for a book cover";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sketch,
      title,
      style = "professional elegant book cover typography",
      customNotes,
      provider = "auto",
    } = body as {
      sketch?: string;
      title: string;
      style?: string;
      customNotes?: string;
      provider?: AIProvider;
    };

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

    const sketchDescription = sketch
      ? parseSVGContent(sketch)
      : "A blank canvas for a book cover";

    const fullPrompt = buildSketchTransformPrompt(
      sketchDescription,
      title,
      style,
      customNotes
    );

    let imageUrl: string | null = null;
    let usedProvider: string = "";

    if (provider === "openai" || (provider === "auto" && hasOpenAI)) {
      imageUrl = await generateWithOpenAI(fullPrompt);
      if (imageUrl) usedProvider = "openai";
    }

    if (!imageUrl && (provider === "grok" || (provider === "auto" && hasGrok))) {
      imageUrl = await generateWithGrok(fullPrompt);
      if (imageUrl) usedProvider = "grok";
    }

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
          message: "Failed to transform sketch. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      provider: usedProvider,
    });
  } catch (error) {
    console.error("Sketch transformation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
