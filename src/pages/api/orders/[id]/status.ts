import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'

const prisma = new PrismaClient()

// Definir transiciones de estado permitidas
const allowedTransitions: Record<string, string[]> = {
  'PENDING': ['PREPARING', 'CANCELLED'],
  'PREPARING': ['READY', 'CANCELLED'],
  'READY': ['DELIVERED', 'CANCELLED'],
  'DELIVERED': [], // Estado final
  'CANCELLED': [], // Estado final
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'No autorizado' })
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Método no permitido' })
  }

  try {
    const { id } = req.query
    const { status, note } = req.body

    if (!status || !['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ message: 'Estado de pedido inválido' })
    }

    const order = await prisma.order.findUnique({
      where: { id: id as string },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    // Verificar si la transición de estado está permitida
    const allowedNextStates = allowedTransitions[order.status]
    if (!allowedNextStates.includes(status)) {
      return res.status(400).json({ 
        message: `No se puede cambiar el estado de ${order.status} a ${status}`,
        allowedTransitions: allowedNextStates
      })
    }

    // Actualizar el estado del pedido
    const updatedOrder = await prisma.order.update({
      where: { id: id as string },
      data: { status },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    })

    // Registrar el cambio de estado en el historial
    await prisma.orderStatusHistory.create({
      data: {
        orderId: id as string,
        userId: session.user.id,
        status,
        note: note || `Estado cambiado de ${order.status} a ${status}`,
      },
    })

    // Si se proporciona una nota, agregarla al pedido
    if (note) {
      await prisma.orderNote.create({
        data: {
          orderId: id as string,
          userId: session.user.id,
          content: note,
        },
      })
    }

    // Aquí se podría agregar lógica para enviar notificaciones al cliente
    // cuando el estado cambia a READY o DELIVERED

    return res.status(200).json(updatedOrder)
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error)
    return res.status(500).json({ message: 'Error al actualizar estado del pedido' })
  }
} 