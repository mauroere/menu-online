import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface ShippingMethod {
  id: string
  name: string
  price: number
  estimatedDays: string
}

interface Coupon {
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  minPurchase?: number
}

export function useCart() {
  const { data: session } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null)
  const [savedCarts, setSavedCarts] = useState<{ id: string; name: string; items: CartItem[] }[]>([])

  // Cargar el carrito desde localStorage o la base de datos si el usuario está autenticado
  useEffect(() => {
    const loadCart = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/cart')
          const data = await response.json()
          if (data.items) {
            setItems(data.items)
          }
          if (data.savedCarts) {
            setSavedCarts(data.savedCarts)
          }
        } catch (error) {
          console.error('Error loading cart:', error)
        }
      } else {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          setItems(JSON.parse(savedCart))
        }
      }
    }
    loadCart()
  }, [session])

  // Guardar el carrito en localStorage o la base de datos
  useEffect(() => {
    const saveCart = async () => {
      if (session?.user) {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, coupon, shippingMethod }),
          })
        } catch (error) {
          console.error('Error saving cart:', error)
        }
      } else {
        localStorage.setItem('cart', JSON.stringify(items))
      }
    }
    saveCart()
  }, [items, coupon, shippingMethod, session])

  const addToCart = (product: CartItem) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id)
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...currentItems, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setItems(currentItems =>
      currentItems.filter(item => item.id !== productId)
    )
  }

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    setCoupon(null)
    setShippingMethod(null)
  }

  const applyCoupon = async (code: string) => {
    try {
      const response = await fetch(`/api/coupons/validate?code=${code}`)
      const data = await response.json()
      
      if (data.valid) {
        setCoupon(data.coupon)
        return { success: true, message: 'Cupón aplicado correctamente' }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Error applying coupon:', error)
      return { success: false, message: 'Error al aplicar el cupón' }
    }
  }

  const removeCoupon = () => {
    setCoupon(null)
  }

  const saveCart = async (name: string) => {
    if (session?.user) {
      try {
        const response = await fetch('/api/cart/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, items }),
        })
        const data = await response.json()
        setSavedCarts([...savedCarts, data])
        return { success: true, message: 'Carrito guardado correctamente' }
      } catch (error) {
        console.error('Error saving cart:', error)
        return { success: false, message: 'Error al guardar el carrito' }
      }
    }
    return { success: false, message: 'Debes iniciar sesión para guardar el carrito' }
  }

  const loadSavedCart = async (cartId: string) => {
    if (session?.user) {
      try {
        const response = await fetch(`/api/cart/saved/${cartId}`)
        const data = await response.json()
        setItems(data.items)
        return { success: true, message: 'Carrito cargado correctamente' }
      } catch (error) {
        console.error('Error loading saved cart:', error)
        return { success: false, message: 'Error al cargar el carrito' }
      }
    }
    return { success: false, message: 'Debes iniciar sesión para cargar el carrito' }
  }

  const setShipping = (method: ShippingMethod) => {
    setShippingMethod(method)
  }

  const getSubtotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getDiscount = () => {
    if (!coupon) return 0
    const subtotal = getSubtotal()
    if (coupon.type === 'percentage') {
      return (subtotal * coupon.discount) / 100
    }
    return coupon.discount
  }

  const getShipping = () => {
    return shippingMethod?.price || 0
  }

  const getTotal = () => {
    const subtotal = getSubtotal()
    const discount = getDiscount()
    const shipping = getShipping()
    return subtotal - discount + shipping
  }

  return {
    items,
    coupon,
    shippingMethod,
    savedCarts,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    saveCart,
    loadSavedCart,
    setShipping,
    getSubtotal,
    getDiscount,
    getShipping,
    getTotal,
  }
} 