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
        goals: [
          {
            id: 'temp-goal-1',
            title: 'Meta de Ejemplo',
            description: 'Esta es una meta de ejemplo',
            target: 100,
            current: 75,
            unit: 'tareas',
            category: 'work',
            status: 'active',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            createdAt: new Date()
          }
        ]
      })
    }

    // Get user with goals
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        goals: {
          include: {
            milestones: true
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
      goals: user.goals
    })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
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

    const { title, description, target, unit, category, deadline } = await request.json()

    // Special case for temp admin
    if (session.user.email === 'admin@flowy.app') {
      return NextResponse.json({
        message: 'Goal created successfully',
        goal: {
          id: 'temp-goal-' + Date.now(),
          title,
          description,
          target,
          current: 0,
          unit,
          category,
          deadline: deadline ? new Date(deadline) : null,
          status: 'active',
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

    // Create goal
    const goal = await db.goal.create({
      data: {
        userId: user.id,
        title,
        description,
        target,
        unit,
        category,
        deadline: deadline ? new Date(deadline) : null
      }
    })

    return NextResponse.json({
      message: 'Goal created successfully',
      goal
    })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    )
  }
}