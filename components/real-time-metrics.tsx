"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Zap } from "lucide-react"

export function RealTimeMetrics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Real-Time Treasury Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Portfolio Allocation</span>
              <Badge variant="secondary">Auto-rebalancing</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>ETH</span>
                <span>45.2%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "45.2%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>USDC</span>
                <span>32.1%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: "32.1%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>DeFi Positions</span>
                <span>22.7%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: "22.7%" }}></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">Recent AI Actions</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Rebalanced ETH position</span>
                <span className="text-xs text-muted-foreground">2m ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">ZK proof generated</span>
                <span className="text-xs text-muted-foreground">3m ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Risk assessment updated</span>
                <span className="text-xs text-muted-foreground">5m ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Yield optimization executed</span>
                <span className="text-xs text-muted-foreground">8m ago</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
