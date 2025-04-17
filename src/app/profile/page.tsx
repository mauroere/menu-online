'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { User, Lock, Mail, Phone, MapPin } from 'lucide-react'
import { signOut } from 'next-auth/react'

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
  const { data: session, status } = useSession()
  const router = useRouter()
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
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

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

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Nombre</h3>
              <p className="text-gray-600">{session.user?.name}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Email</h3>
              <p className="text-gray-600">{session.user?.email}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Rol</h3>
              <p className="text-gray-600">{session.user?.role}</p>
            </div>
            <Button
              variant="destructive"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>

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