import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email, password, name, language = 'es' } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      )
    }

    // Encriptar contraseña
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Crear usuario
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        language,
        referralCode: Math.random().toString(36).substring(2, 15).toUpperCase()
      }
    })

    // Crear suscripción gratuita por defecto
    await db.subscription.create({
      data: {
        userId: user.id,
        plan: 'free',
        status: 'active'
      }
    })

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        language: user.language
      }
    })

  } catch (error) {
    console.error('Error en signup:', error)
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}