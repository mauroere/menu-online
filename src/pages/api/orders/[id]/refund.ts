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

  if (req.method === 'POST') {
    try {
      const { reason, amount, partialRefund } = req.body

      if (!reason) {
        return res.status(400).json({ message: 'Se requiere una razón para el reembolso' })
      }

      const order = await prisma.order.findUnique({
        where: { id: id as string },
        include: {
          refunds: true,
        },
      })

      if (!order) {
        return res.status(404).json({ message: 'Orden no encontrada' })
      }

      // Verificar si la orden es reembolsable
      if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
        return res.status(400).json({ message: 'La orden no es reembolsable' })
      }

      // Calcular el monto reembolsable
      const refundedAmount = order.refundedAmount || 0
      const remainingAmount = order.total - refundedAmount
      const refundAmount = amount || remainingAmount

      if (refundAmount <= 0) {
        return res.status(400).json({ message: 'El monto del reembolso debe ser mayor a 0' })
      }

      if (refundAmount > remainingAmount) {
        return res.status(400).json({ message: 'El monto del reembolso excede el monto disponible' })
      }

      // Crear el reembolso
      const refund = await prisma.orderRefund.create({
        data: {
          orderId: id as string,
          amount: refundAmount,
          reason,
          processedBy: session.user.id,
          status: 'PENDING',
        },
      })

      // Actualizar el estado de la orden si es reembolso total
      if (!partialRefund && refundAmount === remainingAmount) {
        await prisma.order.update({
          where: { id: id as string },
          data: {
            status: 'REFUNDED',
            refundedAmount: order.total,
          },
        })

        // Registrar el cambio de estado
        await prisma.orderStatusHistory.create({
          data: {
            orderId: id as string,
            userId: session.user.id,
            status: 'REFUNDED',
            note: `Reembolso total por: ${reason}`,
          },
        })
      } else {
        // Actualizar el monto reembolsado
        await prisma.order.update({
          where: { id: id as string },
          data: {
            refundedAmount: refundedAmount + refundAmount,
          },
        })
      }

      // Agregar nota sobre el reembolso
      await prisma.orderNote.create({
        data: {
          orderId: id as string,
          userId: session.user.id,
          content: `Reembolso de $${refundAmount} procesado. Razón: ${reason}`,
        },
      })

      return res.status(201).json(refund)
    } catch (error) {
      console.error('Error al procesar reembolso:', error)
      return res.status(500).json({ message: 'Error al procesar reembolso' })
    }
  }

  if (req.method === 'GET') {
    try {
      const refunds = await prisma.orderRefund.findMany({
        where: { orderId: id as string },
        include: {
          processedByUser: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return res.status(200).json(refunds)
    } catch (error) {
      console.error('Error al obtener reembolsos:', error)
      return res.status(500).json({ message: 'Error al obtener reembolsos' })
    }
  }

  return res.status(405).json({ message: 'Método no permitido' })
} 