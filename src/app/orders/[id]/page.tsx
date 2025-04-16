'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    name: string
    image: string | null
  }
  modifiers: {
    option: {
      name: string
      price: number
    }
  }[]
}

interface Order {
  id: string
  status: string
  type: string
  total: number
  items: OrderItem[]
  payment: {
    status: string
    qrCode: string | null
  }
  address?: {
    street: string
    number: string
    apartment: string | null
    city: string
    state: string
    zipCode: string
    reference: string | null
  }
}

const statusMessages = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En preparación',
  READY_FOR_PICKUP: 'Listo para retirar',
  OUT_FOR_DELIVERY: 'En camino',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado'
}

export default function OrderPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${id}`)
        if (!response.ok) {
          throw new Error('Error al cargar el pedido')
        }
        const data = await response.json()
        setOrder(data.order)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el pedido')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error || 'Pedido no encontrado'}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Pedido #{order.id}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
              order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {statusMessages[order.status as keyof typeof statusMessages]}
            </span>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-semibold">Productos</h2>
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start border-b pb-4">
                {item.product.image && (
                  <div className="w-16 h-16 relative mr-4">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                  {item.modifiers.length > 0 && (
                    <div className="text-sm text-gray-500">
                      {item.modifiers.map((mod, index) => (
                        <div key={index}>
                          {mod.option.name}
                          {mod.option.price > 0 && ` (+$${mod.option.price.toFixed(2)})`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Information */}
          {order.type === 'DELIVERY' && order.address && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Dirección de entrega</h2>
              <div className="bg-gray-50 rounded p-4">
                <p>{order.address.street} {order.address.number}</p>
                {order.address.apartment && <p>Apto: {order.address.apartment}</p>}
                <p>{order.address.city}, {order.address.state}</p>
                <p>CP: {order.address.zipCode}</p>
                {order.address.reference && (
                  <p className="text-gray-600 mt-2">
                    Referencia: {order.address.reference}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Pago</h2>
            <div className="bg-gray-50 rounded p-4">
              <div className="flex justify-between items-center mb-2">
                <span>Estado</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  order.payment.status === 'PAID' ? 'bg-green-100 text-green-800' :
                  order.payment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.payment.status === 'PAID' ? 'Pagado' :
                   order.payment.status === 'FAILED' ? 'Fallido' :
                   'Pendiente'}
                </span>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              {order.payment.qrCode && order.payment.status === 'PENDING' && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Escanea el código QR para pagar con Mercado Pago
                  </p>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <Image
                      src={`data:image/png;base64,${order.payment.qrCode}`}
                      alt="Código QR de pago"
                      width={200}
                      height={200}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 