import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

// Rate limiting (simple in-memory for demo)
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5; // Inpainting is expensive, limit more
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
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
  
  return { allowed: true };
}

// Helper: Fetch an image URL and convert to base64 data URL (avoids CORS issues)
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

// Convert base64 to File for OpenAI API
async function base64ToFile(base64: string, filename: string): Promise<File> {
  const res = await fetch(base64);
  const blob = await res.blob();
  return new File([blob], filename, { type: "image/png" });
}

// Resize image to square (required for DALL-E 2)
async function resizeToSquare(base64: string, size: number = 1024): Promise<string> {
  // This runs server-side, so we need to use a different approach
  // For now, we'll trust the client sends properly sized images
  // In production, use sharp or similar library
  return base64;
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

    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json(
        { success: false, message: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { image, mask, prompt } = body as {
      image: string; // Base64 original image
      mask: string;  // Base64 mask (transparent = edit areas)
      prompt: string;
    };

    if (!image || !mask || !prompt?.trim()) {
      return NextResponse.json(
        { success: false, message: "Image, mask, and prompt are required" },
        { status: 400 }
      );
    }

    // Convert base64 to Files
    const imageFile = await base64ToFile(image, "image.png");
    const maskFile = await base64ToFile(mask, "mask.png");

    console.log("Calling DALL-E 2 inpainting API...");
    console.log("Image size:", imageFile.size);
    console.log("Mask size:", maskFile.size);
    console.log("Prompt:", prompt);

    // Call DALL-E 2 image edit (inpainting) API
    const response = await client.images.edit({
      model: "dall-e-2",
      image: imageFile,
      mask: maskFile,
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: "No image returned from API" },
        { status: 500 }
      );
    }

    // Fetch and convert to base64 to avoid CORS issues in browser
    const base64Image = await fetchImageAsBase64(imageUrl);
    if (!base64Image) {
      return NextResponse.json(
        { success: false, message: "Failed to process generated image" },
        { status: 500 }
      );
    }

    console.log("Inpainting successful!");

    return NextResponse.json({
      success: true,
      imageUrl: base64Image,
    });
  } catch (error: unknown) {
    console.error("Inpainting API error:", error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes("Invalid image")) {
        return NextResponse.json(
          { success: false, message: "Invalid image format. Images must be PNG and square." },
          { status: 400 }
        );
      }
      if (error.message.includes("mask")) {
        return NextResponse.json(
          { success: false, message: "Invalid mask format. Please try drawing again." },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, message: "Failed to edit image. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const client = getOpenAIClient();
  return NextResponse.json({
    message: "Image inpainting API",
    available: !!client,
  });
}
