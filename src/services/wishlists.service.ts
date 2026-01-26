import type { WishlistWithItems } from '@/types'
import { api } from '@/utils/api'
import type {
  addWishlistItemInput,
  removeWishlistItemInput,
} from '@/validators/wishlists.validator'

export const wishlistService = {
  async getWishlist() {
    return api<WishlistWithItems>('/wishlists', 'GET')
  },

  async addWishlistItem(data: addWishlistItemInput) {
    return api<WishlistWithItems>('/wishlists/items', 'POST', data)
  },

  async removeWishlistItem(data: removeWishlistItemInput) {
    return api<WishlistWithItems>('/wishlists/items', 'DELETE', data)
  },

  async clearWishlist() {
    return api<WishlistWithItems>('/wishlists', 'DELETE')
  },

  async shareWishlist() {
    return api<{ shareToken: string; shareExpiresAt: string }>(
      '/wishlists/share',
      'POST',
    )
  },

  async getSharedWishlist(token: string) {
    return api<WishlistWithItems>(`/wishlists/shared/${token}`, 'GET')
  },

  async mergeSharedWishlist(token: string) {
    return api<WishlistWithItems>(`/wishlists/shared/${token}/merge`, 'POST')
  },

  async importFromCart(token: string | null) {
    return api<WishlistWithItems>('/wishlists/import-from-cart', 'POST', {
      token: token ?? undefined,
    })
  },
}
