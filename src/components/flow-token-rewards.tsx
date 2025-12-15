'use client'

import { useState } from 'react'
import { useGamification } from '@/contexts/gamification-context'
import { Trophy, Gift, Star, Zap, Crown, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function FlwyTokenRewards() {
  const { flwyBalance, rewards, redeemReward } = useGamification()
  const [selectedReward, setSelectedReward] = useState<string | null>(null)

  const handleRedeemReward = async (rewardId: string) => {
    try {
      await redeemReward(rewardId)
      setSelectedReward(null)
    } catch (error) {
      console.error('Error redeeming reward:', error)
    }
  }

  const getRewardIcon = (category: string) => {
    switch (category) {
      case 'themes': return '🎨'
      case 'features': return '⚡'
      case 'badges': return '🏆'
      case 'discounts': return '💰'
      default: return '🎁'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'themes': return 'bg-purple-500'
      case 'features': return 'bg-blue-500'
      case 'badges': return 'bg-yellow-500'
      case 'discounts': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* FLWY Balance Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Zap className="h-6 w-6" />
            Tu Balance FLWY
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-4xl font-bold mb-2">
            {flwyBalance}
          </div>
          <p className="text-blue-100 text-sm">
            Tokens disponibles para canjear por recompensas
          </p>
          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">+50</div>
              <div className="text-blue-100">por meta</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">+25</div>
              <div className="text-blue-100">por racha</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">+10</div>
              <div className="text-blue-100">por logro</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Store */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            Tienda de Recompensas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rewards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay recompensas disponibles</p>
              <p className="text-sm">Completa metas y hábitos para ganar tokens FLWY</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => {
                const canAfford = flwyBalance >= reward.flwyCost
                
                return (
                  <div 
                    key={reward.id} 
                    className={`border rounded-lg p-4 relative ${
                      !canAfford ? 'opacity-50' : 'hover:shadow-md transition-shadow'
                    }`}
                  >
                    {!canAfford && (
                      <div className="absolute inset-0 bg-gray-500/20 rounded-lg flex items-center justify-center">
                        <Lock className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="text-2xl mb-2">
                        {getRewardIcon(reward.category)}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {reward.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {reward.description}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getCategoryColor(reward.category)}>
                          {reward.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span className="font-bold text-yellow-600">
                            {reward.flwyCost}
                          </span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => canAfford && handleRedeemReward(reward.id)}
                        disabled={!canAfford}
                      >
                        {canAfford ? 'Canjear' : 'Tokens insuficientes'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Earn FLWY */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            ¿Cómo Ganar Tokens FLWY?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl">🎯</div>
              <div>
                <h4 className="font-semibold text-blue-900">Completa Metas</h4>
                <p className="text-sm text-blue-700">
                  Gana <strong>50 tokens</strong> por cada meta que completes
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="text-2xl">🔥</div>
              <div>
                <h4 className="font-semibold text-green-900">Mantén Rachas</h4>
                <p className="text-sm text-green-700">
                  Gana <strong>25 tokens</strong> por cada semana de hábitos consecutivos
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl">🏆</div>
              <div>
                <h4 className="font-semibold text-purple-900">Desbloquea Logros</h4>
                <p className="text-sm text-purple-700">
                  Gana <strong>10-100 tokens</strong> por logros especiales
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl">⭐</div>
              <div>
                <h4 className="font-semibold text-yellow-900">Sé Premium</h4>
                <p className="text-sm text-yellow-700">
                  Gana <strong>500 tokens</strong> al suscribirte anualmente
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}