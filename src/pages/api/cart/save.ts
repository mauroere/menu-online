import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user) {
    return res.status(401).json({ message: 'No autorizado' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { name, items } = req.body

  if (!name || !items || !Array.isArray(items)) {
    return res.status(400).json({ message: 'Datos inválidos' })
  }

  try {
    const savedCart = await prisma.savedCart.create({
      data: {
        name,
        userId: session.user.id,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return res.status(200).json({
      id: savedCart.id,
      name: savedCart.name,
      items: savedCart.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      })),
    })
  } catch (error) {
    console.error('Error saving cart:', error)
    return res.status(500).json({ message: 'Error al guardar el carrito' })
  }
} 