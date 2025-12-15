'use client'

import { useState } from 'react'
import { useGamification } from '@/contexts/gamification-context'
import { Target, Calendar, Plus, X, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export function GoalsAndHabits() {
  const { goals, habits, loading, createGoal, updateGoal, deleteGoal, createHabit, completeHabit } = useGamification()
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [showHabitForm, setShowHabitForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: 1,
    unit: 'tareas',
    category: 'personal',
    deadline: ''
  })
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    targetCount: 1
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    await createGoal(newGoal)
    setNewGoal({
      title: '',
      description: '',
      target: 1,
      unit: 'tareas',
      category: 'personal',
      deadline: ''
    })
    setShowGoalForm(false)
  }

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createHabit(newHabit)
    setNewHabit({
      name: '',
      description: '',
      frequency: 'daily',
      targetCount: 1
    })
    setShowHabitForm(false)
  }

  const handleCompleteHabit = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0]
    await completeHabit(habitId, today)
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work': return 'bg-blue-500'
      case 'health': return 'bg-green-500'
      case 'personal': return 'bg-purple-500'
      case 'learning': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Diario'
      case 'weekly': return 'Semanal'
      case 'monthly': return 'Mensual'
      default: return frequency
    }
  }

  return (
    <div className="space-y-6">
      {/* Goals Section */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Metas
          </CardTitle>
          <Button size="sm" onClick={() => setShowGoalForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Meta
          </Button>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tienes metas configuradas</p>
              <p className="text-sm">Crea tu primera meta para empezar a trackear tu progreso</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getCategoryColor(goal.category)}>
                        {goal.category}
                      </Badge>
                      {goal.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progreso</span>
                      <span className="font-medium">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(goal.current, goal.target)} 
                      className="h-2"
                    />
                    {goal.deadline && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(goal.deadline).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    {goal.status !== 'completed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateGoal(goal.id, { 
                          current: Math.min(goal.current + 1, goal.target) 
                        })}
                      >
                        Actualizar
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateGoal(goal.id, { 
                        status: goal.status === 'completed' ? 'active' : 'completed' 
                      })}
                    >
                      {goal.status === 'completed' ? 'Reabrir' : 'Completar'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Habits Section */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            Hábitos
          </CardTitle>
          <Button size="sm" onClick={() => setShowHabitForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Hábito
          </Button>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tienes hábitos configurados</p>
              <p className="text-sm">Crea tu primer hábito para empezar a construir rachas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {habits.map((habit) => {
                const today = new Date().toISOString().split('T')[0]
                const isCompletedToday = habit.completions?.some(
                  completion => completion.date === today && completion.completed
                )
                
                return (
                  <div key={habit.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{habit.name}</h3>
                        {habit.description && (
                          <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getFrequencyText(habit.frequency)}
                        </Badge>
                        {isCompletedToday && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Racha actual</span>
                        <span className="font-medium">
                          🔥 {habit.currentStreak} días
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Mejor racha</span>
                        <span className="font-medium">
                          ⭐ {habit.bestStreak} días
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => handleCompleteHabit(habit.id)}
                      disabled={isCompletedToday}
                    >
                      {isCompletedToday ? 'Completado hoy ✓' : 'Completar hoy'}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Nueva Meta</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowGoalForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    placeholder="Ej: Leer 20 libros este año"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Descripción opcional"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Objetivo</label>
                    <input
                      type="number"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({...newGoal, target: parseInt(e.target.value)})}
                      className="w-full p-2 border rounded-md"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Unidad</label>
                    <select
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="tareas">Tareas</option>
                      <option value="minutos">Minutos</option>
                      <option value="veces">Veces</option>
                      <option value="libros">Libros</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Categoría</label>
                    <select
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="work">Trabajo</option>
                      <option value="health">Salud</option>
                      <option value="personal">Personal</option>
                      <option value="learning">Aprendizaje</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fecha límite</label>
                    <input
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Crear Meta
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowGoalForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Habit Form Modal */}
      {showHabitForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Nuevo Hábito</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowHabitForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateHabit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nombre</label>
                  <input
                    type="text"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    placeholder="Ej: Meditar 30 minutos"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <textarea
                    value={newHabit.description}
                    onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Descripción opcional"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Frecuencia</label>
                    <select
                      value={newHabit.frequency}
                      onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Veces por {newHabit.frequency === 'daily' ? 'día' : newHabit.frequency === 'weekly' ? 'semana' : 'mes'}</label>
                    <input
                      type="number"
                      value={newHabit.targetCount}
                      onChange={(e) => setNewHabit({...newHabit, targetCount: parseInt(e.target.value)})}
                      className="w-full p-2 border rounded-md"
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Crear Hábito
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowHabitForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}