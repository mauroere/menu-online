'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface SalesData {
  date: string
  amount: number
  orders: number
}

interface TopProduct {
  id: string
  name: string
  quantity: number
  revenue: number
}

export function Overview() {
  const [isLoading, setIsLoading] = useState(true)
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesResponse, productsResponse] = await Promise.all([
          fetch('/api/admin/reports?type=sales'),
          fetch('/api/admin/reports?type=products')
        ])

        const salesData = await salesResponse.json()
        const productsData = await productsResponse.json()

        setSalesData(salesData.dailySales)
        setTopProducts(productsData)
      } catch (error) {
        console.error('Error fetching overview data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Ventas</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Ventas" />
                <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Órdenes" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Productos Más Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {topProducts.map((product) => (
              <div key={product.id} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.quantity} unidades - ${product.revenue}
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  {((product.quantity / topProducts[0].quantity) * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 