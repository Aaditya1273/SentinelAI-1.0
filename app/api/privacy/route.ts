import { type NextRequest, NextResponse } from "next/server"
import { zkProofSystem } from "@/lib/zk/zk-proof-system"
import { privacyOracles } from "@/lib/privacy/privacy-preserving-oracles"
import { federatedLearning } from "@/lib/privacy/federated-learning"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    switch (action) {
      case "zk_proofs":
        // Return recent ZK proofs (mock data for demo)
        return NextResponse.json({
          proofs: [
            {
              id: "zk_001",
              type: "Transaction Proof",
              status: "verified",
              timestamp: Date.now() - 120000,
              gasOptimization: "45% reduction",
            },
          ],
        })

      case "privacy_metrics":
        return NextResponse.json({
          privacyScore: 98.7,
          quantumResistant: true,
          proofsGenerated: 1247,
          gasOptimization: 42,
        })

      case "federated_models":
        const models = federatedLearning.getAllModels()
        return NextResponse.json({ models })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Privacy operation failed" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    switch (action) {
      case "generate_proof":
        const proof = await zkProofSystem.generateTransactionProof({
          publicInputs: data.publicInputs,
          privateInputs: data.privateInputs,
          proofType: data.proofType,
        })
        return NextResponse.json({ proof })

      case "fetch_private_data":
        const privateData = await privacyOracles.fetchPrivatePriceData(data.request)
        return NextResponse.json({ privateData })

      case "federated_update":
        await federatedLearning.initializeRiskPredictionModel()
        return NextResponse.json({ message: "Federated learning model initialized" })

      case "unlearning_request":
        const model = await federatedLearning.federatedUnlearning(data.modelId, data.unlearningRequest)
        return NextResponse.json({ model })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Privacy operation failed" }, { status: 500 })
  }
}
