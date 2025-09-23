"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star, TrendingUp, Shield, Brain, BarChart3, Coins } from "lucide-react"
import { agentMarketplace, type AgentListing, type AgentHire } from "@/lib/agents/agent-marketplace"
import { usdmToken, type USDMBalance } from "@/lib/tokens/usdm-token"
import { useAccount } from "wagmi"

export function AgentMarketplace() {
  const { address } = useAccount()
  const [listings, setListings] = useState<AgentListing[]>([])
  const [userHires, setUserHires] = useState<AgentHire[]>([])
  const [balance, setBalance] = useState<USDMBalance | null>(null)
  const [selectedListing, setSelectedListing] = useState<AgentListing | null>(null)
  const [hireDuration, setHireDuration] = useState("")
  const [customBudget, setCustomBudget] = useState("")
  const [isHiring, setIsHiring] = useState(false)

  useEffect(() => {
    loadMarketplaceData()
  }, [address])

  const loadMarketplaceData = async () => {
    const availableAgents = agentMarketplace.getAvailableAgents()
    setListings(availableAgents)

    if (address) {
      const hires = agentMarketplace.getUserHires(address)
      setUserHires(hires)

      const userBalance = await usdmToken.getBalance(address)
      setBalance(userBalance)
    }
  }

  const handleHireAgent = async () => {
    if (!selectedListing || !address || !hireDuration) return

    setIsHiring(true)
    try {
      const duration = Number.parseInt(hireDuration)
      await agentMarketplace.hireAgent(selectedListing.id, address, duration, customBudget || undefined)

      await loadMarketplaceData()
      setSelectedListing(null)
      setHireDuration("")
      setCustomBudget("")
    } catch (error) {
      console.error("Hiring failed:", error)
    } finally {
      setIsHiring(false)
    }
  }

  const getAgentIcon = (type: string) => {
    switch (type) {
      case "trader":
        return <TrendingUp className="w-5 h-5" />
      case "compliance":
        return <Shield className="w-5 h-5" />
      case "advisor":
        return <Brain className="w-5 h-5" />
      case "supervisor":
        return <BarChart3 className="w-5 h-5" />
      default:
        return <Brain className="w-5 h-5" />
    }
  }

  const getStatusColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-success/10 text-success border-success/20"
      case "busy":
        return "bg-warning/10 text-warning border-warning/20"
      case "offline":
        return "bg-muted/10 text-muted-foreground border-muted/20"
      default:
        return "bg-secondary/10 text-secondary border-secondary/20"
    }
  }

  const calculateBudget = (hourlyRate: string, duration: string) => {
    if (!duration) return "0.00"
    return (Number.parseFloat(hourlyRate) * Number.parseInt(duration)).toFixed(2)
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      {balance && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              USDM Token Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{usdmToken.formatAmount(balance.balance)}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{usdmToken.formatAmount(balance.staked)}</div>
                <div className="text-sm text-muted-foreground">Staked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{usdmToken.formatAmount(balance.rewards)}</div>
                <div className="text-sm text-muted-foreground">Rewards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{usdmToken.formatAmount(balance.locked)}</div>
                <div className="text-sm text-muted-foreground">Locked</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <Card
            key={listing.id}
            className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getAgentIcon(listing.agentType)}
                  <div>
                    <CardTitle className="text-lg">{listing.name}</CardTitle>
                    <CardDescription className="capitalize">{listing.agentType} Agent</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(listing.availability)}>{listing.availability}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">{listing.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{listing.performance.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({listing.performance.completedTasks} tasks)</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{listing.hourlyRate} USDM/hr</div>
                  <div className="text-xs text-muted-foreground">
                    {listing.minimumHours}-{listing.maximumHours}h
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {listing.specialties.slice(0, 3).map((specialty) => (
                  <Badge key={specialty} variant="outline" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {listing.specialties.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{listing.specialties.length - 3} more
                  </Badge>
                )}
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="w-full ai-glow"
                    disabled={listing.availability !== "available"}
                    onClick={() => setSelectedListing(listing)}
                  >
                    {listing.availability === "available" ? "Hire Agent" : "Unavailable"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Hire {listing.name}</DialogTitle>
                    <DialogDescription>Configure your agent hire parameters</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Duration (hours)</Label>
                      <Input
                        type="number"
                        placeholder={`${listing.minimumHours}-${listing.maximumHours}`}
                        value={hireDuration}
                        onChange={(e) => setHireDuration(e.target.value)}
                        min={listing.minimumHours}
                        max={listing.maximumHours}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Custom Budget (optional)</Label>
                      <Input
                        type="number"
                        placeholder={`Default: ${calculateBudget(listing.hourlyRate, hireDuration)} USDM`}
                        value={customBudget}
                        onChange={(e) => setCustomBudget(e.target.value)}
                      />
                    </div>

                    {hireDuration && (
                      <div className="p-3 bg-secondary/20 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>Estimated Cost:</span>
                          <span className="font-medium">
                            {customBudget || calculateBudget(listing.hourlyRate, hireDuration)} USDM
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Duration:</span>
                          <span>{hireDuration} hours</span>
                        </div>
                      </div>
                    )}

                    <Button onClick={handleHireAgent} disabled={!hireDuration || isHiring} className="w-full ai-glow">
                      {isHiring ? "Processing..." : "Confirm Hire"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User's Active Hires */}
      {userHires.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Your Agent Hires</CardTitle>
            <CardDescription>Track your active and completed agent contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userHires.map((hire) => {
                const listing = agentMarketplace.getAgentListing(hire.listingId)
                if (!listing) return null

                return (
                  <div key={hire.id} className="p-4 border border-border/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getAgentIcon(listing.agentType)}
                        <span className="font-medium">{listing.name}</span>
                      </div>
                      <Badge className={getStatusColor(hire.status)}>{hire.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Duration</div>
                        <div>{hire.duration} hours</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Budget</div>
                        <div>{hire.budget} USDM</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Started</div>
                        <div>{hire.startTime ? new Date(hire.startTime).toLocaleDateString() : "Pending"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Performance</div>
                        <div>{hire.performance ? `${(hire.performance * 100).toFixed(0)}%` : "In Progress"}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
