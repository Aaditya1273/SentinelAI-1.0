// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SentinelTreasury
 * @dev Main treasury contract for SentinelAI 4.0 DAO treasury management
 * Supports multi-agent AI decisions with human override capabilities
 */
contract SentinelTreasury is ReentrancyGuard, AccessControl, Pausable {
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant SUPERVISOR_ROLE = keccak256("SUPERVISOR_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    // Structs
    struct Asset {
        address tokenAddress;
        uint256 amount;
        uint256 lastUpdated;
        bool isActive;
    }

    struct AgentDecision {
        uint256 id;
        address agent;
        string actionType;
        bytes actionData;
        uint256 timestamp;
        bool executed;
        bool overridden;
        string zkProofHash;
    }

    struct GovernanceProposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
        mapping(address => bool) voteChoice;
    }

    // State variables
    mapping(address => Asset) public assets;
    address[] public assetList;
    mapping(uint256 => AgentDecision) public agentDecisions;
    mapping(uint256 => GovernanceProposal) public proposals;
    
    uint256 public nextDecisionId = 1;
    uint256 public nextProposalId = 1;
    uint256 public totalValueUSD;
    
    // Agent autonomy settings
    uint256 public maxAutonomousAmount = 500000 * 10**18; // $500K in wei
    uint256 public governanceThreshold = 1000000 * 10**18; // $1M requires governance
    
    // Events
    event AssetAdded(address indexed token, uint256 amount);
    event AssetRemoved(address indexed token);
    event AgentDecisionProposed(uint256 indexed decisionId, address indexed agent, string actionType);
    event AgentDecisionExecuted(uint256 indexed decisionId);
    event AgentDecisionOverridden(uint256 indexed decisionId, address indexed supervisor);
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address _admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(SUPERVISOR_ROLE, _admin);
        _grantRole(GOVERNANCE_ROLE, _admin);
    }

    /**
     * @dev Add a new asset to the treasury
     */
    function addAsset(address _token, uint256 _amount) external onlyRole(SUPERVISOR_ROLE) {
        require(_token != address(0), "Invalid token address");
        
        if (!assets[_token].isActive) {
            assetList.push(_token);
        }
        
        assets[_token] = Asset({
            tokenAddress: _token,
            amount: _amount,
            lastUpdated: block.timestamp,
            isActive: true
        });
        
        emit AssetAdded(_token, _amount);
    }

    /**
     * @dev Agent proposes a treasury action with ZK proof
     */
    function proposeAgentAction(
        string memory _actionType,
        bytes memory _actionData,
        string memory _zkProofHash
    ) external onlyRole(AGENT_ROLE) returns (uint256) {
        uint256 decisionId = nextDecisionId++;
        
        agentDecisions[decisionId] = AgentDecision({
            id: decisionId,
            agent: msg.sender,
            actionType: _actionType,
            actionData: _actionData,
            timestamp: block.timestamp,
            executed: false,
            overridden: false,
            zkProofHash: _zkProofHash
        });
        
        emit AgentDecisionProposed(decisionId, msg.sender, _actionType);
        return decisionId;
    }

    /**
     * @dev Execute agent decision if within autonomous limits
     */
    function executeAgentDecision(uint256 _decisionId) external onlyRole(AGENT_ROLE) nonReentrant {
        AgentDecision storage decision = agentDecisions[_decisionId];
        require(!decision.executed, "Decision already executed");
        require(!decision.overridden, "Decision was overridden");
        require(decision.agent == msg.sender, "Not authorized");
        
        // Decode action data to check amount (simplified)
        // In production, this would parse the action data properly
        
        decision.executed = true;
        emit AgentDecisionExecuted(_decisionId);
    }

    /**
     * @dev Supervisor can override agent decisions
     */
    function overrideAgentDecision(uint256 _decisionId, string memory _reason) 
        external onlyRole(SUPERVISOR_ROLE) {
        AgentDecision storage decision = agentDecisions[_decisionId];
        require(!decision.executed, "Decision already executed");
        
        decision.overridden = true;
        emit AgentDecisionOverridden(_decisionId, msg.sender);
    }

    /**
     * @dev Create governance proposal
     */
    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _votingPeriod
    ) external onlyRole(GOVERNANCE_ROLE) returns (uint256) {
        uint256 proposalId = nextProposalId++;
        
        GovernanceProposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.title = _title;
        proposal.description = _description;
        proposal.proposer = msg.sender;
        proposal.endTime = block.timestamp + _votingPeriod;
        
        emit ProposalCreated(proposalId, msg.sender, _title);
        return proposalId;
    }

    /**
     * @dev Cast vote on governance proposal
     */
    function vote(uint256 _proposalId, bool _support) external {
        GovernanceProposal storage proposal = proposals[_proposalId];
        require(block.timestamp < proposal.endTime, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.voteChoice[msg.sender] = _support;
        
        if (_support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
        
        emit VoteCast(_proposalId, msg.sender, _support);
    }

    /**
     * @dev Execute passed governance proposal
     */
    function executeProposal(uint256 _proposalId) external onlyRole(GOVERNANCE_ROLE) {
        GovernanceProposal storage proposal = proposals[_proposalId];
        require(block.timestamp >= proposal.endTime, "Voting still active");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal rejected");
        require(!proposal.executed, "Already executed");
        
        proposal.executed = true;
        emit ProposalExecuted(_proposalId);
    }

    /**
     * @dev Emergency pause function
     */
    function pause() external onlyRole(SUPERVISOR_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause function
     */
    function unpause() external onlyRole(SUPERVISOR_ROLE) {
        _unpause();
    }

    /**
     * @dev Get treasury overview
     */
    function getTreasuryOverview() external view returns (
        address[] memory tokens,
        uint256[] memory amounts,
        uint256 totalValue
    ) {
        tokens = new address[](assetList.length);
        amounts = new uint256[](assetList.length);
        
        for (uint256 i = 0; i < assetList.length; i++) {
            tokens[i] = assetList[i];
            amounts[i] = assets[assetList[i]].amount;
        }
        
        return (tokens, amounts, totalValueUSD);
    }

    /**
     * @dev Get agent decision details
     */
    function getAgentDecision(uint256 _decisionId) external view returns (
        address agent,
        string memory actionType,
        bytes memory actionData,
        uint256 timestamp,
        bool executed,
        bool overridden,
        string memory zkProofHash
    ) {
        AgentDecision memory decision = agentDecisions[_decisionId];
        return (
            decision.agent,
            decision.actionType,
            decision.actionData,
            decision.timestamp,
            decision.executed,
            decision.overridden,
            decision.zkProofHash
        );
    }
}
