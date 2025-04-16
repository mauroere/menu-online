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
        const { page = '1', limit = '10', search } = req.query
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

        const where = {
          sellerId,
          ...(search && {
            OR: [
              { name: { contains: search as string, mode: 'insensitive' } },
              { description: { contains: search as string, mode: 'insensitive' } },
            ],
          }),
        }

        const [products, total] = await Promise.all([
          prisma.product.findMany({
            where,
            include: {
              category: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            skip,
            take: parseInt(limit as string),
          }),
          prisma.product.count({ where }),
        ])

        return res.status(200).json({
          products,
          pagination: {
            total,
            pages: Math.ceil(total / parseInt(limit as string)),
            currentPage: parseInt(page as string),
          },
        })
      } catch (error) {
        console.error('Error fetching seller inventory:', error)
        return res.status(500).json({ error: 'Error al obtener el inventario' })
      }

    case 'POST':
      try {
        const { name, description, price, categoryId, stock, images } = req.body

        const product = await prisma.product.create({
          data: {
            name,
            description,
            price: parseFloat(price),
            categoryId,
            stock: parseInt(stock),
            images,
            sellerId,
          },
          include: {
            category: true,
          },
        })

        return res.status(201).json(product)
      } catch (error) {
        console.error('Error creating product:', error)
        return res.status(500).json({ error: 'Error al crear el producto' })
      }

    case 'PUT':
      try {
        const { id, name, description, price, categoryId, stock, images } = req.body

        const product = await prisma.product.update({
          where: {
            id,
            sellerId,
          },
          data: {
            name,
            description,
            price: parseFloat(price),
            categoryId,
            stock: parseInt(stock),
            images,
          },
          include: {
            category: true,
          },
        })

        return res.status(200).json(product)
      } catch (error) {
        console.error('Error updating product:', error)
        return res.status(500).json({ error: 'Error al actualizar el producto' })
      }

    case 'DELETE':
      try {
        const { id } = req.query

        await prisma.product.delete({
          where: {
            id: id as string,
            sellerId,
          },
        })

        return res.status(200).json({ message: 'Producto eliminado correctamente' })
      } catch (error) {
        console.error('Error deleting product:', error)
        return res.status(500).json({ error: 'Error al eliminar el producto' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
} 