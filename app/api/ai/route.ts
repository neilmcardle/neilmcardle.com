import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  // TODO: wire a provider for this endpoint.
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