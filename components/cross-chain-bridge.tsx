"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Clock, Shield, Zap } from "lucide-react"
import { supportedChains } from "@/lib/blockchain/wallet-config"
import { multisigBridge, type CrossChainTransfer } from "@/lib/blockchain/multi-sig-bridge"
import { useAccount } from "wagmi"

export function CrossChainBridge() {
  const { address } = useAccount()
  const [fromChain, setFromChain] = useState<string>("")
  const [toChain, setToChain] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [token, setToken] = useState("ETH")
  const [transfers, setTransfers] = useState<CrossChainTransfer[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleBridge = async () => {
    if (!address || !fromChain || !toChain || !amount) return

    setIsLoading(true)
    try {
      const transfer = await multisigBridge.initiateCrossChainTransfer(
        Number.parseInt(fromChain),
        Number.parseInt(toChain),
        amount,
        token,
        address,
      )
      setTransfers((prev) => [transfer, ...prev])
    } catch (error) {
      console.error("Bridge error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getChainName = (chainId: number) => {
    return supportedChains.find((chain) => chain.id === chainId)?.name || `Chain ${chainId}`
  }

  const getStatusColor = (status: CrossChainTransfer["status"]) => {
    switch (status) {
      case "pending":
        return "bg-warning/10 text-warning border-warning/20"
      case "confirmed":
        return "bg-success/10 text-success border-success/20"
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-secondary/10 text-secondary border-secondary/20"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Multi-Sig Cross-Chain Bridge
          </CardTitle>
          <CardDescription>Secure cross-chain transfers with multi-signature validation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Chain</Label>
              <Select value={fromChain} onValueChange={setFromChain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source chain" />
                </SelectTrigger>
                <SelectContent>
                  {supportedChains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.icon} {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To Chain</Label>
              <Select value={toChain} onValueChange={setToChain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination chain" />
                </SelectTrigger>
                <SelectContent>
                  {supportedChains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.icon} {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Token</Label>
              <Select value={token} onValueChange={setToken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="DAI">DAI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {fromChain && toChain && amount && (
            <div className="p-4 bg-secondary/20 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Bridge Fee:</span>
                <span className="font-mono">~0.001 ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Estimated Time:</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  10-15 minutes
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Required Signatures:</span>
                <span>3 of 5</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleBridge}
            disabled={!address || !fromChain || !toChain || !amount || isLoading}
            className="w-full ai-glow"
          >
            {isLoading ? (
              "Initiating Transfer..."
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Bridge Assets
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {transfers.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Transfers</CardTitle>
            <CardDescription>Track your cross-chain transfer status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transfers.map((transfer) => (
                <div key={transfer.id} className="p-4 border border-border/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{getChainName(transfer.fromChain)}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{getChainName(transfer.toChain)}</span>
                    </div>
                    <Badge className={getStatusColor(transfer.status)}>{transfer.status}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {transfer.amount} {transfer.token}
                    </span>
                    <span className="font-mono text-muted-foreground">{transfer.id.slice(0, 8)}...</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Signatures: {transfer.signatures.length}/{transfer.requiredSignatures}
                      </span>
                      <span>Est. {transfer.estimatedTime}min</span>
                    </div>
                    <Progress
                      value={(transfer.signatures.length / transfer.requiredSignatures) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
