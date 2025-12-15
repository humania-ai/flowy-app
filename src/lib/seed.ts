import { db } from '@/lib/db'

export async function seedCategories() {
  try {
    const existingCategories = await db.category.findMany()
    
    if (existingCategories.length === 0) {
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

      await db.category.createMany({
        data: categories
      })

      console.log('Categories seeded successfully')
    }
  } catch (error) {
    console.error('Error seeding categories:', error)
  }
}

export async function seedDefaultUser() {
  try {
    const existingUser = await db.user.findFirst()
    
    if (!existingUser) {
      await db.user.create({
        data: {
          email: 'demo@miagenda.com',
          name: 'Usuario Demo',
          phone: '+1234567890'
        }
      })

      console.log('Default user created successfully')
    }
  } catch (error) {
    console.error('Error creating default user:', error)
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  seedCategories()
  seedDefaultUser()
}