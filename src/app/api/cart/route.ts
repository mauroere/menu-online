import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id
      },
      include: {
        items: {
          include: {
            product: true,
            modifiers: {
              include: {
                option: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(cart)
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener carrito" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const cart = await prisma.cart.create({
      data: {
        userId: session.user.id,
        ...data
      }
    })
    return NextResponse.json(cart)
  } catch (error) {
    return NextResponse.json({ error: "Error al crear carrito" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const cart = await prisma.cart.update({
      where: {
        userId: session.user.id
      },
      data
    })
    return NextResponse.json(cart)
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar carrito" }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    await prisma.cart.delete({
      where: {
        userId: session.user.id
      }
    })
    return NextResponse.json({ message: "Carrito eliminado" })
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar carrito" }, { status: 500 })
  }
} 