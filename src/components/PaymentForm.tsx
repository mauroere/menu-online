import { useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

interface PaymentFormProps {
  orderId: string
  items: {
    id: string
    name: string
    price: number
    quantity: number
  }[]
  shipping: {
    cost: number
  }
  customer: {
    name: string
    email: string
    phone: string
    address: string
  }
}

export default function PaymentForm({
  orderId,
  items,
  shipping,
  customer,
}: PaymentFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    if (!session?.user) {
      toast.error('Debes iniciar sesión para realizar el pago')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/payments/mercadopago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          items,
          shipping,
          customer,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al procesar el pago')
      }

      const data = await response.json()
      
      // Redirigir al usuario a la página de pago de MercadoPago
      window.location.href = data.init_point
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  const total = items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0) + shipping.cost

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Resumen del Pago</h2>
      
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>{item.quantity}x {item.name}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        
        <div className="flex justify-between border-t pt-2">
          <span>Envío</span>
          <span>${shipping.cost.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between font-semibold text-lg border-t pt-2">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : (
          'Pagar con MercadoPago'
        )}
      </Button>

      <p className="text-sm text-gray-500 mt-4 text-center">
        Al hacer clic en "Pagar con MercadoPago" serás redirigido a la página de pago segura de MercadoPago
      </p>
    </Card>
  )
} 