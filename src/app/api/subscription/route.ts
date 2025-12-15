import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user with subscription
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { 
        subscription: true,
        usage: {
          orderBy: { date: 'desc' },
          take: 30 // Last 30 days
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate usage
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const usage = user.usage.reduce((acc, curr) => {
      if (curr.date >= thirtyDaysAgo) {
        acc[curr.feature] = (acc[curr.feature] || 0) + curr.count
      }
      return acc
    }, {} as Record<string, number>)

    // Determine plan limits
    const isPremium = user.subscription?.status === 'active'
    const limits = {
      free: {
        events: 10,
        tasks: 10,
        categories: 1,
        googleCalendar: false,
        analytics: false,
        themes: false
      },
      premium: {
        events: Infinity,
        tasks: Infinity,
        categories: Infinity,
        googleCalendar: true,
        analytics: true,
        themes: true
      }
    }

    const currentPlan = isPremium ? 'premium' : 'free'
    const currentLimits = limits[currentPlan]

    return NextResponse.json({
      plan: currentPlan,
      subscription: user.subscription,
      usage,
      limits: currentLimits,
      canUpgrade: !isPremium
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
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

    const { action } = await request.json()

    if (action === 'cancel') {
      // Get user's Stripe subscription
      const user = await db.user.findUnique({
        where: { email: session.user.email },
        include: { subscription: true }
      })

      if (!user?.subscription?.stripeId) {
        return NextResponse.json(
          { error: 'No active subscription' },
          { status: 400 }
        )
      }

      // Cancel subscription at period end
      await stripe.subscriptions.update(user.subscription.stripeId, {
        cancel_at_period_end: true,
      })

      // Update database
      await db.subscription.update({
        where: { userId: user.id },
        data: {
          cancelAtPeriodEnd: true,
        },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing subscription:', error)
    return NextResponse.json(
      { error: 'Failed to manage subscription' },
      { status: 500 }
    )
  }
}