import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import mercadopago from 'mercadopago'

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Método ${req.method} no permitido` })
  }

  try {
    const { type, data } = req.body

    if (type === 'payment') {
      const paymentId = data.id
      const payment = await mercadopago.payment.findById(paymentId)

      if (payment.body.status === 'approved') {
        // Actualizar el pago en la base de datos
        await prisma.payment.update({
          where: {
            preferenceId: payment.body.preference_id,
          },
          data: {
            status: 'COMPLETED',
            transactionId: payment.body.id.toString(),
            paymentMethod: payment.body.payment_method_id,
            paymentType: payment.body.payment_type_id,
            installments: payment.body.installments,
            processedAt: new Date(),
          },
        })

        // Actualizar el estado de la orden
        await prisma.order.update({
          where: {
            id: payment.body.external_reference,
          },
          data: {
            status: 'PAID',
            paymentStatus: 'COMPLETED',
          },
        })

        // Crear notificación para el usuario
        await prisma.notification.create({
          data: {
            userId: payment.body.payer.id,
            type: 'PAYMENT',
            message: 'Tu pago ha sido procesado exitosamente',
            data: {
              orderId: payment.body.external_reference,
              amount: payment.body.transaction_amount,
            },
          },
        })
      } else if (payment.body.status === 'rejected') {
        // Actualizar el pago como rechazado
        await prisma.payment.update({
          where: {
            preferenceId: payment.body.preference_id,
          },
          data: {
            status: 'REJECTED',
            transactionId: payment.body.id.toString(),
            paymentMethod: payment.body.payment_method_id,
            paymentType: payment.body.payment_type_id,
            processedAt: new Date(),
          },
        })

        // Actualizar el estado de la orden
        await prisma.order.update({
          where: {
            id: payment.body.external_reference,
          },
          data: {
            status: 'PAYMENT_FAILED',
            paymentStatus: 'REJECTED',
          },
        })

        // Crear notificación para el usuario
        await prisma.notification.create({
          data: {
            userId: payment.body.payer.id,
            type: 'PAYMENT',
            message: 'Tu pago fue rechazado',
            data: {
              orderId: payment.body.external_reference,
              reason: payment.body.status_detail,
            },
          },
        })
      }
    }

    return res.status(200).json({ message: 'Webhook processed successfully' })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return res.status(500).json({ error: 'Error processing webhook' })
  }
} 