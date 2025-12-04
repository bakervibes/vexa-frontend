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
  variant:
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
  items: CartItemWithDetails[]
}
