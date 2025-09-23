-- SentinelAI 4.0 Database Schema
-- SQLite database for hackathon/development

-- DAO Treasury table
CREATE TABLE IF NOT EXISTS treasury (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dao_address TEXT NOT NULL,
    total_value_usd DECIMAL(20, 2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    chain_id INTEGER NOT NULL
);

-- Asset allocations
CREATE TABLE IF NOT EXISTS allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    treasury_id INTEGER REFERENCES treasury(id),
    asset_symbol TEXT NOT NULL,
    asset_address TEXT NOT NULL,
    amount DECIMAL(30, 18) NOT NULL,
    value_usd DECIMAL(20, 2) NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Agents table
CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'trader', 'compliance', 'supervisor', 'advisor'
    status TEXT NOT NULL, -- 'active', 'paused', 'error'
    config JSON,
    performance_metrics JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent actions/decisions log
CREATE TABLE IF NOT EXISTS agent_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id INTEGER REFERENCES agents(id),
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    parameters JSON,
    result JSON,
    xai_explanation TEXT, -- Explainable AI output
    confidence_score DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ZK Proofs table for privacy compliance
CREATE TABLE IF NOT EXISTS zk_proofs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proof_hash TEXT NOT NULL UNIQUE,
    proof_type TEXT NOT NULL, -- 'transaction', 'allocation', 'governance'
    public_inputs JSON,
    verification_key TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Governance proposals
CREATE TABLE IF NOT EXISTS proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    proposer_address TEXT NOT NULL,
    status TEXT NOT NULL, -- 'active', 'passed', 'rejected', 'executed'
    votes_for INTEGER DEFAULT 0,
    votes_against INTEGER DEFAULT 0,
    ai_recommendation TEXT,
    ai_confidence DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    voting_ends_at TIMESTAMP NOT NULL
);

-- Governance votes
CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposal_id INTEGER REFERENCES proposals(id),
    voter_address TEXT NOT NULL,
    vote_choice TEXT NOT NULL, -- 'for', 'against', 'abstain'
    voting_power DECIMAL(20, 2) NOT NULL,
    is_override BOOLEAN DEFAULT FALSE, -- Human override of AI recommendation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(proposal_id, voter_address)
);

-- Tokenized agent economy
CREATE TABLE IF NOT EXISTS agent_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id INTEGER REFERENCES agents(id),
    token_symbol TEXT NOT NULL,
    total_supply DECIMAL(30, 18) NOT NULL,
    circulating_supply DECIMAL(30, 18) NOT NULL,
    price_usd DECIMAL(20, 8) NOT NULL,
    market_cap_usd DECIMAL(20, 2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent hiring/rewards
CREATE TABLE IF NOT EXISTS agent_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_address TEXT NOT NULL,
    to_agent_id INTEGER REFERENCES agents(id),
    transaction_type TEXT NOT NULL, -- 'hire', 'reward', 'penalty'
    amount DECIMAL(30, 18) NOT NULL,
    token_symbol TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Risk assessments
CREATE TABLE IF NOT EXISTS risk_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id INTEGER REFERENCES agents(id),
    risk_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    risk_score DECIMAL(3, 2) NOT NULL, -- 0.00 to 1.00
    risk_factors JSON,
    mitigation_actions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data
INSERT INTO treasury (dao_address, total_value_usd, chain_id) VALUES 
('0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c', 97097765.47, 1);

INSERT INTO agents (name, type, status, config, performance_metrics) VALUES 
('Trader Agent', 'trader', 'active', '{"max_trade_size": 1000000, "risk_tolerance": 0.3}', '{"yield_generated": 15.2, "trades_executed": 847}'),
('Compliance Agent', 'compliance', 'active', '{"zk_proof_required": true, "regulatory_framework": "MiCA"}', '{"compliance_rate": 100.0, "proofs_generated": 1247}'),
('Supervisor Agent', 'supervisor', 'active', '{"oversight_threshold": 0.8, "crisis_mode": false}', '{"decisions_overridden": 3, "accuracy_rate": 97.8}'),
('Advisor Agent', 'advisor', 'standby', '{"prediction_model": "federated_learning", "crisis_simulation": true}', '{"risk_predictions": 234, "accuracy": 94.2}');

INSERT INTO allocations (treasury_id, asset_symbol, asset_address, amount, value_usd, percentage) VALUES 
(1, 'ETH', '0x0000000000000000000000000000000000000000', 15234.567, 43876543.21, 45.2),
(1, 'USDC', '0xA0b86a33E6441b8C4505B8C4505B8C4505B8C450', 31234567.89, 31234567.89, 32.1),
(1, 'AAVE', '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', 123456.78, 21986654.37, 22.7);

INSERT INTO proposals (title, description, proposer_address, status, votes_for, votes_against, ai_recommendation, ai_confidence, voting_ends_at) VALUES 
('Increase AI Agent Autonomy Threshold', 'Allow agents to execute trades up to $500K without human approval', '0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c', 'active', 847, 123, 'Support', 0.87, datetime('now', '+2 days')),
('Deploy to Arbitrum Network', 'Expand treasury operations to Arbitrum for lower gas costs', '0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c', 'pending', 0, 0, 'Support', 0.92, datetime('now', '+5 days'));
