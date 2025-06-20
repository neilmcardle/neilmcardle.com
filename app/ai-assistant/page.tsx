import ElevenLabsAgent from "@/components/eleven-labs-agent"
import ElevenLabsAgentAdvanced from "@/components/eleven-labs-agent-advanced"

export default function AIAssistantPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">AI Voice Assistant</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Basic Assistant</h2>
          <div className="border border-zinc-200 rounded-lg overflow-hidden">
            <ElevenLabsAgent initialPrompt="Hello! I'm Neil's AI assistant. I can help answer questions about Neil's work and experience. How can I assist you today?" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Advanced Assistant</h2>
          <div className="border border-zinc-200 rounded-lg overflow-hidden">
            <ElevenLabsAgentAdvanced initialPrompt="Hi there! I'm the advanced version of Neil's AI assistant. I have more customization options and features. Feel free to ask me anything about Neil's work!" />
          </div>
        </div>
      </div>
    </div>
  )
}
