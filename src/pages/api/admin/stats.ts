import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get total orders and revenue
    const ordersStats = await prisma.order.aggregate({
      _count: {
        id: true,
      },
      _sum: {
        total: true,
      },
    })

    // Get pending orders count
    const pendingOrders = await prisma.order.count({
      where: {
        status: 'PENDING',
      },
    })

    // Get completed orders count
    const completedOrders = await prisma.order.count({
      where: {
        status: 'COMPLETED',
      },
    })

    // Get popular products
    const popularProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _count: {
        id: true,
      },
      _sum: {
        total: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    })

    // Get product details for popular products
    const productsWithDetails = await Promise.all(
      popularProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true },
        })
        return {
          id: product?.id,
          name: product?.name,
          totalOrders: item._count.id,
          revenue: item._sum.total || 0,
        }
      })
    )

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
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
    })

    return res.status(200).json({
      totalOrders: ordersStats._count.id,
      totalRevenue: ordersStats._sum.total || 0,
      pendingOrders,
      completedOrders,
      popularProducts: productsWithDetails,
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        createdAt: order.createdAt,
        status: order.status,
        total: order.total,
        user: order.user,
      })),
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return res.status(500).json({ message: 'Error al cargar las estadísticas' })
  }
} 