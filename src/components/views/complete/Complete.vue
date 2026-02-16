<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/composables/useAuth'
import { useOrderById, useOrderByNumber } from '@/composables/useOrders'
import { paymentService } from '@/services/payments.service'
import { PaymentProvider, type OrderItem } from '@/types'
import { formatPrice } from '@/utils/lib'
import { useQueryClient } from '@tanstack/vue-query'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const isModalOpen = ref(false)

// Function to invalidate cart and orders queries after successful payment
const invalidateCartAndOrders = () => {
  queryClient.invalidateQueries({ queryKey: ['carts'] })
  queryClient.invalidateQueries({ queryKey: ['orders'] })
}

// Payment verification states
const isVerifyingPayment = ref(false)
const paymentVerificationError = ref<string | null>(null)
const confirmedOrderNumber = ref<string | null>(null)

// Query params
const orderId = computed(() => {
  const value = route.query.orderId
  return typeof value === 'string' ? value : null
})

const orderNumber = computed(() => {
  const value = route.query.orderNumber
  return typeof value === 'string' ? value : null
})

// Determine which order number to use for fetching
const effectiveOrderNumber = computed(() => {
  return orderNumber.value || confirmedOrderNumber.value
})

// Use orderId to fetch order directly when we don't have orderNumber yet
const { order: orderById, isLoadingOrder: isLoadingById } = useOrderById(
  computed(() => (!effectiveOrderNumber.value ? orderId.value : null)),
)

// Use orderNumber to fetch order when available
const {
  order: orderByNumber,
  isLoadingOrder: isLoadingByNumber,
  isErrorOrder,
} = useOrderByNumber(effectiveOrderNumber)

// Combine both order sources
const order = computed(() => orderByNumber.value || orderById.value)
const isLoadingOrder = computed(
  () => isLoadingById.value || isLoadingByNumber.value,
)

// Check if we need to confirm payment (orderId present but order is PENDING)
const needsPaymentConfirmation = computed(() => {
  return orderId.value && !orderNumber.value && !confirmedOrderNumber.value
})

// Confirm payment (fallback if webhook hasn't processed yet)
const confirmPaymentFallback = async () => {
  if (!orderId.value) return

  isVerifyingPayment.value = true
  paymentVerificationError.value = null

  try {
    const result = await paymentService.confirmPayment(orderId.value)

    if (result.success) {
      confirmedOrderNumber.value = result.orderNumber
      // Invalidate cart and orders queries to trigger refetch
      invalidateCartAndOrders()
      // Optionally update URL to use orderNumber
      router.replace({
        name: 'complete',
        query: { orderNumber: result.orderNumber },
      })
    } else if (result.message) {
      // Payment not yet processed, wait and retry
      paymentVerificationError.value = result.message
    }
  } catch (err) {
    paymentVerificationError.value =
      err instanceof Error ? err.message : 'Failed to confirm payment'
  } finally {
    isVerifyingPayment.value = false
  }
}

// Auto-confirm payment on mount if orderId is present
onMounted(() => {
  // If we have an orderNumber, payment was successful via redirect (Stripe/PayPal/Moneroo)
  // Invalidate queries to refresh cart and orders
  if (orderNumber.value) {
    invalidateCartAndOrders()
  }
  // If we only have orderId, need to confirm payment (Kkiapay or fallback)
  if (needsPaymentConfirmation.value) {
    confirmPaymentFallback()
  }
})

// Watch for order to become available and check status
watch(orderById, (newOrder) => {
  if (newOrder && newOrder.status !== 'PENDING') {
    // Order already processed, use its orderNumber
    confirmedOrderNumber.value = newOrder.orderNumber
    // Invalidate cart and orders queries to trigger refetch
    invalidateCartAndOrders()
    router.replace({
      name: 'complete',
      query: { orderNumber: newOrder.orderNumber },
    })
  }
})

// Computed helpers
const orderDate = computed(() => {
  if (!order.value?.createdAt) return ''
  return new Date(order.value.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const paymentMethod = computed(() => {
  const p = order.value?.payments?.[0]
  if (!p) return 'N/A'

  const provider = p.provider as PaymentProvider
  switch (provider) {
    case PaymentProvider.STRIPE:
      return 'Credit Card'
    case PaymentProvider.PAYPAL:
      return 'PayPal'
    case PaymentProvider.KKIAPAY:
      return 'Kkiapay (Mobile Money)'
    case PaymentProvider.MONEROO:
      return 'Moneroo'
    default:
      return provider
  }
})

const _total = computed(() => order.value?.totalAmount ?? 0)
const items = computed(() => order.value?.orderItems ?? [])

// Item helpers - OrderItem has direct properties, not nested under 'data'
const getItemPrice = (item: OrderItem) => item.price
const getItemName = (item: OrderItem) => item.name
const getItemImage = (_item: OrderItem) => '' // OrderItem doesn't have image, would need to fetch product
const getItemQuantity = (item: OrderItem) => item.quantity

// Shared payment logic
const { user: currentUser } = useAuth()

const isSharedPayment = computed(() => {
  if (!order.value || !currentUser.value) return false
  // Current user is the payer but not the owner of the order
  return (
    order.value.payer?.id === currentUser.value.id &&
    order.value.user?.id !== currentUser.value.id
  )
})

const isDownloadingInvoice = ref(false)

const handleDownloadInvoice = async () => {
  if (!order.value?.id) return

  isDownloadingInvoice.value = true
  try {
    const blob = await import('@/services/orders.service').then((m) =>
      m.orderService.downloadInvoice(order.value!.id),
    )

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `invoice-${order.value!.orderNumber}.pdf`)
    document.body.appendChild(link)
    link.click()

    // Cleanup
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download invoice:', error)
    // You might want to add a toast notification here if you have one available
  } finally {
    isDownloadingInvoice.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen justify-center bg-[#0A0A0A] px-4 py-16">
    <Card
      class="bg-surface w-full max-w-2xl border-0 border-[#1E1E1E] shadow-2xl"
    >
      <CardContent class="p-8 text-center md:p-12">
        <!-- MONEROO PAYMENT VERIFICATION IN PROGRESS -->
        <div
          v-if="isVerifyingPayment"
          class="space-y-8 py-10"
        >
          <div
            class="mx-auto h-12 w-12 animate-spin border-4 border-[#1E1E1E] border-t-[#C8A97E]"
          />
          <p class="text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
            Verifying
          </p>
          <h2 class="font-display text-4xl font-light text-[#E8E8E8]">
            Confirming your payment
          </h2>
          <p class="text-text-muted">
            Please wait while we verify your transaction.
          </p>
        </div>

        <!-- MONEROO PAYMENT VERIFICATION ERROR -->
        <div
          v-else-if="paymentVerificationError"
          class="space-y-6 py-10"
        >
          <svg
            class="mx-auto h-12 w-12 text-[#C8A97E]"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <line
              x1="12"
              y1="8"
              x2="12"
              y2="12"
            />
            <line
              x1="12"
              y1="16"
              x2="12.01"
              y2="16"
            />
          </svg>

          <p class="text-xs tracking-[0.3em] text-[#C8A97E] uppercase">Error</p>
          <h2 class="font-display text-4xl font-light text-[#E8E8E8]">
            Verification Failed
          </h2>
          <p class="text-text-muted">
            {{ paymentVerificationError }}
          </p>

          <div class="mx-auto mt-8 h-px w-24 bg-[#C8A97E]/40" />

          <div class="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
            <button
              class="border border-[#C8A97E]/40 px-5 py-3 text-xs tracking-[0.2em] text-[#C8A97E] uppercase transition-all hover:bg-[#C8A97E] hover:text-[#0A0A0A]"
              @click="confirmPaymentFallback"
            >
              Try Again
            </button>
            <RouterLink to="/my-account/orders">
              <button
                class="bg-[#C8A97E] px-5 py-3 text-xs tracking-[0.2em] text-[#0A0A0A] uppercase transition-all hover:bg-[#B8995E]"
              >
                View My Orders
              </button>
            </RouterLink>
          </div>
        </div>

        <!-- LOADING -->
        <div
          v-else-if="isLoadingOrder"
          class="space-y-6 py-10"
        >
          <Skeleton class="mx-auto h-8 w-48 bg-[#1E1E1E]" />
          <Skeleton class="mx-auto h-12 w-64 bg-[#1E1E1E]" />
          <Skeleton class="mx-auto h-10 w-40 bg-[#1E1E1E]" />
          <div class="mx-auto max-w-sm space-y-4">
            <Skeleton class="h-10 w-full bg-[#1E1E1E]" />
            <Skeleton class="h-10 w-full bg-[#1E1E1E]" />
            <Skeleton class="h-10 w-full bg-[#1E1E1E]" />
            <Skeleton class="h-10 w-full bg-[#1E1E1E]" />
          </div>
        </div>

        <!-- ERROR: Missing order info -->
        <div
          v-else-if="!orderId && !orderNumber"
          class="space-y-6 py-10"
        >
          <svg
            class="mx-auto h-12 w-12 text-[#C8A97E]"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <line
              x1="12"
              y1="8"
              x2="12"
              y2="12"
            />
            <line
              x1="12"
              y1="16"
              x2="12.01"
              y2="16"
            />
          </svg>

          <p class="text-xs tracking-[0.3em] text-[#C8A97E] uppercase">Error</p>
          <h2 class="font-display text-4xl font-light text-[#E8E8E8]">
            Missing Order Number
          </h2>
          <p class="text-text-muted">
            The page requires an
            <span class="text-[#C8A97E]">order number</span>
            query parameter.
          </p>

          <div class="mx-auto mt-8 h-px w-24 bg-[#C8A97E]/40" />

          <RouterLink to="/">
            <button
              class="mt-4 bg-[#C8A97E] px-5 py-3 text-xs tracking-[0.2em] text-[#0A0A0A] uppercase transition-all hover:bg-[#B8995E]"
            >
              Return to Home
            </button>
          </RouterLink>
        </div>

        <!-- ERROR: Generic error -->
        <div
          v-else-if="isErrorOrder"
          class="space-y-6 py-10"
        >
          <svg
            class="mx-auto h-12 w-12 text-[#C8A97E]"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <line
              x1="12"
              y1="8"
              x2="12"
              y2="12"
            />
            <line
              x1="12"
              y1="16"
              x2="12.01"
              y2="16"
            />
          </svg>

          <p class="text-xs tracking-[0.3em] text-[#C8A97E] uppercase">Error</p>
          <h2 class="font-display text-4xl font-light text-[#E8E8E8]">
            Unable to Load Order
          </h2>
          <p class="text-text-muted">
            Something went wrong while retrieving your order.
          </p>

          <div class="mx-auto mt-8 h-px w-24 bg-[#C8A97E]/40" />

          <RouterLink to="/">
            <button
              class="mt-4 bg-[#C8A97E] px-5 py-3 text-xs tracking-[0.2em] text-[#0A0A0A] uppercase transition-all hover:bg-[#B8995E]"
            >
              Return to Home
            </button>
          </RouterLink>
        </div>

        <!-- ERROR: Order not found -->
        <div
          v-else-if="!order"
          class="space-y-6 py-10"
        >
          <svg
            class="mx-auto h-12 w-12 text-[#C8A97E]"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <line
              x1="12"
              y1="8"
              x2="12"
              y2="12"
            />
            <line
              x1="12"
              y1="16"
              x2="12.01"
              y2="16"
            />
          </svg>

          <p class="text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
            Not Found
          </p>
          <h2 class="font-display text-4xl font-light text-[#E8E8E8]">
            Order Not Found
          </h2>
          <p class="text-text-muted">
            No order matches the number:
            <span class="text-[#C8A97E]">{{ orderNumber }}</span>
          </p>

          <div class="mx-auto mt-8 h-px w-24 bg-[#C8A97E]/40" />

          <RouterLink to="/orders">
            <button
              class="mt-4 bg-[#C8A97E] px-5 py-3 text-xs tracking-[0.2em] text-[#0A0A0A] uppercase transition-all hover:bg-[#B8995E]"
            >
              View My Orders
            </button>
          </RouterLink>
        </div>

        <!-- SUCCESS -->
        <template v-else>
          <div class="mb-10">
            <p class="mb-4 text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
              Order Confirmed
            </p>
            <h2 class="font-display text-5xl font-light text-[#E8E8E8]">
              Thank You
            </h2>
            <div class="mx-auto mt-6 h-px w-24 bg-[#C8A97E]/40" />
          </div>

          <!-- Shared Payment Banner -->
          <div
            v-if="isSharedPayment"
            class="mb-8 border border-[#C8A97E]/30 bg-[#0A0A0A] p-6 text-left"
          >
            <p class="mb-2 text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
              Shared Cart
            </p>
            <h3 class="font-display text-xl font-light text-[#E8E8E8]">
              Payment for {{ order?.user?.name }}'s Cart
            </h3>
            <p class="text-text-muted mt-2 text-sm">
              You have successfully paid for this shared cart. The order
              confirmation has been sent to {{ order?.user?.email }}.
            </p>
          </div>

          <!-- Modal Trigger -->
          <div class="mb-10">
            <button
              class="border border-[#C8A97E]/40 px-5 py-3 text-xs tracking-[0.2em] text-[#C8A97E] uppercase transition-all hover:bg-[#C8A97E] hover:text-[#0A0A0A]"
              @click="isModalOpen = true"
            >
              <span class="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"
                  />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                View Order Items ({{ items.length }})
              </span>
            </button>

            <Dialog v-model:open="isModalOpen">
              <DialogContent
                class="bg-surface max-h-[80vh] max-w-lg border-[#1E1E1E] text-[#E8E8E8]"
              >
                <DialogHeader>
                  <DialogTitle
                    class="font-display text-2xl font-light text-[#E8E8E8]"
                  >
                    Order Items
                  </DialogTitle>
                </DialogHeader>
                <div class="mt-4 space-y-4">
                  <div
                    v-for="item in items"
                    :key="item.id"
                    class="flex gap-4 border border-[#1E1E1E] bg-[#0A0A0A] p-4"
                  >
                    <div class="h-20 w-20 overflow-hidden bg-[#1E1E1E]">
                      <img
                        class="h-full w-full object-cover"
                        :src="getItemImage(item)"
                        :alt="getItemName(item)"
                      />
                    </div>

                    <div class="flex flex-1 flex-col justify-between">
                      <h4
                        class="font-display text-lg font-light text-[#E8E8E8]"
                      >
                        {{ getItemName(item) }}
                      </h4>

                      <div class="flex items-center justify-between">
                        <span class="text-text-muted text-sm">
                          {{ getItemQuantity(item) }} ×
                          {{ formatPrice(getItemPrice(item)) }}
                        </span>
                        <span class="text-[#C8A97E]">
                          {{
                            formatPrice(
                              getItemPrice(item) * getItemQuantity(item),
                            )
                          }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="items.length === 0"
                    class="text-text-muted py-8 text-center"
                  >
                    No items in this order
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <!-- Order details -->
          <div class="space-y-0 text-left">
            <div class="border-b border-[#1E1E1E] pb-6">
              <p class="mb-4 text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
                Delivery Address
              </p>
              <div
                v-if="order.address"
                class="space-y-3"
              >
                <div class="flex gap-4">
                  <p class="text-text-muted w-1/3 shrink-0 text-sm">
                    Recipient
                  </p>
                  <p class="text-[#E8E8E8]">
                    {{ order.address.name }}
                  </p>
                </div>
                <div class="flex gap-4">
                  <p class="text-text-muted w-1/3 shrink-0 text-sm">Street</p>
                  <p class="text-[#E8E8E8]">{{ order.address.street }}</p>
                </div>
                <div class="flex gap-4">
                  <p class="text-text-muted w-1/3 shrink-0 text-sm">City</p>
                  <p class="text-[#E8E8E8]">
                    {{ order.address.city }}, {{ order.address.country }}
                  </p>
                </div>
                <div class="flex gap-4">
                  <p class="text-text-muted w-1/3 shrink-0 text-sm">Phone</p>
                  <p class="text-[#E8E8E8]">{{ order.address.phone }}</p>
                </div>
              </div>
            </div>

            <div class="flex justify-between border-b border-[#1E1E1E] py-4">
              <span class="text-text-muted">Order Number</span>
              <span class="text-[#C8A97E]">{{ order?.orderNumber }}</span>
            </div>
            <div class="flex justify-between border-b border-[#1E1E1E] py-4">
              <span class="text-text-muted">Date</span>
              <span class="text-[#E8E8E8]">{{ orderDate }}</span>
            </div>
            <div class="flex justify-between border-b border-[#1E1E1E] py-4">
              <span class="text-text-muted">Subtotal</span>
              <span class="text-[#E8E8E8]">
                {{ formatPrice(order?.subtotalAmount) }}
              </span>
            </div>
            <div class="flex justify-between border-b border-[#1E1E1E] py-4">
              <span class="text-text-muted">Shipping</span>
              <span class="text-[#E8E8E8]">
                {{ formatPrice(order?.shippingCost) }}
              </span>
            </div>
            <div
              class="flex justify-between border-b border-[#1E1E1E] py-4"
              :class="{ 'text-[#C8A97E]': order?.discountAmount > 0 }"
            >
              <span>
                Discount
                <span v-if="order?.coupon && order?.discountAmount > 0">
                  <span v-if="order?.coupon?.type === 'PERCENTAGE'">
                    (-{{ order?.coupon?.value }}%)
                  </span>
                  <span v-else>(-{{ formatPrice(order?.coupon?.value) }})</span>
                </span>
              </span>
              <span class="text-[#E8E8E8]">
                {{ formatPrice(order?.discountAmount) }}
              </span>
            </div>
            <div class="flex justify-between border-b border-[#1E1E1E] py-4">
              <span class="text-text-muted">Total</span>
              <span class="font-display text-xl text-[#C8A97E]">
                {{ formatPrice(order?.totalAmount) }}
              </span>
            </div>
            <div class="flex justify-between py-4">
              <span class="text-text-muted">Payment Method</span>
              <span class="text-[#E8E8E8]">{{ paymentMethod }}</span>
            </div>
          </div>

          <div class="mx-auto mt-8 h-px w-24 bg-[#C8A97E]/40" />

          <div class="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <RouterLink to="/my-account/orders">
              <button
                class="bg-[#C8A97E] px-5 py-3 text-xs tracking-[0.2em] text-[#0A0A0A] uppercase transition-all hover:bg-[#B8995E]"
              >
                Purchase History
              </button>
            </RouterLink>

            <button
              class="flex items-center justify-center gap-2 border border-[#C8A97E]/40 px-5 py-3 text-xs tracking-[0.2em] text-[#C8A97E] uppercase transition-all hover:bg-[#C8A97E] hover:text-[#0A0A0A] disabled:opacity-50"
              :disabled="isDownloadingInvoice"
              @click="handleDownloadInvoice"
            >
              <svg
                v-if="!isDownloadingInvoice"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line
                  x1="12"
                  x2="12"
                  y1="15"
                  y2="3"
                />
              </svg>
              <div
                v-else
                class="h-4 w-4 animate-spin border-2 border-[#C8A97E] border-t-transparent"
              />
              Download Invoice
            </button>
          </div>
        </template>
      </CardContent>
    </Card>
  </div>
</template>
