'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  category: {
    id: string
    name: string
  }
  modifiers: {
    group: {
      id: string
      name: string
      options: {
        id: string
        name: string
        price: number
      }[]
    }
  }[]
}

interface Category {
  id: string
  name: string
  description: string | null
  image: string | null
  children: Category[]
}

interface ModifierSelection {
  [key: string]: string
}

export default function MenuPage() {
  const { addItem } = useCart()
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modifierSelections, setModifierSelections] = useState<ModifierSelection>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products'),
        ])

        const categoriesData = await categoriesRes.json()
        const productsData = await productsRes.json()

        setCategories(categoriesData)
        setProducts(productsData.products)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category.id === selectedCategory
    const matchesSearch = !search || 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(search.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleAddToCart = (product: Product) => {
    if (product.modifiers.length > 0) {
      setSelectedProduct(product)
      const initialSelections: ModifierSelection = {}
      product.modifiers.forEach(({ group }) => {
        initialSelections[group.id] = group.options[0].id
      })
      setModifierSelections(initialSelections)
    } else {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        modifiers: []
      })
    }
  }

  const handleConfirmModifiers = () => {
    if (!selectedProduct) return

    const selectedModifiers = selectedProduct.modifiers.map(({ group }) => {
      const selectedOptionId = modifierSelections[group.id]
      const selectedOption = group.options.find(opt => opt.id === selectedOptionId)!
      return {
        groupId: group.id,
        groupName: group.name,
        optionId: selectedOption.id,
        optionName: selectedOption.name,
        price: selectedOption.price
      }
    })

    addItem({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: selectedProduct.image,
      modifiers: selectedModifiers
    })

    setSelectedProduct(null)
    setModifierSelections({})
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filter */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Buscar productos..."
          className="input mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            className={`btn ${!selectedCategory ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`btn ${selectedCategory === category.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="card">
            {product.image && (
              <div className="relative h-48 mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}
            <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
            {product.description && (
              <p className="text-gray-600 mb-4">{product.description}</p>
            )}
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">
                ${product.price.toFixed(2)}
              </span>
              <button 
                className="btn btn-primary"
                onClick={() => handleAddToCart(product)}
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No se encontraron productos</h3>
          <p className="text-gray-600">
            Intenta con otra categoría o término de búsqueda
          </p>
        </div>
      )}

      {/* Modifiers Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">{selectedProduct.name}</h3>
            {selectedProduct.modifiers.map(({ group }) => (
              <div key={group.id} className="mb-4">
                <h4 className="font-medium mb-2">{group.name}</h4>
                <div className="space-y-2">
                  {group.options.map((option) => (
                    <label key={option.id} className="flex items-center">
                      <input
                        type="radio"
                        name={group.id}
                        value={option.id}
                        checked={modifierSelections[group.id] === option.id}
                        onChange={(e) => setModifierSelections({
                          ...modifierSelections,
                          [group.id]: e.target.value
                        })}
                        className="mr-2"
                      />
                      <span>
                        {option.name}
                        {option.price > 0 && ` (+$${option.price.toFixed(2)})`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end space-x-2 mt-6">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedProduct(null)
                  setModifierSelections({})
                }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmModifiers}
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 