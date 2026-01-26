import type {
  Attribute,
  Cart,
  CartItem,
  Option,
  Product,
  ProductVariant,
  ProductVariantOption,
} from './models'

export interface CartItemWithDetails extends CartItem {
  product: Product
  productVariant:
    | (ProductVariant & {
        productVariantOptions: (ProductVariantOption & {
          option: Option & {
            attribute: Attribute
          }
        })[]
      })
    | null
}

export interface CartWithItems extends Cart {
  cartItems: CartItemWithDetails[]
}

export interface ShareCartResponse {
  shareToken: string
  expiresAt: Date
}
