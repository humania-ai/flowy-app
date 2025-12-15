'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Clock, MapPin, Users, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useGamification } from '@/contexts/gamification-context'

interface Event {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  isAllDay: boolean
  location?: string
  whatsapp?: boolean
  status: string
  categoryId?: string
  category?: {
    name: string
    color: string
    icon: string
  }
  reminders?: Array<{
    id: string
    minutes: number
    sent: boolean
  }>
}

export function CalendarView() {
  const { data: session } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const { flwyBalance } = useGamification()

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  const fetchEvents = async () => {
    try {
      const startDate = startOfMonth(currentDate)
      const endDate = endOfMonth(currentDate)
      const response = await fetch(`/api/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.map((event: any) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate)
        })))
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const startWeek = startOfWeek(start, { weekStartsOn: 1 })
    const endWeek = endOfWeek(end, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: startWeek, end: endWeek })
  }

  const getDaysInWeek = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }

  const getDaysInView = () => {
    switch (viewMode) {
      case 'month':
        return getDaysInMonth()
      case 'week':
        return getDaysInWeek()
      case 'day':
        return [currentDate]
      default:
        return getDaysInMonth()
    }
  }

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.startDate, day))
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1))
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'prev' ? -7 : 7
    setCurrentDate(prev => new Date(prev.getTime() + days * 24 * 60 * 60 * 1000))
  }

  const navigateDay = (direction: 'prev' | 'next') => {
    const days = direction === 'prev' ? -1 : 1
    setCurrentDate(prev => new Date(prev.getTime() + days * 24 * 60 * 60 * 1000))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    const dayEvents = getEventsForDay(date)
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0])
    } else if (dayEvents.length > 1) {
      // Mostrar lista de eventos del día
      setSelectedDate(date)
    } else {
      // Crear nuevo evento en esta fecha
      setSelectedDate(date)
      setShowEventForm(true)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatEventTime = (event: Event) => {
    if (event.isAllDay) {
      return 'Todo el día'
    }
    return `${format(event.startDate, 'HH:mm')} - ${format(event.endDate, 'HH:mm')}`
  }

  const renderCalendarGrid = () => {
    const days = getDaysInView()
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

    if (viewMode === 'day') {
      return (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {format(currentDate, 'd')}
              </div>
              <div className="text-lg text-gray-600">
                {format(currentDate, 'EEEE', { locale: es })}
              </div>
              <div className="text-sm text-gray-500">
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {getEventsForDay(currentDate).map(event => (
                <div key={event.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                     style={{ borderColor: event.category?.color || '#3B82F6' }}
                     onClick={() => setSelectedEvent(event)}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                      {event.status === 'confirmed' ? 'Confirmado' : 
                       event.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatEventTime(event)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.whatsapp && (
                      <div className="flex items-center gap-1">
                        <Bell className="h-4 w-4" />
                        <span>WhatsApp</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {getEventsForDay(currentDate).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay eventos para este día</p>
                  <p className="text-sm">Crea un nuevo evento para empezar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => viewMode === 'month' ? navigateMonth('prev') : viewMode === 'week' ? navigateWeek('prev') : navigateDay('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode('day')}>
                Día
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode('week')}>
                Semana
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode('month')}>
                Mes
              </Button>
              <Button variant="outline" size="sm" onClick={() => viewMode === 'month' ? navigateMonth('next') : viewMode === 'week' ? navigateWeek('next') : navigateDay('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {weekDays.map(day => (
              <div key={day} className="text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isToday = isSameDay(day, new Date())
              const dayEvents = getEventsForDay(day)
              
              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-colors ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-blue-50'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="text-sm font-medium mb-1">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                        style={{ 
                          backgroundColor: event.category?.color || '#3B82F6',
                          color: 'white'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEvent(event)
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            Calendario
          </CardTitle>
          <Button onClick={() => setShowEventForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
        </CardHeader>
        <CardContent>
          {renderCalendarGrid()}
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedEvent.title}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Descripción</h4>
                  <p className="text-gray-600">{selectedEvent.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Fecha</h4>
                  <p className="text-gray-600">
                    {format(selectedEvent.startDate, 'PPP', { locale: es })}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Hora</h4>
                  <p className="text-gray-600">
                    {formatEventTime(selectedEvent)}
                  </p>
                </div>
              </div>

              {selectedEvent.location && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Ubicación</h4>
                  <p className="text-gray-600">{selectedEvent.location}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-1">Estado</h4>
                <Badge className={getStatusColor(selectedEvent.status)}>
                  {selectedEvent.status === 'confirmed' ? 'Confirmado' : 
                   selectedEvent.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                </Badge>
              </div>

              {selectedEvent.category && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Categoría</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{selectedEvent.category.icon}</span>
                    <span>{selectedEvent.category.name}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Nuevo Evento</span>
                <Button variant="ghost" size="sm" onClick={() => setShowEventForm(false)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600 mb-2">Formulario de evento en desarrollo</p>
                <p className="text-sm text-gray-500">Próximamente podrás crear eventos completos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}