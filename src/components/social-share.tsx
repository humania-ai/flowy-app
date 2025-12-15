'use client'

import { useState } from 'react'
import { Share2, Copy, Check, MessageCircle, Twitter, Facebook, Linkedin, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SocialShareProps {
  type: 'achievement' | 'goal_completed' | 'habit_streak' | 'flwy_balance' | 'milestone'
  itemId?: string
  title?: string
  description?: string
  onShare?: (platform: string) => void
}

export function SocialShare({ type, itemId, title, description, onShare }: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const platforms = [
    {
      name: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: 'twitter',
      icon: Twitter,
      label: 'Twitter',
      color: 'bg-sky-500 hover:bg-sky-600'
    },
    {
      name: 'facebook',
      icon: Facebook,
      label: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      color: 'bg-blue-700 hover:bg-blue-800'
    },
    {
      name: 'instagram',
      icon: Instagram,
      label: 'Instagram',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
    }
  ]

  const handleShare = async (platform: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/social-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          itemId,
          platform
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Open share link in new window
        if (data.shareContent?.url) {
          window.open(data.shareContent.url, '_blank', 'width=600,height=400')
        }
        
        onShare?.(platform)
      }
    } catch (error) {
      console.error('Error sharing:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = async () => {
    try {
      const response = await fetch('/api/referrals')
      if (response.ok) {
        const data = await response.json()
        await navigator.clipboard.writeText(data.referralLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error('Error copying referral link:', error)
    }
  }

  const getShareTitle = () => {
    switch (type) {
      case 'achievement':
        return '🏆 ¡Nuevo Logro Desbloqueado!'
      case 'goal_completed':
        return '✅ ¡Meta Completada!'
      case 'habit_streak':
        return '🔥 ¡Racha de Hábitos!'
      case 'flwy_balance':
        return '⚡ ¡Tokens FLWY Ganados!'
      case 'milestone':
        return '🎯 ¡Hito Alcanzado!'
      default:
        return '🚀 ¡Mi Progreso en Flowy!'
    }
  }

  const getShareDescription = () => {
    return description || 'Comparte tu progreso y motiva a tus amigos a unirse a la comunidad Flowy'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-blue-600" />
          Compartir tu Progreso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Share Message Preview */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">
            {getShareTitle()}
          </h3>
          <p className="text-sm text-blue-700">
            {getShareDescription()}
          </p>
        </div>

        {/* Social Platforms */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Compartir en redes sociales:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {platforms.map((platform) => {
              const Icon = platform.icon
              return (
                <Button
                  key={platform.name}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-2 ${platform.color} text-white border-0`}
                  onClick={() => handleShare(platform.name)}
                  disabled={loading}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{platform.label}</span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">O comparte tu enlace de referido:</h4>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-mono text-gray-700">
              flowy.pages.dev?ref=TU_CODIGO
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyReferralLink}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copiar</span>
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-600">
            Gana <Badge className="bg-yellow-500 text-white text-xs ml-1">50 FLWY</Badge> por cada amigo que se registre con tu enlace
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-2">🎁 Beneficios de compartir:</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Ayuda a tus amigos a ser más productivos</li>
            <li>• Gana tokens FLWY por cada referido exitoso</li>
            <li>• Construye la comunidad Flowy juntos</li>
            <li>• Desbloquea logros especiales de comunidad</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}