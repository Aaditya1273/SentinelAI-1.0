import { usdmToken } from "../tokens/usdm-token"

export interface GovernanceProposal {
  id: string
  type: "agent_override" | "parameter_change" | "emergency_stop" | "budget_allocation"
  title: string
  description: string
  proposer: string
  agentDecision?: {
    agentId: number
    agentType: string
    decision: any
    confidence: number
    reasoning: string
  }
  proposedOverride?: any
  votingPower: {
    for: string
    against: string
    abstain: string
  }
  stakes: {
    for: Array<{ voter: string; amount: string; timestamp: number }>
    against: Array<{ voter: string; amount: string; timestamp: number }>
    abstain: Array<{ voter: string; amount: string; timestamp: number }>
  }
  status: "active" | "passed" | "rejected" | "executed" | "expired"
  quorum: string
  threshold: number // 0.5 = 50%
  startTime: number
  endTime: number
  executionTime?: number
  outcome?: {
    executed: boolean
    result: any
    learningData: {
      originalConfidence: number
      overrideReason: string
      actualOutcome: number // 0-1 success rate
      supervisorAdjustment: number
    }
  }
}

export interface VoteRecord {
  proposalId: string
  voter: string
  choice: "for" | "against" | "abstain"
  stake: string
  reasoning?: string
  timestamp: number
  txHash?: string
}

export class HybridGovernance {
  private proposals: Map<string, GovernanceProposal> = new Map()
  private votes: Map<string, VoteRecord[]> = new Map()
  private learningHistory: Array<{
    proposalId: string
    agentType: string
    originalDecision: any
    humanOverride: any
    outcome: number
    timestamp: number
  }> = []

  async createAgentOverrideProposal(
    proposer: string,
    agentId: number,
    agentDecision: any,
    proposedOverride: any,
    reasoning: string,
  ): Promise<GovernanceProposal> {
    const proposal: GovernanceProposal = {
      id: `gov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "agent_override",
      title: `Override Agent Decision - ${agentDecision.type}`,
      description: reasoning,
      proposer,
      agentDecision: {
        agentId,
        agentType: agentDecision.agentType,
        decision: agentDecision.decision,
        confidence: agentDecision.confidence,
        reasoning: agentDecision.reasoning,
      },
      proposedOverride,
      votingPower: { for: "0", against: "0", abstain: "0" },
      stakes: { for: [], against: [], abstain: [] },
      status: "active",
      quorum: "10000", // 10,000 USDM minimum
      threshold: 0.6, // 60% threshold for overrides
      startTime: Date.now(),
      endTime: Date.now() + 86400000 * 3, // 3 days
    }

    this.proposals.set(proposal.id, proposal)
    this.votes.set(proposal.id, [])

    console.log(`[Governance] Created override proposal: ${proposal.id}`)
    return proposal
  }

  async createParameterChangeProposal(
    proposer: string,
    parameter: string,
    currentValue: any,
    proposedValue: any,
    reasoning: string,
  ): Promise<GovernanceProposal> {
    const proposal: GovernanceProposal = {
      id: `param_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "parameter_change",
      title: `Change ${parameter}`,
      description: reasoning,
      proposer,
      proposedOverride: { parameter, currentValue, proposedValue },
      votingPower: { for: "0", against: "0", abstain: "0" },
      stakes: { for: [], against: [], abstain: [] },
      status: "active",
      quorum: "5000", // 5,000 USDM minimum
      threshold: 0.5, // 50% threshold for parameter changes
      startTime: Date.now(),
      endTime: Date.now() + 86400000 * 5, // 5 days
    }

    this.proposals.set(proposal.id, proposal)
    this.votes.set(proposal.id, [])

    console.log(`[Governance] Created parameter change proposal: ${proposal.id}`)
    return proposal
  }

  async voteOnProposal(
    proposalId: string,
    voter: string,
    choice: "for" | "against" | "abstain",
    stakeAmount: string,
    reasoning?: string,
  ): Promise<VoteRecord> {
    const proposal = this.proposals.get(proposalId)
    if (!proposal) {
      throw new Error("Proposal not found")
    }

    if (proposal.status !== "active") {
      throw new Error("Proposal is not active")
    }

    if (Date.now() > proposal.endTime) {
      throw new Error("Voting period has ended")
    }

    // Process stake
    const transaction = await usdmToken.stakeTokens(stakeAmount, 7) // 7 day lock

    const vote: VoteRecord = {
      proposalId,
      voter,
      choice,
      stake: stakeAmount,
      reasoning,
      timestamp: Date.now(),
      txHash: transaction.txHash,
    }

    // Update proposal voting power
    proposal.votingPower[choice] = (
      Number.parseFloat(proposal.votingPower[choice]) + Number.parseFloat(stakeAmount)
    ).toString()

    proposal.stakes[choice].push({
      voter,
      amount: stakeAmount,
      timestamp: Date.now(),
    })

    // Store vote
    const proposalVotes = this.votes.get(proposalId) || []
    proposalVotes.push(vote)
    this.votes.set(proposalId, proposalVotes)

    this.proposals.set(proposalId, proposal)

    console.log(`[Governance] Vote cast on ${proposalId}: ${choice} with ${stakeAmount} USDM`)
    return vote
  }

  async executeProposal(proposalId: string): Promise<boolean> {
    const proposal = this.proposals.get(proposalId)
    if (!proposal) {
      throw new Error("Proposal not found")
    }

    if (proposal.status !== "active") {
      throw new Error("Proposal is not active")
    }

    if (Date.now() < proposal.endTime) {
      throw new Error("Voting period has not ended")
    }

    // Check quorum
    const totalVotingPower =
      Number.parseFloat(proposal.votingPower.for) +
      Number.parseFloat(proposal.votingPower.against) +
      Number.parseFloat(proposal.votingPower.abstain)

    if (totalVotingPower < Number.parseFloat(proposal.quorum)) {
      proposal.status = "rejected"
      this.proposals.set(proposalId, proposal)
      return false
    }

    // Check threshold
    const forPercentage =
      Number.parseFloat(proposal.votingPower.for) /
      (Number.parseFloat(proposal.votingPower.for) + Number.parseFloat(proposal.votingPower.against))

    const passed = forPercentage >= proposal.threshold

    if (passed) {
      proposal.status = "passed"
      proposal.executionTime = Date.now()

      // Execute the proposal
      let executionResult = null
      if (proposal.type === "agent_override" && proposal.agentDecision && proposal.proposedOverride) {
        executionResult = await this.executeAgentOverride(proposal)
      } else if (proposal.type === "parameter_change") {
        executionResult = await this.executeParameterChange(proposal)
      }

      proposal.outcome = {
        executed: true,
        result: executionResult,
        learningData: {
          originalConfidence: proposal.agentDecision?.confidence || 0,
          overrideReason: proposal.description,
          actualOutcome: 0.8, // Will be updated based on actual results
          supervisorAdjustment: 0.1,
        },
      }

      proposal.status = "executed"
    } else {
      proposal.status = "rejected"
    }

    this.proposals.set(proposalId, proposal)

    console.log(`[Governance] Proposal ${proposalId} ${proposal.status}`)
    return passed
  }

  private async executeAgentOverride(proposal: GovernanceProposal): Promise<any> {
    if (!proposal.agentDecision || !proposal.proposedOverride) {
      throw new Error("Invalid override proposal")
    }

    // Record learning data for Supervisor Agent
    this.learningHistory.push({
      proposalId: proposal.id,
      agentType: proposal.agentDecision.agentType,
      originalDecision: proposal.agentDecision.decision,
      humanOverride: proposal.proposedOverride,
      outcome: 0.8, // Placeholder - would be updated based on actual results
      timestamp: Date.now(),
    })

    // Apply the override
    console.log(`[Governance] Executing agent override for ${proposal.agentDecision.agentType}`)

    // In a real implementation, this would modify agent behavior
    return {
      type: "agent_override",
      agentId: proposal.agentDecision.agentId,
      originalDecision: proposal.agentDecision.decision,
      newDecision: proposal.proposedOverride,
      timestamp: Date.now(),
    }
  }

  private async executeParameterChange(proposal: GovernanceProposal): Promise<any> {
    if (!proposal.proposedOverride) {
      throw new Error("Invalid parameter change proposal")
    }

    const { parameter, proposedValue } = proposal.proposedOverride

    console.log(`[Governance] Changing parameter ${parameter} to ${proposedValue}`)

    // In a real implementation, this would update system parameters
    return {
      type: "parameter_change",
      parameter,
      oldValue: proposal.proposedOverride.currentValue,
      newValue: proposedValue,
      timestamp: Date.now(),
    }
  }

  getActiveProposals(): GovernanceProposal[] {
    return Array.from(this.proposals.values()).filter((p) => p.status === "active")
  }

  getProposal(proposalId: string): GovernanceProposal | null {
    return this.proposals.get(proposalId) || null
  }

  getProposalVotes(proposalId: string): VoteRecord[] {
    return this.votes.get(proposalId) || []
  }

  getUserVotes(userAddress: string): VoteRecord[] {
    const allVotes: VoteRecord[] = []
    for (const votes of this.votes.values()) {
      allVotes.push(...votes.filter((v) => v.voter.toLowerCase() === userAddress.toLowerCase()))
    }
    return allVotes
  }

  getLearningData(): Array<{
    proposalId: string
    agentType: string
    originalDecision: any
    humanOverride: any
    outcome: number
    timestamp: number
  }> {
    return this.learningHistory
  }

  // Method for Supervisor Agent to learn from governance outcomes
  async updateLearningFromOutcome(proposalId: string, actualOutcome: number): Promise<void> {
    const proposal = this.proposals.get(proposalId)
    if (!proposal || !proposal.outcome) return

    proposal.outcome.learningData.actualOutcome = actualOutcome

    // Update learning history
    const learningEntry = this.learningHistory.find((l) => l.proposalId === proposalId)
    if (learningEntry) {
      learningEntry.outcome = actualOutcome
    }

    // Calculate supervisor adjustment based on outcome
    const originalConfidence = proposal.outcome.learningData.originalConfidence
    const overrideSuccess = actualOutcome > 0.7

    if (overrideSuccess && originalConfidence > 0.8) {
      // Human override was successful despite high AI confidence - reduce AI confidence weighting
      proposal.outcome.learningData.supervisorAdjustment = -0.1
    } else if (!overrideSuccess && originalConfidence < 0.5) {
      // Human override failed and AI had low confidence - increase AI confidence weighting
      proposal.outcome.learningData.supervisorAdjustment = 0.1
    }

    this.proposals.set(proposalId, proposal)

    console.log(`[Governance] Updated learning data for proposal ${proposalId}: outcome ${actualOutcome}`)
  }
}

export const hybridGovernance = new HybridGovernance()
