"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

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

interface PortfolioChartProps {
  allocations: AssetAllocation[]
  timeframe: string
}

export function PortfolioChart({ allocations, timeframe }: PortfolioChartProps) {
  // Generate mock chart data based on timeframe
  const generateChartData = () => {
    const points = timeframe === "1h" ? 60 : timeframe === "24h" ? 24 : timeframe === "7d" ? 7 : 30
    const data = []

    for (let i = 0; i < points; i++) {
      const baseValue = 97000000
      const volatility = 0.02
      const trend = 0.001 * i // Slight upward trend
      const noise = (Math.random() - 0.5) * volatility

      data.push({
        time: i,
        value: baseValue * (1 + trend + noise),
      })
    }

    return data
  }

  const chartData = generateChartData()
  const currentValue = chartData[chartData.length - 1]?.value || 0
  const previousValue = chartData[0]?.value || 0
  const change = ((currentValue - previousValue) / previousValue) * 100

  return (
    <Card className="chart-animate">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Portfolio Performance ({timeframe})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">${currentValue.toLocaleString()}</div>
              <div className={`text-sm ${change > 0 ? "text-success" : "text-destructive"}`}>
                {change > 0 ? "+" : ""}
                {change.toFixed(2)}% ({timeframe})
              </div>
            </div>
          </div>

          {/* Simplified chart visualization */}
          <div className="h-64 bg-muted rounded-lg flex items-end justify-center p-4">
            <div className="flex items-end gap-1 h-full w-full">
              {chartData.slice(-20).map((point, index) => {
                const height =
                  ((point.value - Math.min(...chartData.map((d) => d.value))) /
                    (Math.max(...chartData.map((d) => d.value)) - Math.min(...chartData.map((d) => d.value)))) *
                  100
                return (
                  <div
                    key={index}
                    className="bg-primary rounded-t flex-1 min-h-[4px] transition-all duration-300"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                )
              })}
            </div>
          </div>

          {/* Asset breakdown */}
          <div className="space-y-2">
            <h4 className="font-medium">Asset Breakdown</h4>
            {allocations.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        asset.symbol === "ETH" ? "#627EEA" : asset.symbol === "USDC" ? "#2775CA" : "#B6509E",
                    }}
                  />
                  <span>{asset.symbol}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{asset.percentage}%</span>
                  <span className={asset.change24h > 0 ? "text-success" : "text-destructive"}>
                    {asset.change24h > 0 ? "+" : ""}
                    {asset.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
