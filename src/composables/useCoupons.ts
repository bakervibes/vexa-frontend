import {
  couponService,
  type CreateCouponInput,
  type UpdateCouponInput,
} from '@/services/coupons.service'
import type { AppliedCoupon, Coupon } from '@/types'
import type {
  ApplyCouponInput,
  ValidateCouponInput,
} from '@/validators/coupons.validator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { computed, ref, toValue, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useCarts } from './useCarts'

const COUPONS_QUERY_KEY = ['admin', 'coupons']

/**
 * Hook to manage coupons (user application + admin management)
 */
export const useCoupons = (
  options: { cartSubtotal?: MaybeRefOrGetter<number> } = {},
) => {
  const queryClient = useQueryClient()
  const { cartSubtotal: ownCartSubtotal } = useCarts()
  const route = useRoute()
  const router = useRouter()

  // Use provided subtotal or fallback to own cart subtotal
  const currentCartSubtotal = computed(() => {
    if (options.cartSubtotal) {
      return toValue(options.cartSubtotal)
    }
    return ownCartSubtotal.value
  })

  // ========================================
  // USER: Coupon Application State
  // ========================================

  const appliedCoupon = ref<AppliedCoupon | null>(null)
  const couponCode = ref<string>('')
  const isApplyingCoupon = ref(false)

  const couponFromUrl = computed(() => {
    const code = route.query.coupon
    return typeof code === 'string' ? code : null
  })

  // ========================================
  // USER: Mutations
  // ========================================

  const validateCouponMutation = useMutation({
    mutationFn: (data: ValidateCouponInput) =>
      couponService.validateCoupon(data),
    onError: (error: Error) => {
      toast.error(error.message || 'Invalid coupon code')
      removeCouponFromUrl()
    },
  })

  const applyCouponMutation = useMutation({
    mutationFn: (data: ApplyCouponInput) => couponService.applyCoupon(data),
    onSuccess: (data) => {
      appliedCoupon.value = data
      toast.success(
        `Coupon "${data.code}" applied! You save ${formatDiscount(data)}`,
      )
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to apply coupon')
      appliedCoupon.value = null
      removeCouponFromUrl()
    },
  })

  // ========================================
  // USER: Helper functions
  // ========================================

  function formatDiscount(coupon: AppliedCoupon): string {
    if (coupon.type === 'PERCENTAGE') {
      return `${coupon.value}%`
    }
    return `${coupon.discountAmount.toFixed(2)} FCFA`
  }

  function addCouponToUrl(code: string) {
    const query = { ...route.query, coupon: code.toUpperCase() }
    router.replace({ query })
  }

  function removeCouponFromUrl() {
    const query = { ...route.query }
    delete query.coupon
    router.replace({ query })
  }

  // ========================================
  // USER: Actions
  // ========================================

  async function applyCoupon(code?: string) {
    const codeToApply = code || couponCode.value
    if (!codeToApply.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    isApplyingCoupon.value = true

    try {
      const result = await applyCouponMutation.mutateAsync({
        code: codeToApply.trim().toUpperCase(),
        orderTotal: currentCartSubtotal.value,
      })

      addCouponToUrl(result.code)
      couponCode.value = ''
    } finally {
      isApplyingCoupon.value = false
    }
  }

  function removeCoupon() {
    appliedCoupon.value = null
    couponCode.value = ''
    removeCouponFromUrl()
    toast.info('Coupon removed')
  }

  async function recalculateDiscount() {
    if (!appliedCoupon.value) return
    try {
      const result = await couponService.applyCoupon({
        code: appliedCoupon.value.code,
        orderTotal: currentCartSubtotal.value,
      })
      appliedCoupon.value = result
    } catch {
      appliedCoupon.value = null
      removeCouponFromUrl()
    }
  }

  async function validateCoupon(data: ValidateCouponInput) {
    return validateCouponMutation.mutateAsync(data)
  }

  // ========================================
  // USER: Watchers
  // ========================================

  watch(
    couponFromUrl,
    async (newCode) => {
      if (newCode && newCode !== appliedCoupon.value?.code) {
        await applyCoupon(newCode)
      } else if (!newCode && appliedCoupon.value) {
        appliedCoupon.value = null
      }
    },
    { immediate: true },
  )

  watch(
    currentCartSubtotal,
    async (newTotal, oldTotal) => {
      if (appliedCoupon.value && newTotal !== oldTotal && newTotal > 0) {
        await recalculateDiscount()
      }
    },
    { immediate: false },
  )

  // ========================================
  // USER: Computed values
  // ========================================

  const discountAmount = computed(
    () => appliedCoupon.value?.discountAmount ?? 0,
  )

  const hasAppliedCoupon = computed(() => appliedCoupon.value !== null)

  const appliedCouponCode = computed(() => appliedCoupon.value?.code ?? null)

  const discountPercentage = computed(() => {
    if (!appliedCoupon.value) return 0
    if (appliedCoupon.value.type === 'PERCENTAGE') {
      return appliedCoupon.value.value
    }
    const total = currentCartSubtotal.value
    if (total === 0) return 0
    return (appliedCoupon.value.discountAmount / total) * 100
  })

  // ========================================
  // ADMIN: State
  // ========================================

  const includeInactive = ref(true)

  // ========================================
  // ADMIN: Queries
  // ========================================

  const couponsQuery = useQuery({
    queryKey: computed(() => [...COUPONS_QUERY_KEY, includeInactive.value]),
    queryFn: () => couponService.getAllCoupons(includeInactive.value),
    staleTime: 1000 * 60 * 2,
  })

  // ========================================
  // ADMIN: Mutations
  // ========================================

  const createMutation = useMutation({
    mutationFn: (data: CreateCouponInput) => couponService.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY })
      toast.success('Coupon créé avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création du coupon')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponInput }) =>
      couponService.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY })
      toast.success('Coupon mis à jour avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du coupon')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY })
      toast.success('Coupon supprimé avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression du coupon')
    },
  })

  // ========================================
  // ADMIN: Actions
  // ========================================

  async function createCoupon(data: CreateCouponInput): Promise<Coupon | null> {
    try {
      return await createMutation.mutateAsync(data)
    } catch {
      return null
    }
  }

  async function updateCoupon(
    id: string,
    data: UpdateCouponInput,
  ): Promise<Coupon | null> {
    try {
      return await updateMutation.mutateAsync({ id, data })
    } catch {
      return null
    }
  }

  async function deleteCoupon(id: string): Promise<Coupon | null> {
    try {
      return await deleteMutation.mutateAsync(id)
    } catch {
      return null
    }
  }

  function toggleInactiveFilter() {
    includeInactive.value = !includeInactive.value
  }

  // ========================================
  // Return (expose public API)
  // ========================================

  return {
    // USER: State
    couponCode,
    appliedCoupon: computed(() => appliedCoupon.value),
    discountAmount,
    hasAppliedCoupon,
    appliedCouponCode,
    discountPercentage,

    // USER: Loading states
    isApplyingCoupon: computed(() => isApplyingCoupon.value),
    isValidatingCoupon: computed(() => validateCouponMutation.isPending.value),

    // USER: Actions
    applyCoupon,
    removeCoupon,
    recalculateDiscount,
    validateCoupon,

    // USER: URL helpers
    addCouponToUrl,
    removeCouponFromUrl,

    // ADMIN: Data
    coupons: computed(() => couponsQuery.data.value || []),
    isLoading: couponsQuery.isLoading,
    isError: couponsQuery.isError,
    error: couponsQuery.error,
    refetch: couponsQuery.refetch,

    // ADMIN: Filters
    includeInactive,
    toggleInactiveFilter,

    // ADMIN: Actions
    createCoupon,
    updateCoupon,
    deleteCoupon,

    // ADMIN: Loading states
    isCreating: computed(() => createMutation.isPending.value),
    isUpdating: computed(() => updateMutation.isPending.value),
    isDeleting: computed(() => deleteMutation.isPending.value),
  }
}
