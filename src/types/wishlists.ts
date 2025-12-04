import type {
  Attribute,
  Option,
  Product,
  ProductVariant,
  ProductVariantOption,
  Wishlist,
  WishlistItem,
} from './models'

export interface WishlistItemWithDetails extends WishlistItem {
  product: Product & { variants: ProductVariant[] }
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

export interface WishlistWithItems extends Wishlist {
  items: WishlistItemWithDetails[]
}
