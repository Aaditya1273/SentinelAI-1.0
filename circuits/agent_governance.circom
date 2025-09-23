pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/eddsa.circom";

// Agent Governance ZK Circuit for SentinelAI 4.0
// Proves valid governance decision without revealing voting details
template AgentGovernance() {
    // Private inputs
    signal private input vote_choice;      // 0 = against, 1 = for, 2 = abstain
    signal private input voting_power;     // Voter's voting power
    signal private input voter_nonce;      // Unique nonce for voter
    signal private input agent_recommendation; // AI agent recommendation (0 or 1)
    signal private input confidence_score; // Agent confidence (0-100)
    
    // Public inputs
    signal input proposal_id;              // Proposal identifier
    signal input voting_deadline;          // Voting deadline timestamp
    signal input current_timestamp;        // Current timestamp
    signal input min_voting_power;         // Minimum voting power required
    
    // Outputs
    signal output valid_vote;              // 1 if vote is valid
    signal output vote_commitment;         // Commitment to vote details
    signal output is_override;             // 1 if human overrides AI recommendation
    
    // Components
    component poseidon_vote = Poseidon(4);
    component poseidon_commitment = Poseidon(5);
    component choice_check = LessEqualThan(8);
    component power_check = GreaterEqualThan(32);
    component time_check = LessEqualThan(64);
    component confidence_check = LessEqualThan(8);
    component override_check = IsEqual();
    
    // Constraint 1: Vote choice must be valid (0, 1, or 2)
    choice_check.in[0] <== vote_choice;
    choice_check.in[1] <== 2;
    
    // Constraint 2: Voting power must meet minimum requirement
    power_check.in[0] <== voting_power;
    power_check.in[1] <== min_voting_power;
    
    // Constraint 3: Vote must be cast before deadline
    time_check.in[0] <== current_timestamp;
    time_check.in[1] <== voting_deadline;
    
    // Constraint 4: Confidence score must be valid (0-100)
    confidence_check.in[0] <== confidence_score;
    confidence_check.in[1] <== 100;
    
    // Constraint 5: Check if human vote overrides AI recommendation
    override_check.in[0] <== vote_choice;
    override_check.in[1] <== agent_recommendation;
    is_override <== 1 - override_check.out;
    
    // Generate vote commitment
    poseidon_commitment.inputs[0] <== vote_choice;
    poseidon_commitment.inputs[1] <== voting_power;
    poseidon_commitment.inputs[2] <== voter_nonce;
    poseidon_commitment.inputs[3] <== agent_recommendation;
    poseidon_commitment.inputs[4] <== confidence_score;
    
    vote_commitment <== poseidon_commitment.out;
    
    // Final validity check
    valid_vote <== choice_check.out * power_check.out * time_check.out * confidence_check.out;
}

component main = AgentGovernance();
