'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'
import { useSubscription } from '@/contexts/subscription-context'
import { Crown, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PricingCardProps {
  plan: 'free' | 'premium'
  title: string
  price: string
  yearlyPrice?: string
  description: string
  features: string[]
  highlighted?: boolean
  currentPlan?: boolean
}

function PricingCard({ 
  plan, 
  title, 
  price, 
  yearlyPrice, 
  description, 
  features, 
  highlighted = false,
  currentPlan = false 
}: PricingCardProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const { refreshSubscription } = useSubscription()

  const handleSubscribe = async (billingCycle: 'monthly' | 'yearly') => {
    if (!session) return

    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: billingCycle === 'monthly' 
            ? process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY
            : process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      })

      if (response.ok) {
        const { sessionId } = await response.json()
        const stripe = await stripePromise
        
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId })
          if (error) {
            console.error('Stripe error:', error)
          }
        }
      }
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={`relative ${highlighted ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-200'}`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-500 text-white px-4 py-1">
            POPULAR
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
          {plan === 'premium' && <Crown className="h-5 w-5 text-yellow-500" />}
          {title}
        </CardTitle>
        <div className="mt-2">
          <div className="text-3xl font-bold">
            {price}
            <span className="text-lg font-normal text-gray-600">/mes</span>
          </div>
          {yearlyPrice && (
            <div className="text-sm text-green-600 mt-1">
              O {yearlyPrice} al año (Ahorra 17%)
            </div>
          )}
        </div>
        <p className="text-gray-600 mt-2">{description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {currentPlan ? (
          <Button disabled className="w-full" variant="outline">
            Plan Actual
          </Button>
        ) : plan === 'free' ? (
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            Comenzar Gratis
          </Button>
        ) : (
          <div className="space-y-2">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => handleSubscribe('monthly')}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Suscribirse Mensual'
              )}
            </Button>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleSubscribe('yearly')}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Suscribirse Anual'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function Pricing() {
  const { subscription, loading } = useSubscription()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  const currentPlan = subscription?.plan || 'free'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Elige tu Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Organiza tu vida con Flowy. Empieza gratis y actualiza cuando lo necesites.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            plan="free"
            title="Flowy Gratis"
            price="$0"
            description="Perfecto para empezar a organizar tu vida"
            features={[
              '10 eventos por mes',
              '10 tareas por mes',
              '1 categoría personalizada',
              'Compartir por WhatsApp',
              'Notificaciones básicas',
              'Soporte por email'
            ]}
            currentPlan={currentPlan === 'free'}
          />
          
          <PricingCard
            plan="premium"
            title="Flowy Premium"
            price="$4.99"
            yearlyPrice="$49.99"
            description="Para quienes quieren el máximo control y productividad"
            highlighted={true}
            features={[
              'Eventos y tareas ilimitadas',
              'Categorías personalizadas ilimitadas',
              'Sincronización con Google Calendar',
              'Analytics y estadísticas',
              'Temas personalizados',
              'Notificaciones avanzadas',
              'Soporte prioritario 24/7',
              'Exportación de datos'
            ]}
            currentPlan={currentPlan === 'premium'}
          />
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Preguntas Frecuentes
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Puedo cancelar mi suscripción en cualquier momento?
              </h3>
              <p className="text-gray-600">
                Sí, puedes cancelar tu suscripción en cualquier momento. Seguirás teniendo acceso 
                hasta el final del período de facturación actual.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Qué pasa si excedo los límites del plan gratuito?
              </h3>
              <p className="text-gray-600">
                Te notificaremos cuando te acerques a los límites. Puedes actualizar a Premium 
                en cualquier momento para obtener acceso ilimitado.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Mis datos están seguros?
              </h3>
              <p className="text-gray-600">
                Sí, utilizamos encriptación de nivel bancario y nunca compartimos tus datos. 
                Toda la información está protegida y respaldada.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Hay descuentos para estudiantes?
              </h3>
              <p className="text-gray-600">
                Sí, ofrecemos un 50% de descuento para estudiantes válidos. 
                Contáctanos con tu email educativo para obtener el descuento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}