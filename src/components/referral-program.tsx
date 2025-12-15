'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Users, Gift, TrendingUp, Copy, Check, Crown, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SocialShare } from './social-share'

interface ReferralStats {
  totalReferrals: number
  pendingReferrals: number
  completedReferrals: number
  totalEarned: number
}

interface Referral {
  id: string
  status: 'pending' | 'completed' | 'rewarded'
  referred: {
    name: string
    email: string
    createdAt: string
  }
  completedAt?: string
  rewardedAt?: string
  flwyReward: number
}

export function ReferralProgram() {
  const { data: session } = useSession()
  const [referralData, setReferralData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/referrals')
      if (response.ok) {
        const data = await response.json()
        setReferralData(data)
      }
    } catch (error) {
      console.error('Error fetching referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = async () => {
    if (referralData?.referralLink) {
      await navigator.clipboard.writeText(referralData.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyReferralCode = async () => {
    if (referralData?.referralCode) {
      await navigator.clipboard.writeText(referralData.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = referralData?.stats || {
    totalReferrals: 0,
    pendingReferrals: 0,
    completedReferrals: 0,
    totalEarned: 0
  }

  const referrals = referralData?.referrals || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rewarded':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Star className="h-4 w-4 text-yellow-600" />
      case 'completed':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'rewarded':
        return <Gift className="h-4 w-4 text-green-600" />
      default:
        return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'completed':
        return 'Completado'
      case 'rewarded':
        return 'Recompensado'
      default:
        return 'Desconocido'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Crown className="h-6 w-6" />
            Programa de Referidos Flowy
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-purple-100 mb-4">
            Invita a tus amigos y gana tokens FLWY mientras creces la comunidad más productiva
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.totalReferrals}</div>
              <div className="text-sm text-purple-100">Total Referidos</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.completedReferrals}</div>
              <div className="text-sm text-purple-100">Activos</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.totalEarned}</div>
              <div className="text-sm text-purple-100">FLWY Ganados</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">50</div>
              <div className="text-sm text-purple-100">FLWY por Referido</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Code and Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            Tu Código de Referido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-center mb-3">
              <div className="text-sm text-purple-600 mb-1">Código de Referido</div>
              <div className="text-2xl font-bold text-purple-900 font-mono">
                {referralData?.referralCode || 'GENERANDO...'}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyReferralCode}
                className="flex-1 flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copiar Código</span>
                  </>
                )}
              </Button>
              <Button
                onClick={copyReferralLink}
                className="flex-1 flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <Zap className="h-4 w-4" />
                <span>Copiar Enlace</span>
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Enlace completo:</div>
            <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono text-gray-700 break-all">
              {referralData?.referralLink || 'Cargando...'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            ¿Cómo Funciona?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">1️⃣</div>
              <h4 className="font-semibold text-blue-900 mb-2">Comparte tu Código</h4>
              <p className="text-sm text-blue-700">
                Comparte tu enlace o código con amigos, familiares o en redes sociales
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">2️⃣</div>
              <h4 className="font-semibold text-green-900 mb-2">Se Registren</h4>
              <p className="text-sm text-green-700">
                Tus amigos se registran usando tu código y empiezan a usar Flowy
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">3️⃣</div>
              <h4 className="font-semibold text-purple-900 mb-2">Gana Recompensas</h4>
              <p className="text-sm text-purple-700">
                Recibe <Badge className="bg-yellow-500 text-white text-xs ml-1">50 FLWY</Badge> por cada referido activo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Historial de Referidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aún no tienes referidos</p>
              <p className="text-sm">Comparte tu código y empieza a construir tu red</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral: Referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {referral.referred.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {referral.referred.name || 'Usuario'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(referral.referred.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(referral.status)}`}>
                      {getStatusIcon(referral.status)}
                      <span>{getStatusText(referral.status)}</span>
                    </div>
                    {referral.status === 'rewarded' && (
                      <div className="text-sm font-semibold text-green-600 mt-1">
                        +{referral.flwyReward} FLWY
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Sharing */}
      <SocialShare 
        type="milestone"
        title="🚀 Únete a Flowy"
        description="Organiza tu vida, alcanza tus metas y únete a la comunidad más productiva"
      />
    </div>
  )
}