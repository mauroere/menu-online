'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react'

interface DeliveryHour {
  id: string
  date: string
  startTime: string
  endTime: string
  maxOrders: number
  currentOrders: number
  isBlocked: boolean
}

export default function DeliveryHoursPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [deliveryHours, setDeliveryHours] = useState<DeliveryHour[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [newHour, setNewHour] = useState({
    startTime: '',
    endTime: '',
    maxOrders: 10,
  })

  useEffect(() => {
    if (selectedDate) {
      fetchDeliveryHours()
    }
  }, [selectedDate])

  const fetchDeliveryHours = async () => {
    try {
      const response = await fetch(`/api/admin/delivery-hours?date=${selectedDate}`)
      if (!response.ok) {
        throw new Error('Error al cargar los horarios')
      }

      const data = await response.json()
      setDeliveryHours(data)
    } catch (error) {
      console.error('Error fetching delivery hours:', error)
      toast.error('Error al cargar los horarios')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddHour = async () => {
    try {
      const response = await fetch('/api/admin/delivery-hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          ...newHour,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al crear el horario')
      }

      toast.success('Horario creado exitosamente')
      fetchDeliveryHours()
      setNewHour({
        startTime: '',
        endTime: '',
        maxOrders: 10,
      })
    } catch (error) {
      console.error('Error creating delivery hour:', error)
      toast.error('Error al crear el horario')
    }
  }

  const handleDeleteHour = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/delivery-hours/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el horario')
      }

      toast.success('Horario eliminado exitosamente')
      fetchDeliveryHours()
    } catch (error) {
      console.error('Error deleting delivery hour:', error)
      toast.error('Error al eliminar el horario')
    }
  }

  const handleToggleBlock = async (id: string, isBlocked: boolean) => {
    try {
      const response = await fetch(`/api/admin/delivery-hours/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el horario')
      }

      toast.success('Horario actualizado exitosamente')
      fetchDeliveryHours()
    } catch (error) {
      console.error('Error updating delivery hour:', error)
      toast.error('Error al actualizar el horario')
    }
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Gestión de Horarios</h1>
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No tienes acceso a esta página</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Gestión de Horarios</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Horarios</h1>

      <Card className="p-6 mb-6">
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </Card>

      {selectedDate && (
        <>
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Agregar Nuevo Horario</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <Input
                  type="time"
                  value={newHour.startTime}
                  onChange={(e) =>
                    setNewHour({ ...newHour, startTime: e.target.value })
                  }
                  placeholder="Hora de inicio"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <Input
                  type="time"
                  value={newHour.endTime}
                  onChange={(e) =>
                    setNewHour({ ...newHour, endTime: e.target.value })
                  }
                  placeholder="Hora de fin"
                />
              </div>
              <div>
                <Input
                  type="number"
                  value={newHour.maxOrders}
                  onChange={(e) =>
                    setNewHour({
                      ...newHour,
                      maxOrders: parseInt(e.target.value),
                    })
                  }
                  placeholder="Máximo de órdenes"
                  min="1"
                />
              </div>
            </div>
            <Button
              onClick={handleAddHour}
              className="mt-4"
              disabled={!newHour.startTime || !newHour.endTime}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Horario
            </Button>
          </Card>

          <div className="space-y-4">
            {deliveryHours.map((hour) => (
              <Card key={hour.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {hour.startTime} - {hour.endTime}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          hour.isBlocked
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {hour.isBlocked ? 'Bloqueado' : 'Disponible'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Órdenes: {hour.currentOrders} / {hour.maxOrders}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleToggleBlock(hour.id, hour.isBlocked)}
                    >
                      {hour.isBlocked ? 'Desbloquear' : 'Bloquear'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteHour(hour.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
} 