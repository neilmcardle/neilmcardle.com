import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  // AI functionality temporarily disabled for security reasons
  // The original implementation attempted to connect to localhost:11434 which is not secure
  // TODO: Implement proper AI integration using secure API endpoints
  
  return new Response(
    JSON.stringify({ 
      error: "AI functionality is temporarily disabled. Please configure a secure AI provider." 
    }), 
    { 
      status: 503,
      headers: { "Content-Type": "application/json" }
    }
  );
}