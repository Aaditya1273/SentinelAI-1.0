"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Shield, Zap } from "lucide-react"

const treasuryMetrics = [
  {
    title: "Total Value Locked",
    value: "$97,097,765.47",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    description: "Across all chains",
  },
  {
    title: "AI Yield Generated",
    value: "$2,847,392",
    change: "+8.2%",
    trend: "up",
    icon: Zap,
    description: "Last 30 days",
  },
  {
    title: "Privacy Score",
    value: "98.7%",
    change: "+0.3%",
    trend: "up",
    icon: Shield,
    description: "ZK compliance rate",
  },
  {
    title: "Risk Level",
    value: "Low",
    change: "Stable",
    trend: "neutral",
    icon: TrendingUp,
    description: "AI risk assessment",
  },
]

export function TreasuryOverview() {
  return (
    <>
      {treasuryMetrics.map((metric) => (
        <Card key={metric.title} className="chart-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={metric.trend === "up" ? "default" : metric.trend === "down" ? "destructive" : "secondary"}
                className="text-xs"
              >
                {metric.trend === "up" && <TrendingUp className="w-3 h-3 mr-1" />}
                {metric.trend === "down" && <TrendingDown className="w-3 h-3 mr-1" />}
                {metric.change}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
