import { DashboardLayout } from "@/components/dashboard-layout"
import { TreasuryOverview } from "@/components/treasury-overview"
import { AgentStatus } from "@/components/agent-status"
import { RealTimeMetrics } from "@/components/real-time-metrics"
import { GovernancePanel } from "@/components/governance-panel"

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance">SentinelAI 4.0 Dashboard</h1>
            <p className="text-muted-foreground text-pretty">Privacy-first AI-powered DAO treasury management system</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <TreasuryOverview />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RealTimeMetrics />
          </div>
          <div>
            <AgentStatus />
          </div>
        </div>

        <GovernancePanel />
      </div>
    </DashboardLayout>
  )
}
