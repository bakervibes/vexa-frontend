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
  product: Product & { productVariants: ProductVariant[] }
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

export interface WishlistWithItems extends Wishlist {
  wishlistItems: WishlistItemWithDetails[]
}
