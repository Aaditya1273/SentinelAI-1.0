import { type NextRequest, NextResponse } from "next/server"
import { agentManager } from "@/lib/agents/agent-manager"
import { agentQueries } from "@/lib/database"

export async function GET() {
  try {
    await agentManager.initialize()
    const agents = agentQueries.getAllAgents()
    const statuses = agentManager.getAllAgentStatuses()

    const agentsWithStatus = agents.map((agent) => ({
      ...agent,
      realTimeStatus: statuses.find((s) => s.id === agent.id),
    }))

    return NextResponse.json({ agents: agentsWithStatus })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, agentId } = await request.json()

    await agentManager.initialize()

    switch (action) {
      case "execute":
        const result = await agentManager.executeAgent(agentId)
        return NextResponse.json({ result })

      case "execute_all":
        const results = await agentManager.executeAllAgents()
        return NextResponse.json({ results })

      case "start_autonomous":
        await agentManager.startAutonomousMode()
        return NextResponse.json({ message: "Autonomous mode started" })

      case "stop_autonomous":
        agentManager.stopAutonomousMode()
        return NextResponse.json({ message: "Autonomous mode stopped" })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Agent operation failed" }, { status: 500 })
  }
}
