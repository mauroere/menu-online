'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { User, Lock, Mail, Phone, MapPin } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  role: string
}

interface Order {
  id: string
  createdAt: string
  status: string
  total: number
  items: {
    id: string
    name: string
    quantity: number
    price: number
  }[]
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
      fetchOrders()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (!response.ok) {
        throw new Error('Error al cargar el perfil')
      }
      const data = await response.json()
      setProfile(data)
      setFormData({
        ...formData,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Error al cargar el perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/user/orders')
      if (!response.ok) {
        throw new Error('Error al cargar las órdenes')
      }
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Error al cargar las órdenes')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el perfil')
      }

      toast.success('Perfil actualizado correctamente')
      fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error al actualizar el perfil')
    } finally {
      setIsSaving(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">Debes iniciar sesión para ver tu perfil</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Información Personal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-500" />
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre completo"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-gray-500" />
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Correo electrónico"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-gray-500" />
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Teléfono"
              />
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Dirección"
              />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Cambiar Contraseña</h2>
          <form className="space-y-4">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-gray-500" />
              <Input
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Contraseña actual"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-gray-500" />
              <Input
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Nueva contraseña"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-gray-500" />
              <Input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmar nueva contraseña"
              />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Cambiando...' : 'Cambiar contraseña'}
            </Button>
          </form>
        </Card>
      </div>

      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Mis Órdenes</h2>
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">Orden #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${order.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{order.status}</p>
                </div>
              </div>
              <div className="mt-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm text-gray-600"
                  >
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
} 