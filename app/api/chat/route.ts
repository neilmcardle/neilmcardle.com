import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // This is where you would integrate with your AI backend
    // For example, OpenAI, Anthropic, or your own custom solution

    // For demonstration, we'll just echo back a simple response
    const lastUserMessage = messages.findLast((msg: any) => msg.role === "user")?.content || ""

    // Simple response logic - replace with actual AI integration
    let response = "I'm Neil's AI assistant. I can help answer questions about Neil's work and services."

    if (lastUserMessage.toLowerCase().includes("portfolio")) {
      response =
        "You can view Neil's portfolio by clicking the 'View Portfolio' button on the homepage. It showcases his UI/UX design and frontend development projects."
    } else if (lastUserMessage.toLowerCase().includes("contact") || lastUserMessage.toLowerCase().includes("hire")) {
      response =
        "You can contact Neil by clicking the 'Contact Me' button or connecting on LinkedIn. He's currently available for freelance projects."
    } else if (lastUserMessage.toLowerCase().includes("services") || lastUserMessage.toLowerCase().includes("work")) {
      response =
        "Neil specializes in UI/UX design, frontend development, brand identity, and illustration. He offers elite design services with fast turnaround times."
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

