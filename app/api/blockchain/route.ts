import { type NextRequest, NextResponse } from "next/server"
import { daoIntegration } from "@/lib/blockchain/dao-integration"
import { multisigBridge } from "@/lib/blockchain/multi-sig-bridge"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    switch (action) {
      case "treasury":
        const treasuryData = await daoIntegration.getTreasuryData()
        return NextResponse.json(treasuryData)

      case "proposals":
        const proposals = await daoIntegration.getActiveProposals()
        return NextResponse.json(proposals)

      case "performance":
        const days = Number.parseInt(searchParams.get("days") || "30")
        const performance = await daoIntegration.getHistoricalPerformance(days)
        return NextResponse.json(performance)

      case "balance":
        const chainId = Number.parseInt(searchParams.get("chainId") || "1")
        const address = searchParams.get("address")
        if (!address) {
          return NextResponse.json({ error: "Address required" }, { status: 400 })
        }
        const balance = await multisigBridge.getChainBalance(chainId, address)
        return NextResponse.json(balance)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Blockchain API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case "bridge":
        const { fromChain, toChain, amount, token, recipient } = body
        const transfer = await multisigBridge.initiateCrossChainTransfer(fromChain, toChain, amount, token, recipient)
        return NextResponse.json(transfer)

      case "vote":
        const { proposalId, support, votes } = body
        const txHash = await daoIntegration.voteOnProposal(proposalId, support, votes)
        return NextResponse.json({ txHash })

      case "propose":
        const { title, description, actions } = body
        const newProposalId = await daoIntegration.createProposal(title, description, actions)
        return NextResponse.json({ proposalId: newProposalId })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Blockchain API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
