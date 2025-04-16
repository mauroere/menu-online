'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { MapPin, Clock } from 'lucide-react'
import PaymentForm from '@/components/PaymentForm'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, coupon, shippingMethod, getSubtotal, getDiscount, getShipping, getTotal } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user) {
      toast.error('Debes iniciar sesión para realizar un pedido')
      return
    }

    if (!shippingMethod) {
      toast.error('Debes seleccionar un método de envío')
      return
    }

    try {
      setIsLoading(true)
      
      // Crear el pedido
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          shipping: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            method: shippingMethod.id,
          },
          coupon: coupon?.code,
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al procesar el pedido')
      }

      const order = await response.json()
      
      toast.success('Pedido creado con éxito')
      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error('Error during checkout:', error)
      toast.error('Error al procesar el pedido')
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Finalizar Compra</h1>
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
          <Button onClick={() => router.push('/')}>
            Continuar Comprando
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Finalizar Compra</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Dirección de Envío</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado/Provincia</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="zipCode">Código Postal</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Notas Adicionales</h2>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Instrucciones especiales para la entrega, etc."
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
              />
            </Card>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Procesando...' : 'Continuar al Pago'}
            </Button>
          </form>
        </div>
        
        <div>
          <Card className="p-4 mb-4">
            <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-2">x {item.quantity}</span>
                  </div>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                
                {coupon && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Descuento</span>
                    <span>-${getDiscount().toFixed(2)}</span>
                  </div>
                )}
                
                {shippingMethod && (
                  <div className="flex justify-between mb-2">
                    <span>Envío ({shippingMethod.name})</span>
                    <span>${getShipping().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-2 font-semibold">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {shippingMethod && (
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Información de Envío</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span>{shippingMethod.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span>Tiempo estimado: {shippingMethod.estimatedDays} días</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 