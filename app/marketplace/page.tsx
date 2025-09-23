import { AgentMarketplace } from "@/components/agent-marketplace"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function MarketplacePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Agent Marketplace</h1>
          <p className="text-muted-foreground text-pretty">
            Hire specialized AI agents using USDM tokens for your DAO treasury management needs
          </p>
        </div>

        <AgentMarketplace />
      </div>
    </DashboardLayout>
  )
}
