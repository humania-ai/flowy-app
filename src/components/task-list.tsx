'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { format, isToday, isPast, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, CheckCircle, Circle, Clock, Calendar, AlertCircle, Filter, Search, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useGamification } from '@/contexts/gamification-context'

interface Task {
  id: string
  title: string
  description?: string
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'completed'
  categoryId?: string
  category?: {
    name: string
    color: string
    icon: string
  }
  createdAt: Date
  updatedAt: Date
}

export function TaskList() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all')
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { flwyBalance } = useGamification()

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchTerm, filterStatus, filterPriority])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data.map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        })))
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTasks = () => {
    let filtered = tasks

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus)
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority)
    }

    setFilteredTasks(filtered)
  }

  const updateTaskStatus = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed') => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: taskId,
          status: newStatus
        })
      })

      if (response.ok) {
        setTasks(prev => prev.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        ))
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: taskId })
      })

      if (response.ok) {
        setTasks(prev => prev.filter(task => task.id !== taskId))
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'todo':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'todo':
        return <Circle className="h-4 w-4 text-gray-600" />
      default:
        return <Circle className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta'
      case 'medium':
        return 'Media'
      case 'low':
        return 'Baja'
      default:
        return priority
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada'
      case 'in_progress':
        return 'En progreso'
      case 'todo':
        return 'Pendiente'
      default:
        return status
    }
  }

  const isOverdue = (task: Task) => {
    return task.dueDate && isPast(task.dueDate) && task.status !== 'completed'
  }

  const groupTasksByDate = (tasks: Task[]) => {
    const groups: { [key: string]: Task[] } = {}
    
    tasks.forEach(task => {
      let dateKey = 'Sin fecha'
      if (task.dueDate) {
        if (isToday(task.dueDate)) {
          dateKey = 'Hoy'
        } else if (isPast(task.dueDate)) {
          dateKey = 'Vencidas'
        } else {
          dateKey = format(task.dueDate, 'PPP', { locale: es })
        }
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(task)
    })

    return groups
  }

  const taskGroups = groupTasksByDate(filteredTasks)
  const sortedDates = Object.keys(taskGroups).sort((a, b) => {
    if (a === 'Vencidas') return -1
    if (b === 'Vencidas') return 1
    if (a === 'Hoy') return -1
    if (b === 'Hoy') return 1
    return 0
  })

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => isOverdue(t)).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl mb-2">📋</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-sm text-gray-600">Total Tareas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-sm text-gray-600">Completadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl mb-2">🔄</div>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-sm text-gray-600">En Progreso</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center p-4">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-sm text-gray-600">Vencidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtros y Búsqueda
            </span>
            <Button onClick={() => setShowTaskForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos</option>
                <option value="todo">Pendientes</option>
                <option value="in_progress">En progreso</option>
                <option value="completed">Completadas</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2">Prioridad</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todas</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                ? 'No se encontraron tareas con los filtros aplicados'
                : 'No tienes tareas aún'
              }
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Intenta ajustar los filtros o términos de búsqueda'
                : 'Crea tu primera tarea para empezar a organizar tu día'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        sortedDates.map(dateKey => (
          <Card key={dateKey}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {dateKey === 'Vencidas' && <AlertCircle className="h-5 w-5 text-red-600" />}
                {dateKey === 'Hoy' && <Calendar className="h-5 w-5 text-blue-600" />}
                {dateKey !== 'Vencidas' && dateKey !== 'Hoy' && <span className="text-lg">📅</span>}
                <span className={
                  dateKey === 'Vencidas' ? 'text-red-600' : 
                  dateKey === 'Hoy' ? 'text-blue-600' : 'text-gray-900'
                }>
                  {dateKey}
                </span>
                <Badge variant="outline">
                  {taskGroups[dateKey].length} tareas
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taskGroups[dateKey].map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <button
                      onClick={() => updateTaskStatus(task.id, 
                        task.status === 'completed' ? 'todo' : 'completed')}
                      className="flex-shrink-0"
                    >
                      {getStatusIcon(task.status)}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className={`font-medium truncate ${
                          task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={getPriorityColor(task.priority)}>
                            {getPriorityText(task.priority)}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusText(task.status)}
                          </Badge>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      {task.dueDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className={
                            isOverdue(task) ? 'text-red-600 font-medium' : 'text-gray-600'
                          }>
                            {format(task.dueDate, 'PPP', { locale: es })}
                          </span>
                          {isToday(task.dueDate) && (
                            <Badge variant="outline" className="text-xs">
                              Hoy
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTask(task)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}