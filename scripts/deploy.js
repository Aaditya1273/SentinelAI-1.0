const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying SentinelAI 4.0 Smart Contracts...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy AgentToken ($USDM) first
  console.log("\n📄 Deploying AgentToken ($USDM)...");
  const AgentToken = await ethers.getContractFactory("AgentToken");
  const agentToken = await AgentToken.deploy(deployer.address);
  await agentToken.deployed();
  console.log("✅ AgentToken deployed to:", agentToken.address);

  // Deploy SentinelTreasury
  console.log("\n🏛️ Deploying SentinelTreasury...");
  const SentinelTreasury = await ethers.getContractFactory("SentinelTreasury");
  const sentinelTreasury = await SentinelTreasury.deploy(deployer.address);
  await sentinelTreasury.deployed();
  console.log("✅ SentinelTreasury deployed to:", sentinelTreasury.address);

  // Deploy CrossChainBridge
  console.log("\n🌉 Deploying CrossChainBridge...");
  const CrossChainBridge = await ethers.getContractFactory("CrossChainBridge");
  const crossChainBridge = await CrossChainBridge.deploy(deployer.address);
  await crossChainBridge.deployed();
  console.log("✅ CrossChainBridge deployed to:", crossChainBridge.address);

  // Setup initial configuration
  console.log("\n⚙️ Setting up initial configuration...");

  // Grant roles to treasury contract
  const AGENT_ROLE = await sentinelTreasury.AGENT_ROLE();
  const SUPERVISOR_ROLE = await sentinelTreasury.SUPERVISOR_ROLE();
  const GOVERNANCE_ROLE = await sentinelTreasury.GOVERNANCE_ROLE();

  // Grant agent role to deployer for testing
  await sentinelTreasury.grantRole(AGENT_ROLE, deployer.address);
  console.log("✅ Granted AGENT_ROLE to deployer");

  // Setup AgentToken roles
  const MINTER_ROLE = await agentToken.MINTER_ROLE();
  const AGENT_MANAGER_ROLE = await agentToken.AGENT_MANAGER_ROLE();
  
  await agentToken.grantRole(MINTER_ROLE, sentinelTreasury.address);
  await agentToken.grantRole(AGENT_MANAGER_ROLE, deployer.address);
  console.log("✅ Granted roles to AgentToken");

  // Setup CrossChainBridge
  const VALIDATOR_ROLE = await crossChainBridge.VALIDATOR_ROLE();
  await crossChainBridge.grantRole(VALIDATOR_ROLE, deployer.address);
  
  // Add AgentToken as supported token
  await crossChainBridge.setSupportedToken(agentToken.address, true);
  console.log("✅ Configured CrossChainBridge");

  // Create some initial agent listings
  console.log("\n🤖 Creating initial agent listings...");
  
  const traderAgentCost = ethers.utils.parseEther("100"); // 100 USDM per hour
  const complianceAgentCost = ethers.utils.parseEther("150"); // 150 USDM per hour
  const supervisorAgentCost = ethers.utils.parseEther("200"); // 200 USDM per hour
  const advisorAgentCost = ethers.utils.parseEther("120"); // 120 USDM per hour

  await agentToken.listAgent(
    "0x1234567890123456789012345678901234567890", // Mock agent contract
    "trader",
    traderAgentCost,
    ethers.utils.parseEther("10") // 10 USDM reward rate
  );

  await agentToken.listAgent(
    "0x2345678901234567890123456789012345678901", // Mock agent contract
    "compliance",
    complianceAgentCost,
    ethers.utils.parseEther("15") // 15 USDM reward rate
  );

  await agentToken.listAgent(
    "0x3456789012345678901234567890123456789012", // Mock agent contract
    "supervisor",
    supervisorAgentCost,
    ethers.utils.parseEther("20") // 20 USDM reward rate
  );

  await agentToken.listAgent(
    "0x4567890123456789012345678901234567890123", // Mock agent contract
    "advisor",
    advisorAgentCost,
    ethers.utils.parseEther("12") // 12 USDM reward rate
  );

  console.log("✅ Created 4 initial agent listings");

  // Create initial treasury assets (mock)
  console.log("\n💰 Setting up initial treasury assets...");
  
  // Mock USDC address (use actual address in production)
  const mockUSDC = "0xA0b86a33E6441b8C4505B8C4505B8C4505B8C450";
  const mockAAVE = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9";
  
  await sentinelTreasury.addAsset(agentToken.address, ethers.utils.parseEther("1000000")); // 1M USDM
  await sentinelTreasury.addAsset(mockUSDC, ethers.utils.parseEther("500000")); // 500K USDC
  await sentinelTreasury.addAsset(mockAAVE, ethers.utils.parseEther("100000")); // 100K AAVE
  
  console.log("✅ Added initial treasury assets");

  // Create a sample governance proposal
  console.log("\n🗳️ Creating sample governance proposal...");
  
  const votingPeriod = 7 * 24 * 60 * 60; // 7 days
  await sentinelTreasury.createProposal(
    "Increase AI Agent Autonomy Threshold",
    "Proposal to increase the maximum autonomous trading amount from $500K to $1M for improved efficiency",
    votingPeriod
  );
  
  console.log("✅ Created sample governance proposal");

  // Summary
  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("==========================================");
  console.log("📄 AgentToken ($USDM):", agentToken.address);
  console.log("🏛️ SentinelTreasury:", sentinelTreasury.address);
  console.log("🌉 CrossChainBridge:", crossChainBridge.address);
  console.log("==========================================");
  console.log("💡 Next steps:");
  console.log("1. Update .env with contract addresses");
  console.log("2. Verify contracts on Etherscan");
  console.log("3. Configure frontend with new addresses");
  console.log("4. Test agent interactions");

  // Save deployment addresses to file
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      AgentToken: agentToken.address,
      SentinelTreasury: sentinelTreasury.address,
      CrossChainBridge: crossChainBridge.address
    },
    initialSetup: {
      agentListings: 4,
      treasuryAssets: 3,
      governanceProposals: 1
    }
  };

  fs.writeFileSync(
    `deployments/${hre.network.name}-deployment.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`📁 Deployment info saved to deployments/${hre.network.name}-deployment.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
