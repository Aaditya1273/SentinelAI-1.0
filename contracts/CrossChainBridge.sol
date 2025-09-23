// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title CrossChainBridge
 * @dev Multi-sig cross-chain bridge for SentinelAI treasury operations
 * Supports Ethereum, Arbitrum, and other EVM chains
 */
contract CrossChainBridge is ReentrancyGuard, AccessControl, Pausable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant BRIDGE_ADMIN_ROLE = keccak256("BRIDGE_ADMIN_ROLE");

    // Structs
    struct BridgeTransaction {
        uint256 id;
        address sender;
        address recipient;
        address token;
        uint256 amount;
        uint256 sourceChainId;
        uint256 targetChainId;
        uint256 timestamp;
        bool executed;
        bool cancelled;
        bytes32 txHash;
        string zkProofHash;
    }

    struct ValidatorSignature {
        address validator;
        bytes signature;
        uint256 timestamp;
    }

    // State variables
    mapping(uint256 => BridgeTransaction) public bridgeTransactions;
    mapping(uint256 => mapping(address => bool)) public hasValidatorSigned;
    mapping(uint256 => ValidatorSignature[]) public transactionSignatures;
    mapping(address => bool) public supportedTokens;
    mapping(uint256 => bool) public supportedChains;
    
    uint256 public nextTransactionId = 1;
    uint256 public requiredSignatures = 3;
    uint256 public validatorCount = 0;
    uint256 public bridgeFee = 1000; // 0.1% in basis points
    
    // Events
    event BridgeInitiated(
        uint256 indexed transactionId,
        address indexed sender,
        address indexed recipient,
        address token,
        uint256 amount,
        uint256 sourceChainId,
        uint256 targetChainId,
        string zkProofHash
    );
    event ValidatorSigned(uint256 indexed transactionId, address indexed validator);
    event BridgeExecuted(uint256 indexed transactionId, bytes32 txHash);
    event BridgeCancelled(uint256 indexed transactionId);
    event TokenSupported(address indexed token, bool supported);
    event ChainSupported(uint256 indexed chainId, bool supported);

    constructor(address _admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(BRIDGE_ADMIN_ROLE, _admin);
        
        // Support common chains
        supportedChains[1] = true; // Ethereum
        supportedChains[42161] = true; // Arbitrum
        supportedChains[137] = true; // Polygon
        supportedChains[10] = true; // Optimism
    }

    /**
     * @dev Initiate a cross-chain bridge transaction
     */
    function initiateBridge(
        address _recipient,
        address _token,
        uint256 _amount,
        uint256 _targetChainId,
        string memory _zkProofHash
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        require(_recipient != address(0), "Invalid recipient");
        require(supportedTokens[_token], "Token not supported");
        require(supportedChains[_targetChainId], "Target chain not supported");
        require(_targetChainId != block.chainid, "Cannot bridge to same chain");
        require(_amount > 0, "Amount must be positive");
        
        // Calculate bridge fee
        uint256 fee = (_amount * bridgeFee) / 10000;
        uint256 bridgeAmount = _amount - fee;
        
        // Transfer tokens to bridge
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        
        uint256 transactionId = nextTransactionId++;
        
        bridgeTransactions[transactionId] = BridgeTransaction({
            id: transactionId,
            sender: msg.sender,
            recipient: _recipient,
            token: _token,
            amount: bridgeAmount,
            sourceChainId: block.chainid,
            targetChainId: _targetChainId,
            timestamp: block.timestamp,
            executed: false,
            cancelled: false,
            txHash: bytes32(0),
            zkProofHash: _zkProofHash
        });
        
        emit BridgeInitiated(
            transactionId,
            msg.sender,
            _recipient,
            _token,
            bridgeAmount,
            block.chainid,
            _targetChainId,
            _zkProofHash
        );
        
        return transactionId;
    }

    /**
     * @dev Validator signs a bridge transaction
     */
    function signTransaction(uint256 _transactionId, bytes memory _signature) 
        external onlyRole(VALIDATOR_ROLE) {
        require(_transactionId < nextTransactionId, "Invalid transaction ID");
        require(!hasValidatorSigned[_transactionId][msg.sender], "Already signed");
        
        BridgeTransaction storage transaction = bridgeTransactions[_transactionId];
        require(!transaction.executed, "Transaction already executed");
        require(!transaction.cancelled, "Transaction cancelled");
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            transaction.id,
            transaction.sender,
            transaction.recipient,
            transaction.token,
            transaction.amount,
            transaction.sourceChainId,
            transaction.targetChainId,
            transaction.zkProofHash
        ));
        
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(_signature);
        require(signer == msg.sender, "Invalid signature");
        
        hasValidatorSigned[_transactionId][msg.sender] = true;
        transactionSignatures[_transactionId].push(ValidatorSignature({
            validator: msg.sender,
            signature: _signature,
            timestamp: block.timestamp
        }));
        
        emit ValidatorSigned(_transactionId, msg.sender);
        
        // Auto-execute if enough signatures
        if (transactionSignatures[_transactionId].length >= requiredSignatures) {
            _executeTransaction(_transactionId);
        }
    }

    /**
     * @dev Execute bridge transaction (internal)
     */
    function _executeTransaction(uint256 _transactionId) internal {
        BridgeTransaction storage transaction = bridgeTransactions[_transactionId];
        require(!transaction.executed, "Already executed");
        require(transactionSignatures[_transactionId].length >= requiredSignatures, "Insufficient signatures");
        
        transaction.executed = true;
        transaction.txHash = keccak256(abi.encodePacked(block.timestamp, _transactionId));
        
        // Release tokens to recipient (simplified - in production would interact with target chain)
        IERC20(transaction.token).safeTransfer(transaction.recipient, transaction.amount);
        
        emit BridgeExecuted(_transactionId, transaction.txHash);
    }

    /**
     * @dev Cancel a bridge transaction (emergency function)
     */
    function cancelTransaction(uint256 _transactionId) 
        external onlyRole(BRIDGE_ADMIN_ROLE) {
        BridgeTransaction storage transaction = bridgeTransactions[_transactionId];
        require(!transaction.executed, "Already executed");
        require(!transaction.cancelled, "Already cancelled");
        
        transaction.cancelled = true;
        
        // Refund tokens to sender
        IERC20(transaction.token).safeTransfer(transaction.sender, transaction.amount);
        
        emit BridgeCancelled(_transactionId);
    }

    /**
     * @dev Add/remove supported token
     */
    function setSupportedToken(address _token, bool _supported) 
        external onlyRole(BRIDGE_ADMIN_ROLE) {
        supportedTokens[_token] = _supported;
        emit TokenSupported(_token, _supported);
    }

    /**
     * @dev Add/remove supported chain
     */
    function setSupportedChain(uint256 _chainId, bool _supported) 
        external onlyRole(BRIDGE_ADMIN_ROLE) {
        supportedChains[_chainId] = _supported;
        emit ChainSupported(_chainId, _supported);
    }

    /**
     * @dev Add validator
     */
    function addValidator(address _validator) external onlyRole(BRIDGE_ADMIN_ROLE) {
        require(_validator != address(0), "Invalid validator");
        _grantRole(VALIDATOR_ROLE, _validator);
        validatorCount++;
    }

    /**
     * @dev Remove validator
     */
    function removeValidator(address _validator) external onlyRole(BRIDGE_ADMIN_ROLE) {
        _revokeRole(VALIDATOR_ROLE, _validator);
        validatorCount--;
    }

    /**
     * @dev Set required signatures threshold
     */
    function setRequiredSignatures(uint256 _required) external onlyRole(BRIDGE_ADMIN_ROLE) {
        require(_required > 0 && _required <= validatorCount, "Invalid threshold");
        requiredSignatures = _required;
    }

    /**
     * @dev Set bridge fee
     */
    function setBridgeFee(uint256 _fee) external onlyRole(BRIDGE_ADMIN_ROLE) {
        require(_fee <= 1000, "Fee cannot exceed 10%"); // Max 10%
        bridgeFee = _fee;
    }

    /**
     * @dev Get transaction signatures
     */
    function getTransactionSignatures(uint256 _transactionId) 
        external view returns (ValidatorSignature[] memory) {
        return transactionSignatures[_transactionId];
    }

    /**
     * @dev Get transaction details
     */
    function getTransaction(uint256 _transactionId) external view returns (
        address sender,
        address recipient,
        address token,
        uint256 amount,
        uint256 sourceChainId,
        uint256 targetChainId,
        uint256 timestamp,
        bool executed,
        bool cancelled,
        uint256 signatureCount
    ) {
        BridgeTransaction memory transaction = bridgeTransactions[_transactionId];
        return (
            transaction.sender,
            transaction.recipient,
            transaction.token,
            transaction.amount,
            transaction.sourceChainId,
            transaction.targetChainId,
            transaction.timestamp,
            transaction.executed,
            transaction.cancelled,
            transactionSignatures[_transactionId].length
        );
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(BRIDGE_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(BRIDGE_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees(address _token, address _to) 
        external onlyRole(BRIDGE_ADMIN_ROLE) {
        require(_to != address(0), "Invalid recipient");
        uint256 balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(_to, balance);
    }
}
