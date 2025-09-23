import { type NextRequest, NextResponse } from "next/server"
import { hybridGovernance } from "@/lib/governance/hybrid-governance"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  const address = searchParams.get("address")
  const proposalId = searchParams.get("proposalId")

  try {
    switch (action) {
      case "proposals":
        const proposals = hybridGovernance.getActiveProposals()
        return NextResponse.json(proposals)

      case "proposal":
        if (!proposalId) {
          return NextResponse.json({ error: "Proposal ID required" }, { status: 400 })
        }
        const proposal = hybridGovernance.getProposal(proposalId)
        return NextResponse.json(proposal)

      case "votes":
        if (!proposalId) {
          return NextResponse.json({ error: "Proposal ID required" }, { status: 400 })
        }
        const votes = hybridGovernance.getProposalVotes(proposalId)
        return NextResponse.json(votes)

      case "user-votes":
        if (!address) {
          return NextResponse.json({ error: "Address required" }, { status: 400 })
        }
        const userVotes = hybridGovernance.getUserVotes(address)
        return NextResponse.json(userVotes)

      case "learning":
        const learningData = hybridGovernance.getLearningData()
        return NextResponse.json(learningData)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Governance API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case "create-override":
        const { proposer, agentId, agentDecision, proposedOverride, reasoning } = body
        const overrideProposal = await hybridGovernance.createAgentOverrideProposal(
          proposer,
          agentId,
          agentDecision,
          proposedOverride,
          reasoning,
        )
        return NextResponse.json(overrideProposal)

      case "create-parameter":
        const { proposer: paramProposer, parameter, currentValue, proposedValue, reasoning: paramReasoning } = body
        const paramProposal = await hybridGovernance.createParameterChangeProposal(
          paramProposer,
          parameter,
          currentValue,
          proposedValue,
          paramReasoning,
        )
        return NextResponse.json(paramProposal)

      case "vote":
        const { proposalId, voter, choice, stakeAmount, reasoning: voteReasoning } = body
        const vote = await hybridGovernance.voteOnProposal(proposalId, voter, choice, stakeAmount, voteReasoning)
        return NextResponse.json(vote)

      case "execute":
        const { proposalId: execProposalId } = body
        const executed = await hybridGovernance.executeProposal(execProposalId)
        return NextResponse.json({ executed })

      case "update-learning":
        const { proposalId: learningProposalId, actualOutcome } = body
        await hybridGovernance.updateLearningFromOutcome(learningProposalId, actualOutcome)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Governance API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
