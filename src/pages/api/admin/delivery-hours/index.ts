import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ message: 'No autorizado' })
  }

  if (req.method === 'GET') {
    try {
      const { date } = req.query
      const targetDate = date ? new Date(date as string) : new Date()

      // Obtener horarios disponibles para la fecha
      const deliveryHours = await prisma.deliveryHours.findMany({
        where: {
          date: {
            gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            lt: new Date(targetDate.setHours(23, 59, 59, 999)),
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      })

      // Obtener órdenes programadas para la fecha
      const scheduledOrders = await prisma.order.count({
        where: {
          scheduledDeliveryTime: {
            gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            lt: new Date(targetDate.setHours(23, 59, 59, 999)),
          },
        },
      })

      return res.status(200).json({
        deliveryHours,
        scheduledOrders,
      })
    } catch (error) {
      console.error('Error al obtener horarios:', error)
      return res.status(500).json({ message: 'Error al obtener horarios' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { date, startTime, endTime, maxOrders, isBlocked } = req.body

      if (!date || !startTime || !endTime) {
        return res.status(400).json({ message: 'Se requieren fecha, hora de inicio y hora de fin' })
      }

      // Verificar si ya existe un horario para ese período
      const existingHours = await prisma.deliveryHours.findFirst({
        where: {
          date: new Date(date),
          OR: [
            {
              AND: [
                { startTime: { lte: new Date(startTime) } },
                { endTime: { gt: new Date(startTime) } },
              ],
            },
            {
              AND: [
                { startTime: { lt: new Date(endTime) } },
                { endTime: { gte: new Date(endTime) } },
              ],
            },
          ],
        },
      })

      if (existingHours) {
        return res.status(400).json({ message: 'Ya existe un horario configurado para este período' })
      }

      // Crear el horario
      const deliveryHours = await prisma.deliveryHours.create({
        data: {
          date: new Date(date),
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          maxOrders: maxOrders || null,
          isBlocked: isBlocked || false,
        },
      })

      return res.status(201).json(deliveryHours)
    } catch (error) {
      console.error('Error al crear horario:', error)
      return res.status(500).json({ message: 'Error al crear horario' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, maxOrders, isBlocked } = req.body

      if (!id) {
        return res.status(400).json({ message: 'Se requiere el ID del horario' })
      }

      // Actualizar el horario
      const deliveryHours = await prisma.deliveryHours.update({
        where: { id },
        data: {
          maxOrders,
          isBlocked,
        },
      })

      return res.status(200).json(deliveryHours)
    } catch (error) {
      console.error('Error al actualizar horario:', error)
      return res.status(500).json({ message: 'Error al actualizar horario' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query

      if (!id) {
        return res.status(400).json({ message: 'Se requiere el ID del horario' })
      }

      // Verificar si hay órdenes programadas para este horario
      const scheduledOrders = await prisma.order.count({
        where: {
          scheduledDeliveryTime: {
            gte: new Date(id as string),
            lt: new Date(new Date(id as string).getTime() + 3600000), // 1 hora después
          },
        },
      })

      if (scheduledOrders > 0) {
        return res.status(400).json({ 
          message: 'No se puede eliminar el horario porque hay órdenes programadas',
          scheduledOrders,
        })
      }

      // Eliminar el horario
      await prisma.deliveryHours.delete({
        where: { id: id as string },
      })

      return res.status(200).json({ message: 'Horario eliminado correctamente' })
    } catch (error) {
      console.error('Error al eliminar horario:', error)
      return res.status(500).json({ message: 'Error al eliminar horario' })
    }
  }

  return res.status(405).json({ message: 'Método no permitido' })
} 