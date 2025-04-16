import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'No autorizado' })
  }

  if (req.method === 'GET') {
    try {
      const { status, page = '1', limit = '10' } = req.query
      const pageNumber = parseInt(page as string)
      const limitNumber = parseInt(limit as string)
      const skip = (pageNumber - 1) * limitNumber

      const where = status ? { status: status as string } : {}

      // Si es usuario normal, solo ver sus quejas
      if (session.user.role !== 'ADMIN') {
        where.userId = session.user.id
      }

      const [complaints, total] = await Promise.all([
        prisma.complaint.findMany({
          where,
          skip,
          take: limitNumber,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
            order: {
              select: {
                id: true,
                total: true,
                status: true,
              },
            },
            responses: {
              include: {
                user: {
                  select: {
                    name: true,
                    role: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        }),
        prisma.complaint.count({ where }),
      ])

      return res.status(200).json({
        complaints,
        pagination: {
          total,
          pages: Math.ceil(total / limitNumber),
          currentPage: pageNumber,
          limit: limitNumber,
        },
      })
    } catch (error) {
      console.error('Error al obtener quejas:', error)
      return res.status(500).json({ message: 'Error al obtener quejas' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { orderId, type, description, priority } = req.body

      if (!orderId || !type || !description) {
        return res.status(400).json({ message: 'Se requieren todos los campos obligatorios' })
      }

      // Verificar que la orden existe y pertenece al usuario
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      })

      if (!order) {
        return res.status(404).json({ message: 'Orden no encontrada' })
      }

      if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'No autorizado para esta orden' })
      }

      // Crear la queja
      const complaint = await prisma.complaint.create({
        data: {
          userId: session.user.id,
          orderId,
          type,
          description,
          priority: priority || 'MEDIUM',
          status: 'PENDING',
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          order: {
            select: {
              id: true,
              total: true,
              status: true,
            },
          },
        },
      })

      // Notificar a los administradores (aquí se implementaría la lógica de notificación)
      // notifyAdmins('Nueva queja registrada', complaint)

      return res.status(201).json(complaint)
    } catch (error) {
      console.error('Error al crear queja:', error)
      return res.status(500).json({ message: 'Error al crear queja' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, status, response } = req.body

      if (!id || !status) {
        return res.status(400).json({ message: 'Se requiere ID y estado' })
      }

      // Verificar que la queja existe
      const complaint = await prisma.complaint.findUnique({
        where: { id },
      })

      if (!complaint) {
        return res.status(404).json({ message: 'Queja no encontrada' })
      }

      // Solo administradores pueden cambiar el estado
      if (session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'No autorizado para cambiar el estado' })
      }

      // Actualizar la queja
      const updatedComplaint = await prisma.complaint.update({
        where: { id },
        data: { status },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          order: {
            select: {
              id: true,
              total: true,
              status: true,
            },
          },
          responses: {
            include: {
              user: {
                select: {
                  name: true,
                  role: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      })

      // Si hay una respuesta, agregarla
      if (response) {
        await prisma.complaintResponse.create({
          data: {
            complaintId: id,
            userId: session.user.id,
            content: response,
          },
        })
      }

      // Notificar al usuario (aquí se implementaría la lógica de notificación)
      // notifyUser(complaint.userId, 'Su queja ha sido actualizada', updatedComplaint)

      return res.status(200).json(updatedComplaint)
    } catch (error) {
      console.error('Error al actualizar queja:', error)
      return res.status(500).json({ message: 'Error al actualizar queja' })
    }
  }

  return res.status(405).json({ message: 'Método no permitido' })
} 