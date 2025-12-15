'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Subscription {
  plan: 'free' | 'premium'
  status: 'active' | 'cancelled' | 'expired' | 'past_due'
  limits: {
    events: number
    tasks: number
    categories: number
    googleCalendar: boolean
    analytics: boolean
    themes: boolean
  }
  usage: {
    events: number
    tasks: number
    categories: number
  }
  canUpgrade: boolean
}

interface SubscriptionContextType {
  subscription: Subscription | null
  loading: boolean
  checkLimits: (feature: string) => Promise<any>
  trackUsage: (feature: string, increment?: number) => Promise<any>
  isPremium: boolean
  refreshSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [])

  const checkLimits = async (feature: string) => {
    try {
      const response = await fetch(`/api/limits?feature=${feature}`)
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Error checking limits:', error)
      return null
    }
  }

  const trackUsage = async (feature: string, increment: number = 1) => {
    try {
      const response = await fetch('/api/limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feature, increment }),
      })
      
      if (response.ok) {
        const result = await response.json()
        // Refresh subscription data to get updated limits
        await fetchSubscription()
        return result
      }
      return null
    } catch (error) {
      console.error('Error tracking usage:', error)
      return null
    }
  }

  const isPremium = subscription?.plan === 'premium' && subscription.status === 'active'

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      loading,
      checkLimits,
      trackUsage,
      isPremium,
      refreshSubscription: fetchSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}