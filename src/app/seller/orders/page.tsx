'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Package, Clock, MapPin, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  image: string
}

interface Order {
  id: string
  createdAt: string
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
  items: OrderItem[]
  total: number
  user: {
    id: string
    name: string
    email: string
  }
  shipping: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    method: string
  }
  payment: {
    method: string
    status: string
  }
  notes?: string
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  READY: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const statusLabels = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En preparación',
  READY: 'Listo para entrega',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const allowedTransitions = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

export default function SellerOrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `/api/seller/orders?page=${currentPage}&status=${selectedStatus}`
        )
        if (!response.ok) {
          throw new Error('Error al cargar los pedidos')
        }
        const data = await response.json()
        setOrders(data.orders)
        setTotalPages(data.pagination.pages)
      } catch (error) {
        console.error('Error fetching orders:', error)
        toast.error('Error al cargar los pedidos')
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchOrders()
    }
  }, [session, currentPage, selectedStatus])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/seller/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el estado')
      }

      // Actualizar el estado en la lista local
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )

      toast.success('Estado actualizado correctamente')
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Error al actualizar el estado')
    }
  }

  if (!session?.user || session.user.role !== 'SELLER') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Gestión de Pedidos</h1>
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No tienes acceso a esta página</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Gestión de Pedidos</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Gestión de Pedidos</h1>

      <div className="mb-4 flex gap-4">
        <Select
          value={selectedStatus}
          onValueChange={(value) => {
            setSelectedStatus(value)
            setCurrentPage(1)
          }}
        >
          <option value="">Todos los estados</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold">Pedido #{order.id}</h2>
                <p className="text-sm text-gray-500">
                  {format(new Date(order.createdAt), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                </p>
                <p className="text-sm text-gray-500">
                  Cliente: {order.user.name} ({order.user.email})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[order.status]}>
                  {statusLabels[order.status]}
                </Badge>
                <Select
                  value={order.status}
                  onValueChange={(value) => handleStatusChange(order.id, value)}
                >
                  {allowedTransitions[order.status].map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Productos</h3>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span>{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div>{item.quantity}x</div>
                        <div className="text-sm text-gray-500">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Detalles de Entrega</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <div>{order.shipping.name}</div>
                      <div className="text-sm text-gray-500">
                        {order.shipping.address}, {order.shipping.city}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.shipping.state}, {order.shipping.zipCode}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-500" />
                    <span>{order.shipping.method}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <span>Pago: {order.payment.method}</span>
                  </div>

                  {order.notes && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-1">Notas</h4>
                      <p className="text-sm text-gray-500">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="py-2">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
} 