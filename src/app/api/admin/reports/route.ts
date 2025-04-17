import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    // Obtener estadísticas básicas
    const totalUsers = await prisma.user.count()
    const totalOrders = await prisma.order.count()
    const totalProducts = await prisma.product.count()
    
    // Obtener ventas totales
    const sales = await prisma.order.aggregate({
      where: {
        status: "COMPLETED"
      },
      _sum: {
        total: true
      }
    })

    // Obtener productos más vendidos
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5,
      include: {
        product: true
      }
    })

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalSales: sales._sum.total || 0,
      topProducts
    })
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener reportes" }, { status: 500 })
  }
} 