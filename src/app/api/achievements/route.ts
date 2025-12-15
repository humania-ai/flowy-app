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
        achievements: {
          include: {
            achievement: true
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

    return NextResponse.json(user.achievements)
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
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

    // Seed initial achievements
    const achievements = [
      {
        name: 'Primer Paso',
        description: 'Crea tu primera meta',
        icon: '🎯',
        category: 'milestone',
        flwyReward: 10,
        requirement: JSON.stringify({
          type: 'goals_created',
          count: 1
        }),
        isActive: true
      },
      {
        name: 'Primer Hábito',
        description: 'Crea tu primer hábito',
        icon: '⭐',
        category: 'milestone',
        flwyReward: 10,
        requirement: JSON.stringify({
          type: 'habits_created',
          count: 1
        }),
        isActive: true
      },
      {
        name: 'Cumplidor de Metas',
        description: 'Completa 5 metas',
        icon: '🏆',
        category: 'productivity',
        flwyReward: 25,
        requirement: JSON.stringify({
          type: 'goals_completed',
          count: 5
        }),
        isActive: true
      },
      {
        name: 'Semana Perfecta',
        description: 'Mantén una racha de 7 días',
        icon: '🔥',
        category: 'consistency',
        flwyReward: 25,
        requirement: JSON.stringify({
          type: 'streak_days',
          count: 7
        }),
        isActive: true
      },
      {
        name: 'Maestro de Hábitos',
        description: 'Mantén una racha de 21 días',
        icon: '🌟',
        category: 'consistency',
        flwyReward: 50,
        requirement: JSON.stringify({
          type: 'streak_days',
          count: 21
        }),
        isActive: true
      },
      {
        name: 'Experto en Metas',
        description: 'Completa 25 metas',
        icon: '⭐',
        category: 'productivity',
        flwyReward: 50,
        requirement: JSON.stringify({
          type: 'goals_completed',
          count: 25
        }),
        isActive: true
      },
      {
        name: 'Mes de Productividad',
        description: 'Mantén una racha de 30 días',
        icon: '👑',
        category: 'consistency',
        flwyReward: 100,
        requirement: JSON.stringify({
          type: 'streak_days',
          count: 30
        }),
        isActive: true
      },
      {
        name: 'Leyenda de Flowy',
        description: 'Completa 50 metas',
        icon: '👑',
        category: 'productivity',
        flwyReward: 100,
        requirement: JSON.stringify({
          type: 'goals_completed',
          count: 50
        }),
        isActive: true
      }
    ]

    for (const achievement of achievements) {
      try {
        await db.achievement.upsert({
          where: { name: achievement.name },
          update: achievement,
          create: achievement
        })
      } catch (error) {
        console.error('Error seeding achievement:', error)
      }
    }

    return NextResponse.json({ success: true, achievements })
  } catch (error) {
    console.error('Error seeding achievements:', error)
    return NextResponse.json(
      { error: 'Failed to seed achievements' },
      { status: 500 }
    )
  }
}