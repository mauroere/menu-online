'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, addDays, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'

interface DeliverySlot {
  id: string
  date: string
  startTime: string
  endTime: string
  maxOrders: number
  currentOrders: number
  isBlocked: boolean
}

interface Order {
  id: string
  customerName: string
  total: number
  status: string
}

export function DeliveryCalendar() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null)
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    maxOrders: '10',
    isBlocked: false,
  })

  const fetchDeliverySlots = async () => {
    try {
      const startDate = format(startOfDay(selectedDate), 'yyyy-MM-dd')
      const endDate = format(endOfDay(selectedDate), 'yyyy-MM-dd')
      
      const response = await fetch(
        `/api/seller/delivery-slots?startDate=${startDate}&endDate=${endDate}`
      )
      const data = await response.json()
      setDeliverySlots(data)
    } catch (error) {
      console.error('Error fetching delivery slots:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrders = async (slotId: string) => {
    try {
      const response = await fetch(`/api/seller/delivery-slots/${slotId}/orders`)
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  useEffect(() => {
    fetchDeliverySlots()
  }, [selectedDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = selectedSlot
        ? `/api/seller/delivery-slots/${selectedSlot.id}`
        : '/api/seller/delivery-slots'
      const method = selectedSlot ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date: format(selectedDate, 'yyyy-MM-dd'),
        }),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        fetchDeliverySlots()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving delivery slot:', error)
    }
  }

  const handleEdit = (slot: DeliverySlot) => {
    setSelectedSlot(slot)
    setFormData({
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxOrders: slot.maxOrders.toString(),
      isBlocked: slot.isBlocked,
    })
    setIsDialogOpen(true)
  }

  const handleViewOrders = (slot: DeliverySlot) => {
    setSelectedSlot(slot)
    fetchOrders(slot.id)
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setSelectedSlot(null)
    setFormData({
      startTime: '',
      endTime: '',
      maxOrders: '10',
      isBlocked: false,
    })
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Calendario de Entregas</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={es}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Horarios para {format(selectedDate, 'PPP', { locale: es })}
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>Nuevo Horario</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedSlot ? 'Editar Horario' : 'Nuevo Horario'}
                </DialogTitle>
              </DialogHeader>
              {selectedSlot && orders.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium">Órdenes Programadas</h3>
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-muted-foreground">
                            ${order.total}
                          </div>
                        </div>
                        <div className="text-sm">{order.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Hora de Inicio</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Hora de Fin</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxOrders">Máximo de Órdenes</Label>
                    <Input
                      id="maxOrders"
                      type="number"
                      value={formData.maxOrders}
                      onChange={(e) =>
                        setFormData({ ...formData, maxOrders: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isBlocked"
                      checked={formData.isBlocked}
                      onChange={(e) =>
                        setFormData({ ...formData, isBlocked: e.target.checked })
                      }
                    />
                    <Label htmlFor="isBlocked">Bloquear Horario</Label>
                  </div>
                  <Button type="submit">
                    {selectedSlot ? 'Guardar cambios' : 'Crear horario'}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliverySlots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-4 border rounded"
              >
                <div>
                  <div className="font-medium">
                    {slot.startTime} - {slot.endTime}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {slot.currentOrders} / {slot.maxOrders} órdenes
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewOrders(slot)}
                  >
                    Ver Órdenes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(slot)}
                  >
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 