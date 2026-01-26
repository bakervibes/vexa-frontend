<script setup lang="ts">
import { Button } from '@/components/ui/button'
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
  <div class="flex justify-center">
    <Card class="w-full max-w-2xl">
      <CardContent class="p-8 text-center">
        <!-- MONEROO PAYMENT VERIFICATION IN PROGRESS -->
        <div
          v-if="isVerifyingPayment"
          class="space-y-6 py-10"
        >
          <div
            class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"
          />
          <h2 class="text-xl font-semibold text-gray-700">
            Verifying your payment...
          </h2>
          <p class="text-gray-500">
            Please wait while we confirm your payment.
          </p>
        </div>

        <!-- MONEROO PAYMENT VERIFICATION ERROR -->
        <div
          v-else-if="paymentVerificationError"
          class="space-y-4 py-10"
        >
          <svg
            class="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
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

          <h2 class="text-xl font-semibold text-red-600">
            Payment Verification Failed
          </h2>
          <p class="text-gray-600">
            {{ paymentVerificationError }}
          </p>

          <div class="flex justify-center gap-4">
            <Button
              variant="outline"
              @click="confirmPaymentFallback"
            >
              Try Again
            </Button>
            <RouterLink to="/my-account/orders">
              <Button>View My Orders</Button>
            </RouterLink>
          </div>
        </div>

        <!-- LOADING -->
        <div
          v-else-if="isLoadingOrder"
          class="space-y-6"
        >
          <Skeleton class="mx-auto h-8 w-48" />
          <Skeleton class="mx-auto h-12 w-64" />
          <Skeleton class="mx-auto h-10 w-40" />
          <div class="mx-auto max-w-sm space-y-4">
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
          </div>
        </div>

        <!-- ERROR: Missing order info -->
        <div
          v-else-if="!orderId && !orderNumber"
          class="space-y-4 py-10"
        >
          <svg
            class="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
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

          <h2 class="text-xl font-semibold text-red-600">
            Missing order number
          </h2>
          <p class="text-gray-600">
            The page requires an
            <strong>order number</strong>
            query parameter.
          </p>

          <RouterLink to="/">
            <Button class="mt-4">Return to Home</Button>
          </RouterLink>
        </div>

        <!-- ERROR: Generic error -->
        <div
          v-else-if="isErrorOrder"
          class="space-y-4 py-10"
        >
          <svg
            class="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
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

          <h2 class="text-xl font-semibold text-red-600">
            Unable to load order
          </h2>
          <p class="text-gray-500">
            Something went wrong while retrieving your order.
          </p>

          <RouterLink to="/">
            <Button class="mt-4">Return to Home</Button>
          </RouterLink>
        </div>

        <!-- ERROR: Order not found -->
        <div
          v-else-if="!order"
          class="space-y-4 py-10"
        >
          <svg
            class="mx-auto h-12 w-12 text-yellow-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M10.29 3.86L1.82 18a1 1 0 0 0 .85 1.5h18.66a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0z"
            />
            <line
              x1="12"
              y1="9"
              x2="12"
              y2="13"
            />
            <line
              x1="12"
              y1="17"
              x2="12.01"
              y2="17"
            />
          </svg>

          <h2 class="text-xl font-semibold text-yellow-600">Order not found</h2>
          <p class="text-gray-500">
            No order matches the number:
            <strong>{{ orderNumber }}</strong>
            .
          </p>

          <RouterLink to="/orders">
            <Button class="mt-4">View my orders</Button>
          </RouterLink>
        </div>

        <!-- SUCCESS -->
        <template v-else>
          <div class="mb-8">
            <p class="mb-2 text-lg text-gray-500">Thank you! 🎉</p>
            <h2 class="text-3xl font-semibold">Your order has been received</h2>
          </div>

          <!-- Shared Payment Banner -->
          <div
            v-if="isSharedPayment"
            class="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-left"
          >
            <h3 class="font-semibold text-blue-900">
              Payment for {{ order?.user?.name }}'s Cart
            </h3>
            <p class="text-sm text-blue-700">
              You have successfully paid for this shared cart. The order
              confirmation has been sent to {{ order?.user?.email }}.
            </p>
          </div>

          <!-- Modal Trigger -->
          <div class="mb-8">
            <Button
              variant="outline"
              class="gap-2"
              @click="isModalOpen = true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              View order items ({{ items.length }})
            </Button>

            <Dialog v-model:open="isModalOpen">
              <DialogContent class="max-h-[80vh] max-w-lg overflow-auto">
                <DialogHeader>
                  <DialogTitle>Order Items</DialogTitle>
                </DialogHeader>
                <div class="mt-4 space-y-4">
                  <div
                    v-for="item in items"
                    :key="item.id"
                    class="flex gap-4 rounded-lg border p-4"
                  >
                    <div
                      class="h-20 w-20 overflow-hidden rounded-md bg-gray-100"
                    >
                      <img
                        class="h-full w-full object-cover"
                        :src="getItemImage(item)"
                        :alt="getItemName(item)"
                      />
                    </div>

                    <div class="flex flex-1 flex-col justify-between">
                      <h4 class="font-medium text-gray-900">
                        {{ getItemName(item) }}
                      </h4>

                      <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">
                          {{ getItemQuantity(item) }} ×
                          {{ formatPrice(getItemPrice(item)) }}
                        </span>
                        <span class="font-medium">
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
                    class="py-8 text-center text-gray-500"
                  >
                    No items in this order
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <!-- Order details -->
          <div class="space-y-4 text-left">
            <div class="border-b pb-4">
              <h3 class="mb-2 font-medium">Delivery Address</h3>
              <div
                v-if="order.address"
                class="space-y-1 text-sm text-gray-600"
              >
                <div class="flex gap-4">
                  <p
                    class="w-1/3 shrink-0 text-sm whitespace-nowrap text-gray-500"
                  >
                    Recipient Name
                  </p>
                  <p class="font-medium text-gray-900">
                    {{ order.address.name }}
                  </p>
                </div>
                <div class="flex gap-4">
                  <p
                    class="w-1/3 shrink-0 text-sm whitespace-nowrap text-gray-500"
                  >
                    Street
                  </p>
                  <p class="font-medium">{{ order.address.street }}</p>
                </div>
                <div class="flex gap-4">
                  <p
                    class="w-1/3 shrink-0 text-sm whitespace-nowrap text-gray-500"
                  >
                    City, Country
                  </p>
                  <p class="font-medium">
                    {{ order.address.city }}, {{ order.address.country }}
                  </p>
                </div>
                <div class="flex gap-4">
                  <p
                    class="w-1/3 shrink-0 text-sm whitespace-nowrap text-gray-500"
                  >
                    Phone
                  </p>
                  <p class="font-medium">{{ order.address.phone }}</p>
                </div>
              </div>
            </div>

            <div class="flex justify-between border-b pb-3">
              <span class="text-gray-500">Order number</span>
              <span class="font-medium">{{ order?.orderNumber }}</span>
            </div>
            <div class="flex justify-between border-b pb-3">
              <span class="text-gray-500">Date</span>
              <span class="font-medium">{{ orderDate }}</span>
            </div>
            <div class="flex justify-between border-b pb-3">
              <span class="text-gray-500">Subtotal</span>
              <span class="font-medium">
                {{ formatPrice(order?.subtotalAmount) }}
              </span>
            </div>
            <div class="flex justify-between border-b pb-3">
              <span class="text-gray-500">Shipping cost</span>
              <span class="font-medium">
                {{ formatPrice(order?.shippingCost) }}
              </span>
            </div>
            <div
              class="flex justify-between border-b pb-3"
              :class="{ 'text-emerald-600': order?.discountAmount > 0 }"
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
              <span class="font-medium">
                {{ formatPrice(order?.discountAmount) }}
              </span>
            </div>
            <div class="flex justify-between border-b pb-3">
              <span class="text-gray-500">Total</span>
              <span class="font-medium">
                {{ formatPrice(order?.totalAmount) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Payment method</span>
              <span class="font-medium">{{ paymentMethod }}</span>
            </div>
          </div>

          <div class="mt-8 flex justify-center gap-4">
            <RouterLink to="/my-account/orders">
              <Button class="h-12 px-8">Purchase history</Button>
            </RouterLink>

            <Button
              variant="outline"
              class="h-12 gap-2 px-8"
              :disabled="isDownloadingInvoice"
              @click="handleDownloadInvoice"
            >
              <svg
                v-if="!isDownloadingInvoice"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
                class="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"
              />
              Download Invoice
            </Button>
          </div>
        </template>
      </CardContent>
    </Card>
  </div>
</template>
