/**
 * API Route for External Integrations
 * Handles ElizaOS, DEGA, and DAO API requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { ElizaDEGAIntegration } from '@/lib/integrations/eliza-dega'
import { DAOAPIIntegrator } from '@/lib/integrations/dao-apis'

const elizaDega = new ElizaDEGAIntegration()
const daoIntegrator = new DAOAPIIntegrator()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'agents':
        const availableAgents = elizaDega.getAvailableAgents()
        return NextResponse.json({ 
          success: true, 
          agents: availableAgents,
          count: availableAgents.length 
        })

      case 'marketplace_stats':
        const stats = await elizaDega.getMarketplaceStats()
        return NextResponse.json({ success: true, stats })

      case 'dao_proposals':
        const spaceId = searchParams.get('space') || 'aave.eth'
        const proposals = await daoIntegrator.getDAOProposals(spaceId)
        return NextResponse.json({ success: true, proposals })

      case 'aave_reserves':
        const reserves = await daoIntegrator.getAaveReserves()
        return NextResponse.json({ success: true, reserves })

      case 'uniswap_pools':
        const pools = await daoIntegrator.getUniswapPools()
        return NextResponse.json({ success: true, pools })

      case 'defi_tvl':
        const tvlData = await daoIntegrator.getDeFiTVL()
        return NextResponse.json({ success: true, tvl: tvlData })

      case 'treasury_simulation':
        const daoAddress = searchParams.get('address') || '0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c'
        const treasuryData = await daoIntegrator.simulateDAOTreasury(daoAddress)
        return NextResponse.json({ success: true, treasury: treasuryData })

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action parameter' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Integration API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'hire_agent':
        const { description, capabilities, budget, deadline } = body
        const taskId = await elizaDega.hireAgent(description, capabilities, budget, deadline)
        return NextResponse.json({ success: true, taskId })

      case 'collaborative_task':
        const { taskType, participants, parameters } = body
        const result = await elizaDega.executeCollaborativeTask(taskType, participants, parameters)
        return NextResponse.json({ success: true, result })

      case 'create_proposal':
        const { spaceId, title, proposalBody, choices, start, end } = body
        const proposalId = await daoIntegrator.createSnapshotProposal(
          spaceId, title, proposalBody, choices, start, end
        )
        return NextResponse.json({ success: true, proposalId })

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Integration API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
