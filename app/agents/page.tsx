import { AgentDashboard } from "@/components/agent-dashboard"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function AgentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">AI Agent Management</h1>
          <p className="text-muted-foreground text-pretty">
            Monitor and control the multi-agent AI system powering your DAO treasury
          </p>
        </div>

        <AgentDashboard />
      </div>
    </DashboardLayout>
  )
}
