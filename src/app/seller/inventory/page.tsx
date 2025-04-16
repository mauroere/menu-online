'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { toast } from 'sonner'
import { Search, Plus, RefreshCw, Edit2, Trash2, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image: string
  isActive: boolean
}

export default function InventoryPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    image: '',
    isActive: true,
  })

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, categoryFilter])

  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        category: categoryFilter,
      })

      const response = await fetch(`/api/seller/products?${queryParams}`)
      if (!response.ok) {
        throw new Error('Error al cargar los productos')
      }

      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Error al cargar los productos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProduct = async () => {
    if (!selectedProduct) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/seller/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedProduct),
      })

      if (!response.ok) {
        throw new Error('Error al guardar el producto')
      }

      const data = await response.json()
      setProducts((prev) =>
        prev.map((p) => (p.id === data.product.id ? data.product : p))
      )
      setSelectedProduct(null)
      toast.success('Producto actualizado correctamente')
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Error al guardar el producto')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.description || !newProduct.price) {
      toast.error('Por favor complete todos los campos requeridos')
      return
    }

    try {
      const response = await fetch('/api/seller/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      })

      if (!response.ok) {
        throw new Error('Error al crear el producto')
      }

      const data = await response.json()
      setProducts([...products, data.product])
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        image: '',
        isActive: true,
      })
      toast.success('Producto creado correctamente')
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Error al crear el producto')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Está seguro de eliminar este producto?')) {
      return
    }

    try {
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el producto')
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId))
      toast.success('Producto eliminado correctamente')
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Error al eliminar el producto')
    }
  }

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/seller/products/${productId}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el estado del producto')
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, isActive: !p.isActive } : p
        )
      )
      toast.success('Estado del producto actualizado')
    } catch (error) {
      console.error('Error toggling product:', error)
      toast.error('Error al actualizar el estado del producto')
    }
  }

  if (!session?.user || session.user.role !== 'SELLER') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Gestión de Inventario</h1>
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No tienes acceso a esta página</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Gestión de Inventario</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Inventario</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos..."
            className="pl-10"
          />
        </div>

        <Select
          value={categoryFilter}
          onValueChange={setCategoryFilter}
          className="w-full md:w-48"
        >
          <option value="all">Todas las categorías</option>
          <option value="food">Comida</option>
          <option value="drinks">Bebidas</option>
          <option value="desserts">Postres</option>
          <option value="snacks">Snacks</option>
        </Select>

        <Button onClick={fetchProducts} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Nuevo Producto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <Input
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              placeholder="Nombre del producto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <Select
              value={newProduct.category}
              onValueChange={(value) =>
                setNewProduct({ ...newProduct, category: value })
              }
            >
              <option value="">Seleccionar categoría</option>
              <option value="food">Comida</option>
              <option value="drinks">Bebidas</option>
              <option value="desserts">Postres</option>
              <option value="snacks">Snacks</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Precio</label>
            <Input
              type="number"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  price: parseFloat(e.target.value),
                })
              }
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <Input
              type="number"
              value={newProduct.stock}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  stock: parseInt(e.target.value),
                })
              }
              placeholder="0"
              min="0"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Descripción
            </label>
            <textarea
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Descripción del producto"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              URL de la imagen
            </label>
            <Input
              value={newProduct.image}
              onChange={(e) =>
                setNewProduct({ ...newProduct, image: e.target.value })
              }
              placeholder="https://..."
            />
          </div>
        </div>

        <Button onClick={handleAddProduct} className="mt-4">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProduct(product)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}

            <p className="text-sm text-gray-600 mb-4">{product.description}</p>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">${product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  Stock: {product.stock} unidades
                </p>
              </div>
              <Button
                variant={product.isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToggleActive(product.id, !product.isActive)}
              >
                {product.isActive ? 'Activo' : 'Inactivo'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No se encontraron productos</p>
        </Card>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">
              Editar Producto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre
                </label>
                <Input
                  value={selectedProduct.name}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Categoría
                </label>
                <Select
                  value={selectedProduct.category}
                  onValueChange={(value) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      category: value,
                    })
                  }
                >
                  <option value="food">Comida</option>
                  <option value="drinks">Bebidas</option>
                  <option value="desserts">Postres</option>
                  <option value="snacks">Snacks</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Precio
                </label>
                <Input
                  type="number"
                  value={selectedProduct.price}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Stock
                </label>
                <Input
                  type="number"
                  value={selectedProduct.stock}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      stock: parseInt(e.target.value),
                    })
                  }
                  min="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Descripción
                </label>
                <textarea
                  value={selectedProduct.description}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  URL de la imagen
                </label>
                <Input
                  value={selectedProduct.image}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      image: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedProduct(null)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveProduct} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
} 