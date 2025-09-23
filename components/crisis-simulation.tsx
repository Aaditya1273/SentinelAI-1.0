"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Play, RotateCcw, TrendingDown, Shield } from "lucide-react"

interface CrisisScenario {
  id: string
  name: string
  description: string
  probability: number
  expectedLoss: number
  recoveryTime: string
  severity: "low" | "medium" | "high" | "critical"
}

const crisisScenarios: CrisisScenario[] = [
  {
    id: "flash_crash",
    name: "Flash Crash (50% drop)",
    description: "Sudden market crash with 50% portfolio value loss",
    probability: 0.02,
    expectedLoss: 48500000,
    recoveryTime: "3-6 months",
    severity: "critical",
  },
  {
    id: "defi_exploit",
    name: "DeFi Protocol Exploit",
    description: "Major vulnerability in connected DeFi protocol",
    probability: 0.08,
    expectedLoss: 8000000,
    recoveryTime: "1-3 months",
    severity: "high",
  },
  {
    id: "regulatory_crackdown",
    name: "Regulatory Crackdown",
    description: "Sudden regulatory restrictions on DeFi operations",
    probability: 0.12,
    expectedLoss: 5000000,
    recoveryTime: "6-12 months",
    severity: "medium",
  },
  {
    id: "liquidity_crisis",
    name: "Liquidity Crisis",
    description: "Market-wide liquidity shortage affecting withdrawals",
    probability: 0.06,
    expectedLoss: 3000000,
    recoveryTime: "2-4 weeks",
    severity: "medium",
  },
  {
    id: "smart_contract_bug",
    name: "Smart Contract Bug",
    description: "Critical bug in treasury management contracts",
    probability: 0.05,
    expectedLoss: 12000000,
    recoveryTime: "1-2 months",
    severity: "high",
  },
]

export function CrisisSimulation() {
  const [selectedScenario, setSelectedScenario] = useState<string>("")
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [simulationResults, setSimulationResults] = useState<any>(null)

  const runSimulation = async () => {
    if (!selectedScenario) return

    setSimulationRunning(true)
    setSimulationResults(null)

    // Simulate crisis scenario
    setTimeout(() => {
      const scenario = crisisScenarios.find((s) => s.id === selectedScenario)
      if (scenario) {
        const results = {
          scenario: scenario.name,
          initialValue: 97097765.47,
          finalValue: 97097765.47 - scenario.expectedLoss,
          loss: scenario.expectedLoss,
          lossPercentage: (scenario.expectedLoss / 97097765.47) * 100,
          recoveryTime: scenario.recoveryTime,
          mitigationEffectiveness: Math.random() * 0.4 + 0.3, // 30-70% mitigation
          recommendedActions: generateRecommendations(scenario),
        }
        setSimulationResults(results)
      }
      setSimulationRunning(false)
    }, 3000)
  }

  const generateRecommendations = (scenario: CrisisScenario): string[] => {
    const recommendations: Record<string, string[]> = {
      flash_crash: [
        "Activate emergency stop mechanisms",
        "Increase stablecoin allocation to 60%",
        "Implement dynamic hedging strategies",
        "Prepare crisis communication plan",
      ],
      defi_exploit: [
        "Immediately withdraw from affected protocols",
        "Diversify across multiple DeFi platforms",
        "Increase insurance coverage",
        "Implement real-time security monitoring",
      ],
      regulatory_crackdown: [
        "Prepare regulatory compliance documentation",
        "Diversify across multiple jurisdictions",
        "Establish legal framework contingencies",
        "Maintain regulatory compliance buffer",
      ],
      liquidity_crisis: [
        "Maintain 25% liquid reserves",
        "Establish emergency credit lines",
        "Diversify across multiple DEXs",
        "Implement gradual withdrawal protocols",
      ],
      smart_contract_bug: [
        "Conduct immediate security audit",
        "Implement circuit breakers",
        "Establish bug bounty program",
        "Deploy emergency governance procedures",
      ],
    }

    return recommendations[scenario.id] || []
  }

  const resetSimulation = () => {
    setSimulationResults(null)
    setSelectedScenario("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Crisis Simulation Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select crisis scenario" />
                </SelectTrigger>
                <SelectContent>
                  {crisisScenarios.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={runSimulation} disabled={!selectedScenario || simulationRunning} className="ai-glow">
                <Play className="w-4 h-4 mr-2" />
                {simulationRunning ? "Running..." : "Run Simulation"}
              </Button>
              <Button onClick={resetSimulation} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            {selectedScenario && !simulationResults && (
              <div className="p-4 border rounded-lg bg-muted/50">
                {(() => {
                  const scenario = crisisScenarios.find((s) => s.id === selectedScenario)
                  return scenario ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            scenario.severity === "critical"
                              ? "destructive"
                              : scenario.severity === "high"
                                ? "destructive"
                                : scenario.severity === "medium"
                                  ? "secondary"
                                  : "default"
                          }
                        >
                          {scenario.severity}
                        </Badge>
                        <span className="font-medium">{scenario.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{scenario.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Probability:</span>
                          <div className="font-medium">{(scenario.probability * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expected Loss:</span>
                          <div className="font-medium text-destructive">${scenario.expectedLoss.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Recovery Time:</span>
                          <div className="font-medium">{scenario.recoveryTime}</div>
                        </div>
                      </div>
                    </div>
                  ) : null
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {simulationResults && (
        <Card className="chart-animate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              Simulation Results: {simulationResults.scenario}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Impact Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-destructive">-${simulationResults.loss.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Loss</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-destructive">
                    -{simulationResults.lossPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Portfolio Impact</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{simulationResults.recoveryTime}</div>
                  <div className="text-sm text-muted-foreground">Recovery Time</div>
                </div>
              </div>

              {/* Portfolio Impact */}
              <div className="space-y-2">
                <h4 className="font-medium">Portfolio Impact</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Initial Value:</span>
                    <span className="font-medium">${simulationResults.initialValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Post-Crisis Value:</span>
                    <span className="font-medium text-destructive">
                      ${simulationResults.finalValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Mitigation Effectiveness:</span>
                    <span className="font-medium text-success">
                      {(simulationResults.mitigationEffectiveness * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Recommended Mitigation Actions
                </h4>
                <div className="space-y-2">
                  {simulationResults.recommendedActions.map((action: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="ai-glow">
                  <Shield className="w-4 h-4 mr-2" />
                  Implement Safeguards
                </Button>
                <Button variant="outline">Export Report</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Simulations */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Crisis Simulations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {crisisScenarios.slice(0, 3).map((scenario) => (
              <div key={scenario.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      scenario.severity === "critical" || scenario.severity === "high" ? "destructive" : "secondary"
                    }
                  >
                    {scenario.severity}
                  </Badge>
                  <div>
                    <div className="font-medium">{scenario.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Last run: {Math.floor(Math.random() * 30)} days ago
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-destructive">
                    -{((scenario.expectedLoss / 97097765.47) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Simulated impact</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
