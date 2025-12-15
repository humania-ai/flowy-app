import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Special case for temp admin
    if (session.user.email === 'admin@flowy.app') {
      return NextResponse.json({
        rewards: [
          {
            id: 'temp-reward-1',
            name: 'Tema Premium - Noche',
            description: 'Desbloquea el tema oscuro para tu aplicación',
            icon: '🌙',
            flwyCost: 500,
            category: 'themes',
            isActive: true,
            createdAt: new Date()
          },
          {
            id: 'temp-reward-2',
            name: 'Analytics Avanzado',
            description: 'Estadísticas detalladas de tu productividad',
            icon: '📊',
            flwyCost: 750,
            category: 'features',
            isActive: true,
            createdAt: new Date()
          },
          {
            id: 'temp-reward-3',
            name: 'Insignia Experto',
            description: 'Una insignia exclusiva para tu perfil',
            icon: '🏆',
            flwyCost: 1000,
            category: 'badges',
            isActive: true,
            createdAt: new Date()
          }
        ]
      })
    }

    // Get user with rewards
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        rewards: {
          include: {
            reward: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      rewards: user.rewards.map(ur => ur.reward)
    })
  } catch (error) {
    console.error('Error fetching rewards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { rewardId } = await request.json()

    // Special case for temp admin
    if (session.user.email === 'admin@flowy.app') {
      return NextResponse.json({
        message: 'Reward redeemed successfully',
        userReward: {
          id: 'temp-user-reward-' + Date.now(),
          rewardId,
          redeemedAt: new Date()
        }
      })
    }

    // Get user and reward
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    const reward = await db.reward.findUnique({
      where: { id: rewardId }
    })

    if (!user || !reward) {
      return NextResponse.json(
        { error: 'User or reward not found' },
        { status: 404 }
      )
    }

    // Check if already redeemed
    const existingRedemption = await db.userReward.findUnique({
      where: {
        userId_rewardId: {
          userId: user.id,
          rewardId: rewardId
        }
      }
    })

    if (existingRedemption) {
      return NextResponse.json(
        { error: 'Reward already redeemed' },
        { status: 400 }
      )
    }

    // Create redemption record
    const userReward = await db.userReward.create({
      data: {
        userId: user.id,
        rewardId
      }
    })

    return NextResponse.json({
      message: 'Reward redeemed successfully',
      userReward
    })
  } catch (error) {
    console.error('Error redeeming reward:', error)
    return NextResponse.json(
      { error: 'Failed to redeem reward' },
      { status: 500 }
    )
  }
}