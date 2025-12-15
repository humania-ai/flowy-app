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
        tokens: [
          {
            id: 'temp-token-1',
            amount: 1000,
            source: 'achievement',
            sourceId: 'admin-bonus',
            createdAt: new Date()
          }
        ],
        balance: 1000
      })
    }

    // Get user with tokens
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        flwyTokens: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const balance = user.flwyTokens.reduce((total, token) => total + token.amount, 0)

    return NextResponse.json({
      tokens: user.flwyTokens,
      balance
    })
  } catch (error) {
    console.error('Error fetching FLWY tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
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

    const { amount, source, sourceId } = await request.json()

    // Special case for temp admin
    if (session.user.email === 'admin@flowy.app') {
      return NextResponse.json({
        message: 'Tokens added successfully',
        token: {
          id: 'temp-token-' + Date.now(),
          amount,
          source,
          sourceId,
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

    // Create token record
    const token = await db.flwyToken.create({
      data: {
        userId: user.id,
        amount,
        source,
        sourceId
      }
    })

    return NextResponse.json({
      message: 'Tokens added successfully',
      token
    })
  } catch (error) {
    console.error('Error adding FLWY tokens:', error)
    return NextResponse.json(
      { error: 'Failed to add tokens' },
      { status: 500 }
    )
  }
}