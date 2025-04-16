import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  switch (req.method) {
    case 'GET':
      try {
        const notifications = await prisma.notification.findMany({
          where: {
            userId: session.user.id,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 50,
        })

        return res.status(200).json(notifications)
      } catch (error) {
        console.error('Error fetching notifications:', error)
        return res.status(500).json({ error: 'Error al cargar las notificaciones' })
      }

    case 'POST':
      try {
        const { type, message, data } = req.body

        if (!type || !message) {
          return res.status(400).json({ error: 'Faltan campos requeridos' })
        }

        const notification = await prisma.notification.create({
          data: {
            type,
            message,
            data,
            userId: session.user.id,
          },
        })

        return res.status(201).json(notification)
      } catch (error) {
        console.error('Error creating notification:', error)
        return res.status(500).json({ error: 'Error al crear la notificación' })
      }

    case 'PUT':
      try {
        const { id } = req.query
        const { read } = req.body

        if (!id) {
          return res.status(400).json({ error: 'ID de notificación requerido' })
        }

        const notification = await prisma.notification.update({
          where: {
            id: String(id),
            userId: session.user.id,
          },
          data: {
            read,
          },
        })

        return res.status(200).json(notification)
      } catch (error) {
        console.error('Error updating notification:', error)
        return res.status(500).json({ error: 'Error al actualizar la notificación' })
      }

    case 'DELETE':
      try {
        const { id } = req.query

        if (!id) {
          return res.status(400).json({ error: 'ID de notificación requerido' })
        }

        await prisma.notification.delete({
          where: {
            id: String(id),
            userId: session.user.id,
          },
        })

        return res.status(200).json({ message: 'Notificación eliminada' })
      } catch (error) {
        console.error('Error deleting notification:', error)
        return res.status(500).json({ error: 'Error al eliminar la notificación' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Método ${req.method} no permitido` })
  }
} 