export interface AgentConfig {
  id: number
  name: string
  type: "trader" | "compliance" | "supervisor" | "advisor"
  status: "active" | "paused" | "error" | "standby"
  config: Record<string, any>
  performanceMetrics: Record<string, any>
}

export interface AgentAction {
  id?: number
  agentId: number
  actionType: string
  description: string
  parameters: Record<string, any>
  result: Record<string, any>
  xaiExplanation: string
  confidenceScore: number
  createdAt?: string
}

export abstract class BaseAgent {
  protected config: AgentConfig
  protected isRunning = false

  constructor(config: AgentConfig) {
    this.config = config
  }

  abstract execute(): Promise<AgentAction>
  abstract analyze(data: any): Promise<any>

  protected generateXAIExplanation(decision: any, factors: any[]): string {
    // Simplified XAI explanation generation
    const topFactors = factors.slice(0, 3)
    return `Decision based on: ${topFactors.map((f) => `${f.name} (${f.impact}%)`).join(", ")}. Confidence: ${decision.confidence}%`
  }

  protected calculateConfidence(factors: any[]): number {
    // Simplified confidence calculation
    const avgImpact = factors.reduce((sum, f) => sum + f.impact, 0) / factors.length
    return Math.min(Math.max(avgImpact, 0.1), 0.99)
  }

  getStatus(): string {
    return this.config.status
  }

  getPerformanceMetrics(): Record<string, any> {
    return this.config.performanceMetrics
  }
}
