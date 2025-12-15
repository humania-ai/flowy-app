import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Verificar si el admin ya existe
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@flowy.app' }
    })

    console.log('Admin existente:', existingAdmin)

    if (existingAdmin) {
      // Borrar el admin existente para recrearlo con contraseña correcta
      console.log('Borrando admin existente...')
      await db.user.delete({
        where: { email: 'admin@flowy.app' }
      })
      console.log('Admin borrado')
    }

    // Encriptar contraseña "admin" con bcryptjs
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash('admin', saltRounds)
    console.log('Contraseña encriptada:', hashedPassword.substring(0, 20) + '...')

    // Crear usuario admin
    const admin = await db.user.create({
      data: {
        email: 'admin@flowy.app',
        password: hashedPassword,
        name: 'Administrador',
        language: 'es',
        referralCode: 'ADMIN'
      }
    })
    console.log('Admin creado:', admin.id)

    // Crear suscripción premium para el admin
    await db.subscription.create({
      data: {
        userId: admin.id,
        plan: 'premium',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
      }
    })
    console.log('Suscripción creada')

    return NextResponse.json({
      message: 'Usuario admin creado exitosamente',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        password: 'admin'
      }
    })

  } catch (error) {
    console.error('Error completo creando admin:', error)
    return NextResponse.json(
      { error: 'Error al crear usuario admin: ' + error.message },
      { status: 500 }
    )
  }
}