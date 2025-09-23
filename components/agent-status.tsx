"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bot, Brain, Shield, TrendingUp, Play, Pause } from "lucide-react"

const agents = [
  {
    name: "Trader Agent",
    status: "active",
    icon: TrendingUp,
    description: "Portfolio optimization & rebalancing",
    performance: "+15.2% yield",
    lastAction: "2 min ago",
  },
  {
    name: "Compliance Agent",
    status: "active",
    icon: Shield,
    description: "ZK proof validation & regulatory checks",
    performance: "100% compliant",
    lastAction: "1 min ago",
  },
  {
    name: "Supervisor Agent",
    status: "monitoring",
    icon: Brain,
    description: "Overseeing all agent operations",
    performance: "No issues detected",
    lastAction: "30 sec ago",
  },
  {
    name: "Advisor Agent",
    status: "standby",
    icon: Bot,
    description: "Risk assessment & crisis simulation",
    performance: "Risk: Low",
    lastAction: "5 min ago",
  },
]

export function AgentStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Agent Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  agent.status === "active"
                    ? "bg-success/10 text-success agent-active"
                    : agent.status === "monitoring"
                      ? "bg-warning/10 text-warning"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                <agent.icon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-sm">{agent.name}</div>
                <div className="text-xs text-muted-foreground">{agent.description}</div>
                <div className="text-xs text-success mt-1">{agent.performance}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={agent.status === "active" ? "default" : "secondary"} className="text-xs">
                {agent.status}
              </Badge>
              <Button size="sm" variant="ghost">
                {agent.status === "active" ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
