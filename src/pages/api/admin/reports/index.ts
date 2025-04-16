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
      const { startDate, endDate, type } = req.query

      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30))
      const end = endDate ? new Date(endDate as string) : new Date()

      switch (type) {
        case 'sales':
          // Reporte de ventas
          const salesReport = await prisma.order.groupBy({
            by: ['status'],
            where: {
              createdAt: {
                gte: start,
                lte: end,
              },
            },
            _count: {
              id: true,
            },
            _sum: {
              total: true,
            },
          })

          // Ventas por día
          const dailySales = await prisma.order.groupBy({
            by: ['createdAt'],
            where: {
              createdAt: {
                gte: start,
                lte: end,
              },
            },
            _sum: {
              total: true,
            },
          })

          return res.status(200).json({
            summary: salesReport,
            dailySales: dailySales.map(day => ({
              date: day.createdAt,
              total: day._sum.total,
            })),
          })

        case 'products':
          // Productos más vendidos
          const topProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
              order: {
                createdAt: {
                  gte: start,
                  lte: end,
                },
              },
            },
            _sum: {
              quantity: true,
            },
            orderBy: {
              _sum: {
                quantity: 'desc',
              },
            },
            take: 10,
          })

          const productsWithDetails = await Promise.all(
            topProducts.map(async (item) => {
              const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { name: true, price: true },
              })
              return {
                ...item,
                product,
              }
            })
          )

          return res.status(200).json(productsWithDetails)

        case 'preparation':
          // Tiempo promedio de preparación
          const preparationTimes = await prisma.orderStatusHistory.groupBy({
            by: ['orderId'],
            where: {
              order: {
                createdAt: {
                  gte: start,
                  lte: end,
                },
              },
              status: {
                in: ['PREPARING', 'READY'],
              },
            },
            _min: {
              createdAt: true,
            },
            _max: {
              createdAt: true,
            },
          })

          const avgPreparationTime = preparationTimes.reduce((acc, curr) => {
            const time = curr._max.createdAt.getTime() - curr._min.createdAt.getTime()
            return acc + time
          }, 0) / preparationTimes.length

          return res.status(200).json({
            averagePreparationTime: avgPreparationTime,
            totalOrders: preparationTimes.length,
          })

        case 'satisfaction':
          // Satisfacción del cliente
          const satisfactionRatings = await prisma.order.groupBy({
            by: ['rating'],
            where: {
              createdAt: {
                gte: start,
                lte: end,
              },
              rating: {
                not: null,
              },
            },
            _count: {
              id: true,
            },
          })

          const totalRatings = satisfactionRatings.reduce((acc, curr) => acc + curr._count.id, 0)
          const averageRating = satisfactionRatings.reduce((acc, curr) => acc + (curr.rating * curr._count.id), 0) / totalRatings

          return res.status(200).json({
            ratings: satisfactionRatings,
            averageRating,
            totalRatings,
          })

        default:
          return res.status(400).json({ message: 'Tipo de reporte no válido' })
      }
    } catch (error) {
      console.error('Error al generar reporte:', error)
      return res.status(500).json({ message: 'Error al generar reporte' })
    }
  }

  return res.status(405).json({ message: 'Método no permitido' })
} 