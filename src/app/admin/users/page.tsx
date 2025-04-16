'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, UserPlus } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'SELLER' | 'CUSTOMER'
  createdAt: string
  lastLogin?: string
  isActive: boolean
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
  })

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `/api/admin/users?page=${currentPage}&search=${searchTerm}&role=${selectedRole}`
        )
        if (!response.ok) {
          throw new Error('Error al cargar los usuarios')
        }
        const data = await response.json()
        setUsers(data.users)
        setTotalPages(data.pagination.pages)
      } catch (error) {
        console.error('Error fetching users:', error)
        toast.error('Error al cargar los usuarios')
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchUsers()
    }
  }, [session, currentPage, searchTerm, selectedRole])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingUser
        ? `/api/admin/users?id=${editingUser.id}`
        : '/api/admin/users'
      const method = editingUser ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Error al guardar el usuario')
      }

      const updatedUser = await response.json()
      setUsers((prev) =>
        editingUser
          ? prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
          : [...prev, updatedUser]
      )

      toast.success(
        `Usuario ${editingUser ? 'actualizado' : 'creado'} correctamente`
      )
      resetForm()
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error('Error al guardar el usuario')
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el usuario')
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId))
      toast.success('Usuario eliminado correctamente')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error al eliminar el usuario')
    }
  }

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el estado del usuario')
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isActive: !isActive } : u
        )
      )

      toast.success('Estado del usuario actualizado correctamente')
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Error al actualizar el estado del usuario')
    }
  }

  const resetForm = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      role: '',
      password: '',
    })
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    })
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No tienes acceso a esta página</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={() => setEditingUser(null)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <Input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
        />
        <Select
          value={selectedRole}
          onValueChange={(value) => {
            setSelectedRole(value)
            setCurrentPage(1)
          }}
        >
          <option value="">Todos los roles</option>
          <option value="ADMIN">Administrador</option>
          <option value="SELLER">Vendedor</option>
          <option value="CUSTOMER">Cliente</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                  required
                >
                  <option value="">Seleccionar rol</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="SELLER">Vendedor</option>
                  <option value="CUSTOMER">Cliente</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!editingUser}
                />
              </div>

              <div className="flex justify-end gap-2">
                {editingUser && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancelar
                  </Button>
                )}
                <Button type="submit">
                  {editingUser ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                  >
                    {user.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
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