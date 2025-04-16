'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useCart } from '@/hooks/useCart'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: {
    id: string
    name: string
  }
  available: boolean
}

interface Category {
  id: string
  name: string
}

export default function CatalogPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
      })

      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/products?${queryParams}`),
        fetch('/api/categories'),
      ])

      const productsData = await productsResponse.json()
      const categoriesData = await categoriesResponse.json()

      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, categoryFilter])

  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCart({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity,
        image: selectedProduct.image,
      })
      setIsDialogOpen(false)
      setQuantity(1)
    }
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Catálogo de Productos</h1>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="aspect-square relative overflow-hidden rounded-lg">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}
              </div>
              <CardTitle className="mt-4">{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {product.category.name}
                </p>
                <p className="text-lg font-bold">${product.price}</p>
                <Button
                  className="w-full"
                  onClick={() => handleViewProduct(product)}
                  disabled={!product.available}
                >
                  {product.available ? 'Ver detalles' : 'No disponible'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              {selectedProduct.image && (
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div>
                <h3 className="font-medium">Descripción</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedProduct.description}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Categoría</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedProduct.category.name}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Precio</h3>
                <p className="text-lg font-bold">${selectedProduct.price}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <Button className="w-full" onClick={handleAddToCart}>
                Agregar al carrito
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 