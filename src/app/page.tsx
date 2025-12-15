'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useGamification } from '@/contexts/gamification-context'
import { useSubscription } from '@/contexts/subscription-context'
import { ArrowLeft, Calendar, CheckSquare, Target, Trophy, Gift, Zap, Settings, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GoalsAndHabits } from '@/components/goals-and-habits'
import { FlwyTokenRewards } from '@/components/flow-token-rewards'
import { GamificationDashboard } from '@/components/gamification-dashboard'
import { ReferralProgram } from '@/components/referral-program'
import { CalendarView } from '@/components/calendar-view'
import { TaskList } from '@/components/task-list'
import { OfflineMode } from '@/components/offline-mode'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isPremium } = useSubscription()
  const { flwyBalance } = useGamification()
  const [activeView, setActiveView] = useState<'calendar' | 'tasks' | 'goals' | 'rewards' | 'dashboard' | 'referrals'>('calendar')

  // ¡AÑADE ESTE LOG!
  console.log('🔍 [Home.tsx] useSession status:', status);
  console.log('🔍 [Home.tsx] useSession data:', session);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              F
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenido a Flowy 2
            </h1>
            <p className="text-gray-600 mb-6">
              Tu agenda inteligente para organizar tu vida
            </p>
            <Button 
              onClick={() => router.push('/auth/signin')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push('/settings')}
            >
              <Settings className="h-5 w-5 text-blue-600" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                F
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Flowy</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* FLWY Balance */}
            <div className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="font-bold text-purple-700">{flwyBalance}</span>
            </div>
            
            {/* Premium Badge */}
            {isPremium && (
              <Badge className="bg-yellow-500 text-white">
                ⭐ Premium
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveView('calendar')}
            className={`flex items-center justify-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeView === 'calendar'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Calendario</span>
          </button>
          <button
            onClick={() => setActiveView('tasks')}
            className={`flex items-center justify-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeView === 'tasks'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span className="font-medium">Tareas</span>
          </button>
          <button
            onClick={() => setActiveView('goals')}
            className={`flex items-center justify-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeView === 'goals'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Target className="h-4 w-4" />
            <span className="font-medium">Metas</span>
          </button>
          <button
            onClick={() => setActiveView('rewards')}
            className={`flex items-center justify-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeView === 'rewards'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Gift className="h-4 w-4" />
            <span className="font-medium">Recompensas</span>
          </button>
          <button
            onClick={() => setActiveView('referrals')}
            className={`flex items-center justify-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeView === 'referrals'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Users className="h-4 w-4" />
            <span className="font-medium">Referidos</span>
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center justify-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeView === 'dashboard'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span className="font-medium">Logros</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 pb-20">
        {activeView === 'calendar' && (
          <CalendarView />
        )}

        {activeView === 'tasks' && (
          <TaskList />
        )}

        {activeView === 'goals' && (
          <GoalsAndHabits />
        )}

        {activeView === 'rewards' && (
          <FlwyTokenRewards />
        )}

        {activeView === 'referrals' && (
          <ReferralProgram />
        )}

        {activeView === 'dashboard' && (
          <GamificationDashboard />
        )}
      </main>

      {/* User Info */}
      <div className="fixed bottom-4 left-4 bg-white/80 backdrop-blur-md rounded-lg p-3 border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
            {session.user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{session.user?.name}</p>
            <p className="text-sm text-gray-600">{session.user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}