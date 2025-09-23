"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Lock, Eye, Key, Zap, CheckCircle, AlertTriangle, Activity } from "lucide-react"

interface ZKProof {
  id: string
  type: string
  status: "verified" | "pending" | "failed"
  timestamp: number
  gasOptimization: string
}

export function PrivacyDashboard() {
  const [zkProofs, setZkProofs] = useState<ZKProof[]>([])
  const [privacyScore, setPrivacyScore] = useState(98.7)
  const [quantumResistance, setQuantumResistance] = useState(true)

  useEffect(() => {
    // Simulate ZK proof data
    setZkProofs([
      {
        id: "zk_001",
        type: "Transaction Proof",
        status: "verified",
        timestamp: Date.now() - 120000,
        gasOptimization: "45% reduction",
      },
      {
        id: "zk_002",
        type: "Allocation Proof",
        status: "verified",
        timestamp: Date.now() - 300000,
        gasOptimization: "38% reduction",
      },
      {
        id: "zk_003",
        type: "Governance Proof",
        status: "pending",
        timestamp: Date.now() - 60000,
        gasOptimization: "Calculating...",
      },
      {
        id: "zk_004",
        type: "Agent Action Proof",
        status: "verified",
        timestamp: Date.now() - 480000,
        gasOptimization: "52% reduction",
      },
    ])
  }, [])

  const generateNewProof = async (proofType: string) => {
    const newProof: ZKProof = {
      id: `zk_${Date.now()}`,
      type: proofType,
      status: "pending",
      timestamp: Date.now(),
      gasOptimization: "Calculating...",
    }

    setZkProofs((prev) => [newProof, ...prev])

    // Simulate proof generation and verification
    setTimeout(() => {
      setZkProofs((prev) =>
        prev.map((proof) =>
          proof.id === newProof.id
            ? { ...proof, status: "verified", gasOptimization: `${Math.floor(Math.random() * 30 + 30)}% reduction` }
            : proof,
        ),
      )
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* Privacy Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="chart-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Privacy Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{privacyScore}%</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Excellent
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">ZK compliance rate</p>
          </CardContent>
        </Card>

        <Card className="chart-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quantum Resistance</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" className="text-xs ai-glow">
                <Zap className="w-3 h-3 mr-1" />
                PLONK + Lattice
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Post-quantum cryptography</p>
          </CardContent>
        </Card>

        <Card className="chart-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ZK Proofs Generated</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                +23 today
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">All verified successfully</p>
          </CardContent>
        </Card>

        <Card className="chart-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gas Optimization</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" className="text-xs">
                Average savings
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Through ZK batching</p>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button onClick={() => generateNewProof("Transaction Proof")} className="ai-glow">
              <Lock className="w-4 h-4 mr-2" />
              Generate TX Proof
            </Button>
            <Button onClick={() => generateNewProof("Allocation Proof")} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Allocation Proof
            </Button>
            <Button onClick={() => generateNewProof("Governance Proof")} variant="outline">
              <Key className="w-4 h-4 mr-2" />
              Governance Proof
            </Button>
            <Button onClick={() => generateNewProof("Solvency Proof")} variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Solvency Proof
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ZK Proof Management */}
      <Card>
        <CardHeader>
          <CardTitle>Zero-Knowledge Proof Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recent" className="w-full">
            <TabsList>
              <TabsTrigger value="recent">Recent Proofs</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              <div className="space-y-3">
                {zkProofs.map((proof) => (
                  <div key={proof.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          proof.status === "verified"
                            ? "bg-success/10 text-success"
                            : proof.status === "pending"
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {proof.status === "verified" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : proof.status === "pending" ? (
                          <Activity className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{proof.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(proof.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{proof.gasOptimization}</div>
                        <div className="text-xs text-muted-foreground">Gas savings</div>
                      </div>
                      <Badge
                        variant={
                          proof.status === "verified"
                            ? "default"
                            : proof.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {proof.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Proof Generation Efficiency</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Transaction Proofs</span>
                      <span>2.3s avg</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Allocation Proofs</span>
                      <span>1.8s avg</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Governance Proofs</span>
                      <span>3.1s avg</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: "78%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Privacy Metrics</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Data Anonymization:</span>
                      <span className="font-medium text-success">100%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Differential Privacy:</span>
                      <span className="font-medium text-success">ε = 1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Federated Learning:</span>
                      <span className="font-medium text-success">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantum Resistance:</span>
                      <span className="font-medium text-success">PLONK + Lattice</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Federated Learning Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Federated Learning Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Active Participants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">94.2%</div>
              <div className="text-sm text-muted-foreground">Model Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">ε = 1.0</div>
              <div className="text-sm text-muted-foreground">Privacy Budget</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <strong>Latest Update:</strong> Risk prediction model updated with contributions from 8 DAOs. Unlearning
              request processed for participant DAO_7 (regulatory compliance).
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
