import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'No autorizado' })
  }

  const { id } = req.query

  // Obtener detalles del pedido
  if (req.method === 'GET') {
    try {
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
                  image: true,
                },
              },
            },
          },
          statusHistory: {
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          notes: {
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })

      if (!order) {
        return res.status(404).json({ message: 'Pedido no encontrado' })
      }

      return res.status(200).json(order)
    } catch (error) {
      console.error('Error al obtener detalles del pedido:', error)
      return res.status(500).json({ message: 'Error al obtener detalles del pedido' })
    }
  }

  // Actualizar detalles del pedido
  if (req.method === 'PUT') {
    try {
      const { deliveryAddress, deliveryNotes, cancelReason } = req.body

      const order = await prisma.order.findUnique({
        where: { id: id as string },
      })

      if (!order) {
        return res.status(404).json({ message: 'Pedido no encontrado' })
      }

      // Solo se puede actualizar si el pedido no está entregado o cancelado
      if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
        return res.status(400).json({ message: 'No se puede modificar un pedido entregado o cancelado' })
      }

      const updateData: any = {}

      if (deliveryAddress !== undefined) {
        updateData.deliveryAddress = deliveryAddress
      }

      if (deliveryNotes !== undefined) {
        updateData.deliveryNotes = deliveryNotes
      }

      // Si se proporciona un motivo de cancelación, cancelar el pedido
      if (cancelReason) {
        updateData.status = 'CANCELLED'
        
        // Crear nota de cancelación
        await prisma.orderNote.create({
          data: {
            orderId: id as string,
            userId: session.user.id,
            content: `Pedido cancelado. Motivo: ${cancelReason}`,
          },
        })
        
        // Registrar cambio de estado
        await prisma.orderStatusHistory.create({
          data: {
            orderId: id as string,
            userId: session.user.id,
            status: 'CANCELLED',
            note: cancelReason,
          },
        })
      }

      const updatedOrder = await prisma.order.update({
        where: { id: id as string },
        data: updateData,
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
          statusHistory: {
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          notes: {
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })

      return res.status(200).json(updatedOrder)
    } catch (error) {
      console.error('Error al actualizar detalles del pedido:', error)
      return res.status(500).json({ message: 'Error al actualizar detalles del pedido' })
    }
  }

  // Agregar nota al pedido
  if (req.method === 'POST') {
    try {
      const { content } = req.body

      if (!content) {
        return res.status(400).json({ message: 'Se requiere contenido para la nota' })
      }

      const order = await prisma.order.findUnique({
        where: { id: id as string },
      })

      if (!order) {
        return res.status(404).json({ message: 'Pedido no encontrado' })
      }

      const note = await prisma.orderNote.create({
        data: {
          orderId: id as string,
          userId: session.user.id,
          content,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      })

      return res.status(201).json(note)
    } catch (error) {
      console.error('Error al agregar nota al pedido:', error)
      return res.status(500).json({ message: 'Error al agregar nota al pedido' })
    }
  }

  return res.status(405).json({ message: 'Método no permitido' })
} 