"use client"
import ElevenLabsAgent from "./eleven-labs-agent"

interface ElevenLabsWidgetProps {
  agentId?: string
}

export function ElevenLabsWidget({ agentId = "wjHL8KdEVglYcTYadlxF" }: ElevenLabsWidgetProps) {
  return <ElevenLabsAgent agentId={agentId} />
}
