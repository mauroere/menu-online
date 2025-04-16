import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const defaultRoles = {
  ADMIN: {
    name: 'Administrador',
    permissions: ['*'],
  },
  SELLER: {
    name: 'Vendedor',
    permissions: [
      'manage_products',
      'manage_orders',
      'view_reports',
      'manage_inventory',
    ],
  },
  CUSTOMER: {
    name: 'Cliente',
    permissions: [
      'view_products',
      'create_orders',
      'view_orders',
      'manage_profile',
    ],
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'No autorizado' })
  }

  switch (req.method) {
    case 'GET':
      try {
        const roles = await prisma.role.findMany({
          include: {
            permissions: true,
          },
        })

        return res.status(200).json(roles)
      } catch (error) {
        console.error('Error fetching roles:', error)
        return res.status(500).json({ error: 'Error al obtener los roles' })
      }

    case 'POST':
      try {
        const { code, name, permissions } = req.body

        // Verificar si el rol ya existe
        const existingRole = await prisma.role.findUnique({
          where: { code },
        })

        if (existingRole) {
          return res.status(400).json({ error: 'El rol ya existe' })
        }

        const role = await prisma.role.create({
          data: {
            code,
            name,
            permissions: {
              create: permissions.map((permission: string) => ({
                name: permission,
              })),
            },
          },
          include: {
            permissions: true,
          },
        })

        return res.status(201).json(role)
      } catch (error) {
        console.error('Error creating role:', error)
        return res.status(500).json({ error: 'Error al crear el rol' })
      }

    case 'PUT':
      try {
        const { id, name, permissions } = req.body

        // Eliminar permisos existentes
        await prisma.permission.deleteMany({
          where: { roleId: id },
        })

        // Actualizar rol y crear nuevos permisos
        const role = await prisma.role.update({
          where: { id },
          data: {
            name,
            permissions: {
              create: permissions.map((permission: string) => ({
                name: permission,
              })),
            },
          },
          include: {
            permissions: true,
          },
        })

        return res.status(200).json(role)
      } catch (error) {
        console.error('Error updating role:', error)
        return res.status(500).json({ error: 'Error al actualizar el rol' })
      }

    case 'DELETE':
      try {
        const { id } = req.query

        // Verificar si es un rol por defecto
        const role = await prisma.role.findUnique({
          where: { id: id as string },
        })

        if (role && Object.keys(defaultRoles).includes(role.code)) {
          return res.status(400).json({
            error: 'No se pueden eliminar los roles por defecto',
          })
        }

        // Eliminar permisos asociados
        await prisma.permission.deleteMany({
          where: { roleId: id as string },
        })

        // Eliminar rol
        await prisma.role.delete({
          where: { id: id as string },
        })

        return res.status(200).json({ message: 'Rol eliminado correctamente' })
      } catch (error) {
        console.error('Error deleting role:', error)
        return res.status(500).json({ error: 'Error al eliminar el rol' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
} 