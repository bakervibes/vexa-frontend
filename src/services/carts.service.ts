import type { CartWithItems } from '@/types'
import { api } from '@/utils/api'
import type {
  AddToCartInput,
  RemoveCartItemInput,
  UpdateCartItemInput,
} from '@/validators/carts.validator'

export const cartService = {
  async getCart() {
    return api<CartWithItems>('/carts', 'GET')
  },

  async addToCart(data: AddToCartInput) {
    return api<CartWithItems>('/carts/items', 'POST', data)
  },

  async updateItem(data: UpdateCartItemInput) {
    return api<CartWithItems>('/carts/items', 'PATCH', data)
  },

  async removeItem(data: RemoveCartItemInput) {
    return api<CartWithItems>('/carts/items', 'DELETE', data)
  },

  async clearCart() {
    return api<CartWithItems>('/carts', 'DELETE')
  },
}
