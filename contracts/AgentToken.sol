// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AgentToken ($USDM)
 * @dev Tokenized agent economy for SentinelAI 4.0
 * Agents can be hired, rewarded, and penalized using this token
 */
contract AgentToken is ERC20, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant AGENT_MANAGER_ROLE = keccak256("AGENT_MANAGER_ROLE");

    // Agent marketplace structures
    struct AgentListing {
        uint256 id;
        address agentContract;
        string agentType; // "trader", "compliance", "supervisor", "advisor"
        uint256 hireCost;
        uint256 rewardRate;
        uint256 reputation;
        bool isActive;
        address owner;
    }

    struct AgentHiring {
        uint256 listingId;
        address hirer;
        uint256 duration;
        uint256 startTime;
        uint256 totalCost;
        bool isActive;
    }

    // State variables
    mapping(uint256 => AgentListing) public agentListings;
    mapping(uint256 => AgentHiring) public agentHirings;
    mapping(address => uint256[]) public userHirings;
    
    uint256 public nextListingId = 1;
    uint256 public nextHiringId = 1;
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1B tokens
    
    // Events
    event AgentListed(uint256 indexed listingId, address indexed owner, string agentType, uint256 hireCost);
    event AgentHired(uint256 indexed hiringId, uint256 indexed listingId, address indexed hirer, uint256 duration);
    event AgentRewarded(address indexed agent, uint256 amount, string reason);
    event AgentPenalized(address indexed agent, uint256 amount, string reason);
    event ReputationUpdated(uint256 indexed listingId, uint256 newReputation);

    constructor(address _admin) ERC20("SentinelAI USD Market", "USDM") {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MINTER_ROLE, _admin);
        _grantRole(BURNER_ROLE, _admin);
        _grantRole(AGENT_MANAGER_ROLE, _admin);
        
        // Mint initial supply to admin
        _mint(_admin, 100000000 * 10**18); // 100M initial supply
    }

    /**
     * @dev List an agent for hiring in the marketplace
     */
    function listAgent(
        address _agentContract,
        string memory _agentType,
        uint256 _hireCost,
        uint256 _rewardRate
    ) external returns (uint256) {
        require(_agentContract != address(0), "Invalid agent contract");
        require(_hireCost > 0, "Hire cost must be positive");
        
        uint256 listingId = nextListingId++;
        
        agentListings[listingId] = AgentListing({
            id: listingId,
            agentContract: _agentContract,
            agentType: _agentType,
            hireCost: _hireCost,
            rewardRate: _rewardRate,
            reputation: 100, // Starting reputation
            isActive: true,
            owner: msg.sender
        });
        
        emit AgentListed(listingId, msg.sender, _agentType, _hireCost);
        return listingId;
    }

    /**
     * @dev Hire an agent for a specified duration
     */
    function hireAgent(uint256 _listingId, uint256 _duration) external returns (uint256) {
        AgentListing storage listing = agentListings[_listingId];
        require(listing.isActive, "Agent not available");
        require(_duration > 0, "Duration must be positive");
        
        uint256 totalCost = listing.hireCost * _duration;
        require(balanceOf(msg.sender) >= totalCost, "Insufficient balance");
        
        // Transfer tokens to agent owner
        _transfer(msg.sender, listing.owner, totalCost);
        
        uint256 hiringId = nextHiringId++;
        
        agentHirings[hiringId] = AgentHiring({
            listingId: _listingId,
            hirer: msg.sender,
            duration: _duration,
            startTime: block.timestamp,
            totalCost: totalCost,
            isActive: true
        });
        
        userHirings[msg.sender].push(hiringId);
        
        emit AgentHired(hiringId, _listingId, msg.sender, _duration);
        return hiringId;
    }

    /**
     * @dev Reward an agent for good performance
     */
    function rewardAgent(address _agent, uint256 _amount, string memory _reason) 
        external onlyRole(AGENT_MANAGER_ROLE) {
        require(_agent != address(0), "Invalid agent address");
        require(_amount > 0, "Reward must be positive");
        
        _mint(_agent, _amount);
        emit AgentRewarded(_agent, _amount, _reason);
    }

    /**
     * @dev Penalize an agent for poor performance
     */
    function penalizeAgent(address _agent, uint256 _amount, string memory _reason) 
        external onlyRole(AGENT_MANAGER_ROLE) {
        require(_agent != address(0), "Invalid agent address");
        require(balanceOf(_agent) >= _amount, "Insufficient balance to penalize");
        
        _burn(_agent, _amount);
        emit AgentPenalized(_agent, _amount, _reason);
    }

    /**
     * @dev Update agent reputation based on performance
     */
    function updateReputation(uint256 _listingId, uint256 _newReputation) 
        external onlyRole(AGENT_MANAGER_ROLE) {
        require(_newReputation <= 1000, "Reputation cannot exceed 1000");
        
        agentListings[_listingId].reputation = _newReputation;
        emit ReputationUpdated(_listingId, _newReputation);
    }

    /**
     * @dev Mint tokens (only by authorized minters)
     */
    function mint(address _to, uint256 _amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + _amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(_to, _amount);
    }

    /**
     * @dev Burn tokens (only by authorized burners)
     */
    function burn(address _from, uint256 _amount) external onlyRole(BURNER_ROLE) {
        _burn(_from, _amount);
    }

    /**
     * @dev Get active agent listings
     */
    function getActiveListings() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 1; i < nextListingId; i++) {
            if (agentListings[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active listing IDs
        uint256[] memory activeListings = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextListingId; i++) {
            if (agentListings[i].isActive) {
                activeListings[index] = i;
                index++;
            }
        }
        
        return activeListings;
    }

    /**
     * @dev Get user's hiring history
     */
    function getUserHirings(address _user) external view returns (uint256[] memory) {
        return userHirings[_user];
    }

    /**
     * @dev Pause token transfers
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Override transfer to add pause functionality
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override
        whenNotPaused
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
