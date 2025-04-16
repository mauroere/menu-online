'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { toast } from 'sonner'
import { Search, Filter, RefreshCw, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface OrderItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  subtotal: number
}

interface Order {
  id: string
  createdAt: string
  status: string
  total: number
  items: OrderItem[]
  deliveryAddress: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  paymentMethod: string
  notes?: string
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [currentPage, searchTerm, statusFilter])

  const fetchOrders = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        status: statusFilter,
      })

      const response = await fetch(`/api/orders?${queryParams}`)
      if (!response.ok) {
        throw new Error('Error al cargar los pedidos')
      }

      const data = await response.json()
      setOrders(data.orders)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Error al cargar los pedidos')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      delivered: 'bg-purple-100 text-purple-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Pendiente',
      processing: 'En Proceso',
      completed: 'Completado',
      cancelled: 'Cancelado',
      delivered: 'Entregado',
    }
    return texts[status as keyof typeof texts] || status
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Mis Pedidos</h1>
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">
            Por favor inicia sesión para ver tus pedidos
          </p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Mis Pedidos</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mis Pedidos</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar pedidos..."
            className="pl-10"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-full md:w-48"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="processing">En Proceso</option>
          <option value="completed">Completados</option>
          <option value="cancelled">Cancelados</option>
          <option value="delivered">Entregados</option>
        </Select>

        <Button onClick={fetchOrders} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Pedido #{order.id}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {format(new Date(order.createdAt), "d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </p>
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-64">
                <h3 className="font-medium mb-2">Dirección de Entrega</h3>
                <p className="text-sm text-gray-600">
                  {order.deliveryAddress.street}
                  <br />
                  {order.deliveryAddress.city}, {order.deliveryAddress.state}{' '}
                  {order.deliveryAddress.zipCode}
                </p>
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Método de Pago</h3>
                  <p className="text-sm text-gray-600">
                    {order.paymentMethod === 'cash'
                      ? 'Efectivo'
                      : order.paymentMethod === 'card'
                      ? 'Tarjeta'
                      : order.paymentMethod}
                  </p>
                </div>
                {order.notes && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Notas</h3>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No se encontraron pedidos</p>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
} 