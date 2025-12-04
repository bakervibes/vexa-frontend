import { couponService } from '@/services/coupons.service'
import type { AppliedCoupon } from '@/types'
import type {
  ApplyCouponInput,
  ValidateCouponInput,
} from '@/validators/coupons.validator'
import { useMutation } from '@tanstack/vue-query'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

/**
 * Composable to manage coupon state and URL synchronization
 */
export function useCoupons(cartTotal: () => number) {
  const route = useRoute()
  const router = useRouter()

  // Local state for the applied coupon
  const appliedCoupon = ref<AppliedCoupon | null>(null)
  const couponCode = ref<string>('')
  const isApplyingCoupon = ref(false)

  // Get coupon code from URL query parameter
  const couponFromUrl = computed(() => {
    const code = route.query.coupon
    return typeof code === 'string' ? code : null
  })

  // ========================================
  // Mutations
  // ========================================

  const validateCouponMutation = useMutation({
    mutationFn: (data: ValidateCouponInput) =>
      couponService.validateCoupon(data),
    onError: (error: Error) => {
      toast.error(error.message || 'Invalid coupon code')
      // Remove invalid coupon from URL
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
      // Remove invalid coupon from URL
      removeCouponFromUrl()
    },
  })

  // ========================================
  // Helper functions
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
  // Actions
  // ========================================

  /**
   * Apply a coupon code
   */
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
        cartTotal: cartTotal(),
      })

      // Add coupon to URL
      addCouponToUrl(result.code)
      couponCode.value = ''
    } finally {
      isApplyingCoupon.value = false
    }
  }

  /**
   * Remove the applied coupon
   */
  function removeCoupon() {
    appliedCoupon.value = null
    couponCode.value = ''
    removeCouponFromUrl()
    toast.info('Coupon removed')
  }

  /**
   * Recalculate discount when cart total changes
   */
  async function recalculateDiscount() {
    if (!appliedCoupon.value) return

    try {
      const result = await couponService.applyCoupon({
        code: appliedCoupon.value.code,
        cartTotal: cartTotal(),
      })
      appliedCoupon.value = result
    } catch {
      // If recalculation fails, remove the coupon
      appliedCoupon.value = null
      removeCouponFromUrl()
    }
  }

  // ========================================
  // Watch for URL coupon changes
  // ========================================

  // Apply coupon from URL on mount or when URL changes
  watch(
    couponFromUrl,
    async (newCode) => {
      if (newCode && newCode !== appliedCoupon.value?.code) {
        await applyCoupon(newCode)
      } else if (!newCode && appliedCoupon.value) {
        // URL coupon was removed, clear applied coupon
        appliedCoupon.value = null
      }
    },
    { immediate: true },
  )

  // ========================================
  // Computed values
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
    // Calculate percentage for fixed discount
    const total = cartTotal()
    if (total === 0) return 0
    return (appliedCoupon.value.discountAmount / total) * 100
  })

  return {
    // State
    couponCode,
    appliedCoupon: computed(() => appliedCoupon.value),
    discountAmount,
    hasAppliedCoupon,
    appliedCouponCode,
    discountPercentage,

    // Loading states
    isApplyingCoupon: computed(() => isApplyingCoupon.value),
    isValidatingCoupon: computed(() => validateCouponMutation.isPending.value),

    // Actions
    applyCoupon,
    removeCoupon,
    recalculateDiscount,

    // URL helpers
    addCouponToUrl,
    removeCouponFromUrl,
  }
}

/**
 * Simple composable to just validate a coupon without applying it
 */
export function useValidateCoupon() {
  const mutation = useMutation({
    mutationFn: (data: ValidateCouponInput) =>
      couponService.validateCoupon(data),
  })

  return {
    validateCoupon: mutation.mutateAsync,
    isValidating: computed(() => mutation.isPending.value),
    error: computed(() => mutation.error.value),
  }
}
