import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let events
    
    if (userId) {
      events = await db.event.findMany({
        where: {
          userId: userId,
          ...(startDate && endDate && {
            startDate: {
              gte: new Date(startDate)
            },
            endDate: {
              lte: new Date(endDate)
            }
          })
        },
        include: {
          category: true,
          reminders: true
        },
        orderBy: {
          startDate: 'asc'
        }
      })
    } else {
      // Return all events for demo purposes
      events = await db.event.findMany({
        include: {
          category: true,
          reminders: true
        },
        orderBy: {
          startDate: 'asc'
        }
      })
    }

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      startDate,
      endDate,
      isAllDay,
      location,
      whatsapp,
      status,
      userId,
      categoryId,
      reminders
    } = body

    // For demo purposes, create a default user if not provided
    let defaultUser = null
    if (!userId) {
      defaultUser = await db.user.findFirst()
      if (!defaultUser) {
        defaultUser = await db.user.create({
          data: {
            email: 'demo@example.com',
            name: 'Demo User'
          }
        })
      }
    }

    const event = await db.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isAllDay: isAllDay || false,
        location,
        whatsapp: whatsapp || false,
        status: status || 'pending',
        userId: userId || defaultUser.id,
        categoryId,
        reminders: reminders ? {
          create: reminders.map((minutes: number) => ({
            minutes
          }))
        } : undefined
      },
      include: {
        category: true,
        reminders: true
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}