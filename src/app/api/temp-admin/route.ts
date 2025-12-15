import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Usuario en memoria para testing mientras se arregla la BD
const IN_MEMORY_ADMIN = {
  email: 'admin@flowy.app',
  password: '$2a$12$LQv3c1yqBWVHxkd0LdJ.uywYmzUq3bQ9tQGC9RrKJJMZ9z7S9uK', // bcryptjs hash de "admin"
  name: 'Administrador',
  id: 'admin-in-memory'
}

export async function POST() {
  try {
    return NextResponse.json({
      message: 'Usuario admin en memoria listo para testing',
      admin: {
        id: IN_MEMORY_ADMIN.id,
        email: IN_MEMORY_ADMIN.email,
        name: IN_MEMORY_ADMIN.name,
        password: 'admin',
        note: 'Usuario en memoria temporal mientras se arregla la BD'
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error: ' + error.message },
      { status: 500 }
    )
  }
}