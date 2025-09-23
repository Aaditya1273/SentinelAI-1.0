"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Play, Pause, RotateCcw, Activity, Brain, Shield, TrendingUp, Zap } from "lucide-react"

interface Agent {
  id: number
  name: string
  type: string
  status: string
  performance_metrics: string
  last_active: string
  total_actions: number
}

const agentIcons = {
  trader: TrendingUp,
  compliance: Shield,
  supervisor: Brain,
  advisor: Bot,
}

export function AgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [autonomousMode, setAutonomousMode] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents")
      const data = await response.json()
      setAgents(data.agents)
    } catch (error) {
      console.error("Failed to fetch agents:", error)
    } finally {
      setLoading(false)
    }
  }

  const executeAgent = async (agentId: number) => {
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "execute", agentId }),
      })
      const data = await response.json()
      console.log("Agent execution result:", data.result)
      fetchAgents() // Refresh data
    } catch (error) {
      console.error("Failed to execute agent:", error)
    }
  }

  const executeAllAgents = async () => {
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "execute_all" }),
      })
      const data = await response.json()
      console.log("All agents execution results:", data.results)
      fetchAgents() // Refresh data
    } catch (error) {
      console.error("Failed to execute all agents:", error)
    }
  }

  const toggleAutonomousMode = async () => {
    try {
      const action = autonomousMode ? "stop_autonomous" : "start_autonomous"
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await response.json()
      setAutonomousMode(!autonomousMode)
      console.log(data.message)
    } catch (error) {
      console.error("Failed to toggle autonomous mode:", error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading agents...</div>
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Agent Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleAutonomousMode}
              variant={autonomousMode ? "destructive" : "default"}
              className="ai-glow"
            >
              {autonomousMode ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {autonomousMode ? "Stop Autonomous Mode" : "Start Autonomous Mode"}
            </Button>
            <Button onClick={executeAllAgents} variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              Execute All Agents
            </Button>
            <Button onClick={fetchAgents} variant="ghost">
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Badge variant={autonomousMode ? "default" : "secondary"} className="ml-auto">
              {autonomousMode ? "Autonomous Active" : "Manual Control"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Agent Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {agents.map((agent) => {
          const IconComponent = agentIcons[agent.type as keyof typeof agentIcons] || Bot
          const metrics = JSON.parse(agent.performance_metrics || "{}")

          return (
            <Card key={agent.id} className="chart-animate">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        agent.status === "active"
                          ? "bg-success/10 text-success agent-active"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    {agent.name}
                  </div>
                  <Badge variant={agent.status === "active" ? "default" : "secondary"}>{agent.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div className="font-medium capitalize">{agent.type}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Actions:</span>
                      <div className="font-medium">{agent.total_actions || 0}</div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Performance Metrics:</span>
                    <div className="text-sm space-y-1">
                      {Object.entries(metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/_/g, " ")}:</span>
                          <span className="font-medium">
                            {typeof value === "number"
                              ? key.includes("rate") || key.includes("accuracy")
                                ? `${value}%`
                                : value
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => executeAgent(agent.id)} disabled={agent.status !== "active"}>
                      <Play className="w-3 h-3 mr-1" />
                      Execute
                    </Button>
                    <Button size="sm" variant="outline">
                      View Logs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Agent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Agent Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Agents</TabsTrigger>
              <TabsTrigger value="trader">Trader</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="supervisor">Supervisor</TabsTrigger>
              <TabsTrigger value="advisor">Advisor</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-2">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex justify-between items-center p-2 border rounded">
                  <span>Trader Agent executed portfolio rebalancing</span>
                  <span>2 min ago</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span>Compliance Agent generated ZK proof for transaction</span>
                  <span>3 min ago</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span>Supervisor Agent performed system health check</span>
                  <span>5 min ago</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span>Advisor Agent updated risk predictions</span>
                  <span>8 min ago</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
