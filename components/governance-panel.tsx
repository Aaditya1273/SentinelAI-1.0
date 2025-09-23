"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Vote, Users, Clock, CheckCircle } from "lucide-react"

const proposals = [
  {
    id: 1,
    title: "Increase AI Agent Autonomy Threshold",
    description: "Allow agents to execute trades up to $500K without human approval",
    status: "active",
    votes: { for: 847, against: 123 },
    timeLeft: "2 days",
    aiRecommendation: "Support",
  },
  {
    id: 2,
    title: "Deploy to Arbitrum Network",
    description: "Expand treasury operations to Arbitrum for lower gas costs",
    status: "pending",
    votes: { for: 0, against: 0 },
    timeLeft: "5 days",
    aiRecommendation: "Support",
  },
]

export function GovernancePanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote className="w-5 h-5" />
          Hybrid Governance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">{proposal.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{proposal.description}</p>
                </div>
                <Badge variant={proposal.status === "active" ? "default" : "secondary"}>{proposal.status}</Badge>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{proposal.votes.for + proposal.votes.against} votes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{proposal.timeLeft} left</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>AI: {proposal.aiRecommendation}</span>
                </div>
              </div>

              {proposal.status === "active" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>For: {proposal.votes.for}</span>
                    <span>Against: {proposal.votes.against}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full"
                      style={{
                        width: `${(proposal.votes.for / (proposal.votes.for + proposal.votes.against)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="default">
                      Vote For
                    </Button>
                    <Button size="sm" variant="outline">
                      Vote Against
                    </Button>
                    <Button size="sm" variant="ghost">
                      Override AI
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
