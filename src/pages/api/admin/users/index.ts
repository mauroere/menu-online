import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'No autorizado' })
  }

  switch (req.method) {
    case 'GET':
      try {
        const { page = '1', limit = '10', search, role } = req.query
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

        const where = {
          ...(search && {
            OR: [
              { name: { contains: search as string, mode: 'insensitive' } },
              { email: { contains: search as string, mode: 'insensitive' } },
            ],
          }),
          ...(role && { role: role as string }),
        }

        const [users, total] = await Promise.all([
          prisma.user.findMany({
            where,
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            skip,
            take: parseInt(limit as string),
          }),
          prisma.user.count({ where }),
        ])

        return res.status(200).json({
          users,
          pagination: {
            total,
            pages: Math.ceil(total / parseInt(limit as string)),
            currentPage: parseInt(page as string),
          },
        })
      } catch (error) {
        console.error('Error fetching users:', error)
        return res.status(500).json({ error: 'Error al obtener los usuarios' })
      }

    case 'POST':
      try {
        const { name, email, password, role } = req.body

        // Verificar si el email ya existe
        const existingUser = await prisma.user.findUnique({
          where: { email },
        })

        if (existingUser) {
          return res.status(400).json({ error: 'El email ya está registrado' })
        }

        // Hash de la contraseña
        const hashedPassword = await hash(password, 12)

        const user = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        })

        return res.status(201).json(user)
      } catch (error) {
        console.error('Error creating user:', error)
        return res.status(500).json({ error: 'Error al crear el usuario' })
      }

    case 'PUT':
      try {
        const { id, name, email, role, password } = req.body

        const data: any = {
          name,
          email,
          role,
        }

        // Si se proporciona una nueva contraseña, hashearla
        if (password) {
          data.password = await hash(password, 12)
        }

        const user = await prisma.user.update({
          where: { id },
          data,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        })

        return res.status(200).json(user)
      } catch (error) {
        console.error('Error updating user:', error)
        return res.status(500).json({ error: 'Error al actualizar el usuario' })
      }

    case 'DELETE':
      try {
        const { id } = req.query

        // No permitir eliminar el último administrador
        const adminCount = await prisma.user.count({
          where: { role: 'ADMIN' },
        })

        const userToDelete = await prisma.user.findUnique({
          where: { id: id as string },
          select: { role: true },
        })

        if (adminCount === 1 && userToDelete?.role === 'ADMIN') {
          return res.status(400).json({
            error: 'No se puede eliminar el último administrador',
          })
        }

        await prisma.user.delete({
          where: { id: id as string },
        })

        return res.status(200).json({ message: 'Usuario eliminado correctamente' })
      } catch (error) {
        console.error('Error deleting user:', error)
        return res.status(500).json({ error: 'Error al eliminar el usuario' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
} 