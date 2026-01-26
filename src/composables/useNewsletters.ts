import {
  newsletterService,
  type NewsletterFilters,
  type NewsletterStats,
} from '@/services/newsletters.service'
import type { SubscribeNewsletterInput } from '@/validators/newsletters.validator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

const NEWSLETTER_QUERY_KEY = ['admin', 'newsletter']

/**
 * Hook to manage newsletters (user subscription + admin management)
 */
export const useNewsletters = () => {
  const queryClient = useQueryClient()

  // ========================================
  // USER: Mutations
  // ========================================

  const subscribeMutation = useMutation({
    mutationFn: (data: SubscribeNewsletterInput) =>
      newsletterService.subscribe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NEWSLETTER_QUERY_KEY })
      toast.success(
        'Inscription réussie ! Merci de vous être inscrit à notre newsletter.',
      )
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erreur lors de l'inscription à la newsletter")
    },
  })

  const unsubscribeMutation = useMutation({
    mutationFn: (email: string) => newsletterService.unsubscribe(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NEWSLETTER_QUERY_KEY })
      toast.success('Vous avez été désinscrit de notre newsletter.')
    },
    onError: (err: Error) => {
      toast.error(
        err.message || 'Erreur lors de la désinscription de la newsletter',
      )
    },
  })

  // ========================================
  // USER: Actions
  // ========================================

  function subscribe(data: SubscribeNewsletterInput) {
    return subscribeMutation.mutateAsync(data)
  }

  function unsubscribe(email: string) {
    return unsubscribeMutation.mutateAsync(email)
  }

  // ========================================
  // ADMIN: State
  // ========================================

  const filters = ref<NewsletterFilters>({
    page: 1,
    limit: 20,
    activeOnly: false,
  })

  // ========================================
  // ADMIN: Queries
  // ========================================

  const subscribersQuery = useQuery({
    queryKey: computed(() => [
      ...NEWSLETTER_QUERY_KEY,
      'subscribers',
      filters.value,
    ]),
    queryFn: () => newsletterService.getSubscribers(filters.value),
    staleTime: 1000 * 60 * 2,
  })

  const statsQuery = useQuery({
    queryKey: [...NEWSLETTER_QUERY_KEY, 'stats'],
    queryFn: () => newsletterService.getStats(),
    staleTime: 1000 * 60 * 5,
  })

  // ========================================
  // ADMIN: Actions
  // ========================================

  function setPage(page: number) {
    filters.value = { ...filters.value, page }
  }

  function setLimit(limit: number) {
    filters.value = { ...filters.value, limit, page: 1 }
  }

  function toggleActiveOnly() {
    filters.value = {
      ...filters.value,
      activeOnly: !filters.value.activeOnly,
      page: 1,
    }
  }

  function exportToCsv() {
    const subscribers = subscribersQuery.data.value?.data || []
    if (subscribers.length === 0) return

    const headers = ['Email', 'Statut', 'Date inscription']
    const rows = subscribers.map((s) => [
      s.email,
      s.isActive ? 'Actif' : 'Inactif',
      new Date(s.createdAt).toLocaleDateString('fr-FR'),
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  // ========================================
  // Return (expose public API)
  // ========================================

  return {
    // USER: Actions
    subscribe,
    unsubscribe,

    // USER: Loading states
    isSubscribing: computed(() => subscribeMutation.isPending.value),
    isUnsubscribing: computed(() => unsubscribeMutation.isPending.value),

    // ADMIN: Data
    subscribers: computed(() => subscribersQuery.data.value?.data || []),
    pagination: computed(() => subscribersQuery.data.value?.meta || null),
    stats: computed<NewsletterStats | null>(
      () => statsQuery.data.value || null,
    ),
    filters,

    // ADMIN: Loading states
    isLoading: subscribersQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    isError: subscribersQuery.isError,
    error: subscribersQuery.error,
    refetch: subscribersQuery.refetch,

    // ADMIN: Actions
    setPage,
    setLimit,
    toggleActiveOnly,
    exportToCsv,
  }
}
