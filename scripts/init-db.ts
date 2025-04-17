import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Crear usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Crear usuario vendedor
  const sellerPassword = await bcrypt.hash('seller123', 10)
  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      name: 'Vendedor',
      password: sellerPassword,
      role: 'SELLER',
    },
  })

  // Crear productos de ejemplo
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Hamburguesa Clásica',
        description: 'Deliciosa hamburguesa con lechuga, tomate y queso',
        price: 10.99,
        category: 'Hamburguesas',
        stock: 50,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Pizza Margherita',
        description: 'Pizza tradicional con tomate y mozzarella',
        price: 12.99,
        category: 'Pizzas',
        stock: 30,
      },
    }),
  ])

  console.log({ admin, seller, products })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 