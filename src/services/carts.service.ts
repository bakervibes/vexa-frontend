import type { CartWithItems, ShareCartResponse } from '@/types'
import { api } from '@/utils/api'
import type {
  addCartItemInput,
  RemoveCartItemInput,
  UpdateCartItemInput,
} from '@/validators/carts.validator'

export const cartsService = {
  async getCart() {
    return api<CartWithItems>('/carts', 'GET')
  },

  async addCartItem(data: addCartItemInput) {
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

  async shareCart() {
    return api<ShareCartResponse>('/carts/share', 'POST')
  },

  async getSharedCart(token: string) {
    return api<CartWithItems>(`/carts/share/${token}`, 'GET')
  },

  async mergeSharedCart(token: string) {
    return api<CartWithItems>(`/carts/share/${token}/merge`, 'POST')
  },
}
