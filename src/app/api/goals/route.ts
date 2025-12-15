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
        goals: {
          include: {
            milestones: true
          },
          orderBy: {
            createdAt: 'desc'
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

    return NextResponse.json(user.goals)
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
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

    const { title, description, target, unit, category, deadline } = await request.json()

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const goal = await db.goal.create({
      data: {
        userId: user.id,
        title,
        description,
        target,
        unit,
        category,
        deadline: deadline ? new Date(deadline) : null,
        status: 'active'
      }
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, current, status } = await request.json()

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (current !== undefined) updateData.current = current
    if (status !== undefined) updateData.status = status

    // Check if goal is completed and award tokens
    if (status === 'completed') {
      const existingGoal = await db.goal.findUnique({
        where: { id },
        include: { user: true }
      })

      if (existingGoal && existingGoal.status !== 'completed') {
        // Award FLOW tokens for completing goal
        await db.flowToken.create({
          data: {
            userId: user.id,
            amount: 50, // 50 FLOW tokens for completing a goal
            source: 'goal',
            sourceId: id
          }
        })

        // Check for achievements
        await checkGoalAchievements(user.id)
      }
    }

    const goal = await db.goal.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await request.json()

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    await db.goal.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    )
  }
}

async function checkGoalAchievements(userId: string) {
  const completedGoalsCount = await db.goal.count({
    where: {
      userId,
      status: 'completed'
    }
  })

  // Check for achievements
  const achievements = await db.achievement.findMany({
    where: {
      isActive: true
    }
  })

  for (const achievement of achievements) {
    try {
      const requirement = JSON.parse(achievement.requirement)
      
      if (requirement.type === 'goals_completed' && completedGoalsCount >= requirement.count) {
        // Check if user already has this achievement
        const existing = await db.userAchievement.findUnique({
          where: {
            userId,
            achievementId: achievement.id
          }
        })

        if (!existing) {
          await db.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id
            }
          })

          // Award FLOW tokens
          await db.flowToken.create({
            data: {
              userId,
              amount: achievement.flowReward,
              source: 'achievement',
              sourceId: achievement.id
            }
          })
        }
      }
    } catch (error) {
      console.error('Error checking achievement:', error)
    }
  }
}