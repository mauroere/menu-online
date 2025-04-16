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
    const { includeProducts = 'false' } = req.query

    const categories = await prisma.category.findMany({
      where: {
        parentId: null, // Get only root categories
      },
      include: {
        children: true,
        ...(includeProducts === 'true' && {
          products: {
            where: {
              isAvailable: true,
            },
          },
        }),
      },
      orderBy: {
        name: 'asc',
      },
    })

    return res.status(200).json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, description, image, parentId } = req.body

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Name is required' })
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        description,
        image,
        parentId,
      },
      include: {
        children: true,
      },
    })

    return res.status(201).json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 