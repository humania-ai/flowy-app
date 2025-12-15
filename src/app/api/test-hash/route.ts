import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Generar hash para "admin" con bcryptjs
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash('admin', saltRounds)
    
    // Verificar que funciona
    const isValid = await bcrypt.compare('admin', hashedPassword)
    
    return NextResponse.json({
      originalHash: '$2a$12$LQv3c1yqBWVHxkd0LdJ.uywYmzUq3bQ9tQGC9RrKJJMZ9z7S9uK',
      newHash: hashedPassword,
      isValid: isValid,
      testCompare: await bcrypt.compare('admin', hashedPassword)
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error: ' + error.message },
      { status: 500 }
    )
  }
}