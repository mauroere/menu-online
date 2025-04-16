'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Ticket {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  createdAt: string
  customer: {
    name: string
    email: string
  }
  order?: {
    id: string
    total: number
  }
  messages: {
    id: string
    content: string
    createdAt: string
    sender: {
      name: string
      role: string
    }
  }[]
}

export function SupportTickets() {
  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  const fetchTickets = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      })

      const response = await fetch(`/api/seller/tickets?${queryParams}`)
      const data = await response.json()
      setTickets(data)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [searchTerm, statusFilter, priorityFilter])

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/seller/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchTickets()
      }
    } catch (error) {
      console.error('Error updating ticket status:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !newMessage.trim()) return

    try {
      const response = await fetch(`/api/seller/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      })

      if (response.ok) {
        setNewMessage('')
        fetchTickets()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tickets de Soporte</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <Input
            placeholder="Buscar tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los estados</SelectItem>
              <SelectItem value="OPEN">Abierto</SelectItem>
              <SelectItem value="IN_PROGRESS">En progreso</SelectItem>
              <SelectItem value="RESOLVED">Resuelto</SelectItem>
              <SelectItem value="CLOSED">Cerrado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las prioridades</SelectItem>
              <SelectItem value="LOW">Baja</SelectItem>
              <SelectItem value="MEDIUM">Media</SelectItem>
              <SelectItem value="HIGH">Alta</SelectItem>
              <SelectItem value="URGENT">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>
                    <div>
                      <div>{ticket.customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {ticket.customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={ticket.status}
                      onValueChange={(value) => handleStatusChange(ticket.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Abierto</SelectItem>
                        <SelectItem value="IN_PROGRESS">En progreso</SelectItem>
                        <SelectItem value="RESOLVED">Resuelto</SelectItem>
                        <SelectItem value="CLOSED">Cerrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{ticket.priority}</TableCell>
                  <TableCell>
                    {format(new Date(ticket.createdAt), 'PPp', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTicket(ticket)}
                    >
                      Ver detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Ticket</DialogTitle>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Asunto</h3>
                  <p>{selectedTicket.subject}</p>
                </div>
                <div>
                  <h3 className="font-medium">Descripción</h3>
                  <p>{selectedTicket.description}</p>
                </div>
                {selectedTicket.order && (
                  <div>
                    <h3 className="font-medium">Orden Relacionada</h3>
                    <p>
                      ID: {selectedTicket.order.id} - Total: ${selectedTicket.order.total}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="font-medium">Mensajes</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedTicket.messages.map((message) => (
                      <div
                        key={message.id}
                        className="p-4 border rounded"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium">{message.sender.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({message.sender.role})
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(message.createdAt), 'PPp', { locale: es })}
                          </span>
                        </div>
                        <p>{message.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="message">Nuevo mensaje</Label>
                    <Textarea
                      id="message"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe tu respuesta..."
                      required
                    />
                  </div>
                  <Button type="submit">Enviar mensaje</Button>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
} 