'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { toast } from 'sonner'
import { Search, Filter, Download } from 'lucide-react'

interface Log {
  id: string
  timestamp: string
  level: 'INFO' | 'WARNING' | 'ERROR'
  source: string
  message: string
  details?: any
}

export default function LogsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState<Log[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('ALL')
  const [sourceFilter, setSourceFilter] = useState<string>('ALL')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  })

  useEffect(() => {
    fetchLogs()
  }, [levelFilter, sourceFilter, dateRange])

  const fetchLogs = async () => {
    try {
      const queryParams = new URLSearchParams({
        level: levelFilter,
        source: sourceFilter,
        startDate: dateRange.start,
        endDate: dateRange.end,
      })

      const response = await fetch(`/api/admin/logs?${queryParams}`)
      if (!response.ok) {
        throw new Error('Error al cargar los logs')
      }

      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Error al cargar los logs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams({
        level: levelFilter,
        source: sourceFilter,
        startDate: dateRange.start,
        endDate: dateRange.end,
      })

      const response = await fetch(`/api/admin/logs/export?${queryParams}`)
      if (!response.ok) {
        throw new Error('Error al exportar los logs')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `logs-${new Date().toISOString()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Logs exportados exitosamente')
    } catch (error) {
      console.error('Error exporting logs:', error)
      toast.error('Error al exportar los logs')
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter
    const matchesSource = sourceFilter === 'ALL' || log.source === sourceFilter
    return matchesSearch && matchesLevel && matchesSource
  })

  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Logs del Sistema</h1>
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No tienes acceso a esta página</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Logs del Sistema</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Logs del Sistema</h1>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Logs
        </Button>
      </div>

      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar en logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="ALL">Todos los niveles</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="ERROR">Error</option>
          </Select>

          <Select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="ALL">Todas las fuentes</option>
            <option value="API">API</option>
            <option value="AUTH">Autenticación</option>
            <option value="DB">Base de datos</option>
            <option value="PAYMENT">Pagos</option>
          </Select>

          <div className="flex space-x-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      log.level === 'ERROR'
                        ? 'bg-red-100 text-red-800'
                        : log.level === 'WARNING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-sm text-gray-500">{log.source}</span>
                </div>
                <p className="mt-2">{log.message}</p>
                {log.details && (
                  <pre className="mt-2 text-sm bg-gray-50 p-2 rounded">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 