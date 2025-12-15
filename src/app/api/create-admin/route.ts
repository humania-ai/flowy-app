import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Encriptar contraseña "admin" con bcryptjs
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash('admin', saltRounds)
    console.log('Contraseña encriptada:', hashedPassword.substring(0, 20) + '...')

    // Intentar crear usuario admin sin borrar el existente
    try {
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
    } catch (createError) {
      // Si ya existe, intentar actualizar la contraseña
      if (createError.code === 'P2002') {
        console.log('Admin ya existe, intentando actualizar contraseña...')
        
        const updatedAdmin = await db.user.update({
          where: { email: 'admin@flowy.app' },
          data: { password: hashedPassword }
        })
        
        return NextResponse.json({
          message: 'Contraseña de admin actualizada exitosamente',
          admin: {
            id: updatedAdmin.id,
            email: updatedAdmin.email,
            name: updatedAdmin.name,
            password: 'admin'
          }
        })
      } else {
        throw createError
      }
    }

  } catch (error) {
    console.error('Error completo creando admin:', error)
    return NextResponse.json(
      { error: 'Error al crear usuario admin: ' + error.message },
      { status: 500 }
    )
  }
}