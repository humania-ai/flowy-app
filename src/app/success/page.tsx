'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Success() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setError('No se encontró la sesión de pago')
      setLoading(false)
      return
    }

    // Verify the session with our backend
    verifySession(sessionId)
  }, [searchParams])

  const verifySession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/stripe/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(true)
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        setError('Error al verificar la sesión de pago')
      }
    } catch (error) {
      console.error('Error verifying session:', error)
      setError('Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Verificando tu pago...
          </h2>
          <p className="text-gray-600">
            Estamos procesando tu suscripción a Flowy Premium
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-red-600">
              Error en el Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/pricing')}
                className="w-full"
              >
                Volver a Precios
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                Ir al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-green-600">
            ¡Pago Exitoso!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bienvenido a Flowy Premium
            </h3>
            <p className="text-gray-600">
              Tu suscripción ha sido activada correctamente. Ahora tienes acceso a todas 
              las características premium.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">
              ¿Qué tienes ahora?
            </h4>
            <ul className="text-left text-sm text-green-700 space-y-1">
              <li>✅ Eventos y tareas ilimitadas</li>
              <li>✅ Sincronización con Google Calendar</li>
              <li>✅ Analytics y estadísticas</li>
              <li>✅ Temas personalizados</li>
              <li>✅ Soporte prioritario 24/7</li>
            </ul>
          </div>

          <div className="text-sm text-gray-500">
            Serás redirigido automáticamente al dashboard...
          </div>
          
          <Button 
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Ir a mi Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}