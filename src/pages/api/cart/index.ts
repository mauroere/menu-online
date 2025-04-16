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

  if (req.method === 'GET') {
    try {
      const cart = await prisma.cart.findFirst({
        where: { userId: session.user.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      const savedCarts = await prisma.savedCart.findMany({
        where: { userId: session.user.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      return res.status(200).json({
        items: cart?.items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        })) || [],
        savedCarts: savedCarts.map(cart => ({
          id: cart.id,
          name: cart.name,
          items: cart.items.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image,
          })),
        })),
      })
    } catch (error) {
      console.error('Error fetching cart:', error)
      return res.status(500).json({ message: 'Error al obtener el carrito' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { items, coupon, shippingMethod } = req.body

      // Actualizar o crear el carrito
      const cart = await prisma.cart.upsert({
        where: { userId: session.user.id },
        update: {
          items: {
            deleteMany: {},
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
            })),
          },
          couponCode: coupon?.code,
          shippingMethodId: shippingMethod?.id,
        },
        create: {
          userId: session.user.id,
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
            })),
          },
          couponCode: coupon?.code,
          shippingMethodId: shippingMethod?.id,
        },
      })

      return res.status(200).json(cart)
    } catch (error) {
      console.error('Error updating cart:', error)
      return res.status(500).json({ message: 'Error al actualizar el carrito' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
} 