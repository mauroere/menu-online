'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, Minus, Save, Truck, Tag } from 'lucide-react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const shippingMethods = [
  {
    id: 'standard',
    name: 'Envío Estándar',
    price: 5.99,
    estimatedDays: '3-5 días hábiles'
  },
  {
    id: 'express',
    name: 'Envío Express',
    price: 12.99,
    estimatedDays: '1-2 días hábiles'
  },
  {
    id: 'same-day',
    name: 'Entrega el mismo día',
    price: 24.99,
    estimatedDays: 'En el día'
  }
]

export default function CartPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const {
    items,
    coupon,
    shippingMethod,
    savedCarts,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    saveCart,
    loadSavedCart,
    setShipping,
    getSubtotal,
    getDiscount,
    getShipping,
    getTotal
  } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [cartName, setCartName] = useState('')

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode) return
    const result = await applyCoupon(couponCode)
    if (result.success) {
      toast.success(result.message)
      setCouponCode('')
    } else {
      toast.error(result.message)
    }
  }

  const handleSaveCart = async () => {
    if (!cartName) return
    const result = await saveCart(cartName)
    if (result.success) {
      toast.success(result.message)
      setIsSaveDialogOpen(false)
      setCartName('')
    } else {
      toast.error(result.message)
    }
  }

  const handleLoadCart = async (cartId: string) => {
    const result = await loadSavedCart(cartId)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      // Aquí iría la lógica para procesar el pago
      // Por ahora solo redirigimos a una página de confirmación
      router.push('/checkout')
    } catch (error) {
      console.error('Error al procesar el pago:', error)
      toast.error('Error al procesar el pago')
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Carrito de Compras</h1>
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
      <h1 className="text-2xl font-bold mb-4">Carrito de Compras</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <Card key={item.id} className="p-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">${item.price.toFixed(2)}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                      className="w-16 text-center"
                    />
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
            
            {/* Cupones */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4" />
                <h3 className="font-medium">Cupón de descuento</h3>
              </div>
              {coupon ? (
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                  <span className="text-sm text-green-700">{coupon.code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCoupon()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Ingresa tu código"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button onClick={handleApplyCoupon}>
                    Aplicar
                  </Button>
                </div>
              )}
            </div>

            {/* Envío */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4" />
                <h3 className="font-medium">Método de envío</h3>
              </div>
              <Select
                value={shippingMethod?.id}
                onValueChange={(value) => {
                  const method = shippingMethods.find(m => m.id === value)
                  if (method) setShipping(method)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un método de envío" />
                </SelectTrigger>
                <SelectContent>
                  {shippingMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name} - ${method.price.toFixed(2)} ({method.estimatedDays})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Guardar carrito */}
            {session?.user && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Save className="h-4 w-4" />
                  <h3 className="font-medium">Guardar carrito</h3>
                </div>
                <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Guardar carrito actual
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Guardar carrito</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Nombre del carrito"
                        value={cartName}
                        onChange={(e) => setCartName(e.target.value)}
                      />
                      <Button onClick={handleSaveCart} className="w-full">
                        Guardar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {savedCarts.length > 0 && (
                  <div className="mt-2">
                    <Select onValueChange={handleLoadCart}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cargar carrito guardado" />
                      </SelectTrigger>
                      <SelectContent>
                        {savedCarts.map((cart) => (
                          <SelectItem key={cart.id} value={cart.id}>
                            {cart.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${getSubtotal().toFixed(2)}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento</span>
                  <span>-${getDiscount().toFixed(2)}</span>
                </div>
              )}
              {shippingMethod && (
                <div className="flex justify-between">
                  <span>Envío</span>
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
            
            <Button
              className="w-full"
              onClick={handleCheckout}
              disabled={isLoading || !shippingMethod}
            >
              {isLoading ? 'Procesando...' : 'Proceder al Pago'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
} 