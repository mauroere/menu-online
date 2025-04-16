import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import mercadopago from 'mercadopago'
import { Twilio } from 'twilio'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

const prisma = new PrismaClient()

// Configure MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN!
})

// Configure Twilio
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'No autorizado' })
  }

  if (req.method === 'GET') {
    try {
      const {
        page = '1',
        limit = '10',
        status,
        startDate,
        endDate,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query

      const pageNumber = parseInt(page as string)
      const limitNumber = parseInt(limit as string)
      const skip = (pageNumber - 1) * limitNumber

      // Construir el where clause
      const where: any = {}
      
      if (status) {
        where.status = status
      }

      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) {
          where.createdAt.gte = new Date(startDate as string)
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate as string)
        }
      }

      if (search) {
        where.OR = [
          { id: { contains: search as string } },
          { user: { name: { contains: search as string } } },
          { user: { email: { contains: search as string } } },
        ]
      }

      // Obtener órdenes con paginación
      const orders = await prisma.order.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: {
          [sortBy as string]: sortOrder,
        },
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

      // Obtener el total de órdenes para la paginación
      const total = await prisma.order.count({ where })

      // Obtener estadísticas básicas
      const stats = await prisma.order.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
        _sum: {
          total: true,
        },
      })

      return res.status(200).json({
        orders,
        pagination: {
          total,
          pages: Math.ceil(total / limitNumber),
          currentPage: pageNumber,
          limit: limitNumber,
        },
        stats: stats.reduce((acc, curr) => {
          acc[curr.status] = {
            count: curr._count.status,
            total: curr._sum.total,
          }
          return acc
        }, {} as Record<string, { count: number; total: number }>),
      })
    } catch (error) {
      console.error('Error al obtener órdenes:', error)
      return res.status(500).json({ message: 'Error al obtener órdenes' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { items, deliveryAddress, deliveryNotes } = req.body

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Se requieren items para el pedido' })
      }

      // Calcular el total y verificar disponibilidad de productos
      let total = 0
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        })

        if (!product) {
          return res.status(400).json({ message: `Producto ${item.productId} no encontrado` })
        }

        if (!product.available) {
          return res.status(400).json({ message: `Producto ${product.name} no está disponible` })
        }

        total += product.price * item.quantity
      }

      // Crear el pedido
      const order = await prisma.order.create({
        data: {
          userId: session.user.id,
          status: 'PENDING',
          total,
          deliveryAddress,
          deliveryNotes,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
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

      // Registrar el estado inicial en el historial
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          userId: session.user.id,
          status: 'PENDING',
          note: 'Pedido creado',
        },
      })

      return res.status(201).json(order)
    } catch (error) {
      console.error('Error al crear pedido:', error)
      return res.status(500).json({ message: 'Error al crear pedido' })
    }
  }

  return res.status(405).json({ message: 'Método no permitido' })
} 