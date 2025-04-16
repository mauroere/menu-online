import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: String(id) },
      include: {
        items: {
          include: {
            product: true,
            modifiers: {
              include: {
                option: true
              }
            }
          }
        },
        payment: true,
        address: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    return res.status(200).json({ order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 