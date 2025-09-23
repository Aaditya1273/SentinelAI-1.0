import { GovernanceDashboard } from "@/components/governance-dashboard"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function GovernancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Hybrid Governance</h1>
          <p className="text-muted-foreground text-pretty">
            Participate in DAO governance by voting on AI decisions and system parameters using staked USDM tokens
          </p>
        </div>

        <GovernanceDashboard />
      </div>
    </DashboardLayout>
  )
}
