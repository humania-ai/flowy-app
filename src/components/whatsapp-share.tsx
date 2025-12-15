'use client'

import { useState } from 'react'
import { MessageCircle, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface WhatsAppShareProps {
  event: any
  onClose: () => void
}

export function WhatsAppShare({ event, onClose }: WhatsAppShareProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const formatEventMessage = (event: any) => {
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)
    
    return `📅 *Evento: ${event.title}*

${event.description ? `📝 ${event.description}` : ''}
📅 Fecha: ${startDate.toLocaleDateString('es-ES', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
⏰ Hora: ${startDate.toLocaleTimeString('es-ES', { 
  hour: '2-digit', 
  minute: '2-digit' 
})}${event.location ? `\n📍 Ubicación: ${event.location}` : ''}

¡No te olvides! 🎯`
  }

  const defaultMessage = formatEventMessage(event)

  const handleShare = async () => {
    setLoading(true)
    try {
      const message = customMessage || defaultMessage
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          phoneNumber: phoneNumber,
          message: message
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Open WhatsApp in a new tab
        window.open(data.whatsappUrl, '_blank')
      }
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    const message = customMessage || defaultMessage
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Compartir en WhatsApp
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Event Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm">{event.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(event.startDate).toLocaleDateString('es-ES', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })} • {new Date(event.startDate).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            {event.location && (
              <p className="text-xs text-muted-foreground">📍 {event.location}</p>
            )}
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Número de teléfono (opcional)</label>
            <Input
              type="tel"
              placeholder="+34 600 000 000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Si no ingresas un número, se abrirá WhatsApp para que elijas un contacto
            </p>
          </div>

          {/* Message Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mensaje</label>
            <Textarea
              value={customMessage || defaultMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={6}
              className="text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={copyToClipboard}
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
            <Button 
              onClick={handleShare}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                'Cargando...'
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Compartir
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}