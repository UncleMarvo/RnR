export type ProductWithVariants = {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  sortOrder: number
  variants: ProductVariant[]
}

export type ProductVariant = {
  id: string
  productId: string
  name: string
  sku: string
  flavour: string | null
  size: string | null
  price: number
  stockQty: number
  lowStockThreshold: number
  isActive: boolean
  sortOrder: number
}
