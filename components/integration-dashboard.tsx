"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Bot, 
  Users, 
  Zap, 
  TrendingUp, 
  Shield, 
  Globe, 
  Activity,
  DollarSign,
  BarChart3,
  Network
} from "lucide-react"

interface DEGAAgent {
  id: string
  name: string
  type: string
  reputation: number
  hourlyRate: number
  availability: string
  performance: {
    tasksCompleted: number
    successRate: number
    avgResponseTime: number
  }
}

interface DAOProposal {
  id: string
  title: string
  state: string
  votes: number
  scores_total: number
}

interface MarketplaceStats {
  totalAgents: number
  availableAgents: number
  averageReputation: number
  totalTasksCompleted: number
  averageSuccessRate: number
}

export function IntegrationDashboard() {
  const [agents, setAgents] = useState<DEGAAgent[]>([])
  const [proposals, setProposals] = useState<DAOProposal[]>([])
  const [marketplaceStats, setMarketplaceStats] = useState<MarketplaceStats | null>(null)
  const [treasuryData, setTreasuryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIntegrationData()
  }, [])

  const fetchIntegrationData = async () => {
    try {
      setLoading(true)
      
      // Fetch all integration data in parallel
      const [agentsRes, proposalsRes, statsRes, treasuryRes] = await Promise.all([
        fetch('/api/integrations?action=agents'),
        fetch('/api/integrations?action=dao_proposals'),
        fetch('/api/integrations?action=marketplace_stats'),
        fetch('/api/integrations?action=treasury_simulation')
      ])

      const [agentsData, proposalsData, statsData, treasuryDataRes] = await Promise.all([
        agentsRes.json(),
        proposalsRes.json(),
        statsRes.json(),
        treasuryRes.json()
      ])

      if (agentsData.success) setAgents(agentsData.agents)
      if (proposalsData.success) setProposals(proposalsData.proposals)
      if (statsData.success) setMarketplaceStats(statsData.stats)
      if (treasuryDataRes.success) setTreasuryData(treasuryDataRes.treasury)

    } catch (error) {
      console.error('Failed to fetch integration data:', error)
    } finally {
      setLoading(false)
    }
  }

  const hireAgent = async (agentId: string) => {
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'hire_agent',
          description: 'Portfolio optimization and risk analysis',
          capabilities: ['portfolio_optimization', 'risk_analysis'],
          budget: 500,
          deadline: Date.now() + 3600000 // 1 hour
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(`Agent hired successfully! Task ID: ${data.taskId}`)
      }
    } catch (error) {
      console.error('Failed to hire agent:', error)
    }
  }

  const executeCollaborativeTask = async () => {
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'collaborative_task',
          taskType: 'portfolio_optimization',
          participants: ['dega-trader-001', 'dega-advisor-001'],
          parameters: {
            riskTolerance: 0.3,
            timeHorizon: 365,
            targetReturn: 0.12
          }
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('Collaborative task completed successfully!')
        console.log('Task result:', data.result)
      }
    } catch (error) {
      console.error('Failed to execute collaborative task:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading integration data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Integration Dashboard</h2>
          <p className="text-muted-foreground">
            ElizaOS + DEGA AI MCP and Real DAO Integrations
          </p>
        </div>
        <Button onClick={executeCollaborativeTask} className="bg-gradient-to-r from-blue-500 to-purple-600">
          <Network className="h-4 w-4 mr-2" />
          Start Collaborative Task
        </Button>
      </div>

      {/* Marketplace Stats */}
      {marketplaceStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marketplaceStats.totalAgents}</div>
              <p className="text-xs text-muted-foreground">
                {marketplaceStats.availableAgents} available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Reputation</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marketplaceStats.averageReputation.toFixed(1)}</div>
              <Progress value={marketplaceStats.averageReputation} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marketplaceStats.totalTasksCompleted}</div>
              <p className="text-xs text-muted-foreground">
                Across all agents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(marketplaceStats.averageSuccessRate * 100).toFixed(1)}%</div>
              <Progress value={marketplaceStats.averageSuccessRate * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Treasury TVL</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${treasuryData ? (treasuryData.totalValueUSD / 1000000).toFixed(1) : '0'}M
              </div>
              <p className="text-xs text-muted-foreground">
                Real DAO simulation
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">DEGA Agents</TabsTrigger>
          <TabsTrigger value="dao">DAO Governance</TabsTrigger>
          <TabsTrigger value="defi">DeFi Integration</TabsTrigger>
          <TabsTrigger value="treasury">Treasury Simulation</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Available DEGA Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <Card key={agent.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <Badge variant={agent.availability === 'available' ? 'default' : 'secondary'}>
                          {agent.availability}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">{agent.type} Agent</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Reputation</span>
                        <div className="flex items-center gap-2">
                          <Progress value={agent.reputation} className="w-16" />
                          <span className="text-sm font-medium">{agent.reputation}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Success Rate</span>
                        <span className="text-sm font-medium">
                          {(agent.performance.successRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Hourly Rate</span>
                        <span className="text-sm font-medium">${agent.hourlyRate}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tasks Done</span>
                        <span className="text-sm font-medium">{agent.performance.tasksCompleted}</span>
                      </div>

                      <Button 
                        onClick={() => hireAgent(agent.id)}
                        disabled={agent.availability !== 'available'}
                        className="w-full mt-4"
                        size="sm"
                      >
                        {agent.availability === 'available' ? 'Hire Agent' : 'Unavailable'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                DAO Governance Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <Card key={proposal.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{proposal.title}</h3>
                        <Badge variant={proposal.state === 'active' ? 'default' : 'secondary'}>
                          {proposal.state}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{proposal.votes} votes</span>
                        <span>{proposal.scores_total} total score</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                DeFi Protocol Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Aave Integration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>USDC Supply APY</span>
                        <span className="font-medium">4.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ETH Supply APY</span>
                        <span className="font-medium">2.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Supplied</span>
                        <span className="font-medium">$25M</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Uniswap Integration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>ETH/USDC Pool</span>
                        <span className="font-medium">$450M TVL</span>
                      </div>
                      <div className="flex justify-between">
                        <span>24h Volume</span>
                        <span className="font-medium">$125M</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LP Fees (24h)</span>
                        <span className="font-medium">$12.5K</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treasury" className="space-y-4">
          {treasuryData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Real DAO Treasury Simulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold mb-3">Asset Allocation</h3>
                    <div className="space-y-3">
                      {treasuryData.assets.map((asset: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{asset.symbol}</span>
                            <p className="text-sm text-muted-foreground">
                              {asset.amount.toLocaleString()} tokens
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${asset.valueUSD.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">{asset.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">DeFi Positions</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <h4 className="font-medium">Aave Lending</h4>
                        <p className="text-sm text-muted-foreground">
                          Supplied: ${treasuryData.defiPositions?.aave?.supplied?.toLocaleString() || '0'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Net APY: {((treasuryData.defiPositions?.aave?.netAPY || 0) * 100).toFixed(1)}%
                        </p>
                      </div>
                      
                      <div className="p-3 bg-muted rounded-lg">
                        <h4 className="font-medium">Uniswap LP</h4>
                        <p className="text-sm text-muted-foreground">
                          Liquidity: ${treasuryData.defiPositions?.uniswap?.liquidityProvided?.toLocaleString() || '0'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          24h Fees: ${treasuryData.defiPositions?.uniswap?.fees24h?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Risk Metrics</h3>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{((treasuryData.riskMetrics?.var95 || 0) * 100).toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">VaR (95%)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{treasuryData.riskMetrics?.sharpeRatio?.toFixed(2) || '0'}</p>
                      <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{((treasuryData.riskMetrics?.maxDrawdown || 0) * 100).toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Max Drawdown</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{treasuryData.riskMetrics?.correlationBTC?.toFixed(2) || '0'}</p>
                      <p className="text-sm text-muted-foreground">BTC Correlation</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
