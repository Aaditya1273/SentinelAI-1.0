"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Vote, AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react"
import { hybridGovernance, type GovernanceProposal, type VoteRecord } from "@/lib/governance/hybrid-governance"
import { useAccount } from "wagmi"

export function GovernanceDashboard() {
  const { address } = useAccount()
  const [activeProposals, setActiveProposals] = useState<GovernanceProposal[]>([])
  const [userVotes, setUserVotes] = useState<VoteRecord[]>([])
  const [selectedProposal, setSelectedProposal] = useState<GovernanceProposal | null>(null)
  const [voteChoice, setVoteChoice] = useState<"for" | "against" | "abstain">("for")
  const [stakeAmount, setStakeAmount] = useState("")
  const [voteReasoning, setVoteReasoning] = useState("")
  const [isVoting, setIsVoting] = useState(false)

  useEffect(() => {
    loadGovernanceData()
  }, [address])

  const loadGovernanceData = async () => {
    const proposals = hybridGovernance.getActiveProposals()
    setActiveProposals(proposals)

    if (address) {
      const votes = hybridGovernance.getUserVotes(address)
      setUserVotes(votes)
    }
  }

  const handleVote = async () => {
    if (!selectedProposal || !address || !stakeAmount) return

    setIsVoting(true)
    try {
      await hybridGovernance.voteOnProposal(
        selectedProposal.id,
        address,
        voteChoice,
        stakeAmount,
        voteReasoning || undefined,
      )

      await loadGovernanceData()
      setSelectedProposal(null)
      setStakeAmount("")
      setVoteReasoning("")
    } catch (error) {
      console.error("Voting failed:", error)
    } finally {
      setIsVoting(false)
    }
  }

  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary border-primary/20"
      case "passed":
        return "bg-success/10 text-success border-success/20"
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "executed":
        return "bg-success/10 text-success border-success/20"
      case "expired":
        return "bg-muted/10 text-muted-foreground border-muted/20"
      default:
        return "bg-secondary/10 text-secondary border-secondary/20"
    }
  }

  const getProposalIcon = (type: string) => {
    switch (type) {
      case "agent_override":
        return <AlertTriangle className="w-5 h-5" />
      case "parameter_change":
        return <TrendingUp className="w-5 h-5" />
      case "emergency_stop":
        return <XCircle className="w-5 h-5" />
      case "budget_allocation":
        return <CheckCircle className="w-5 h-5" />
      default:
        return <Vote className="w-5 h-5" />
    }
  }

  const calculateVotingProgress = (proposal: GovernanceProposal) => {
    const totalVotes =
      Number.parseFloat(proposal.votingPower.for) +
      Number.parseFloat(proposal.votingPower.against) +
      Number.parseFloat(proposal.votingPower.abstain)

    const quorum = Number.parseFloat(proposal.quorum)
    const quorumProgress = Math.min((totalVotes / quorum) * 100, 100)

    const forPercentage =
      totalVotes > 0
        ? (Number.parseFloat(proposal.votingPower.for) /
            (Number.parseFloat(proposal.votingPower.for) + Number.parseFloat(proposal.votingPower.against))) *
          100
        : 0

    return { quorumProgress, forPercentage, totalVotes }
  }

  const formatTimeRemaining = (endTime: number) => {
    const remaining = endTime - Date.now()
    if (remaining <= 0) return "Ended"

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h remaining`
    return `${hours}h remaining`
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Proposals</TabsTrigger>
          <TabsTrigger value="history">Voting History</TabsTrigger>
          <TabsTrigger value="learning">AI Learning Data</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeProposals.length === 0 ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Proposals</h3>
                  <p className="text-muted-foreground">
                    There are currently no governance proposals requiring your attention.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeProposals.map((proposal) => {
                const { quorumProgress, forPercentage, totalVotes } = calculateVotingProgress(proposal)
                const userHasVoted = userVotes.some((v) => v.proposalId === proposal.id)

                return (
                  <Card key={proposal.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getProposalIcon(proposal.type)}
                          <div>
                            <CardTitle className="text-lg">{proposal.title}</CardTitle>
                            <CardDescription className="capitalize">
                              {proposal.type.replace("_", " ")} • Proposed by {proposal.proposer.slice(0, 6)}...
                              {proposal.proposer.slice(-4)}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getProposalStatusColor(proposal.status)}>{proposal.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{proposal.description}</p>

                      {proposal.agentDecision && (
                        <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-warning" />
                            <span className="font-medium text-warning">AI Decision Override</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div>
                              <strong>Agent:</strong> {proposal.agentDecision.agentType}
                            </div>
                            <div>
                              <strong>Confidence:</strong> {(proposal.agentDecision.confidence * 100).toFixed(0)}%
                            </div>
                            <div>
                              <strong>Reasoning:</strong> {proposal.agentDecision.reasoning}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Quorum Progress</span>
                            <span>{quorumProgress.toFixed(1)}%</span>
                          </div>
                          <Progress value={quorumProgress} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {totalVotes.toLocaleString()} / {Number.parseFloat(proposal.quorum).toLocaleString()} USDM
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Support</span>
                            <span>{forPercentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={forPercentage} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            Need {(proposal.threshold * 100).toFixed(0)}% to pass
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Time Remaining</span>
                            <Clock className="w-3 h-3" />
                          </div>
                          <div className="text-sm font-medium">{formatTimeRemaining(proposal.endTime)}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-2 text-xs">
                          <span className="text-success">
                            For: {Number.parseFloat(proposal.votingPower.for).toLocaleString()}
                          </span>
                          <span className="text-destructive">
                            Against: {Number.parseFloat(proposal.votingPower.against).toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            Abstain: {Number.parseFloat(proposal.votingPower.abstain).toLocaleString()}
                          </span>
                        </div>

                        {userHasVoted ? (
                          <Badge variant="outline" className="text-xs">
                            Already Voted
                          </Badge>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                className="ai-glow"
                                onClick={() => setSelectedProposal(proposal)}
                                disabled={!address || Date.now() > proposal.endTime}
                              >
                                <Vote className="w-4 h-4 mr-2" />
                                Vote
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Cast Your Vote</DialogTitle>
                                <DialogDescription>Stake USDM tokens to vote on this proposal</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Vote Choice</Label>
                                  <div className="flex gap-2">
                                    {(["for", "against", "abstain"] as const).map((choice) => (
                                      <Button
                                        key={choice}
                                        variant={voteChoice === choice ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setVoteChoice(choice)}
                                        className="capitalize"
                                      >
                                        {choice}
                                      </Button>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Stake Amount (USDM)</Label>
                                  <Input
                                    type="number"
                                    placeholder="100"
                                    value={stakeAmount}
                                    onChange={(e) => setStakeAmount(e.target.value)}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Reasoning (optional)</Label>
                                  <Textarea
                                    placeholder="Explain your vote..."
                                    value={voteReasoning}
                                    onChange={(e) => setVoteReasoning(e.target.value)}
                                    rows={3}
                                  />
                                </div>

                                <Button
                                  onClick={handleVote}
                                  disabled={!stakeAmount || isVoting}
                                  className="w-full ai-glow"
                                >
                                  {isVoting ? "Processing..." : `Vote ${voteChoice} with ${stakeAmount} USDM`}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {userVotes.length === 0 ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Voting History</h3>
                  <p className="text-muted-foreground">You haven't participated in any governance votes yet.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userVotes.map((vote) => {
                const proposal = hybridGovernance.getProposal(vote.proposalId)
                return (
                  <Card
                    key={`${vote.proposalId}-${vote.timestamp}`}
                    className="border-border/50 bg-card/50 backdrop-blur-sm"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{proposal?.title || "Unknown Proposal"}</div>
                        <Badge
                          className={
                            vote.choice === "for"
                              ? "bg-success/10 text-success"
                              : vote.choice === "against"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted/10 text-muted-foreground"
                          }
                        >
                          {vote.choice}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Stake</div>
                          <div>{vote.stake} USDM</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Date</div>
                          <div>{new Date(vote.timestamp).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Status</div>
                          <div className="capitalize">{proposal?.status || "Unknown"}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">TX Hash</div>
                          <div className="font-mono text-xs">
                            {vote.txHash ? `${vote.txHash.slice(0, 6)}...${vote.txHash.slice(-4)}` : "Pending"}
                          </div>
                        </div>
                      </div>
                      {vote.reasoning && (
                        <div className="mt-3 p-2 bg-secondary/20 rounded text-sm">
                          <strong>Reasoning:</strong> {vote.reasoning}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>AI Learning from Governance</CardTitle>
              <CardDescription>How the Supervisor Agent learns from human override decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hybridGovernance
                  .getLearningData()
                  .slice(0, 5)
                  .map((entry, index) => (
                    <div key={entry.proposalId} className="p-4 border border-border/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium capitalize">{entry.agentType} Agent Override</div>
                        <Badge
                          className={entry.outcome > 0.7 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}
                        >
                          {(entry.outcome * 100).toFixed(0)}% Success
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>Original Decision: {JSON.stringify(entry.originalDecision).slice(0, 100)}...</div>
                        <div>Human Override: {JSON.stringify(entry.humanOverride).slice(0, 100)}...</div>
                        <div>Date: {new Date(entry.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}

                {hybridGovernance.getLearningData().length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No learning data available yet. AI will learn from governance outcomes.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
