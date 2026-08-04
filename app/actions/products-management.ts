'use server'

interface Product {
  id: number
  name: string
  unit: string
  unitPrice: number
  reorderLevel: number
}

let nextId = 1
const products: { [key: number]: Product } = {}

export async function addProduct(name: string, unit: string, unitPrice: number, reorderLevel: number) {
  const id = nextId++
  products[id] = { id, name, unit, unitPrice, reorderLevel }
  return products[id]
}

export async function getProducts(): Promise<Product[]> {
  return Object.values(products)
}

export async function updateProduct(id: number, name: string, unit: string, unitPrice: number, reorderLevel: number) {
  if (!products[id]) throw new Error('Product not found')
  products[id] = { id, name, unit, unitPrice, reorderLevel }
  return products[id]
}

export async function deleteProduct(id: number) {
  delete products[id]
}
