import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("No autorizado")
  }
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    throw new Error("No autorizado - Se requieren permisos de administrador")
  }
  return user
}

export async function requireSeller() {
  const user = await getCurrentUser()
  if (!user || user.role !== "SELLER") {
    throw new Error("No autorizado - Se requieren permisos de vendedor")
  }
  return user
} 