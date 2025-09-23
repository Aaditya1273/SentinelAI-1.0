import { TreasuryDashboard } from "@/components/treasury-dashboard"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function TreasuryPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Treasury Management</h1>
          <p className="text-muted-foreground text-pretty">
            AI-powered cross-chain treasury operations with real-time analytics and risk management
          </p>
        </div>

        <TreasuryDashboard />
      </div>
    </DashboardLayout>
  )
}
