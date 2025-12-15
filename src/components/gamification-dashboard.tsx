'use client'

import { useState, useEffect } from 'react'
import { useGamification } from '@/contexts/gamification-context'
import { Trophy, Star, Target, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SocialShare } from './social-share'

export function GamificationDashboard() {
  const { goals, habits, flwyBalance, loading } = useGamification()
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    activeHabits: 0,
    currentStreaks: 0,
    totalFlwyEarned: 0
  })

  useEffect(() => {
    if (!loading && goals.length > 0) {
      const completedGoals = goals.filter(g => g.status === 'completed').length
      const activeHabits = habits.filter(h => h.isActive).length
      const totalStreaks = habits.reduce((sum, h) => sum + h.currentStreak, 0)
      
      setStats({
        totalGoals: goals.length,
        completedGoals,
        activeHabits,
        currentStreaks: totalStreaks,
        totalFlwyEarned: flwyBalance
      })
    }
  }, [goals, habits, flwyBalance, loading])

  const getMotivationalMessage = () => {
    const completionRate = stats.totalGoals > 0 ? (stats.completedGoals / stats.totalGoals) * 100 : 0
    
    if (completionRate >= 80) {
      return "¡Increíble! Eres una máquina de lograr metas 🚀"
    } else if (completionRate >= 60) {
      return "¡Buen trabajo! Sigue así, vas por el camino correcto 💪"
    } else if (completionRate >= 40) {
      return "¡Vamos bien! Cada meta cuenta, sigue adelante 🎯"
    } else if (stats.totalGoals > 0) {
      return "¡Empieza con pequeñas metas, grandes logros 🌟"
    } else {
      return "¡Crea tu primera meta y empieza a lograr tus sueños! 🎯"
    }
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥🔥🔥'
    if (streak >= 21) return '🔥🔥'
    if (streak >= 14) return '🔥'
    if (streak >= 7) return '⭐'
    if (streak >= 3) return '✨'
    return '🌱'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalGoals}
            </div>
            <p className="text-sm text-gray-600">Metas Totales</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.completedGoals}
            </div>
            <p className="text-sm text-gray-600">Metas Completadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-orange-600">
              {stats.currentStreaks}
            </div>
            <p className="text-sm text-gray-600">Días de Rachas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-purple-600">
              {flwyBalance}
            </div>
            <p className="text-sm text-gray-600">Tokens FLWY</p>
          </CardContent>
        </Card>
      </div>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="text-center p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {getMotivationalMessage()}
          </h3>
          <p className="text-gray-600">
            {stats.totalGoals > 0 && (
              <>
                Has completado <strong>{Math.round((stats.completedGoals / stats.totalGoals) * 100)}%</strong> de tus metas
                {stats.currentStreaks > 0 && (
                  <> y tienes <strong>{stats.currentStreaks}</strong> días de racha {getStreakEmoji(stats.currentStreaks)}</>
                )}
              </>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Metas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay metas configuradas
              </p>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{goal.title}</h4>
                      <div className="text-xs text-gray-500">
                        {goal.current} / {goal.target} {goal.unit}
                      </div>
                    </div>
                    {goal.status === 'completed' && (
                      <Badge className="bg-green-500 text-white">
                        Completada
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Hábitos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {habits.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay hábitos configurados
              </p>
            ) : (
              <div className="space-y-3">
                {habits.slice(0, 3).map((habit) => (
                  <div key={habit.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{habit.name}</h4>
                      <div className="text-xs text-gray-500">
                        Racha: {habit.currentStreak} días {getStreakEmoji(habit.currentStreak)}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {habit.frequency}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Progreso de Logros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Primer Logro</span>
              <Badge className="bg-gray-500">
                5 metas completadas
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Maestro de Hábitos</span>
              <Badge className="bg-orange-500">
                30 días de racha
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Experto en Metas</span>
              <Badge className="bg-green-500">
                25 metas completadas
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Leyenda de Productividad</span>
              <Badge className="bg-purple-500">
                50 metas completadas
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Sharing */}
      <SocialShare 
        type="flwy_balance"
        title="🚀 Mi Progreso en Flowy"
        description={`¡He acumulado ${flwyBalance} tokens FLWY y completado ${stats.completedGoals} metas! 🎯`}
      />
    </div>
  )
}