import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Get the API key from server environment variables
    const apiKey = process.env.ELEVENLABS_API_KEY || ""

    // Return a secure, signed response with the API key
    // This is just a placeholder - in a real app, you'd want to implement
    // proper authentication and authorization before returning the API key
    return NextResponse.json({
      success: true,
      // Don't actually return the API key directly - this is just for demonstration
      // In a real app, you'd use a more secure approach
      message: "API key is available on the server",
    })
  } catch (error) {
    console.error("Error in elevenlabs-key API:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

