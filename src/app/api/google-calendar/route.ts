import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { GoogleCalendarService } from '@/lib/google-calendar'
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

    const { action, eventId } = await request.json()

    // Get user with Google tokens
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true
      }
    })

    if (!user?.googleAccessToken) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 400 }
      )
    }

    const calendarService = new GoogleCalendarService(
      user.googleAccessToken,
      user.googleRefreshToken
    )

    switch (action) {
      case 'sync':
        // Get user events
        const events = await db.event.findMany({
          where: {
            user: { email: session.user.email }
          }
        })

        const syncResult = await calendarService.syncEvents(events)
        
        if (syncResult.success) {
          // Update events with Google Calendar IDs
          for (const event of syncResult.events) {
            if (event.googleCalendarId) {
              await db.event.update({
                where: { id: event.id },
                data: { googleCalendarId: event.googleCalendarId }
              })
            }
          }
        }

        return NextResponse.json(syncResult)

      case 'get':
        const googleEvents = await calendarService.getEvents()
        return NextResponse.json({ events: googleEvents })

      case 'delete':
        if (!eventId) {
          return NextResponse.json(
            { error: 'Event ID required' },
            { status: 400 }
          )
        }

        const deleteResult = await calendarService.deleteEvent(eventId)
        return NextResponse.json(deleteResult)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Google Calendar API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}