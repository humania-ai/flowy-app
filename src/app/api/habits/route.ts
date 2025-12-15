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
        habits: [
          {
            id: 'temp-habit-1',
            name: 'Ejercicio Diario',
            description: 'Hacer 30 minutos de ejercicio',
            frequency: 'daily',
            targetCount: 1,
            currentStreak: 5,
            bestStreak: 10,
            isActive: true,
            createdAt: new Date()
          }
        ]
      })
    }

    // Get user with habits
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        habits: {
          include: {
            completions: {
              orderBy: { date: 'desc' },
              take: 30
            }
          },
          orderBy: { createdAt: 'desc' }
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
      habits: user.habits
    })
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
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

    const { name, description, frequency, targetCount } = await request.json()

    // Special case for temp admin
    if (session.user.email === 'admin@flowy.app') {
      return NextResponse.json({
        message: 'Habit created successfully',
        habit: {
          id: 'temp-habit-' + Date.now(),
          name,
          description,
          frequency,
          targetCount,
          currentStreak: 0,
          bestStreak: 0,
          isActive: true,
          createdAt: new Date()
        }
      })
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create habit
    const habit = await db.habit.create({
      data: {
        userId: user.id,
        name,
        description,
        frequency,
        targetCount
      }
    })

    return NextResponse.json({
      message: 'Habit created successfully',
      habit
    })
  } catch (error) {
    console.error('Error creating habit:', error)
    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    )
  }
}