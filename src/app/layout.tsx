import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { CartProvider } from '@/context/CartContext'
import { Toaster } from 'sonner'
import { SessionProvider } from 'next-auth/react'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Menu Online',
  description: 'Tu plataforma de pedidos en línea',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="es">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <CartProvider>
            <Navigation />
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
            <Toaster />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  )
} 