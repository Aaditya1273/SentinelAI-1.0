import type React from "react"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { WalletProvider } from "@/components/wallet-provider"

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "SentinelAI 4.0 - Privacy-First DAO Treasury Management",
  description: "AI-powered DAO treasury management with multi-agent architecture, ZK privacy, and hybrid governance",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  )
}
