'use client'

import { useState, useEffect } from 'react'
import { useGamification } from '@/contexts/gamification-context'
import { Zap, Database, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function OfflineMode() {
  const [isOnline, setIsOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [pendingChanges, setPendingChanges] = useState(0)

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Set initial status
    setIsOnline(navigator.onLine)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    // Load cached data when offline
    if (!isOnline) {
      loadOfflineData()
    }
  }, [isOnline])

  const loadOfflineData = () => {
    try {
      const cachedGoals = localStorage.getItem('flowy-goals')
      const cachedHabits = localStorage.getItem('flowy-habits')
      const cachedFlowBalance = localStorage.getItem('flowy-flow-balance')
      
      if (cachedGoals) {
        console.log('Loading cached goals from offline storage')
      }
      if (cachedHabits) {
        console.log('Loading cached habits from offline storage')
      }
      if (cachedFlowBalance) {
        console.log('Loading cached flow balance from offline storage')
      }
    } catch (error) {
      console.error('Error loading offline data:', error)
    }
  }

  const saveOfflineData = () => {
    try {
      // Cache current data for offline use
      localStorage.setItem('flowy-goals', JSON.stringify([]))
      localStorage.setItem('flowy-habits', JSON.stringify([]))
      localStorage.setItem('flowy-flow-balance', '0')
      console.log('Data cached for offline use')
    } catch (error) {
      console.error('Error saving offline data:', error)
    }
  }

  const syncData = async () => {
    if (!isOnline) {
      alert('Necesitas conexión a internet para sincronizar')
      return
    }

    setSyncStatus('syncing')
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSyncStatus('success')
      setLastSync(new Date())
      setPendingChanges(0)
      
      // Clear offline cache after successful sync
      localStorage.removeItem('flowy-goals')
      localStorage.removeItem('flowy-habits')
      localStorage.removeItem('flowy-flow-balance')
      
      setTimeout(() => setSyncStatus('idle'), 2000)
    } catch (error) {
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 2000)
    }
  }

  const handleCreateOfflineGoal = (goal: any) => {
    try {
      const existingGoals = JSON.parse(localStorage.getItem('flowy-goals') || '[]')
      const newGoal = {
        ...goal,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        pendingSync: true
      }
      
      const updatedGoals = [...existingGoals, newGoal]
      localStorage.setItem('flowy-goals', JSON.stringify(updatedGoals))
      setPendingChanges(prev => prev + 1)
      
      console.log('Goal created offline:', newGoal)
    } catch (error) {
      console.error('Error creating offline goal:', error)
    }
  }

  const handleCreateOfflineHabit = (habit: any) => {
    try {
      const existingHabits = JSON.parse(localStorage.getItem('flowy-habits') || '[]')
      const newHabit = {
        ...habit,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        pendingSync: true
      }
      
      const updatedHabits = [...existingHabits, newHabit]
      localStorage.setItem('flowy-habits', JSON.stringify(updatedHabits))
      setPendingChanges(prev => prev + 1)
      
      console.log('Habit created offline:', newHabit)
    } catch (error) {
      console.error('Error creating offline habit:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            Estado de Conexión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={isOnline ? 'bg-green-500' : 'bg-red-500'}>
                {isOnline ? 'Conectado' : 'Desconectado'}
              </Badge>
              {isOnline ? (
                <span className="text-sm text-green-600">
                  Todos los datos están sincronizados
                </span>
              ) : (
                <span className="text-sm text-red-600">
                  Modo offline activado
                </span>
              )}
            </div>
            <Button
              size="sm"
              onClick={syncData}
              disabled={!isOnline || syncStatus === 'syncing'}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${
                syncStatus === 'syncing' ? 'animate-spin' : ''
              }`} />
              {syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          </div>
          
          {lastSync && (
            <div className="text-xs text-gray-500 mt-2">
              Última sincronización: {lastSync.toLocaleString()}
            </div>
          )}
          
          {pendingChanges > 0 && (
            <div className="text-xs text-orange-600 mt-1">
              {pendingChanges} cambios pendientes de sincronizar
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offline Features */}
      {!isOnline && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-orange-600" />
              Modo Offline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">
                  📱 Funciones Disponibles Offline:
                </h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>✅ Ver metas y hábitos</li>
                  <li>✅ Crear nuevas metas</li>
                  <li>✅ Crear nuevos hábitos</li>
                  <li>✅ Actualizar progreso</li>
                  <li>✅ Completar hábitos diarios</li>
                  <li>✅ Ver balance de tokens FLOW</li>
                </ul>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  ⚠️ Limitaciones Offline:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• No se pueden crear eventos en el calendario</li>
                  <li>• No se pueden compartir por WhatsApp</li>
                  <li>• No se pueden canjear recompensas</li>
                  <li>• Los cambios se sincronizarán cuando vuelvas a estar online</li>
                </ul>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">
                  💡 Consejos para modo offline:
                </h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Los cambios se guardan localmente</li>
                  <li>• Sincroniza regularmente para no perder datos</li>
                  <li>• El modo offline es ideal para viajes o sin internet</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Status */}
      {syncStatus !== 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Estado de Sincronización
            </CardTitle>
          </CardHeader>
          <CardContent>
            {syncStatus === 'syncing' && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-blue-600">Sincronizando tus datos...</p>
                <p className="text-sm text-gray-500">Esto puede tomar unos momentos</p>
              </div>
            )}
            
            {syncStatus === 'success' && (
              <div className="text-center py-4">
                <div className="text-green-600 text-4xl mb-2">✅</div>
                <p className="text-green-600">¡Sincronización completada!</p>
                <p className="text-sm text-gray-500">Todos tus datos están actualizados</p>
              </div>
            )}
            
            {syncStatus === 'error' && (
              <div className="text-center py-4">
                <div className="text-red-600 text-4xl mb-2">❌</div>
                <p className="text-red-600">Error en la sincronización</p>
                <p className="text-sm text-gray-500">Intenta nuevamente más tarde</p>
                <Button 
                  size="sm" 
                  onClick={syncData}
                  className="mt-2"
                >
                  Reintentar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}