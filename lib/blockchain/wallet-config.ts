import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { mainnet, polygon, arbitrum, optimism, base, sepolia } from "wagmi/chains"

export const config = getDefaultConfig({
  appName: "SentinelAI 4.0",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "your-project-id",
  chains: [mainnet, polygon, arbitrum, optimism, base, sepolia],
  ssr: true,
})

export const supportedChains = [
  {
    id: mainnet.id,
    name: "Ethereum",
    symbol: "ETH",
    rpcUrl: mainnet.rpcUrls.default.http[0],
    blockExplorer: mainnet.blockExplorers.default.url,
    icon: "🔷",
  },
  {
    id: polygon.id,
    name: "Polygon",
    symbol: "MATIC",
    rpcUrl: polygon.rpcUrls.default.http[0],
    blockExplorer: polygon.blockExplorers.default.url,
    icon: "🟣",
  },
  {
    id: arbitrum.id,
    name: "Arbitrum",
    symbol: "ETH",
    rpcUrl: arbitrum.rpcUrls.default.http[0],
    blockExplorer: arbitrum.blockExplorers.default.url,
    icon: "🔵",
  },
  {
    id: optimism.id,
    name: "Optimism",
    symbol: "ETH",
    rpcUrl: optimism.rpcUrls.default.http[0],
    blockExplorer: optimism.blockExplorers.default.url,
    icon: "🔴",
  },
  {
    id: base.id,
    name: "Base",
    symbol: "ETH",
    rpcUrl: base.rpcUrls.default.http[0],
    blockExplorer: base.blockExplorers.default.url,
    icon: "🟦",
  },
]
