import { usdmToken, type TokenTransaction } from "../tokens/usdm-token"

export interface AgentListing {
  id: string
  agentId: number
  agentType: "trader" | "compliance" | "supervisor" | "advisor"
  name: string
  description: string
  hourlyRate: string
  minimumHours: number
  maximumHours: number
  performance: {
    rating: number
    completedTasks: number
    successRate: number
    totalEarnings: string
  }
  availability: "available" | "busy" | "offline"
  specialties: string[]
  owner: string
  created: number
}

export interface AgentHire {
  id: string
  listingId: string
  hirer: string
  duration: number
  budget: string
  status: "pending" | "active" | "completed" | "cancelled"
  startTime?: number
  endTime?: number
  performance?: number
  feedback?: string
  transaction?: TokenTransaction
}

export class AgentMarketplace {
  private listings: Map<string, AgentListing> = new Map()
  private hires: Map<string, AgentHire> = new Map()

  constructor() {
    this.initializeDefaultListings()
  }

  private initializeDefaultListings() {
    const defaultListings: AgentListing[] = [
      {
        id: "listing_trader_001",
        agentId: 1,
        agentType: "trader",
        name: "Alpha Trader Pro",
        description:
          "Advanced trading agent with ML-powered portfolio optimization and risk management. Specializes in DeFi yield farming and automated rebalancing.",
        hourlyRate: "50.00",
        minimumHours: 1,
        maximumHours: 168, // 1 week
        performance: {
          rating: 4.8,
          completedTasks: 247,
          successRate: 0.94,
          totalEarnings: "12,450.00",
        },
        availability: "available",
        specialties: ["Portfolio Optimization", "Risk Management", "DeFi Protocols", "Yield Farming"],
        owner: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        created: Date.now() - 86400000 * 30, // 30 days ago
      },
      {
        id: "listing_compliance_001",
        agentId: 2,
        agentType: "compliance",
        name: "RegGuard Elite",
        description:
          "Regulatory compliance specialist with ZK-proof generation and multi-jurisdiction support. Ensures all transactions meet legal requirements.",
        hourlyRate: "75.00",
        minimumHours: 2,
        maximumHours: 72, // 3 days
        performance: {
          rating: 4.9,
          completedTasks: 189,
          successRate: 0.98,
          totalEarnings: "18,750.00",
        },
        availability: "available",
        specialties: ["ZK Proofs", "Regulatory Compliance", "AML/KYC", "Privacy Protection"],
        owner: "0x853f43Cc7634C0532925a3b8D4C9db96C4b4d8b7",
        created: Date.now() - 86400000 * 45, // 45 days ago
      },
      {
        id: "listing_advisor_001",
        agentId: 4,
        agentType: "advisor",
        name: "Oracle Insight",
        description:
          "Predictive analytics agent using federated learning for risk assessment and market analysis. Provides early warning for potential threats.",
        hourlyRate: "60.00",
        minimumHours: 4,
        maximumHours: 48, // 2 days
        performance: {
          rating: 4.7,
          completedTasks: 156,
          successRate: 0.91,
          totalEarnings: "9,360.00",
        },
        availability: "busy",
        specialties: ["Predictive Analytics", "Risk Assessment", "Market Analysis", "Crisis Detection"],
        owner: "0x964g54Dd8745D0643036b4c9E5F8db97D5c5e9c8",
        created: Date.now() - 86400000 * 20, // 20 days ago
      },
    ]

    defaultListings.forEach((listing) => {
      this.listings.set(listing.id, listing)
    })
  }

  getAvailableAgents(): AgentListing[] {
    return Array.from(this.listings.values()).filter((listing) => listing.availability === "available")
  }

  getAgentListing(listingId: string): AgentListing | null {
    return this.listings.get(listingId) || null
  }

  async hireAgent(listingId: string, hirer: string, duration: number, customBudget?: string): Promise<AgentHire> {
    const listing = this.listings.get(listingId)
    if (!listing) {
      throw new Error("Agent listing not found")
    }

    if (listing.availability !== "available") {
      throw new Error("Agent is not available")
    }

    if (duration < listing.minimumHours || duration > listing.maximumHours) {
      throw new Error(`Duration must be between ${listing.minimumHours} and ${listing.maximumHours} hours`)
    }

    const budget = customBudget || (Number.parseFloat(listing.hourlyRate) * duration).toString()

    const hire: AgentHire = {
      id: `hire_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      listingId,
      hirer,
      duration,
      budget,
      status: "pending",
      startTime: Date.now(),
    }

    // Process payment
    const transaction = await usdmToken.hireAgent(listing.agentId, duration, budget)
    hire.transaction = transaction

    // Update agent availability
    listing.availability = "busy"
    this.listings.set(listingId, listing)

    // Store hire record
    this.hires.set(hire.id, hire)

    // Activate agent
    setTimeout(() => {
      hire.status = "active"
      this.hires.set(hire.id, hire)
    }, 3000)

    console.log(`[Marketplace] Agent ${listing.name} hired for ${duration} hours`)
    return hire
  }

  async completeHire(hireId: string, performance: number, feedback?: string): Promise<void> {
    const hire = this.hires.get(hireId)
    if (!hire) {
      throw new Error("Hire record not found")
    }

    const listing = this.listings.get(hire.listingId)
    if (!listing) {
      throw new Error("Agent listing not found")
    }

    // Update hire record
    hire.status = "completed"
    hire.endTime = Date.now()
    hire.performance = performance
    hire.feedback = feedback

    // Calculate and distribute rewards
    const baseReward = Number.parseFloat(hire.budget) * 0.8 // 80% of budget as base reward
    const performanceBonus = baseReward * (performance - 0.5) * 0.4 // Up to 40% bonus for high performance
    const totalReward = Math.max(baseReward + performanceBonus, baseReward * 0.6) // Minimum 60% of base

    await usdmToken.rewardAgent(listing.agentId, totalReward.toString(), performance)

    // Update agent performance metrics
    listing.performance.completedTasks += 1
    listing.performance.rating = listing.performance.rating * 0.9 + performance * 5 * 0.1 // Weighted average
    listing.performance.totalEarnings = (
      Number.parseFloat(listing.performance.totalEarnings.replace(",", "")) + totalReward
    ).toLocaleString()

    if (performance >= 0.7) {
      listing.performance.successRate = listing.performance.successRate * 0.95 + 0.05
    } else {
      listing.performance.successRate = listing.performance.successRate * 0.98
    }

    // Make agent available again
    listing.availability = "available"

    this.listings.set(hire.listingId, listing)
    this.hires.set(hireId, hire)

    console.log(`[Marketplace] Hire ${hireId} completed with performance ${performance}`)
  }

  getUserHires(userAddress: string): AgentHire[] {
    return Array.from(this.hires.values()).filter((hire) => hire.hirer.toLowerCase() === userAddress.toLowerCase())
  }

  getAgentEarnings(agentId: number): {
    totalEarnings: string
    activeHires: number
    completedTasks: number
    averageRating: number
  } {
    const agentListings = Array.from(this.listings.values()).filter((listing) => listing.agentId === agentId)

    if (agentListings.length === 0) {
      return {
        totalEarnings: "0.00",
        activeHires: 0,
        completedTasks: 0,
        averageRating: 0,
      }
    }

    const listing = agentListings[0]
    const activeHires = Array.from(this.hires.values()).filter(
      (hire) => hire.listingId === listing.id && hire.status === "active",
    ).length

    return {
      totalEarnings: listing.performance.totalEarnings,
      activeHires,
      completedTasks: listing.performance.completedTasks,
      averageRating: listing.performance.rating,
    }
  }
}

export const agentMarketplace = new AgentMarketplace()
