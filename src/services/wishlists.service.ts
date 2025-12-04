import type { WishlistWithItems } from '@/types'
import { api } from '@/utils/api'
import type {
  AddToWishlistInput,
  RemoveWishlistItemInput,
} from '@/validators/wishlists.validator'

export const wishlistService = {
  async getWishlist() {
    return api<WishlistWithItems>('/wishlists', 'GET')
  },

  async addToWishlist(data: AddToWishlistInput) {
    return api<WishlistWithItems>('/wishlists/items', 'POST', data)
  },

  async removeWishlistItem(data: RemoveWishlistItemInput) {
    return api<WishlistWithItems>('/wishlists/items', 'DELETE', data)
  },

  async clearWishlist() {
    return api<WishlistWithItems>('/wishlists', 'DELETE')
  },
}
