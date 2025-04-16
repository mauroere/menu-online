import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const allowedTransitions = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'SELLER') {
    return res.status(401).json({ error: 'No autorizado' })
  }

  const { id } = req.query
  const sellerId = session.user.id

  if (req.method === 'PUT') {
    try {
      const { status, note } = req.body

      // Verificar que el pedido existe y pertenece al vendedor
      const order = await prisma.order.findFirst({
        where: {
          id: id as string,
          sellerId,
        },
      })

      if (!order) {
        return res.status(404).json({ error: 'Pedido no encontrado' })
      }

      // Verificar que la transición de estado es válida
      const allowedStatuses = allowedTransitions[order.status]
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: `No se puede cambiar el estado de ${order.status} a ${status}`,
        })
      }

      // Actualizar el estado del pedido
      const updatedOrder = await prisma.order.update({
        where: { id: id as string },
        data: { status },
      })

      // Crear registro en el historial de estados
      await prisma.orderStatusHistory.create({
        data: {
          orderId: id as string,
          status,
          note,
          updatedBy: sellerId,
        },
      })

      // Si se proporciona una nota, crearla
      if (note) {
        await prisma.orderNote.create({
          data: {
            orderId: id as string,
            content: note,
            createdBy: sellerId,
          },
        })
      }

      return res.status(200).json(updatedOrder)
    } catch (error) {
      console.error('Error updating order status:', error)
      return res.status(500).json({ error: 'Error al actualizar el estado del pedido' })
    }
  }

  res.setHeader('Allow', ['PUT'])
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
} 