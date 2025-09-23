import { TraderAgent } from "./trader-agent"
import { ComplianceAgent } from "./compliance-agent"
import { SupervisorAgent } from "./supervisor-agent"
import { AdvisorAgent } from "./advisor-agent"
import type { BaseAgent, AgentConfig } from "./base-agent"
import { agentQueries } from "../database"

export class AgentManager {
  private agents: Map<number, BaseAgent> = new Map()
  private isRunning = false

  async initialize() {
    const agentConfigs = agentQueries.getAllAgents()

    for (const config of agentConfigs) {
      const agent = this.createAgent(config)
      if (agent) {
        this.agents.set(config.id, agent)
      }
    }
  }

  private createAgent(config: any): BaseAgent | null {
    const agentConfig: AgentConfig = {
      id: config.id,
      name: config.name,
      type: config.type,
      status: config.status,
      config: JSON.parse(config.config || "{}"),
      performanceMetrics: JSON.parse(config.performance_metrics || "{}"),
    }

    switch (config.type) {
      case "trader":
        return new TraderAgent(agentConfig)
      case "compliance":
        return new ComplianceAgent(agentConfig)
      case "supervisor":
        return new SupervisorAgent(agentConfig)
      case "advisor":
        return new AdvisorAgent(agentConfig)
      default:
        console.warn(`Unknown agent type: ${config.type}`)
        return null
    }
  }

  async executeAgent(agentId: number) {
    const agent = this.agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found`)
    }

    try {
      const result = await agent.execute()
      return result
    } catch (error) {
      console.error(`Agent ${agentId} execution failed:`, error)
      throw error
    }
  }

  async executeAllAgents() {
    const results = []

    for (const [agentId, agent] of this.agents) {
      if (agent.getStatus() === "active") {
        try {
          const result = await agent.execute()
          results.push(result)
        } catch (error) {
          console.error(`Agent ${agentId} failed:`, error)
        }
      }
    }

    return results
  }

  getAgentStatus(agentId: number) {
    const agent = this.agents.get(agentId)
    return agent
      ? {
          status: agent.getStatus(),
          metrics: agent.getPerformanceMetrics(),
        }
      : null
  }

  getAllAgentStatuses() {
    const statuses = []

    for (const [agentId, agent] of this.agents) {
      statuses.push({
        id: agentId,
        status: agent.getStatus(),
        metrics: agent.getPerformanceMetrics(),
      })
    }

    return statuses
  }

  async startAutonomousMode() {
    if (this.isRunning) return

    this.isRunning = true

    // Execute agents in sequence every 30 seconds
    const executeLoop = async () => {
      if (!this.isRunning) return

      try {
        // Execute in order: Advisor -> Trader -> Compliance -> Supervisor
        const advisorAgent = Array.from(this.agents.values()).find((a) => a.constructor.name === "AdvisorAgent")
        const traderAgent = Array.from(this.agents.values()).find((a) => a.constructor.name === "TraderAgent")
        const complianceAgent = Array.from(this.agents.values()).find((a) => a.constructor.name === "ComplianceAgent")
        const supervisorAgent = Array.from(this.agents.values()).find((a) => a.constructor.name === "SupervisorAgent")

        if (advisorAgent?.getStatus() === "active") await advisorAgent.execute()
        if (traderAgent?.getStatus() === "active") await traderAgent.execute()
        if (complianceAgent?.getStatus() === "active") await complianceAgent.execute()
        if (supervisorAgent?.getStatus() === "active") await supervisorAgent.execute()
      } catch (error) {
        console.error("Autonomous execution error:", error)
      }

      setTimeout(executeLoop, 30000) // 30 second intervals
    }

    executeLoop()
  }

  stopAutonomousMode() {
    this.isRunning = false
  }
}

// Singleton instance
export const agentManager = new AgentManager()
