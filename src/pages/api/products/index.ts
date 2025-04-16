import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res)
    case 'POST':
      return handlePost(req, res)
    default:
      return res.status(405).json({ message: 'Method not allowed' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { category, search, page = '1', limit = '10' } = req.query

    const where = {
      isAvailable: true,
      ...(category && { categoryId: String(category) }),
      ...(search && {
        OR: [
          { name: { contains: String(search), mode: 'insensitive' } },
          { description: { contains: String(search), mode: 'insensitive' } },
        ],
      }),
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          modifiers: {
            include: {
              group: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.product.count({ where }),
    ])

    return res.status(200).json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        limit: Number(limit),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, description, price, categoryId, image, modifiers } = req.body

    // Validate required fields
    if (!name || !price || !categoryId) {
      return res.status(400).json({ message: 'Name, price and category are required' })
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        categoryId,
        image,
        modifiers: {
          create: modifiers?.map((groupId: string) => ({
            groupId,
          })),
        },
      },
      include: {
        category: true,
        modifiers: {
          include: {
            group: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    })

    return res.status(201).json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 