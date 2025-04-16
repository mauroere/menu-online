'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react'

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
}

interface Permission {
  id: string
  name: string
  description: string
}

export default function RolesPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  })

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles')
      if (!response.ok) {
        throw new Error('Error al cargar los roles')
      }

      const data = await response.json()
      setRoles(data)
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Error al cargar los roles')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/admin/permissions')
      if (!response.ok) {
        throw new Error('Error al cargar los permisos')
      }

      const data = await response.json()
      setPermissions(data)
    } catch (error) {
      console.error('Error fetching permissions:', error)
      toast.error('Error al cargar los permisos')
    }
  }

  const handleCreateRole = async () => {
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRole),
      })

      if (!response.ok) {
        throw new Error('Error al crear el rol')
      }

      toast.success('Rol creado exitosamente')
      setNewRole({ name: '', description: '', permissions: [] })
      fetchRoles()
    } catch (error) {
      console.error('Error creating role:', error)
      toast.error('Error al crear el rol')
    }
  }

  const handleUpdateRole = async () => {
    if (!editingRole) return

    try {
      const response = await fetch(`/api/admin/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingRole),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el rol')
      }

      toast.success('Rol actualizado exitosamente')
      setEditingRole(null)
      fetchRoles()
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Error al actualizar el rol')
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este rol?')) return

    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el rol')
      }

      toast.success('Rol eliminado exitosamente')
      fetchRoles()
    } catch (error) {
      console.error('Error deleting role:', error)
      toast.error('Error al eliminar el rol')
    }
  }

  const togglePermission = (permissionId: string, rolePermissions: string[]) => {
    if (rolePermissions.includes(permissionId)) {
      return rolePermissions.filter((id) => id !== permissionId)
    }
    return [...rolePermissions, permissionId]
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Gestión de Roles</h1>
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No tienes acceso a esta página</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Gestión de Roles</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Roles</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Crear Nuevo Rol</h2>
        <div className="space-y-4">
          <Input
            placeholder="Nombre del rol"
            value={newRole.name}
            onChange={(e) =>
              setNewRole({ ...newRole, name: e.target.value })
            }
          />
          <Input
            placeholder="Descripción"
            value={newRole.description}
            onChange={(e) =>
              setNewRole({ ...newRole, description: e.target.value })
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissions.map((permission) => (
              <label
                key={permission.id}
                className="flex items-center space-x-2 p-2 border rounded"
              >
                <input
                  type="checkbox"
                  checked={newRole.permissions.includes(permission.id)}
                  onChange={() =>
                    setNewRole({
                      ...newRole,
                      permissions: togglePermission(
                        permission.id,
                        newRole.permissions
                      ),
                    })
                  }
                />
                <span>{permission.name}</span>
              </label>
            ))}
          </div>
          <Button onClick={handleCreateRole}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Rol
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="p-6">
            {editingRole?.id === role.id ? (
              <div className="space-y-4">
                <Input
                  value={editingRole.name}
                  onChange={(e) =>
                    setEditingRole({ ...editingRole, name: e.target.value })
                  }
                />
                <Input
                  value={editingRole.description}
                  onChange={(e) =>
                    setEditingRole({
                      ...editingRole,
                      description: e.target.value,
                    })
                  }
                />
                <div className="grid grid-cols-1 gap-2">
                  {permissions.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={editingRole.permissions.includes(
                          permission.id
                        )}
                        onChange={() =>
                          setEditingRole({
                            ...editingRole,
                            permissions: togglePermission(
                              permission.id,
                              editingRole.permissions
                            ),
                          })
                        }
                      />
                      <span>{permission.name}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingRole(null)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateRole}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{role.name}</h3>
                    <p className="text-gray-500">{role.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingRole(role)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteRole(role.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {role.permissions.map((permissionId) => {
                    const permission = permissions.find(
                      (p) => p.id === permissionId
                    )
                    return (
                      <div
                        key={permissionId}
                        className="text-sm text-gray-600"
                      >
                        {permission?.name}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
} 