import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'No autorizado' })
  }

  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '50', level, startDate, endDate } = req.query
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

      const where = {
        ...(level && { level: level as string }),
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        }),
      }

      const [logs, total] = await Promise.all([
        prisma.systemLog.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.systemLog.count({ where }),
      ])

      return res.status(200).json({
        logs,
        pagination: {
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
          currentPage: parseInt(page as string),
        },
      })
    } catch (error) {
      console.error('Error fetching logs:', error)
      return res.status(500).json({ error: 'Error al obtener los logs' })
    }
  }

  res.setHeader('Allow', ['GET'])
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
} 