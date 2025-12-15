// app/api/events/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'


/**
 * GET /api/events
 * 
 * Obtiene todos los eventos del usuario autenticado actualmente.
 * Filtra opcionalmente por un rango de fechas (startDate, endDate).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Verificación de Seguridad: Asegurarse de que el usuario esté autenticado.
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const events = await db.event.findMany({
      where: {
        // 2. Filtrar por el ID del usuario autenticado.
        userId: session.user.id,
        // Aplicar filtro de rango de fechas si se proporciona.
        ...(startDate && endDate && {
          startDate: {
            gte: new Date(startDate)
          },
          endDate: {
            lte: new Date(endDate)
          }
        })
      },
      include: {
        category: true,
        reminders: true
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    return NextResponse.json(events);

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * 
 * Crea un nuevo evento para el usuario autenticado actualmente.
 * El ID del usuario se obtiene de la sesión, no del cuerpo de la petición.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Verificación de Seguridad: Asegurarse de que el usuario esté autenticado.
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      isAllDay,
      location,
      whatsapp,
      status,
      categoryId,
      reminders
    } = body;

    // 2. Validación básica de los campos requeridos.
    if (!title || !startDate || !endDate) {
      return NextResponse.json({ message: 'Missing required fields: title, startDate, endDate' }, { status: 400 });
    }

    // 3. Crear el evento en la base de datos.
    // El userId se toma de la sesión, no del cuerpo de la petición para mayor seguridad.
    const newEvent = await db.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isAllDay: isAllDay || false,
        location,
        whatsapp: whatsapp || false,
        status: status || 'pending',
        categoryId,
        userId: session.user.id, // <-- Asociar el evento con el usuario logueado
        reminders: reminders ? {
          create: reminders.map((minutes: number) => ({
            minutes
          }))
        } : undefined
      },
      include: {
        category: true,
        reminders: true
      }
    });

    return NextResponse.json(newEvent, { status: 201 });

  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}