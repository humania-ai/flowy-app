'use client'

import { useState } from 'react'
import { Crown, Lock, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSubscription } from '@/contexts/subscription-context'

interface LimitReachedModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
  currentCount: number
  limit: number
}

export function LimitReachedModal({ isOpen, onClose, feature, currentCount, limit }: LimitReachedModalProps) {
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

  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'events': return 'Eventos'
      case 'tasks': return 'Tareas'
      case 'categories': return 'Categorías'
      default: return feature
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold text-red-600">
            Límite Alcanzado
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Has alcanzado el límite de {getFeatureName(feature)} en el plan gratuito.
            </p>
            <div className="text-lg font-semibold">
              {currentCount} / {limit} {getFeatureName(feature)}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Actualiza a Flowy Premium
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ {getFeatureName(feature)} ilimitados</li>
              <li>✅ Sincronización con Google Calendar</li>
              <li>✅ Analytics y estadísticas</li>
              <li>✅ Soporte prioritario 24/7</li>
            </ul>
          </div>

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
              Cerrar
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Solo $4.99/mes • Cancela en cualquier momento
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}