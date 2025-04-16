'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { toast } from 'sonner'
import { MessageSquare, AlertCircle, CheckCircle } from 'lucide-react'

interface Complaint {
  id: string
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
  createdAt: string
  updatedAt: string
  orderId?: string
  responses: {
    id: string
    message: string
    createdAt: string
    isAdmin: boolean
  }[]
}

export default function ComplaintsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    orderId: '',
  })
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [newResponse, setNewResponse] = useState('')

  useEffect(() => {
    if (session?.user) {
      fetchComplaints()
    }
  }, [session])

  const fetchComplaints = async () => {
    try {
      const response = await fetch('/api/complaints')
      if (!response.ok) {
        throw new Error('Error al cargar las quejas')
      }
      const data = await response.json()
      setComplaints(data)
    } catch (error) {
      console.error('Error fetching complaints:', error)
      toast.error('Error al cargar las quejas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newComplaint),
      })

      if (!response.ok) {
        throw new Error('Error al enviar la queja')
      }

      toast.success('Queja enviada correctamente')
      setNewComplaint({
        title: '',
        description: '',
        orderId: '',
      })
      fetchComplaints()
    } catch (error) {
      console.error('Error submitting complaint:', error)
      toast.error('Error al enviar la queja')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedComplaint) return

    try {
      const response = await fetch(`/api/complaints/${selectedComplaint.id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newResponse }),
      })

      if (!response.ok) {
        throw new Error('Error al enviar la respuesta')
      }

      toast.success('Respuesta enviada correctamente')
      setNewResponse('')
      fetchComplaints()
    } catch (error) {
      console.error('Error submitting response:', error)
      toast.error('Error al enviar la respuesta')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'RESOLVED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Sistema de Quejas</h1>
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">Debes iniciar sesión para acceder al sistema de quejas</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Sistema de Quejas</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Sistema de Quejas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Nueva Queja</h2>
          <form onSubmit={handleSubmitComplaint} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <Input
                value={newComplaint.title}
                onChange={(e) =>
                  setNewComplaint({ ...newComplaint, title: e.target.value })
                }
                placeholder="Título de la queja"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <Textarea
                value={newComplaint.description}
                onChange={(e) =>
                  setNewComplaint({ ...newComplaint, description: e.target.value })
                }
                placeholder="Describe tu queja en detalle"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Número de Orden (opcional)
              </label>
              <Input
                value={newComplaint.orderId}
                onChange={(e) =>
                  setNewComplaint({ ...newComplaint, orderId: e.target.value })
                }
                placeholder="ID de la orden"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Queja'}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Mis Quejas</h2>
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <Card
                key={complaint.id}
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedComplaint(complaint)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{complaint.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(
                      complaint.status
                    )}`}
                  >
                    {complaint.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {complaint.description}
                </p>
              </Card>
            ))}
          </div>
        </Card>
      </div>

      {selectedComplaint && (
        <Card className="p-6 mt-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold">{selectedComplaint.title}</h2>
              <p className="text-sm text-gray-500">
                {new Date(selectedComplaint.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(
                selectedComplaint.status
              )}`}
            >
              {selectedComplaint.status}
            </span>
          </div>
          <p className="text-gray-600 mb-6">{selectedComplaint.description}</p>

          <div className="space-y-4 mb-6">
            {selectedComplaint.responses.map((response) => (
              <div
                key={response.id}
                className={`p-4 rounded-lg ${
                  response.isAdmin ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {response.isAdmin ? (
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-gray-500" />
                  )}
                  <div>
                    <p className="text-sm">{response.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(response.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmitResponse} className="space-y-4">
            <Textarea
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              placeholder="Escribe tu respuesta..."
              required
            />
            <Button type="submit">Enviar Respuesta</Button>
          </form>
        </Card>
      )}
    </div>
  )
} 