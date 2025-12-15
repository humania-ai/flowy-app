'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/contexts/language-context'
import { Calendar, Sync, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

export function GoogleCalendarSync() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncEnabled, setSyncEnabled] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSync = async () => {
    if (!session?.user?.email) return

    setIsSyncing(true)
    setSyncStatus('idle')

    try {
      const response = await fetch('/api/google-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync'
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSyncStatus('success')
        setLastSync(new Date())
      } else {
        setSyncStatus('error')
      }
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error)
      setSyncStatus('error')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleToggleSync = async (enabled: boolean) => {
    setSyncEnabled(enabled)
    
    if (enabled) {
      await handleSync()
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-md border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Calendar className="h-5 w-5 text-blue-600" />
          {t('syncGoogleCalendar')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Sincronización automática</h4>
            <p className="text-sm text-gray-600">
              Sincronizar eventos con tu Google Calendar
            </p>
          </div>
          <Switch
            checked={syncEnabled}
            onCheckedChange={handleToggleSync}
            disabled={isSyncing}
          />
        </div>

        {syncEnabled && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                {syncStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : syncStatus === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <Calendar className="h-4 w-4 text-blue-600" />
                )}
                <span className="text-sm text-gray-700">
                  {syncStatus === 'success' 
                    ? 'Sincronización completada' 
                    : syncStatus === 'error' 
                    ? 'Error en la sincronización' 
                    : 'Listo para sincronizar'
                  }
                </span>
              </div>
              {lastSync && (
                <span className="text-xs text-gray-500">
                  {lastSync.toLocaleTimeString()}
                </span>
              )}
            </div>

            <Button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Sync className="h-4 w-4 mr-2" />
                  Sincronizar ahora
                </>
              )}
            </Button>
          </div>
        )}

        {!session?.user?.email && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              Debes iniciar sesión para usar la sincronización con Google Calendar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}