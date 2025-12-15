'use client'

import { SessionProvider } from 'next-auth/react'
import { LanguageProvider } from '@/contexts/language-context'
import { SubscriptionProvider } from '@/contexts/subscription-context'
import { GamificationProvider } from '@/contexts/gamification-context'



export function Providers({ children, session }: { children: React.ReactNode; session?: any }) {
  return (
    // Pasa la sesión al SessionProvider
    <SessionProvider session={session}>
      <LanguageProvider>
        <SubscriptionProvider>
          <GamificationProvider>
            {children}
          </GamificationProvider>
        </SubscriptionProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}