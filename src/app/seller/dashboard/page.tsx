'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { OrdersList } from '@/components/seller/OrdersList'
import { InventoryManagement } from '@/components/seller/InventoryManagement'
import { DeliveryCalendar } from '@/components/seller/DeliveryCalendar'
import { SupportTickets } from '@/components/seller/SupportTickets'

export default function SellerDashboard() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    pendingOrders: 0,
    todayDeliveries: 0,
    lowStock: 0,
    activeTickets: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/seller/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching seller stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status])

  if (status === 'loading' || isLoading) {
    return <LoadingSpinner />
  }

  if (status === 'unauthenticated') {
    return <div>No autorizado</div>
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Panel de Vendedor</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Órdenes Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entregas Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayDeliveries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productos Bajo Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tickets Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTickets}</div>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Órdenes</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="delivery">Entregas</TabsTrigger>
          <TabsTrigger value="support">Soporte</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <OrdersList />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryManagement />
        </TabsContent>
        <TabsContent value="delivery">
          <DeliveryCalendar />
        </TabsContent>
        <TabsContent value="support">
          <SupportTickets />
        </TabsContent>
      </Tabs>
    </div>
  )
} 