import type { Address } from '@/types'
import { api } from '@/utils/api'
import type {
  CreateAddressInput,
  UpdateAddressInput,
} from '@/validators/addresses.validator'

export const addressService = {
  /**
   * Récupérer toutes les adresses de l'utilisateur connecté
   */
  async getUserAddresses() {
    return api<Address[]>('/addresses', 'GET')
  },

  /**
   * Récupérer une adresse par son ID
   */
  async getAddress(id: string) {
    return api<Address>(`/addresses/${id}`, 'GET')
  },

  /**
   * Créer une nouvelle adresse
   */
  async createAddress(data: CreateAddressInput) {
    return api<Address>('/addresses', 'POST', data)
  },

  /**
   * Mettre à jour une adresse
   */
  async updateAddress(id: string, data: UpdateAddressInput) {
    return api<Address>(`/addresses/${id}`, 'PATCH', data)
  },

  /**
   * Supprimer une adresse
   */
  async deleteAddress(id: string) {
    return api<Address>(`/addresses/${id}`, 'DELETE')
  },

  /**
   * Définir une adresse comme adresse par défaut
   */
  async setDefaultAddress(id: string) {
    return api<Address>(`/addresses/${id}/default`, 'PATCH')
  },
}
