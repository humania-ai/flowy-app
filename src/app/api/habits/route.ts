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
        habits: {
          include: {
            completions: {
              orderBy: {
                date: 'desc'
              },
              take: 30 // Last 30 completions
            }
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

    return NextResponse.json(user.habits)
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
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

    const { name, description, frequency, targetCount } = await request.json()

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const habit = await db.habit.create({
      data: {
        userId: user.id,
        name,
        description,
        frequency,
        targetCount
      }
    })

    return NextResponse.json(habit, { status: 201 })
  } catch (error) {
    console.error('Error creating habit:', error)
    return NextResponse.json(
      { error: 'Failed to create habit' },
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

    const { id, date, completed } = await request.json()

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const habit = await db.habit.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!habit || habit.userId !== user.id) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      )
    }

    // Record completion
    if (completed) {
      await db.habitCompletion.upsert({
        where: {
          habitId_date: {
            habitId: id,
            date: new Date(date)
          }
        },
        update: {
          completed: true
        },
        create: {
          habitId: id,
          date: new Date(date),
          completed: true
        }
      })

      // Update streak
      const newStreak = await calculateStreak(id)
      await db.habit.update({
        where: { id },
        data: {
          currentStreak: newStreak,
          bestStreak: Math.max(newStreak, habit.bestStreak)
        }
      })

      // Award FLOW tokens for streak
      if (newStreak > 0 && newStreak % 7 === 0) {
        await db.flowToken.create({
          data: {
            userId: user.id,
            amount: 25, // 25 FLOW tokens for weekly streak
            source: 'streak',
            sourceId: id
          }
        })
      }

      // Check for streak achievements
      await checkStreakAchievements(user.id, newStreak)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating habit:', error)
    return NextResponse.json(
      { error: 'Failed to update habit' },
      { status: 500 }
    )
  }
}

async function calculateStreak(habitId: string): Promise<number> {
  const completions = await db.habitCompletion.findMany({
    where: {
      habitId
    },
    orderBy: {
      date: 'desc'
    },
    take: 365 // Last year
  })

  if (completions.length === 0) return 0

  let streak = 0
  let currentDate = new Date()
  
  for (const completion of completions) {
    const completionDate = new Date(completion.date)
    const diffDays = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= streak) {
      streak++
    } else {
      break
    }
  }

  return streak
}

async function checkStreakAchievements(userId: string, streak: number) {
  const achievements = await db.achievement.findMany({
    where: {
      category: 'consistency',
      isActive: true
    }
  })

  for (const achievement of achievements) {
    try {
      const requirement = JSON.parse(achievement.requirement)
      
      if (requirement.type === 'streak_days' && streak >= requirement.count) {
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
      console.error('Error checking streak achievement:', error)
    }
  }
}