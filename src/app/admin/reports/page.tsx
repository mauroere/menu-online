'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts'
import { Download, Calendar } from 'lucide-react'

interface SalesData {
  date: string
  total: number
  count: number
}

interface TopProduct {
  id: string
  name: string
  quantity: number
  revenue: number
}

interface PreparationTime {
  average: number
  byStatus: {
    status: string
    time: number
  }[]
}

interface CustomerSatisfaction {
  average: number
  total: number
  distribution: {
    rating: number
    count: number
  }[]
}

export default function ReportsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [reportType, setReportType] = useState('sales')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  })
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [prepTime, setPrepTime] = useState<PreparationTime | null>(null)
  const [satisfaction, setSatisfaction] = useState<CustomerSatisfaction | null>(
    null
  )

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchReport()
    }
  }, [reportType, dateRange])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/admin/reports?type=${reportType}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      )
      if (!response.ok) {
        throw new Error('Error al cargar el reporte')
      }

      const data = await response.json()
      switch (reportType) {
        case 'sales':
          setSalesData(data)
          break
        case 'products':
          setTopProducts(data)
          break
        case 'preparation':
          setPrepTime(data)
          break
        case 'satisfaction':
          setSatisfaction(data)
          break
      }
    } catch (error) {
      console.error('Error fetching report:', error)
      toast.error('Error al cargar el reporte')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(
        `/api/admin/reports/export?type=${reportType}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      )
      if (!response.ok) {
        throw new Error('Error al exportar el reporte')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}-report-${dateRange.startDate}-${dateRange.endDate}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting report:', error)
      toast.error('Error al exportar el reporte')
    }
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Reportes</h1>
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No tienes acceso a esta página</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Reportes</h1>

      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Select
              value={reportType}
              onValueChange={setReportType}
              options={[
                { value: 'sales', label: 'Ventas' },
                { value: 'products', label: 'Productos más vendidos' },
                { value: 'preparation', label: 'Tiempo de preparación' },
                { value: 'satisfaction', label: 'Satisfacción del cliente' },
              ]}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              placeholder="Fecha inicial"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              placeholder="Fecha final"
            />
          </div>
        </div>
        <Button onClick={handleExport} className="mt-4">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </Card>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <Card className="p-6">
          {reportType === 'sales' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Reporte de Ventas</h2>
              <LineChart width={800} height={400} data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="total"
                  stroke="#8884d8"
                  name="Ventas ($)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="count"
                  stroke="#82ca9d"
                  name="Cantidad de órdenes"
                />
              </LineChart>
            </div>
          )}

          {reportType === 'products' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Productos más vendidos
              </h2>
              <BarChart width={800} height={400} data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#8884d8" name="Cantidad vendida" />
                <Bar dataKey="revenue" fill="#82ca9d" name="Ingresos ($)" />
              </BarChart>
            </div>
          )}

          {reportType === 'preparation' && prepTime && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Tiempo promedio de preparación
              </h2>
              <p className="text-xl mb-4">
                Tiempo promedio: {prepTime.average.toFixed(2)} minutos
              </p>
              <BarChart width={800} height={400} data={prepTime.byStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="time"
                  fill="#8884d8"
                  name="Tiempo promedio (min)"
                />
              </BarChart>
            </div>
          )}

          {reportType === 'satisfaction' && satisfaction && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Satisfacción del cliente
              </h2>
              <p className="text-xl mb-4">
                Calificación promedio: {satisfaction.average.toFixed(1)} / 5
              </p>
              <BarChart width={800} height={400} data={satisfaction.distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#8884d8"
                  name="Cantidad de calificaciones"
                />
              </BarChart>
            </div>
          )}
        </Card>
      )}
    </div>
  )
} 