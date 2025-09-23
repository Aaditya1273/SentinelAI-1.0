"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Shield,
  Zap,
  BarChart3,
  PieChart,
  RefreshCw,
} from "lucide-react"
import { PortfolioChart } from "./portfolio-chart"
import { CrisisSimulation } from "./crisis-simulation"
import { CrossChainView } from "./cross-chain-view"

interface TreasuryMetrics {
  totalValue: number
  dayChange: number
  weekChange: number
  monthChange: number
  riskScore: number
  yieldGenerated: number
  gasOptimization: number
}

interface AssetAllocation {
  symbol: string
  name: string
  amount: number
  value: number
  percentage: number
  change24h: number
  chain: string
  apy: number
}

export function TreasuryDashboard() {
  const [metrics, setMetrics] = useState<TreasuryMetrics>({
    totalValue: 97097765.47,
    dayChange: 2.34,
    weekChange: 8.12,
    monthChange: 15.67,
    riskScore: 0.23,
    yieldGenerated: 2847392,
    gasOptimization: 42,
  })

  const [allocations, setAllocations] = useState<AssetAllocation[]>([
    {
      symbol: "ETH",
      name: "Ethereum",
      amount: 15234.567,
      value: 43876543.21,
      percentage: 45.2,
      change24h: 3.2,
      chain: "Ethereum",
      apy: 5.2,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      amount: 31234567.89,
      value: 31234567.89,
      percentage: 32.1,
      change24h: 0.1,
      chain: "Ethereum",
      apy: 8.1,
    },
    {
      symbol: "AAVE",
      name: "Aave",
      amount: 123456.78,
      value: 21986654.37,
      percentage: 22.7,
      change24h: -1.8,
      chain: "Ethereum",
      apy: 12.3,
    },
  ])

  const [timeframe, setTimeframe] = useState("24h")
  const [autoRebalancing, setAutoRebalancing] = useState(true)

  const refreshData = async () => {
    // Simulate data refresh
    setMetrics((prev) => ({
      ...prev,
      totalValue: prev.totalValue * (1 + (Math.random() - 0.5) * 0.02),
      dayChange: (Math.random() - 0.5) * 10,
    }))
  }

  const executeRebalancing = async () => {
    console.log("Executing AI-powered rebalancing...")
    // Simulate rebalancing
  }

  return (
    <div className="space-y-6">
      {/* Treasury Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="chart-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value Locked</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalValue.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={metrics.dayChange > 0 ? "default" : "destructive"} className="text-xs">
                {metrics.dayChange > 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {Math.abs(metrics.dayChange).toFixed(2)}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">24h change</p>
          </CardContent>
        </Card>

        <Card className="chart-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Yield Generated</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.yieldGenerated.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" className="text-xs ai-glow">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.2%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="chart-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.riskScore < 0.3 ? "Low" : metrics.riskScore < 0.6 ? "Medium" : "High"}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {(metrics.riskScore * 100).toFixed(1)}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">AI risk assessment</p>
          </CardContent>
        </Card>

        <Card className="chart-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gas Optimization</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.gasOptimization}%</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" className="text-xs">
                ZK Batching
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average savings</p>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Treasury Controls
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={refreshData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={executeRebalancing} className="ai-glow">
              <Zap className="w-4 h-4 mr-2" />
              Execute AI Rebalancing
            </Button>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Crisis Simulation
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">Auto-rebalancing:</span>
              <Badge variant={autoRebalancing ? "default" : "secondary"}>
                {autoRebalancing ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="cross-chain">Cross-Chain</TabsTrigger>
          <TabsTrigger value="crisis">Crisis Sim</TabsTrigger>
          <TabsTrigger value="yield">Yield Farming</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PortfolioChart allocations={allocations} timeframe={timeframe} />
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Asset Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {allocations.map((asset) => (
                  <div key={asset.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium">{asset.symbol}</span>
                      </div>
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {asset.amount.toLocaleString()} {asset.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{asset.percentage}%</div>
                      <div className={`text-sm ${asset.change24h > 0 ? "text-success" : "text-destructive"}`}>
                        {asset.change24h > 0 ? "+" : ""}
                        {asset.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">24h Performance</span>
                    <span className="font-medium text-success">+{metrics.dayChange.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">7d Performance</span>
                    <span className="font-medium text-success">+{metrics.weekChange.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">30d Performance</span>
                    <span className="font-medium text-success">+{metrics.monthChange.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                    <span className="font-medium">2.34</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Max Drawdown</span>
                    <span className="font-medium text-destructive">-8.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="font-medium text-success">Optimization Opportunity</div>
                    <div className="text-muted-foreground mt-1">
                      Rebalancing ETH allocation could increase yield by 2.3%
                    </div>
                  </div>
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="font-medium text-warning">Risk Alert</div>
                    <div className="text-muted-foreground mt-1">
                      Increased correlation detected between ETH and AAVE positions
                    </div>
                  </div>
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="font-medium text-primary">Market Insight</div>
                    <div className="text-muted-foreground mt-1">
                      DeFi yields trending upward, consider increasing AAVE allocation
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cross-chain" className="space-y-6">
          <CrossChainView />
        </TabsContent>

        <TabsContent value="crisis" className="space-y-6">
          <CrisisSimulation />
        </TabsContent>

        <TabsContent value="yield" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Yield Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allocations.map((asset) => (
                    <div key={asset.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">{asset.symbol}</span>
                        </div>
                        <div>
                          <div className="font-medium">{asset.name} Staking</div>
                          <div className="text-sm text-muted-foreground">{asset.chain}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-success">{asset.apy}% APY</div>
                        <div className="text-sm text-muted-foreground">
                          ${(asset.value * asset.apy * 0.01).toLocaleString()}/year
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yield Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success">${metrics.yieldGenerated.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total yield generated (30d)</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Staking Rewards</span>
                      <span className="font-medium">$1,234,567</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Liquidity Mining</span>
                      <span className="font-medium">$987,654</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Lending Interest</span>
                      <span className="font-medium">$625,171</span>
                    </div>
                  </div>
                  <Button className="w-full ai-glow">
                    <Zap className="w-4 h-4 mr-2" />
                    Optimize Yield Strategy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
