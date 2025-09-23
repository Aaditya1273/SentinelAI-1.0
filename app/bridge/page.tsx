import { CrossChainBridge } from "@/components/cross-chain-bridge"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function BridgePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Cross-Chain Bridge</h1>
          <p className="text-muted-foreground text-pretty">
            Securely transfer assets across multiple blockchain networks with multi-signature validation
          </p>
        </div>

        <CrossChainBridge />
      </div>
    </DashboardLayout>
  )
}
