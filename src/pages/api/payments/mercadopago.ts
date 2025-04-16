import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '@/lib/prisma'
import mercadopago from 'mercadopago'

// Configurar MercadoPago con el token de acceso
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  if (req.method === 'POST') {
    try {
      const { orderId, items, shipping, customer } = req.body

      // Validar datos requeridos
      if (!items || !items.length) {
        return res.status(400).json({ error: 'Se requieren items para el pago' })
      }

      // Crear preferencia de pago
      const preference = {
        items: items.map((item: any) => ({
          title: item.name,
          unit_price: Number(item.price),
          quantity: Number(item.quantity),
        })),
        payer: {
          name: customer.name,
          email: customer.email,
          phone: {
            number: customer.phone,
          },
          address: {
            street_name: customer.address,
          },
        },
        shipments: {
          cost: shipping.cost,
          mode: 'not_specified',
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending`,
        },
        auto_return: 'approved',
        external_reference: orderId,
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/webhook`,
      }

      const response = await mercadopago.preferences.create(preference)

      // Guardar la preferencia en la base de datos
      await prisma.payment.create({
        data: {
          orderId,
          provider: 'MERCADOPAGO',
          preferenceId: response.body.id,
          status: 'PENDING',
          amount: items.reduce((total: number, item: any) => 
            total + (item.price * item.quantity), 0) + shipping.cost,
          userId: session.user.id,
        },
      })

      return res.status(200).json({
        id: response.body.id,
        init_point: response.body.init_point,
      })
    } catch (error) {
      console.error('Error creating payment:', error)
      return res.status(500).json({ error: 'Error al crear el pago' })
    }
  }

  if (req.method === 'GET') {
    try {
      const { orderId } = req.query

      if (!orderId) {
        return res.status(400).json({ error: 'Se requiere el ID de la orden' })
      }

      const payment = await prisma.payment.findFirst({
        where: {
          orderId: String(orderId),
          userId: session.user.id,
        },
      })

      if (!payment) {
        return res.status(404).json({ error: 'Pago no encontrado' })
      }

      return res.status(200).json(payment)
    } catch (error) {
      console.error('Error fetching payment:', error)
      return res.status(500).json({ error: 'Error al obtener el pago' })
    }
  }

  res.setHeader('Allow', ['POST', 'GET'])
  return res.status(405).json({ error: `Método ${req.method} no permitido` })
} 