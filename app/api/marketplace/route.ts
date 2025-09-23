import { type NextRequest, NextResponse } from "next/server"
import { agentMarketplace } from "@/lib/agents/agent-marketplace"
import { usdmToken } from "@/lib/tokens/usdm-token"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  const address = searchParams.get("address")

  try {
    switch (action) {
      case "listings":
        const listings = agentMarketplace.getAvailableAgents()
        return NextResponse.json(listings)

      case "balance":
        if (!address) {
          return NextResponse.json({ error: "Address required" }, { status: 400 })
        }
        const balance = await usdmToken.getBalance(address)
        return NextResponse.json(balance)

      case "hires":
        if (!address) {
          return NextResponse.json({ error: "Address required" }, { status: 400 })
        }
        const hires = agentMarketplace.getUserHires(address)
        return NextResponse.json(hires)

      case "earnings":
        const agentId = Number.parseInt(searchParams.get("agentId") || "0")
        if (!agentId) {
          return NextResponse.json({ error: "Agent ID required" }, { status: 400 })
        }
        const earnings = agentMarketplace.getAgentEarnings(agentId)
        return NextResponse.json(earnings)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Marketplace API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case "hire":
        const { listingId, hirer, duration, customBudget } = body
        const hire = await agentMarketplace.hireAgent(listingId, hirer, duration, customBudget)
        return NextResponse.json(hire)

      case "complete":
        const { hireId, performance, feedback } = body
        await agentMarketplace.completeHire(hireId, performance, feedback)
        return NextResponse.json({ success: true })

      case "transfer":
        const { to, transferAmount, purpose } = body
        const transaction = await usdmToken.transfer(to, transferAmount, purpose)
        return NextResponse.json(transaction)

      case "stake":
        const { stakeAmount, duration: stakeDuration } = body
        const stakeTransaction = await usdmToken.stakeTokens(stakeAmount, stakeDuration)
        return NextResponse.json(stakeTransaction)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Marketplace API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
