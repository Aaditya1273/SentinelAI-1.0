pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/bitify.circom";

// Treasury Transaction ZK Circuit for SentinelAI 4.0
// Proves valid treasury operation without revealing sensitive details
template TreasuryTransaction() {
    // Private inputs (hidden from verifier)
    signal private input amount;           // Transaction amount
    signal private input balance_before;   // Balance before transaction
    signal private input balance_after;    // Balance after transaction
    signal private input nonce;           // Transaction nonce for uniqueness
    signal private input agent_id;        // AI agent ID performing transaction
    
    // Public inputs (visible to verifier)
    signal input treasury_id;             // Treasury identifier
    signal input transaction_type;        // 1 = deposit, 2 = withdrawal, 3 = rebalance
    signal input timestamp;               // Transaction timestamp
    signal input compliance_hash;         // Hash of compliance verification
    
    // Outputs
    signal output valid;                  // 1 if transaction is valid, 0 otherwise
    signal output commitment;             // Commitment to private inputs
    
    // Components
    component poseidon = Poseidon(5);
    component amount_check = GreaterThan(64);
    component balance_check = GreaterEqualThan(64);
    component type_check = LessEqualThan(8);
    
    // Constraint 1: Amount must be positive
    amount_check.in[0] <== amount;
    amount_check.in[1] <== 0;
    
    // Constraint 2: Balance after transaction must be non-negative
    balance_check.in[0] <== balance_after;
    balance_check.in[1] <== 0;
    
    // Constraint 3: Transaction type must be valid (1, 2, or 3)
    type_check.in[0] <== transaction_type;
    type_check.in[1] <== 3;
    
    // Constraint 4: Balance consistency check
    // For deposits: balance_after = balance_before + amount
    // For withdrawals: balance_after = balance_before - amount
    // For rebalancing: balance_after can be different based on rebalancing logic
    
    component balance_consistency = BalanceConsistency();
    balance_consistency.balance_before <== balance_before;
    balance_consistency.balance_after <== balance_after;
    balance_consistency.amount <== amount;
    balance_consistency.transaction_type <== transaction_type;
    
    // Constraint 5: Generate commitment to private inputs using Poseidon hash
    poseidon.inputs[0] <== amount;
    poseidon.inputs[1] <== balance_before;
    poseidon.inputs[2] <== balance_after;
    poseidon.inputs[3] <== nonce;
    poseidon.inputs[4] <== agent_id;
    
    commitment <== poseidon.out;
    
    // Final validity check: all constraints must pass
    valid <== amount_check.out * balance_check.out * type_check.out * balance_consistency.valid;
}

// Helper template for balance consistency
template BalanceConsistency() {
    signal input balance_before;
    signal input balance_after;
    signal input amount;
    signal input transaction_type;
    
    signal output valid;
    
    component is_deposit = IsEqual();
    component is_withdrawal = IsEqual();
    component is_rebalance = IsEqual();
    
    is_deposit.in[0] <== transaction_type;
    is_deposit.in[1] <== 1;
    
    is_withdrawal.in[0] <== transaction_type;
    is_withdrawal.in[1] <== 2;
    
    is_rebalance.in[0] <== transaction_type;
    is_rebalance.in[1] <== 3;
    
    // Check deposit: balance_after = balance_before + amount
    signal deposit_valid;
    deposit_valid <== is_deposit.out * (balance_after - balance_before - amount);
    
    // Check withdrawal: balance_after = balance_before - amount
    signal withdrawal_valid;
    withdrawal_valid <== is_withdrawal.out * (balance_after - balance_before + amount);
    
    // For rebalancing, we allow more flexibility
    signal rebalance_valid;
    rebalance_valid <== is_rebalance.out;
    
    // At least one condition must be satisfied
    valid <== 1 - (deposit_valid * deposit_valid + withdrawal_valid * withdrawal_valid - rebalance_valid);
}

component main = TreasuryTransaction();
