import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        flwyTokens: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Last 10 transactions
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate total balance
    const totalBalance = user.flwyTokens.reduce((sum, token) => sum + token.amount, 0)

    // Get available rewards
    const rewards = await db.reward.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        flowCost: 'asc'
      }
    })

    // Get user rewards
    const userRewards = await db.userReward.findMany({
      where: {
        userId: user.id
      },
      include: {
        reward: true
      }
    })

    // Filter out already redeemed rewards
    const availableRewards = rewards.filter(reward => 
      !userRewards.some(userReward => userReward.rewardId === reward.id)
    )

    return NextResponse.json({
      balance: totalBalance,
      rewards: availableRewards,
      userRewards
    })
  } catch (error) {
    console.error('Error fetching rewards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { rewardId } = await request.json()

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        flwyTokens: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Last 10 transactions
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate total balance
    const totalBalance = user.flwyTokens.reduce((sum, token) => sum + token.amount, 0)

    // Get reward details
    const reward = await db.reward.findUnique({
      where: { id: rewardId }
    })

    if (!reward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      )
    }

    // Check if user has enough tokens
    if (totalBalance < reward.flwyCost) {
      return NextResponse.json(
        { error: 'Insufficient FLWY tokens' },
        { status: 400 }
      )
    }

    // Check if already redeemed
    const existingRedemption = await db.userReward.findUnique({
      where: {
        userId: user.id,
        rewardId
      }
    })

    if (existingRedemption) {
      return NextResponse.json(
        { error: 'Reward already redeemed' },
        { status: 400 }
      )
    }

    // Create transaction for spending tokens
    await db.flwyToken.create({
      data: {
        userId: user.id,
        amount: -reward.flwyCost,
        source: 'purchase',
        sourceId: rewardId
      }
    })

    // Mark reward as redeemed
    await db.userReward.create({
      data: {
        userId: user.id,
        rewardId
      }
    })

    return NextResponse.json({ success: true, reward })
  } catch (error) {
    console.error('Error redeeming reward:', error)
    return NextResponse.json(
      { error: 'Failed to redeem reward' },
      { status: 500 }
    )
  }
}