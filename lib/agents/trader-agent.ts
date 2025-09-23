import { BaseAgent, type AgentAction } from "./base-agent"
import { treasuryQueries, agentQueries } from "../database"

interface PortfolioAllocation {
  symbol: string
  currentPercentage: number
  targetPercentage: number
  rebalanceAmount: number
}

export class TraderAgent extends BaseAgent {
  private readonly REBALANCE_THRESHOLD = 0.05 // 5% deviation threshold
  private readonly MAX_TRADE_SIZE = 1000000 // $1M max per trade

  async execute(): Promise<AgentAction> {
    try {
      const treasuryData = treasuryQueries.getTreasuryOverview()[0]
      const allocations = treasuryQueries.getAllocations(treasuryData.id)

      const analysis = await this.analyze({ treasuryData, allocations })
      const action = await this.executeRebalancing(analysis)

      // Log action to database
      agentQueries.logAgentAction(
        this.config.id,
        "rebalance",
        action.description,
        action.parameters,
        action.result,
        action.xaiExplanation,
        action.confidenceScore,
      )

      return action
    } catch (error) {
      throw new Error(`Trader Agent execution failed: ${error}`)
    }
  }

  async analyze(data: any): Promise<any> {
    const { allocations } = data

    // Define target allocations based on market conditions
    const targetAllocations = {
      ETH: 0.4, // 40% ETH
      USDC: 0.35, // 35% USDC
      AAVE: 0.25, // 25% DeFi positions
    }

    const rebalanceNeeded: PortfolioAllocation[] = []

    for (const allocation of allocations) {
      const currentPercentage = allocation.percentage / 100
      const targetPercentage = targetAllocations[allocation.asset_symbol] || 0
      const deviation = Math.abs(currentPercentage - targetPercentage)

      if (deviation > this.REBALANCE_THRESHOLD) {
        rebalanceNeeded.push({
          symbol: allocation.asset_symbol,
          currentPercentage,
          targetPercentage,
          rebalanceAmount: (targetPercentage - currentPercentage) * data.treasuryData.total_value_usd,
        })
      }
    }

    return {
      rebalanceNeeded,
      totalValue: data.treasuryData.total_value_usd,
      riskScore: this.calculateRiskScore(allocations),
      expectedYield: this.calculateExpectedYield(targetAllocations),
    }
  }

  private async executeRebalancing(analysis: any): Promise<AgentAction> {
    const { rebalanceNeeded, totalValue, riskScore, expectedYield } = analysis

    if (rebalanceNeeded.length === 0) {
      return {
        agentId: this.config.id,
        actionType: "no_action",
        description: "Portfolio is within target allocation ranges",
        parameters: { threshold: this.REBALANCE_THRESHOLD },
        result: { status: "no_rebalance_needed" },
        xaiExplanation: "All asset allocations are within 5% of target ranges. No rebalancing required.",
        confidenceScore: 0.95,
      }
    }

    // Execute rebalancing (simulated)
    const trades = rebalanceNeeded.map((asset) => ({
      symbol: asset.symbol,
      action: asset.rebalanceAmount > 0 ? "buy" : "sell",
      amount: Math.abs(asset.rebalanceAmount),
      expectedSlippage: 0.002, // 0.2% slippage
    }))

    const factors = [
      { name: "Portfolio Deviation", impact: 85 },
      { name: "Market Volatility", impact: 70 },
      { name: "Liquidity Conditions", impact: 90 },
    ]

    return {
      agentId: this.config.id,
      actionType: "rebalance",
      description: `Rebalancing ${rebalanceNeeded.length} assets to optimize portfolio allocation`,
      parameters: {
        trades,
        totalTradeValue: rebalanceNeeded.reduce((sum, asset) => sum + Math.abs(asset.rebalanceAmount), 0),
      },
      result: {
        status: "executed",
        tradesExecuted: trades.length,
        expectedYield: expectedYield,
        newRiskScore: riskScore,
      },
      xaiExplanation: this.generateXAIExplanation({ confidence: 87 }, factors),
      confidenceScore: this.calculateConfidence(factors),
    }
  }

  private calculateRiskScore(allocations: any[]): number {
    // Simplified risk calculation based on asset volatility
    const riskWeights = { ETH: 0.8, USDC: 0.1, AAVE: 0.9 }
    let weightedRisk = 0

    for (const allocation of allocations) {
      const weight = allocation.percentage / 100
      const assetRisk = riskWeights[allocation.asset_symbol] || 0.5
      weightedRisk += weight * assetRisk
    }

    return Math.min(weightedRisk, 1.0)
  }

  private calculateExpectedYield(allocations: Record<string, number>): number {
    // Simplified yield calculation
    const yieldRates = { ETH: 0.05, USDC: 0.08, AAVE: 0.12 }
    let expectedYield = 0

    for (const [symbol, weight] of Object.entries(allocations)) {
      expectedYield += weight * (yieldRates[symbol] || 0.04)
    }

    return expectedYield
  }
}
