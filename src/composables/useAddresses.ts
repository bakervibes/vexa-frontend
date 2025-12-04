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
 * Composable pour récupérer les adresses de l'utilisateur
 */
export function useUserAddresses() {
  const query = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService.getUserAddresses(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  return {
    addresses: computed(() => query.data.value || []),
    defaultAddress: computed(
      () =>
        query.data.value?.find((addr) => addr.isDefault) ||
        query.data.value?.[0],
    ),
    isLoading: computed(() => query.isLoading.value),
    isError: computed(() => query.isError.value),
    error: computed(() => query.error.value),
    refetch: query.refetch,
  }
}

/**
 * Composable pour les mutations d'adresses (création, mise à jour, suppression)
 */
export function useAddressesMutation() {
  const queryClient = useQueryClient()

  // Mutation pour créer une adresse
  const createAddressMutation = useMutation({
    mutationFn: (data: CreateAddressInput) =>
      addressService.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Address created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create address')
    },
  })

  // Mutation pour mettre à jour une adresse
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

  // Mutation pour supprimer une adresse
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

  // Mutation pour définir une adresse par défaut
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

  /**
   * Créer une nouvelle adresse
   */
  async function createAddress(data: CreateAddressInput): Promise<Address> {
    return createAddressMutation.mutateAsync(data)
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

  return {
    // Actions
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,

    // Loading states
    isCreatingAddress: computed(() => createAddressMutation.isPending.value),
    isUpdatingAddress: computed(() => updateAddressMutation.isPending.value),
    isDeletingAddress: computed(() => deleteAddressMutation.isPending.value),
    isSettingDefault: computed(() => setDefaultAddressMutation.isPending.value),

    // Error states
    createAddressError: computed(() => createAddressMutation.error.value),
    updateAddressError: computed(() => updateAddressMutation.error.value),
    deleteAddressError: computed(() => deleteAddressMutation.error.value),
    setDefaultError: computed(() => setDefaultAddressMutation.error.value),
  }
}
