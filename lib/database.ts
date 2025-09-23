import Database from "better-sqlite3"
import { readFileSync } from "fs"
import { join } from "path"

// Initialize SQLite database for hackathon
const db = new Database("sentinelai.db")

// Initialize database schema
export function initializeDatabase() {
  try {
    const schema = readFileSync(join(process.cwd(), "scripts", "init-database.sql"), "utf8")
    db.exec(schema)
    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Failed to initialize database:", error)
  }
}

// Treasury operations
export const treasuryQueries = {
  getTreasuryOverview: () => {
    return db
      .prepare(`
      SELECT t.*, 
             COUNT(a.id) as asset_count,
             SUM(a.value_usd) as calculated_total
      FROM treasury t
      LEFT JOIN allocations a ON t.id = a.treasury_id
      GROUP BY t.id
    `)
      .all()
  },

  getAllocations: (treasuryId: number) => {
    return db
      .prepare(`
      SELECT * FROM allocations 
      WHERE treasury_id = ? 
      ORDER BY percentage DESC
    `)
      .all(treasuryId)
  },
}

// Agent operations
export const agentQueries = {
  getAllAgents: () => {
    return db
      .prepare(`
      SELECT a.*,
             COUNT(aa.id) as total_actions,
             MAX(aa.created_at) as last_action
      FROM agents a
      LEFT JOIN agent_actions aa ON a.id = aa.agent_id
      GROUP BY a.id
      ORDER BY a.created_at
    `)
      .all()
  },

  getAgentActions: (agentId: number, limit = 10) => {
    return db
      .prepare(`
      SELECT * FROM agent_actions 
      WHERE agent_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `)
      .all(agentId, limit)
  },

  logAgentAction: (
    agentId: number,
    actionType: string,
    description: string,
    parameters: any,
    result: any,
    xaiExplanation: string,
    confidence: number,
  ) => {
    return db
      .prepare(`
      INSERT INTO agent_actions (agent_id, action_type, description, parameters, result, xai_explanation, confidence_score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
      .run(
        agentId,
        actionType,
        description,
        JSON.stringify(parameters),
        JSON.stringify(result),
        xaiExplanation,
        confidence,
      )
  },
}

// Governance operations
export const governanceQueries = {
  getActiveProposals: () => {
    return db
      .prepare(`
      SELECT * FROM proposals 
      WHERE status = 'active' 
      ORDER BY created_at DESC
    `)
      .all()
  },

  getAllProposals: () => {
    return db
      .prepare(`
      SELECT * FROM proposals 
      ORDER BY created_at DESC
    `)
      .all()
  },

  castVote: (proposalId: number, voterAddress: string, voteChoice: string, votingPower: number, isOverride = false) => {
    return db
      .prepare(`
      INSERT OR REPLACE INTO votes (proposal_id, voter_address, vote_choice, voting_power, is_override)
      VALUES (?, ?, ?, ?, ?)
    `)
      .run(proposalId, voterAddress, voteChoice, votingPower, isOverride)
  },
}

// ZK Proof operations
export const zkQueries = {
  storeProof: (proofHash: string, proofType: string, publicInputs: any, verificationKey: string) => {
    return db
      .prepare(`
      INSERT INTO zk_proofs (proof_hash, proof_type, public_inputs, verification_key)
      VALUES (?, ?, ?, ?)
    `)
      .run(proofHash, proofType, JSON.stringify(publicInputs), verificationKey)
  },

  verifyProof: (proofHash: string) => {
    return db
      .prepare(`
      UPDATE zk_proofs 
      SET is_verified = TRUE 
      WHERE proof_hash = ?
    `)
      .run(proofHash)
  },
}

export default db
