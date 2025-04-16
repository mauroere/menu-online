import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { code } = req.query

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: 'Código de cupón requerido' })
  }

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        discount: true,
        type: true,
        minPurchase: true,
        expiresAt: true,
        isActive: true,
      },
    })

    if (!coupon) {
      return res.status(404).json({
        valid: false,
        message: 'Cupón no encontrado',
      })
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        valid: false,
        message: 'Cupón inactivo',
      })
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({
        valid: false,
        message: 'Cupón expirado',
      })
    }

    return res.status(200).json({
      valid: true,
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
        type: coupon.type,
        minPurchase: coupon.minPurchase,
      },
    })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return res.status(500).json({
      valid: false,
      message: 'Error al validar el cupón',
    })
  }
} 