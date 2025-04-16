import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'No autorizado' })
  }

  switch (req.method) {
    case 'GET':
      try {
        const settings = await prisma.systemSettings.findFirst()
        return res.status(200).json(settings)
      } catch (error) {
        console.error('Error fetching settings:', error)
        return res.status(500).json({ error: 'Error al obtener la configuración' })
      }

    case 'PUT':
      try {
        const {
          storeName,
          storeDescription,
          storeEmail,
          storePhone,
          storeAddress,
          storeLogo,
          currency,
          taxRate,
          minOrderAmount,
          maxOrderAmount,
          deliveryFee,
          freeDeliveryThreshold,
          maintenanceMode,
          maintenanceMessage,
        } = req.body

        const settings = await prisma.systemSettings.upsert({
          where: { id: 1 },
          update: {
            storeName,
            storeDescription,
            storeEmail,
            storePhone,
            storeAddress,
            storeLogo,
            currency,
            taxRate: parseFloat(taxRate),
            minOrderAmount: parseFloat(minOrderAmount),
            maxOrderAmount: parseFloat(maxOrderAmount),
            deliveryFee: parseFloat(deliveryFee),
            freeDeliveryThreshold: parseFloat(freeDeliveryThreshold),
            maintenanceMode,
            maintenanceMessage,
          },
          create: {
            id: 1,
            storeName,
            storeDescription,
            storeEmail,
            storePhone,
            storeAddress,
            storeLogo,
            currency,
            taxRate: parseFloat(taxRate),
            minOrderAmount: parseFloat(minOrderAmount),
            maxOrderAmount: parseFloat(maxOrderAmount),
            deliveryFee: parseFloat(deliveryFee),
            freeDeliveryThreshold: parseFloat(freeDeliveryThreshold),
            maintenanceMode,
            maintenanceMessage,
          },
        })

        return res.status(200).json(settings)
      } catch (error) {
        console.error('Error updating settings:', error)
        return res.status(500).json({ error: 'Error al actualizar la configuración' })
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
} 