import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { type, itemId, platform } = await request.json()

    if (!type || !platform) {
      return NextResponse.json(
        { error: 'Type and platform are required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate shareable content based on type
    let shareContent = generateShareContent(type, itemId, user, platform)
    
    return NextResponse.json({
      success: true,
      shareContent
    })
  } catch (error) {
    console.error('Error generating share content:', error)
    return NextResponse.json(
      { error: 'Failed to generate share content' },
      { status: 500 }
    )
  }
}

function generateShareContent(type: string, itemId: string, user: any, platform: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://flowy.pages.dev'
  const userName = user.name || 'Un amigo'
  
  const shareData = {
    whatsapp: {
      text: `¡Mira mi progreso en Flowy! 🚀\n\n${getShareMessage(type, itemId, userName)}\n\nÚnete a Flowy: ${baseUrl}`,
      url: `https://wa.me/?text=${encodeURIComponent(`¡Mira mi progreso en Flowy! 🚀\n\n${getShareMessage(type, itemId, userName)}\n\nÚnete a Flowy: ${baseUrl}`)}`
    },
    twitter: {
      text: `🚀 ¡Mira mi progreso en Flowy!\n${getShareMessage(type, itemId, userName)}\n\n#Flowy #Productividad #Metas`,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🚀 ¡Mira mi progreso en Flowy!\n${getShareMessage(type, itemId, userName)}\n\n#Flowy #Productividad #Metas`)}&url=${baseUrl}`
    },
    facebook: {
      text: `¡${userName} está alcanzando sus metas con Flowy! 🎯`,
      url: `https://www.facebook.com/sharer/sharer.php?u=${baseUrl}&quote=${encodeURIComponent(`${userName} está alcanzando sus metas con Flowy! 🎯`)}`
    },
    instagram: {
      text: `¡Mira mi progreso en Flowy! 🚀\n${getShareMessage(type, itemId, userName)}`,
      url: `https://www.instagram.com/`
    },
    linkedin: {
      text: `Estoy usando Flowy para organizar mi vida y alcanzar mis metas. ¡Increíble herramienta de productividad! 🎯`,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${baseUrl}&summary=${encodeURIComponent(`Estoy usando Flowy para organizar mi vida y alcanzar mis metas. ¡Increíble herramienta de productividad! 🎯`)}`
    }
  }

  return shareData[platform] || shareData.whatsapp
}

function getShareMessage(type: string, itemId: string, userName: string): string {
  switch (type) {
    case 'achievement':
      return `🏆 ¡Acabo de desbloquear un nuevo logro en Flowy!`
    case 'goal_completed':
      return `✅ ¡Completé una meta importante en Flowy!`
    case 'habit_streak':
      return `🔥 ¡Llevo una racha increíble de hábitos en Flowy!`
    case 'flwy_balance':
      return `⚡ ¡He acumulado muchos tokens FLWY en Flowy!`
    case 'milestone':
      return `🎯 ¡Alcancé un hito importante en mi journey de productividad con Flowy!`
    default:
      return `🚀 ${userName} está usando Flowy para organizar su vida y alcanzar sus metas. ¡Únete a la comunidad más productiva!`
  }
}