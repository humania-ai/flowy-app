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
          take: 50 // Last 50 transactions
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

    return NextResponse.json({
      balance: totalBalance,
      transactions: user.flwyTokens
    })
  } catch (error) {
    console.error('Error fetching FLWY tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FLWY tokens' },
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

    const { amount, source, sourceId } = await request.json()

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const flwyToken = await db.flwyToken.create({
      data: {
        userId: user.id,
        amount,
        source,
        sourceId
      }
    })

    return NextResponse.json(flwyToken, { status: 201 })
  } catch (error) {
    console.error('Error creating FLWY token:', error)
    return NextResponse.json(
      { error: 'Failed to create FLWY token' },
      { status: 500 }
    )
  }
}