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
    const deliveryHours = await prisma.deliveryHours.findMany()
    return NextResponse.json(deliveryHours)
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener horarios" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const deliveryHours = await prisma.deliveryHours.create({
      data
    })
    return NextResponse.json(deliveryHours)
  } catch (error) {
    return NextResponse.json({ error: "Error al crear horario" }, { status: 500 })
  }
} 