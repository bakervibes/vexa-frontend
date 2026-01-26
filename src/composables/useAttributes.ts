import {
  attributesService,
  type CreateAttributeInput,
  type CreateOptionInput,
  type UpdateAttributeInput,
  type UpdateOptionInput,
} from '@/services/attributes.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

const ATTRIBUTES_QUERY_KEY = ['admin', 'attributes']

export function useAttributes() {
  const queryClient = useQueryClient()
  const includeInactive = ref(true)

  const query = useQuery({
    queryKey: computed(() => [...ATTRIBUTES_QUERY_KEY, includeInactive.value]),
    queryFn: () => attributesService.getAll(includeInactive.value),
    staleTime: 1000 * 60 * 2,
  })

  // Attribute mutations
  const createAttributeMutation = useMutation({
    mutationFn: (data: CreateAttributeInput) => attributesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTRIBUTES_QUERY_KEY })
      toast.success('Attribut créé avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création de l'attribut")
    },
  })

  const updateAttributeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttributeInput }) =>
      attributesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTRIBUTES_QUERY_KEY })
      toast.success('Attribut mis à jour avec succès')
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors de la mise à jour de l'attribut",
      )
    },
  })

  const deleteAttributeMutation = useMutation({
    mutationFn: (id: string) => attributesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTRIBUTES_QUERY_KEY })
      toast.success('Attribut supprimé avec succès')
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors de la suppression de l'attribut",
      )
    },
  })

  // Option mutations
  const createOptionMutation = useMutation({
    mutationFn: ({
      attributeId,
      data,
    }: {
      attributeId: string
      data: CreateOptionInput
    }) => attributesService.createOption(attributeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTRIBUTES_QUERY_KEY })
      toast.success('Option créée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création de l'option")
    },
  })

  const updateOptionMutation = useMutation({
    mutationFn: ({
      optionId,
      data,
    }: {
      optionId: string
      data: UpdateOptionInput
    }) => attributesService.updateOption(optionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTRIBUTES_QUERY_KEY })
      toast.success('Option mise à jour avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour de l'option")
    },
  })

  const deleteOptionMutation = useMutation({
    mutationFn: (optionId: string) => attributesService.deleteOption(optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTRIBUTES_QUERY_KEY })
      toast.success('Option supprimée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression de l'option")
    },
  })

  // Actions
  async function createAttribute(data: CreateAttributeInput) {
    return createAttributeMutation.mutateAsync(data)
  }

  async function updateAttribute(id: string, data: UpdateAttributeInput) {
    return updateAttributeMutation.mutateAsync({ id, data })
  }

  async function deleteAttribute(id: string) {
    return deleteAttributeMutation.mutateAsync(id)
  }

  async function createOption(attributeId: string, data: CreateOptionInput) {
    return createOptionMutation.mutateAsync({ attributeId, data })
  }

  async function updateOption(optionId: string, data: UpdateOptionInput) {
    return updateOptionMutation.mutateAsync({ optionId, data })
  }

  async function deleteOption(optionId: string) {
    return deleteOptionMutation.mutateAsync(optionId)
  }

  function toggleInactiveFilter() {
    includeInactive.value = !includeInactive.value
  }

  return {
    attributes: computed(() => query.data.value || []),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    includeInactive,
    toggleInactiveFilter,

    // Attribute actions
    createAttribute,
    updateAttribute,
    deleteAttribute,
    isCreatingAttribute: computed(
      () => createAttributeMutation.isPending.value,
    ),
    isUpdatingAttribute: computed(
      () => updateAttributeMutation.isPending.value,
    ),
    isDeletingAttribute: computed(
      () => deleteAttributeMutation.isPending.value,
    ),

    // Option actions
    createOption,
    updateOption,
    deleteOption,
    isCreatingOption: computed(() => createOptionMutation.isPending.value),
    isUpdatingOption: computed(() => updateOptionMutation.isPending.value),
    isDeletingOption: computed(() => deleteOptionMutation.isPending.value),
  }
}
