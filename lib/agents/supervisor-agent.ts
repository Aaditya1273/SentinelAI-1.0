import { BaseAgent, type AgentAction } from "./base-agent"
import { agentQueries } from "../database"

interface AgentOverview {
  id: number
  name: string
  status: string
  lastAction: string
  performanceScore: number
  riskLevel: string
}

interface SupervisorDecision {
  action: "approve" | "reject" | "modify" | "escalate"
  reasoning: string
  modifications?: Record<string, any>
}

export class SupervisorAgent extends BaseAgent {
  private readonly OVERSIGHT_THRESHOLD = 0.8
  private readonly CRISIS_MODE = false
  private readonly MAX_AGENT_AUTONOMY = 500000 // $500K

  async execute(): Promise<AgentAction> {
    try {
      const agentOverviews = await this.getAgentOverviews()
      const systemHealth = await this.assessSystemHealth(agentOverviews)
      const supervisorDecision = await this.makeSupervisorDecision(systemHealth)

      const action: AgentAction = {
        agentId: this.config.id,
        actionType: "supervision",
        description: "Performed system-wide agent oversight and coordination",
        parameters: {
          oversightThreshold: this.OVERSIGHT_THRESHOLD,
          crisisMode: this.CRISIS_MODE,
          agentsMonitored: agentOverviews.length,
        },
        result: {
          systemHealth: systemHealth.overallScore,
          decision: supervisorDecision,
          agentStatuses: agentOverviews.map((a) => ({ name: a.name, status: a.status })),
          recommendedActions: this.generateRecommendations(systemHealth),
        },
        xaiExplanation: this.generateSupervisionExplanation(systemHealth, supervisorDecision),
        confidenceScore: systemHealth.confidence,
      }

      // Log action to database
      agentQueries.logAgentAction(
        this.config.id,
        action.actionType,
        action.description,
        action.parameters,
        action.result,
        action.xaiExplanation,
        action.confidenceScore,
      )

      return action
    } catch (error) {
      throw new Error(`Supervisor Agent execution failed: ${error}`)
    }
  }

  async analyze(data: any): Promise<any> {
    const agentOverviews = await this.getAgentOverviews()
    return await this.assessSystemHealth(agentOverviews)
  }

  private async getAgentOverviews(): Promise<AgentOverview[]> {
    const agents = agentQueries.getAllAgents()

    return agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      status: agent.status,
      lastAction: agent.last_action || "No recent activity",
      performanceScore: this.calculatePerformanceScore(agent),
      riskLevel: this.assessAgentRisk(agent),
    }))
  }

  private async assessSystemHealth(agentOverviews: AgentOverview[]): Promise<any> {
    const activeAgents = agentOverviews.filter((a) => a.status === "active").length
    const totalAgents = agentOverviews.length
    const avgPerformance = agentOverviews.reduce((sum, a) => sum + a.performanceScore, 0) / totalAgents
    const highRiskAgents = agentOverviews.filter((a) => a.riskLevel === "high").length

    const overallScore = this.calculateSystemHealthScore(activeAgents, totalAgents, avgPerformance, highRiskAgents)

    return {
      overallScore,
      activeAgentRatio: activeAgents / totalAgents,
      averagePerformance: avgPerformance,
      highRiskAgentCount: highRiskAgents,
      systemStatus: this.determineSystemStatus(overallScore),
      confidence: this.calculateSystemConfidence(overallScore, activeAgents, totalAgents),
    }
  }

  private async makeSupervisorDecision(systemHealth: any): Promise<SupervisorDecision> {
    if (systemHealth.overallScore >= this.OVERSIGHT_THRESHOLD) {
      return {
        action: "approve",
        reasoning: "System operating within normal parameters. All agents performing optimally.",
      }
    } else if (systemHealth.overallScore >= 0.6) {
      return {
        action: "modify",
        reasoning: "System performance below threshold. Implementing optimization protocols.",
        modifications: {
          increaseMonitoring: true,
          reduceAgentAutonomy: true,
          requireHumanApproval: systemHealth.overallScore < 0.7,
        },
      }
    } else {
      return {
        action: "escalate",
        reasoning: "Critical system health issues detected. Human intervention required.",
      }
    }
  }

  private calculatePerformanceScore(agent: any): number {
    // Simplified performance calculation based on agent metrics
    const metrics = JSON.parse(agent.performance_metrics || "{}")

    switch (agent.type) {
      case "trader":
        return Math.min((metrics.yield_generated || 0) / 20, 1.0) // Normalize to 0-1
      case "compliance":
        return (metrics.compliance_rate || 0) / 100
      case "advisor":
        return (metrics.accuracy || 0) / 100
      default:
        return 0.8 // Default score
    }
  }

  private assessAgentRisk(agent: any): string {
    const performanceScore = this.calculatePerformanceScore(agent)

    if (performanceScore >= 0.8) return "low"
    if (performanceScore >= 0.6) return "medium"
    return "high"
  }

  private calculateSystemHealthScore(
    activeAgents: number,
    totalAgents: number,
    avgPerformance: number,
    highRiskAgents: number,
  ): number {
    const activeRatio = activeAgents / totalAgents
    const riskPenalty = highRiskAgents * 0.1

    return Math.max(0, Math.min(1, activeRatio * 0.4 + avgPerformance * 0.6 - riskPenalty))
  }

  private determineSystemStatus(score: number): string {
    if (score >= 0.9) return "optimal"
    if (score >= 0.8) return "good"
    if (score >= 0.6) return "acceptable"
    if (score >= 0.4) return "degraded"
    return "critical"
  }

  private calculateSystemConfidence(score: number, activeAgents: number, totalAgents: number): number {
    const baseConfidence = score
    const activeBonus = (activeAgents / totalAgents) * 0.1
    return Math.min(baseConfidence + activeBonus, 0.99)
  }

  private generateRecommendations(systemHealth: any): string[] {
    const recommendations: string[] = []

    if (systemHealth.overallScore < 0.8) {
      recommendations.push("Increase monitoring frequency for underperforming agents")
    }

    if (systemHealth.highRiskAgentCount > 0) {
      recommendations.push("Review and retrain high-risk agents")
    }

    if (systemHealth.activeAgentRatio < 0.8) {
      recommendations.push("Investigate inactive agents and restore functionality")
    }

    return recommendations
  }

  private generateSupervisionExplanation(systemHealth: any, decision: SupervisorDecision): string {
    return `System health assessment: ${(systemHealth.overallScore * 100).toFixed(1)}% (${systemHealth.systemStatus}). Decision: ${decision.action} - ${decision.reasoning} Active agents: ${(systemHealth.activeAgentRatio * 100).toFixed(1)}%, Average performance: ${(systemHealth.averagePerformance * 100).toFixed(1)}%.`
  }
}
