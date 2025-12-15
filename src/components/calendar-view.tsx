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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"

// ... (interface Event se queda igual)
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

// Categorías de ejemplo
const EVENT_CATEGORIES = [
  { id: '1', name: 'Trabajo', color: '#3B82F6', icon: '💼' },
  { id: '2', name: 'Personal', color: '#10B981', icon: '👤' },
  { id: '3', name: 'Reunión', color: '#F59E0B', icon: '🤝' },
  { id: '4', name: 'Tarea', color: '#8B5CF6', icon: '✅' },
]

export function CalendarView() {
  const { data: session } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  // Añadimos una comprobación por si el contexto no está disponible
  const { flwyBalance } = useGamification() || { flwyBalance: 0 }

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    isAllDay: false,
    location: '',
    categoryId: '',
    status: 'pending'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    const dayEvents = getEventsForDay(date)
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0])
    } else if (dayEvents.length > 1) {
      setSelectedDate(date)
    } else {
      setNewEvent(prev => ({
        ...prev,
        startDate: date,
        endDate: new Date(date.getTime() + 60 * 60 * 1000)
      }))
      setShowEventForm(true)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) {
        toast.error("Debes estar logueado para crear un evento.")
        return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEvent,
          userId: session.user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create event')
      }

      toast.success("Evento creado exitosamente.")
      setShowEventForm(false)
      fetchEvents()

      setNewEvent({
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        isAllDay: false,
        location: '',
        categoryId: '',
        status: 'pending'
      })

    } catch (error) {
      console.error(error)
      toast.error("Hubo un error al crear el evento.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ... (resto de las funciones de ayuda)
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
      case 'month': return getDaysInMonth()
      case 'week': return getDaysInWeek()
      case 'day': return [currentDate]
      default: return getDaysInMonth()
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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  const formatEventTime = (event: Event) => {
    if (event.isAllDay) return 'Todo el día'
    return `${format(event.startDate, 'HH:mm')} - ${format(event.endDate, 'HH:mm')}`
  }
  
  // --- VISTA PARA MÓVIL (AGENDA) ---
  const renderMobileAgendaView = () => {
    const eventsByDay = events.reduce((acc, event) => {
      const day = format(event.startDate, 'yyyy-MM-dd')
      if (!acc[day]) acc[day] = []
      acc[day].push(event)
      acc[day].sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      return acc
    }, {} as Record<string, Event[]>)

    const sortedDays = Object.keys(eventsByDay).sort()

    if (sortedDays.length === 0) {
      return (
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarIcon className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">No hay eventos este mes</h3>
            <p className="text-slate-500">Toca el botón para crear tu primer evento.</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {sortedDays.map(dayString => {
          const dayEvents = eventsByDay[dayString]
          return (
            <Card key={dayString} className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  {format(new Date(dayString), 'EEEE d \'de\' MMMM', { locale: es })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 -mx-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div
                      className="w-1 h-12 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: event.category?.color || '#3B82F6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{event.title}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>{formatEventTime(event)}</span>
                        {event.location && (
                          <>
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge className={`shrink-0 ${getStatusColor(event.status)}`}>
                      {event.status === 'confirmed' ? 'Confirmado' : event.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // --- VISTA DE ESCRITORIO (CUADRÍCULA) ---
  const renderCalendarGrid = () => {
    const days = getDaysInView()
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

    if (viewMode === 'day') {
      return (
        <div className="bg-white rounded-xl shadow-lg border-0">
          <div className="p-6 border-b border-slate-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {format(currentDate, 'd')}
              </div>
              <div className="text-lg text-slate-600">
                {format(currentDate, 'EEEE', { locale: es })}
              </div>
              <div className="text-sm text-slate-500">
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {getEventsForDay(currentDate).map(event => (
                <div key={event.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                     style={{ borderColor: event.category?.color || '#3B82F6' }}
                     onClick={() => setSelectedEvent(event)}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{event.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                      {event.status === 'confirmed' ? 'Confirmado' : 
                       event.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-500">
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
                <div className="text-center py-8 text-slate-500">
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
      <div className="bg-white rounded-xl shadow-lg border-0">
        <div className="p-6 border-b border-slate-100">
          <div className="grid grid-cols-7 gap-4 text-center">
            {weekDays.map(day => (
              <div key={day} className="text-sm font-medium text-slate-600 py-2">
                {day}
              </div>
            ))}
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {days.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isToday = isSameDay(day, new Date())
              const dayEvents = getEventsForDay(day)
              
              return (
                <div
                  key={index}
                  className={`min-h-28 p-3 border border-slate-100 rounded-xl cursor-pointer transition-colors ${
                    !isCurrentMonth ? 'bg-slate-50 text-slate-400' : 'bg-white hover:bg-slate-50'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="text-sm font-medium mb-1">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <Badge
                        key={event.id}
                        variant="secondary"
                        className="truncate cursor-pointer justify-start font-medium text-xs"
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
                      </Badge>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-slate-500 text-center">
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
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <span>{format(currentDate, 'MMMM yyyy', { locale: es })}</span>
          </CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => viewMode === 'month' ? navigateMonth('prev') : viewMode === 'week' ? navigateWeek('prev') : navigateDay('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setViewMode('day')}>Día</Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode('week')}>Semana</Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode('month')}>Mes</Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => viewMode === 'month' ? navigateMonth('next') : viewMode === 'week' ? navigateWeek('next') : navigateDay('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Evento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Título</Label>
                    <Input id="title" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Descripción</Label>
                    <Textarea id="description" value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">Categoría</Label>
                    <Select value={newEvent.categoryId} onValueChange={(value) => setNewEvent({...newEvent, categoryId: value})}>
                      <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
                      <SelectContent>{EVENT_CATEGORIES.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startDate" className="text-right">Inicio</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={`col-span-3 justify-start text-left font-normal ${!newEvent.startDate && "text-muted-foreground"}`}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newEvent.startDate ? format(newEvent.startDate, "PPP") : <span>Selecciona una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={newEvent.startDate} onSelect={(date) => date && setNewEvent({...newEvent, startDate: date})} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endDate" className="text-right">Fin</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={`col-span-3 justify-start text-left font-normal ${!newEvent.endDate && "text-muted-foreground"}`}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newEvent.endDate ? format(newEvent.endDate, "PPP") : <span>Selecciona una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={newEvent.endDate} onSelect={(date) => date && setNewEvent({...newEvent, endDate: date})} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">Ubicación</Label>
                    <Input id="location" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} className="col-span-3" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowEventForm(false)}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar Evento'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <div className="lg:hidden">{renderMobileAgendaView()}</div>
      <div className="max-lg:hidden">{renderCalendarGrid()}</div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedEvent.title}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>×</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedEvent.description && (<div><h4 className="font-medium text-slate-900 mb-1">Descripción</h4><p className="text-slate-600">{selectedEvent.description}</p></div>)}
              <div className="grid grid-cols-2 gap-4">
                <div><h4 className="font-medium text-slate-900 mb-1">Fecha</h4><p className="text-slate-600">{format(selectedEvent.startDate, 'PPP', { locale: es })}</p></div>
                <div><h4 className="font-medium text-slate-900 mb-1">Hora</h4><p className="text-slate-600">{formatEventTime(selectedEvent)}</p></div>
              </div>
              {selectedEvent.location && (<div><h4 className="font-medium text-slate-900 mb-1">Ubicación</h4><p className="text-slate-600">{selectedEvent.location}</p></div>)}
              <div><h4 className="font-medium text-slate-900 mb-1">Estado</h4><Badge className={getStatusColor(selectedEvent.status)}>{selectedEvent.status === 'confirmed' ? 'Confirmado' : selectedEvent.status === 'pending' ? 'Pendiente' : 'Cancelado'}</Badge></div>
              {selectedEvent.category && (<div><h4 className="font-medium text-slate-900 mb-1">Categoría</h4><div className="flex items-center gap-2"><span className="text-lg">{selectedEvent.category.icon}</span><span>{selectedEvent.category.name}</span></div></div>)}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}