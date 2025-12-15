import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Seed achievements
    const achievements = [
      {
        name: 'Primer Paso',
        description: 'Crea tu primera meta',
        icon: '🎯',
        category: 'milestone',
        flwyReward: 10,
        requirement: JSON.stringify({
          type: 'goals_created',
          count: 1
        }),
        isActive: true
      },
      {
        name: 'Primer Hábito',
        description: 'Crea tu primer hábito',
        icon: '⭐',
        category: 'milestone',
        flwyReward: 10,
        requirement: JSON.stringify({
          type: 'habits_created',
          count: 1
        }),
        isActive: true
      },
      {
        name: 'Cumplidor de Metas',
        description: 'Completa 5 metas',
        icon: '🏆',
        category: 'productivity',
        flwyReward: 25,
        requirement: JSON.stringify({
          type: 'goals_completed',
          count: 5
        }),
        isActive: true
      },
      {
        name: 'Semana Perfecta',
        description: 'Mantén una racha de 7 días',
        icon: '🔥',
        category: 'consistency',
        flwyReward: 25,
        requirement: JSON.stringify({
          type: 'streak_days',
          count: 7
        }),
        isActive: true
      },
      {
        name: 'Maestro de Hábitos',
        description: 'Mantén una racha de 21 días',
        icon: '🌟',
        category: 'consistency',
        flwyReward: 50,
        requirement: JSON.stringify({
          type: 'streak_days',
          count: 21
        }),
        isActive: true
      },
      {
        name: 'Experto en Metas',
        description: 'Completa 25 metas',
        icon: '⭐',
        category: 'productivity',
        flwyReward: 50,
        requirement: JSON.stringify({
          type: 'goals_completed',
          count: 25
        }),
        isActive: true
      },
      {
        name: 'Mes de Productividad',
        description: 'Mantén una racha de 30 días',
        icon: '👑',
        category: 'consistency',
        flwyReward: 100,
        requirement: JSON.stringify({
          type: 'streak_days',
          count: 30
        }),
        isActive: true
      },
      {
        name: 'Leyenda de Flowy',
        description: 'Completa 50 metas',
        icon: '👑',
        category: 'productivity',
        flwyReward: 100,
        requirement: JSON.stringify({
          type: 'goals_completed',
          count: 50
        }),
        isActive: true
      }
    ]

    // Seed rewards
    const rewards = [
      {
        name: 'Tema Oscuro',
        description: 'Desbloquea el tema oscuro para Flowy',
        icon: '🌙',
        category: 'themes',
        flwyCost: 100,
        isActive: true
      },
      {
        name: 'Tema Neón',
        description: 'Desbloquea el tema neón para Flowy',
        icon: '💫',
        category: 'themes',
        flwyCost: 150,
        isActive: true
      },
      {
        name: 'Tema Minimalista',
        description: 'Desbloquea el tema minimalista para Flowy',
        icon: '🎨',
        category: 'themes',
        flwyCost: 100,
        isActive: true
      },
      {
        name: 'Badge Experto',
        description: 'Obtén el badge de experto en tu perfil',
        icon: '🏆',
        category: 'badges',
        flwyCost: 50,
        isActive: true
      },
      {
        name: 'Badge Leyenda',
        description: 'Obtén el badge de leyenda en tu perfil',
        icon: '👑',
        category: 'badges',
        flwyCost: 100,
        isActive: true
      },
      {
        name: 'Extra de Storage',
        description: 'Duplica tu límite de almacenamiento',
        icon: '💾',
        category: 'features',
        flwyCost: 200,
        isActive: true
      },
      {
        name: 'Analytics Avanzado',
        description: 'Desbloquea analytics avanzados',
        icon: '📊',
        category: 'features',
        flwyCost: 150,
        isActive: true
      },
      {
        name: 'Descuento 10%',
        description: '10% de descuento en tu próxima suscripción',
        icon: '💰',
        category: 'discounts',
        flwyCost: 300,
        isActive: true
      },
      {
        name: 'Descuento 25%',
        description: '25% de descuento en tu próxima suscripción',
        icon: '💰',
        category: 'discounts',
        flwyCost: 500,
        isActive: true
      }
    ]

    // Seed categories
    const categories = [
      { name: 'Trabajo', color: '#3B82F6', icon: '💼' },
      { name: 'Personal', color: '#10B981', icon: '👤' },
      { name: 'Salud', color: '#F59E0B', icon: '🏥' },
      { name: 'Familia', color: '#8B5CF6', icon: '👨‍👩‍👧‍👦' },
      { name: 'Social', color: '#EC4899', icon: '🎉' },
      { name: 'Compras', color: '#06B6D4', icon: '🛒' },
      { name: 'Estudio', color: '#84CC16', icon: '📚' },
      { name: 'Deporte', color: '#F97316', icon: '⚽' }
    ]

    // Insert data
    for (const achievement of achievements) {
      await db.achievement.upsert({
        where: { name: achievement.name },
        update: achievement,
        create: achievement
      })
    }

    for (const reward of rewards) {
      await db.reward.upsert({
        where: { name: reward.name },
        update: reward,
        create: reward
      })
    }

    for (const category of categories) {
      await db.category.upsert({
        where: { name: category.name },
        update: category,
        create: category
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      achievements: achievements.length,
      rewards: rewards.length,
      categories: categories.length
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}