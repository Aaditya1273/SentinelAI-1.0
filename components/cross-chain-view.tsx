"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, ArrowRightLeft, Zap, Shield } from "lucide-react"

interface ChainData {
  name: string
  chainId: number
  totalValue: number
  assets: number
  gasPrice: number
  status: "active" | "maintenance" | "congested"
  bridgeAvailable: boolean
}

const chainData: ChainData[] = [
  {
    name: "Ethereum",
    chainId: 1,
    totalValue: 65000000,
    assets: 3,
    gasPrice: 25,
    status: "active",
    bridgeAvailable: true,
  },
  {
    name: "Arbitrum",
    chainId: 42161,
    totalValue: 18000000,
    assets: 2,
    gasPrice: 0.5,
    status: "active",
    bridgeAvailable: true,
  },
  {
    name: "Polygon",
    chainId: 137,
    totalValue: 12000000,
    assets: 4,
    gasPrice: 30,
    status: "congested",
    bridgeAvailable: true,
  },
  {
    name: "Optimism",
    chainId: 10,
    totalValue: 2097765,
    assets: 1,
    gasPrice: 0.8,
    status: "active",
    bridgeAvailable: true,
  },
]

export function CrossChainView() {
  const totalValue = chainData.reduce((sum, chain) => sum + chain.totalValue, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Cross-Chain Treasury Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Cross-Chain Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{chainData.length}</div>
              <div className="text-sm text-muted-foreground">Active Chains</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{chainData.reduce((sum, chain) => sum + chain.assets, 0)}</div>
              <div className="text-sm text-muted-foreground">Total Assets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">98.7%</div>
              <div className="text-sm text-muted-foreground">Bridge Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {chainData.map((chain) => (
          <Card key={chain.chainId} className="chart-animate">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  {chain.name}
                </div>
                <Badge
                  variant={
                    chain.status === "active" ? "default" : chain.status === "congested" ? "secondary" : "destructive"
                  }
                >
                  {chain.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Value:</span>
                    <div className="font-medium">${chain.totalValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Assets:</span>
                    <div className="font-medium">{chain.assets}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gas Price:</span>
                    <div className="font-medium">{chain.gasPrice} gwei</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chain ID:</span>
                    <div className="font-medium">{chain.chainId}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Portfolio Allocation</span>
                    <span className="font-medium">{((chain.totalValue / totalValue) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(chain.totalValue / totalValue) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={!chain.bridgeAvailable}>
                    <ArrowRightLeft className="w-3 h-3 mr-1" />
                    Bridge
                  </Button>
                  <Button size="sm" variant="outline">
                    <Zap className="w-3 h-3 mr-1" />
                    Rebalance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Multi-Sig Bridge Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">$2.4M</div>
                <div className="text-sm text-muted-foreground">Pending Bridges</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">3/5</div>
                <div className="text-sm text-muted-foreground">Required Signatures</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">15 min</div>
                <div className="text-sm text-muted-foreground">Avg Bridge Time</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Recent Bridge Transactions</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <div>
                      <div className="font-medium">ETH → Arbitrum</div>
                      <div className="text-sm text-muted-foreground">500 ETH bridged</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$1,750,000</div>
                    <div className="text-sm text-muted-foreground">2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-warning rounded-full" />
                    <div>
                      <div className="font-medium">USDC → Polygon</div>
                      <div className="text-sm text-muted-foreground">Pending signatures (2/5)</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$2,400,000</div>
                    <div className="text-sm text-muted-foreground">30 min ago</div>
                  </div>
                </div>
              </div>
            </div>

            <Button className="w-full ai-glow">
              <Shield className="w-4 h-4 mr-2" />
              Execute Pending Multi-Sig Operations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
