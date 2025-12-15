'use client'

import { useState } from 'react'
import { Crown, Lock, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSubscription } from '@/contexts/subscription-context'

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: string
}

export function PremiumModal({ isOpen, onClose, feature }: PremiumModalProps) {
  const { isPremium } = useSubscription()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      window.location.href = '/pricing'
    } catch (error) {
      console.error('Error upgrading:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const features = [
    {
      icon: '📅',
      title: 'Eventos y Tareas Ilimitadas',
      description: 'Crea tantos eventos y tareas como necesites'
    },
    {
      icon: '🔄',
      title: 'Sincronización con Google Calendar',
      description: 'Sincroniza automáticamente con tu calendario'
    },
    {
      icon: '📊',
      title: 'Analytics y Estadísticas',
      description: 'Visualiza tu productividad y patrones'
    },
    {
      icon: '🎨',
      title: 'Temas Personalizados',
      description: 'Personaliza la apariencia de Flowy'
    },
    {
      icon: '🔔',
      title: 'Notificaciones Avanzadas',
      description: 'Recordatorios inteligentes y personalizados'
    },
    {
      icon: '💬',
      title: 'Soporte Prioritario 24/7',
      description: 'Ayuda instantánea cuando la necesites'
    }
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Flowy Premium
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {feature && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Esta característica requiere una suscripción Premium
              </p>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Price */}
          <div className="text-center">
            <div className="text-3xl font-bold">
              $4.99
              <span className="text-lg font-normal text-gray-600">/mes</span>
            </div>
            <div className="text-sm text-green-600">
              O $49.99 al año (Ahorra 17%)
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              Todo lo que obtienes con Premium:
            </h3>
            <div className="space-y-3">
              {features.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button 
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                'Actualizar a Premium'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Ahora no
            </Button>
          </div>

          {/* Guarantee */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Lock className="h-4 w-4" />
              Cancela en cualquier momento • Garantía de 30 días
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}