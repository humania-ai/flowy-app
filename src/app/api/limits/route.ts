import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { feature, increment = 1 } = await request.json()

    // Get user with subscription
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has premium
    const isPremium = user.subscription?.status === 'active'
    
    // Define limits
    const limits = {
      free: {
        events: 10,
        tasks: 10,
        categories: 1
      },
      premium: {
        events: Infinity,
        tasks: Infinity,
        categories: Infinity
      }
    }

    const currentLimits = isPremium ? limits.premium : limits.free

    // Get current usage for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayUsage = await db.usage.findUnique({
      where: {
        userId_feature_date: {
          userId: user.id,
          feature,
          date: today
        }
      }
    })

    const currentCount = todayUsage?.count || 0
    const newCount = currentCount + increment

    // Check if limit exceeded
    if (newCount > currentLimits[feature as keyof typeof currentLimits]) {
      return NextResponse.json(
        { 
          error: 'Limit exceeded',
          feature,
          currentCount,
          limit: currentLimits[feature as keyof typeof currentLimits],
          canUpgrade: !isPremium
        },
        { status: 429 }
      )
    }

    // Update or create usage record
    await db.usage.upsert({
      where: {
        userId_feature_date: {
          userId: user.id,
          feature,
          date: today
        }
      },
      update: {
        count: newCount
      },
      create: {
        userId: user.id,
        feature,
        date: today,
        count: increment
      }
    })

    return NextResponse.json({
      success: true,
      newCount,
      remaining: currentLimits[feature as keyof typeof currentLimits] - newCount
    })
  } catch (error) {
    console.error('Error tracking usage:', error)
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { feature } = new URL(request.url).searchParams

    // Get user with subscription
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has premium
    const isPremium = user.subscription?.status === 'active'
    
    // Define limits
    const limits = {
      free: {
        events: 10,
        tasks: 10,
        categories: 1
      },
      premium: {
        events: Infinity,
        tasks: Infinity,
        categories: Infinity
      }
    }

    const currentLimits = isPremium ? limits.premium : limits.free

    // Get current usage for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayUsage = await db.usage.findUnique({
      where: {
        userId_feature_date: {
          userId: user.id,
          feature,
          date: today
        }
      }
    })

    const currentCount = todayUsage?.count || 0

    return NextResponse.json({
      feature,
      currentCount,
      limit: currentLimits[feature as keyof typeof currentLimits],
      remaining: currentLimits[feature as keyof typeof currentLimits] - currentCount,
      isPremium,
      canUpgrade: !isPremium
    })
  } catch (error) {
    console.error('Error checking limits:', error)
    return NextResponse.json(
      { error: 'Failed to check limits' },
      { status: 500 }
    )
  }
}