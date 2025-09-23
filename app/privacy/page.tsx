import { PrivacyDashboard } from "@/components/privacy-dashboard"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function PrivacyPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Privacy & ZK Proof System</h1>
          <p className="text-muted-foreground text-pretty">
            Quantum-resistant zero-knowledge proofs and privacy-preserving operations
          </p>
        </div>

        <PrivacyDashboard />
      </div>
    </DashboardLayout>
  )
}
