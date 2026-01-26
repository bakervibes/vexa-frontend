import { addressService } from '@/services/addresses.service'
import type { Address } from '@/types'
import type {
  CreateAddressInput,
  UpdateAddressInput,
} from '@/validators/addresses.validator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { toast } from 'vue-sonner'

/**
 * Hook for managing user addresses
 */
export const useAddresses = () => {
  const queryClient = useQueryClient()

  // ========================================
  // Queries
  // ========================================

  /**
   * Query pour récupérer les adresses de l'utilisateur
   */
  const query = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService.getUserAddresses(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  // ========================================
  // Mutations
  // ========================================

  /**
   * Mutation pour créer une adresse
   */
  const createAddressMutation = useMutation({
    mutationFn: ({ data }: { data: CreateAddressInput }) =>
      addressService.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Address created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create address')
    },
  })

  /**
   * Mutation pour mettre à jour une adresse
   */
  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressInput }) =>
      addressService.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Address updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update address')
    },
  })

  /**
   * Mutation pour supprimer une adresse
   */
  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Address deleted successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete address')
    },
  })

  /**
   * Mutation pour définir une adresse par défaut
   */
  const setDefaultAddressMutation = useMutation({
    mutationFn: (id: string) => addressService.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Default address updated!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set default address')
    },
  })

  // ========================================
  // Getters (computed)
  // ========================================

  const addresses = computed(() => query.data.value || [])

  const defaultAddress = computed(
    () =>
      query.data.value?.find((addr) => addr.isDefault) || query.data.value?.[0],
  )

  const isLoadingAddresses = computed(() => query.isLoading.value)
  const isErrorAddresses = computed(() => query.isError.value)
  const errorAddresses = computed(() => query.error.value)

  // Loading states for mutations
  const isCreatingAddress = computed(
    () => createAddressMutation.isPending.value,
  )
  const isUpdatingAddress = computed(
    () => updateAddressMutation.isPending.value,
  )
  const isDeletingAddress = computed(
    () => deleteAddressMutation.isPending.value,
  )
  const isSettingDefault = computed(
    () => setDefaultAddressMutation.isPending.value,
  )

  // Error states for mutations
  const createAddressError = computed(() => createAddressMutation.error.value)
  const updateAddressError = computed(() => updateAddressMutation.error.value)
  const deleteAddressError = computed(() => deleteAddressMutation.error.value)
  const setDefaultError = computed(() => setDefaultAddressMutation.error.value)

  // ========================================
  // Actions
  // ========================================

  /**
   * Créer une nouvelle adresse
   */
  async function createAddress(data: CreateAddressInput): Promise<Address> {
    return createAddressMutation.mutateAsync({ data })
  }

  /**
   * Mettre à jour une adresse
   */
  async function updateAddress(
    id: string,
    data: UpdateAddressInput,
  ): Promise<Address> {
    return updateAddressMutation.mutateAsync({ id, data })
  }

  /**
   * Supprimer une adresse
   */
  async function deleteAddress(id: string): Promise<void> {
    await deleteAddressMutation.mutateAsync(id)
  }

  /**
   * Définir une adresse par défaut
   */
  async function setDefaultAddress(id: string): Promise<Address> {
    return setDefaultAddressMutation.mutateAsync(id)
  }

  /**
   * Rafraîchir les adresses
   */
  async function refetchAddresses() {
    await query.refetch()
  }

  // ========================================
  // Return (expose public API)
  // ========================================

  return {
    // Data
    addresses,
    defaultAddress,

    // Query states
    isLoadingAddresses,
    isErrorAddresses,
    errorAddresses,

    // Mutation loading states
    isCreatingAddress,
    isUpdatingAddress,
    isDeletingAddress,
    isSettingDefault,

    // Mutation error states
    createAddressError,
    updateAddressError,
    deleteAddressError,
    setDefaultError,

    // Actions
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetchAddresses,

    // Expose mutations for advanced usage
    createAddressMutation,
    updateAddressMutation,
    deleteAddressMutation,
    setDefaultAddressMutation,
  }
}
