import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'SELLER') {
    return res.status(401).json({ error: 'No autorizado' })
  }

  const sellerId = session.user.id

  switch (req.method) {
    case 'GET':
      try {
        const { status, page = '1', limit = '10' } = req.query
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

        const where = {
          sellerId,
          ...(status && { status: status as string }),
        }

        const [orders, total] = await Promise.all([
          prisma.order.findMany({
            where,
            include: {
              items: {
                include: {
                  product: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            skip,
            take: parseInt(limit as string),
          }),
          prisma.order.count({ where }),
        ])

        return res.status(200).json({
          orders,
          pagination: {
            total,
            pages: Math.ceil(total / parseInt(limit as string)),
            currentPage: parseInt(page as string),
          },
        })
      } catch (error) {
        console.error('Error fetching seller orders:', error)
        return res.status(500).json({ error: 'Error al obtener los pedidos' })
      }

    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
} 