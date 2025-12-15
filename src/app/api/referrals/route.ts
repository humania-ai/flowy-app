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
        referrals: {
          include: {
            referred: {
              select: {
                name: true,
                email: true,
                createdAt: true
              }
            }
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

    // Generate referral code if user doesn't have one
    let referralCode = user.referralCode
    if (!referralCode) {
      referralCode = generateReferralCode(user.name || user.email)
      await db.user.update({
        where: { id: user.id },
        data: { referralCode }
      })
    }

    // Calculate referral stats
    const pendingReferrals = user.referrals.filter(r => r.status === 'pending').length
    const completedReferrals = user.referrals.filter(r => r.status === 'completed').length
    const totalEarned = user.referrals
      .filter(r => r.status === 'rewarded')
      .reduce((sum, r) => sum + r.flwyReward, 0)

    return NextResponse.json({
      referralCode,
      referralLink: `${process.env.NEXTAUTH_URL || 'https://flowy.pages.dev'}?ref=${referralCode}`,
      stats: {
        totalReferrals: user.referrals.length,
        pendingReferrals,
        completedReferrals,
        totalEarned
      },
      referrals: user.referrals
    })
  } catch (error) {
    console.error('Error fetching referrals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { referralCode } = await request.json()
    
    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      )
    }

    // Find referrer by code
    const referrer = await db.user.findUnique({
      where: { referralCode }
    })

    if (!referrer) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      )
    }

    // Get current session
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const referredUser = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!referredUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already has a referrer
    if (referredUser.referredBy) {
      return NextResponse.json(
        { error: 'User already has a referrer' },
        { status: 400 }
      )
    }

    // Check if referral already exists
    const existingReferral = await db.referral.findUnique({
      where: {
        referrerId_referrerId_referredId_referredId: {
          referrerId: referrer.id,
          referredId: referredUser.id
        }
      }
    })

    if (existingReferral) {
      return NextResponse.json(
        { error: 'Referral already exists' },
        { status: 400 }
      )
    }

    // Create referral
    const referral = await db.referral.create({
      data: {
        referrerId: referrer.id,
        referredId: referredUser.id,
        status: 'pending'
      }
    })

    // Update referred user
    await db.user.update({
      where: { id: referredUser.id },
      data: { referredBy: referrer.id }
    })

    return NextResponse.json({
      success: true,
      referral,
      referrer: {
        name: referrer.name,
        email: referrer.email
      }
    })
  } catch (error) {
    console.error('Error creating referral:', error)
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    )
  }
}

function generateReferralCode(userIdentifier: string): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  const clean = userIdentifier.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4)
  return `${clean}${timestamp}${random}`.toUpperCase()
}