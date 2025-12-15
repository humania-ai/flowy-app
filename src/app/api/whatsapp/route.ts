import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, phoneNumber, message } = body

    // If no phone number provided, return a generic WhatsApp link
    if (!phoneNumber) {
      return NextResponse.json({
        whatsappUrl: `https://wa.me/?text=${encodeURIComponent(message || '¡Mira este evento!')}`
      })
    }

    // Clean phone number (remove +, spaces, dashes)
    const cleanPhone = phoneNumber.replace(/[+\s-]/g, '')
    
    // Create WhatsApp link with pre-filled message
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`

    return NextResponse.json({
      whatsappUrl,
      success: true
    })
  } catch (error) {
    console.error('Error generating WhatsApp link:', error)
    return NextResponse.json(
      { error: 'Failed to generate WhatsApp link' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // In a real implementation, you would fetch the event from the database
    // For now, we'll create a sample event message
    const sampleEvent = {
      title: 'Reunión importante',
      description: 'Recordatorio de nuestra reunión',
      startDate: new Date(),
      location: 'Oficina principal'
    }

    const message = `📅 *Evento: ${sampleEvent.title}*

📝 ${sampleEvent.description}
📅 Fecha: ${sampleEvent.startDate.toLocaleDateString('es-ES')}
📍 Ubicación: ${sampleEvent.location}

¡No te olvides! 🎯`

    return NextResponse.json({
      whatsappUrl: `https://wa.me/?text=${encodeURIComponent(message)}`,
      message
    })
  } catch (error) {
    console.error('Error generating WhatsApp link:', error)
    return NextResponse.json(
      { error: 'Failed to generate WhatsApp link' },
      { status: 500 }
    )
  }
}