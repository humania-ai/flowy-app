import { google } from 'googleapis'

export class GoogleCalendarService {
  private oauth2Client: any

  constructor(accessToken: string, refreshToken?: string) {
    this.oauth2Client = new google.auth.OAuth2()
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })
  }

  async syncEvents(events: any[]) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
    
    try {
      for (const event of events) {
        const googleEvent = {
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.startDate,
            timeZone: 'UTC'
          },
          end: {
            dateTime: event.endDate,
            timeZone: 'UTC'
          },
          location: event.location,
          reminders: event.reminders?.map((r: any) => ({
            method: 'popup',
            minutes: r.minutes
          }))
        }

        if (event.googleCalendarId) {
          // Update existing event
          await calendar.events.update({
            calendarId: 'primary',
            eventId: event.googleCalendarId,
            requestBody: googleEvent
          })
        } else {
          // Create new event
          const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: googleEvent
          })
          
          // Store the Google Calendar ID
          event.googleCalendarId = response.data.id
        }
      }
      
      return { success: true, events }
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error)
      return { success: false, error }
    }
  }

  async getEvents() {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
    
    try {
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime'
      })
      
      return response.data.items || []
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error)
      return []
    }
  }

  async deleteEvent(googleCalendarId: string) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
    
    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: googleCalendarId
      })
      return { success: true }
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error)
      return { success: false, error }
    }
  }
}