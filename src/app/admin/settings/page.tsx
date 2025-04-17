'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Save, RefreshCw } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SystemSettings {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    supportPhone: string
    maintenanceMode: boolean
  }
  orders: {
    minOrderAmount: number
    maxOrderAmount: number
    taxRate: number
    deliveryFee: number
    freeDeliveryThreshold: number
    orderExpirationMinutes: number
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    orderConfirmationEmail: boolean
    orderStatusUpdateEmail: boolean
    orderConfirmationSms: boolean
    orderStatusUpdateSms: boolean
  }
  payment: {
    paymentMethods: string[]
    currency: string
    currencySymbol: string
    stripeEnabled: boolean
    stripePublicKey: string
    stripeSecretKey: string
    mercadopagoEnabled: boolean
    mercadopagoPublicKey: string
    mercadopagoAccessToken: string
  }
  delivery: {
    deliveryEnabled: boolean
    pickupEnabled: boolean
    deliveryRadius: number
    deliveryTimeEstimate: number
    deliveryFeeCalculation: 'fixed' | 'distance' | 'order_value'
  }
  loyalty: {
    loyaltyProgramEnabled: boolean
    pointsPerCurrency: number
    currencyPerPoint: number
    minPointsRedemption: number
    pointsExpirationDays: number
  }
}

export default function AdminSettingsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: '',
      siteDescription: '',
      contactEmail: '',
      supportPhone: '',
      maintenanceMode: false,
    },
    orders: {
      minOrderAmount: 0,
      maxOrderAmount: 0,
      taxRate: 0,
      deliveryFee: 0,
      freeDeliveryThreshold: 0,
      orderExpirationMinutes: 30,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      orderConfirmationEmail: true,
      orderStatusUpdateEmail: true,
      orderConfirmationSms: false,
      orderStatusUpdateSms: false,
    },
    payment: {
      paymentMethods: ['cash', 'card'],
      currency: 'USD',
      currencySymbol: '$',
      stripeEnabled: false,
      stripePublicKey: '',
      stripeSecretKey: '',
      mercadopagoEnabled: false,
      mercadopagoPublicKey: '',
      mercadopagoAccessToken: '',
    },
    delivery: {
      deliveryEnabled: true,
      pickupEnabled: true,
      deliveryRadius: 5,
      deliveryTimeEstimate: 30,
      deliveryFeeCalculation: 'fixed',
    },
    loyalty: {
      loyaltyProgramEnabled: false,
      pointsPerCurrency: 1,
      currencyPerPoint: 0.01,
      minPointsRedemption: 100,
      pointsExpirationDays: 365,
    },
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings')
        if (!response.ok) {
          throw new Error('Error al cargar la configuración')
        }
        const data = await response.json()
        setSettings(data.settings)
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast.error('Error al cargar la configuración')
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchSettings()
    }
  }, [session])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar la configuración')
      }

      toast.success('Configuración guardada correctamente')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Configuración del Sistema</h1>
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No tienes acceso a esta página</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Configuración del Sistema</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="orders">Órdenes</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="payment">Pagos</TabsTrigger>
          <TabsTrigger value="delivery">Entrega</TabsTrigger>
          <TabsTrigger value="loyalty">Fidelización</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Configuración General</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre del Sitio
                </label>
                <Input
                  value={settings.general.siteName}
                  onChange={(e) =>
                    handleChange('general', 'siteName', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Descripción del Sitio
                </label>
                <textarea
                  value={settings.general.siteDescription}
                  onChange={(e) =>
                    handleChange('general', 'siteDescription', e.target.value)
                  }
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email de Contacto
                </label>
                <Input
                  type="email"
                  value={settings.general.contactEmail}
                  onChange={(e) =>
                    handleChange('general', 'contactEmail', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Teléfono de Soporte
                </label>
                <Input
                  value={settings.general.supportPhone}
                  onChange={(e) =>
                    handleChange('general', 'supportPhone', e.target.value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Modo de Mantenimiento
                </label>
                <Switch
                  checked={settings.general.maintenanceMode}
                  onCheckedChange={(checked) =>
                    handleChange('general', 'maintenanceMode', checked)
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Configuración de Órdenes</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Monto Mínimo de Orden
                  </label>
                  <Input
                    type="number"
                    value={settings.orders.minOrderAmount}
                    onChange={(e) =>
                      handleChange(
                        'orders',
                        'minOrderAmount',
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Monto Máximo de Orden
                  </label>
                  <Input
                    type="number"
                    value={settings.orders.maxOrderAmount}
                    onChange={(e) =>
                      handleChange(
                        'orders',
                        'maxOrderAmount',
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tasa de Impuesto (%)
                  </label>
                  <Input
                    type="number"
                    value={settings.orders.taxRate}
                    onChange={(e) =>
                      handleChange(
                        'orders',
                        'taxRate',
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tarifa de Entrega
                  </label>
                  <Input
                    type="number"
                    value={settings.orders.deliveryFee}
                    onChange={(e) =>
                      handleChange(
                        'orders',
                        'deliveryFee',
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Umbral para Entrega Gratuita
                  </label>
                  <Input
                    type="number"
                    value={settings.orders.freeDeliveryThreshold}
                    onChange={(e) =>
                      handleChange(
                        'orders',
                        'freeDeliveryThreshold',
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tiempo de Expiración de Orden (minutos)
                  </label>
                  <Input
                    type="number"
                    value={settings.orders.orderExpirationMinutes}
                    onChange={(e) =>
                      handleChange(
                        'orders',
                        'orderExpirationMinutes',
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Configuración de Notificaciones
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Notificaciones por Email
                </label>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleChange('notifications', 'emailNotifications', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Notificaciones por SMS
                </label>
                <Switch
                  checked={settings.notifications.smsNotifications}
                  onCheckedChange={(checked) =>
                    handleChange('notifications', 'smsNotifications', checked)
                  }
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="text-md font-medium mb-2">Notificaciones por Email</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Confirmación de Orden</label>
                    <Switch
                      checked={settings.notifications.orderConfirmationEmail}
                      onCheckedChange={(checked) =>
                        handleChange(
                          'notifications',
                          'orderConfirmationEmail',
                          checked
                        )
                      }
                      disabled={!settings.notifications.emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Actualización de Estado</label>
                    <Switch
                      checked={settings.notifications.orderStatusUpdateEmail}
                      onCheckedChange={(checked) =>
                        handleChange(
                          'notifications',
                          'orderStatusUpdateEmail',
                          checked
                        )
                      }
                      disabled={!settings.notifications.emailNotifications}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-md font-medium mb-2">Notificaciones por SMS</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Confirmación de Orden</label>
                    <Switch
                      checked={settings.notifications.orderConfirmationSms}
                      onCheckedChange={(checked) =>
                        handleChange(
                          'notifications',
                          'orderConfirmationSms',
                          checked
                        )
                      }
                      disabled={!settings.notifications.smsNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Actualización de Estado</label>
                    <Switch
                      checked={settings.notifications.orderStatusUpdateSms}
                      onCheckedChange={(checked) =>
                        handleChange(
                          'notifications',
                          'orderStatusUpdateSms',
                          checked
                        )
                      }
                      disabled={!settings.notifications.smsNotifications}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Configuración de Pagos
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Moneda
                  </label>
                  <Input
                    value={settings.payment.currency}
                    onChange={(e) =>
                      handleChange('payment', 'currency', e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Símbolo de Moneda
                  </label>
                  <Input
                    value={settings.payment.currencySymbol}
                    onChange={(e) =>
                      handleChange('payment', 'currencySymbol', e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Métodos de Pago
                </label>
                <div className="space-y-2">
                  {['cash', 'card', 'transfer', 'wallet'].map((method) => (
                    <div key={method} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`method-${method}`}
                        checked={settings.payment.paymentMethods.includes(method)}
                        onChange={(e) => {
                          const newMethods = e.target.checked
                            ? [...settings.payment.paymentMethods, method]
                            : settings.payment.paymentMethods.filter(
                                (m) => m !== method
                              )
                          handleChange('payment', 'paymentMethods', newMethods)
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`method-${method}`} className="text-sm">
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-md font-medium mb-2">Stripe</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Habilitar Stripe</label>
                    <Switch
                      checked={settings.payment.stripeEnabled}
                      onCheckedChange={(checked) =>
                        handleChange('payment', 'stripeEnabled', checked)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Clave Pública
                    </label>
                    <Input
                      value={settings.payment.stripePublicKey}
                      onChange={(e) =>
                        handleChange('payment', 'stripePublicKey', e.target.value)
                      }
                      disabled={!settings.payment.stripeEnabled}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Clave Secreta
                    </label>
                    <Input
                      type="password"
                      value={settings.payment.stripeSecretKey}
                      onChange={(e) =>
                        handleChange('payment', 'stripeSecretKey', e.target.value)
                      }
                      disabled={!settings.payment.stripeEnabled}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-md font-medium mb-2">MercadoPago</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Habilitar MercadoPago
                    </label>
                    <Switch
                      checked={settings.payment.mercadopagoEnabled}
                      onCheckedChange={(checked) =>
                        handleChange(
                          'payment',
                          'mercadopagoEnabled',
                          checked
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Clave Pública
                    </label>
                    <Input
                      value={settings.payment.mercadopagoPublicKey}
                      onChange={(e) =>
                        handleChange(
                          'payment',
                          'mercadopagoPublicKey',
                          e.target.value
                        )
                      }
                      disabled={!settings.payment.mercadopagoEnabled}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Token de Acceso
                    </label>
                    <Input
                      type="password"
                      value={settings.payment.mercadopagoAccessToken}
                      onChange={(e) =>
                        handleChange(
                          'payment',
                          'mercadopagoAccessToken',
                          e.target.value
                        )
                      }
                      disabled={!settings.payment.mercadopagoEnabled}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Configuración de Entrega
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Habilitar Entrega a Domicilio
                </label>
                <Switch
                  checked={settings.delivery.deliveryEnabled}
                  onCheckedChange={(checked) =>
                    handleChange('delivery', 'deliveryEnabled', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Habilitar Recogida en Tienda
                </label>
                <Switch
                  checked={settings.delivery.pickupEnabled}
                  onCheckedChange={(checked) =>
                    handleChange('delivery', 'pickupEnabled', checked)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Radio de Entrega (km)
                </label>
                <Input
                  type="number"
                  value={settings.delivery.deliveryRadius}
                  onChange={(e) =>
                    handleChange(
                      'delivery',
                      'deliveryRadius',
                      parseFloat(e.target.value)
                    )
                  }
                  disabled={!settings.delivery.deliveryEnabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tiempo Estimado de Entrega (minutos)
                </label>
                <Input
                  type="number"
                  value={settings.delivery.deliveryTimeEstimate}
                  onChange={(e) =>
                    handleChange(
                      'delivery',
                      'deliveryTimeEstimate',
                      parseInt(e.target.value)
                    )
                  }
                  disabled={!settings.delivery.deliveryEnabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Cálculo de Tarifa de Entrega
                </label>
                <Select
                  value={settings.delivery.deliveryFeeCalculation}
                  onValueChange={(value) =>
                    handleChange('delivery', 'deliveryFeeCalculation', value)
                  }
                  disabled={!settings.delivery.deliveryEnabled}
                >
                  <option value="fixed">Fija</option>
                  <option value="distance">Por Distancia</option>
                  <option value="order_value">Por Valor de Orden</option>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Configuración de Fidelización
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Habilitar Programa de Fidelización
                </label>
                <Switch
                  checked={settings.loyalty.loyaltyProgramEnabled}
                  onCheckedChange={(checked) =>
                    handleChange('loyalty', 'loyaltyProgramEnabled', checked)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Puntos por Unidad Monetaria
                  </label>
                  <Input
                    type="number"
                    value={settings.loyalty.pointsPerCurrency}
                    onChange={(e) =>
                      handleChange(
                        'loyalty',
                        'pointsPerCurrency',
                        parseFloat(e.target.value)
                      )
                    }
                    disabled={!settings.loyalty.loyaltyProgramEnabled}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Valor de Punto (unidades monetarias)
                  </label>
                  <Input
                    type="number"
                    value={settings.loyalty.currencyPerPoint}
                    onChange={(e) =>
                      handleChange(
                        'loyalty',
                        'currencyPerPoint',
                        parseFloat(e.target.value)
                      )
                    }
                    disabled={!settings.loyalty.loyaltyProgramEnabled}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Puntos Mínimos para Canjear
                  </label>
                  <Input
                    type="number"
                    value={settings.loyalty.minPointsRedemption}
                    onChange={(e) =>
                      handleChange(
                        'loyalty',
                        'minPointsRedemption',
                        parseInt(e.target.value)
                      )
                    }
                    disabled={!settings.loyalty.loyaltyProgramEnabled}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Días de Expiración de Puntos
                  </label>
                  <Input
                    type="number"
                    value={settings.loyalty.pointsExpirationDays}
                    onChange={(e) =>
                      handleChange(
                        'loyalty',
                        'pointsExpirationDays',
                        parseInt(e.target.value)
                      )
                    }
                    disabled={!settings.loyalty.loyaltyProgramEnabled}
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 