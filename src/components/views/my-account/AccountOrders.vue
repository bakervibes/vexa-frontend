<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/composables/useAuth'
import { useOrderById, useOrders } from '@/composables/useOrders'
import { paymentService } from '@/services/payments.service'
import {
  OrderStatus,
  PaymentProvider,
  type OrderDetails,
  type OrderItem,
} from '@/types'
import { convertCurrency, formatPrice } from '@/utils/lib'
import {
  addFailedListener,
  addKkiapayCloseListener,
  addSuccessListener,
  openKkiapayWidget,
} from 'kkiapay'
import {
  AlertCircleIcon,
  CheckIcon,
  CopyIcon,
  CreditCardIcon,
  EyeIcon,
  GlobeIcon,
  MoreHorizontal,
  PackageIcon,
  ShoppingBagIcon,
  SmartphoneIcon,
  WalletIcon,
  XCircleIcon,
} from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const {
  orders,
  isLoadingOrders,
  cancelOrder,
  isCancellingOrder: _isCancellingOrder,
  requestRefund,
  isRequestingRefund: _isRequestingRefund,
} = useOrders()

// Modal state
const isModalOpen = ref(false)
const selectedOrderId = ref<string | null>(null)

// Fetch order details when modal opens - pass the ref for reactivity
const { order, isLoadingOrder } = useOrderById(selectedOrderId)

// Format date for display
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Get status badge variant
const getStatusVariant = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.DELIVERED:
      return 'default'
    case OrderStatus.SHIPPED:
      return 'secondary'
    case OrderStatus.PROCESSING:
      return 'outline'
    case OrderStatus.PENDING:
      return 'secondary'
    case OrderStatus.CANCELLED:
      return 'destructive'
    case OrderStatus.REFUND_REQUESTED:
      return 'secondary'
    case OrderStatus.REFUNDED:
      return 'secondary'
    default:
      return 'secondary'
  }
}

// Format status for display
const formatStatus = (status: OrderStatus) => {
  console.log({ status })
  if (status === OrderStatus.REFUND_REQUESTED) return 'Refund Requested'
  return status.charAt(0) + status.slice(1).toLowerCase()
}

// Get payment method display name
const getPaymentMethod = (provider?: PaymentProvider) => {
  if (!provider) return 'N/A'
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
}

// Item helpers - OrderItem has direct properties, not nested under 'data'
const getItemPrice = (item: OrderItem) => item.price
const getItemName = (item: OrderItem) => item.name
const getItemImage = (_item: OrderItem) => '' // OrderItem doesn't have image
const getItemQuantity = (item: OrderItem) => item.quantity

// Open order details modal
const openDetails = (order: OrderDetails) => {
  selectedOrderId.value = order.id
  isModalOpen.value = true
}

// Close modal
const closeModal = () => {
  isModalOpen.value = false
  selectedOrderId.value = null
}

const router = useRouter()
const { user: currentUser } = useAuth()

const isPaymentModalOpen = ref(false)
const processingOrderId = ref<string | null>(null)
const selectedPaymentMethod = ref<PaymentProvider>(PaymentProvider.STRIPE)
const isProcessingPayment = ref(false)

const openPaymentModal = (orderId: string) => {
  processingOrderId.value = orderId
  isPaymentModalOpen.value = true
}

const handleRetryPayment = async () => {
  if (!processingOrderId.value) return

  isProcessingPayment.value = true
  try {
    const paymentData = await paymentService.createPaymentSession(
      processingOrderId.value,
      selectedPaymentMethod.value,
    )

    if (selectedPaymentMethod.value === PaymentProvider.KKIAPAY) {
      const amount = await convertCurrency(
        paymentData.totalAmount,
        'EUR',
        'XOF',
      )
      handleOpenKkiapayWidget(
        processingOrderId.value,
        amount,
        currentUser.value!,
      )
      isPaymentModalOpen.value = false
    } else if (paymentData.redirectUrl) {
      window.location.href = paymentData.redirectUrl
    } else {
      toast.error('Failed to get payment URL')
    }
  } catch (error) {
    console.error('Payment retry failed:', error)
    toast.error('Failed to initiate payment')
  } finally {
    isProcessingPayment.value = false
  }
}

// Copy Payment Link Logic
const isPaymentLinkCopied = ref(false)

const handleGenerateAndCopyLink = async () => {
  if (!processingOrderId.value) return

  isProcessingPayment.value = true
  try {
    const paymentData = await paymentService.createPaymentSession(
      processingOrderId.value,
      selectedPaymentMethod.value,
    )

    if (paymentData.redirectUrl) {
      await navigator.clipboard.writeText(paymentData.redirectUrl)
      isPaymentLinkCopied.value = true
      toast.success('Payment link copied to clipboard')

      setTimeout(() => {
        isPaymentLinkCopied.value = false
      }, 2000)
    } else {
      toast.error('Could not generate payment link')
    }
  } catch (error) {
    console.error('Failed to generate link:', error)
    toast.error('Failed to generate payment link')
  } finally {
    isProcessingPayment.value = false
  }
}

// Ensure Kkiapay listeners are set up (reusing logic from Checkout)
const currentKkiapayOrderId = ref<string | null>(null)

const handleOpenKkiapayWidget = (
  orderId: string,
  amount: number,
  user: { name: string; email: string },
) => {
  currentKkiapayOrderId.value = orderId
  openKkiapayWidget({
    amount: Math.round(amount),
    position: 'center',
    name: user.name,
    email: user.email,
    phone: '97000000',
    data: JSON.stringify({ orderId }),
    theme: '#000000',
    key: import.meta.env.VITE_KKIAPAY_PUBLIC_KEY,
    sandbox: import.meta.env.VITE_ENV !== 'production',
  })
}

const handleKkiapaySuccess = async (response: { transactionId: string }) => {
  if (!currentKkiapayOrderId.value) return
  try {
    await paymentService.verifyKkiapay(
      currentKkiapayOrderId.value,
      response.transactionId,
    )
    toast.success('Payment successful!')
    router.push({
      name: 'complete',
      query: { orderId: currentKkiapayOrderId.value },
    })
  } catch {
    toast.error('Payment verification failed')
  } finally {
    currentKkiapayOrderId.value = null
  }
}

onMounted(() => {
  addSuccessListener(handleKkiapaySuccess)
  addFailedListener(() => toast.error('Payment failed'))
  addKkiapayCloseListener(() => {
    if (currentKkiapayOrderId.value) {
      toast.info('Payment cancelled')
      currentKkiapayOrderId.value = null
    }
  })
})

// Shared order helpers
const getOrderLabel = (order: OrderDetails) => {
  if (!currentUser.value) return ''

  const isPayer = order.payer?.id === currentUser.value.id
  const isOwner = order.user?.id === currentUser.value.id

  if (isPayer && !isOwner) {
    return `For ${order.user?.name || 'Unknown'}`
  }
  if (!isPayer && isOwner) {
    return `Paid by ${order.payer?.name || 'Unknown'}`
  }
  return ''
}
// Actions
const handleCancelOrder = async (orderId: string) => {
  if (!confirm('Are you sure you want to cancel this order?')) return
  await cancelOrder(orderId)
}

const handleRequestRefund = async (orderId: string) => {
  if (
    !confirm(
      'Are you sure you want to request a refund for this order? It will be reviewed by an admin.',
    )
  )
    return
  await requestRefund(orderId)
}

const handleDownloadInvoice = async (orderId: string) => {
  const toastId = toast.loading('Generating invoice...')
  try {
    const blob = await import('@/services/orders.service').then((m) =>
      m.orderService.downloadInvoice(orderId),
    )

    // Find order number for filename
    const order = orders.value.find((o) => o.id === orderId)
    const orderNum = order?.orderNumber || 'invoice'

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `invoice-${orderNum}.pdf`)
    document.body.appendChild(link)
    link.click()

    link.remove()
    window.URL.revokeObjectURL(url)
    toast.success('Invoice downloaded', { id: toastId })
  } catch (error) {
    console.error('Failed to download invoice:', error)
    toast.error('Failed to download invoice', { id: toastId })
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <h2 class="text-xl font-semibold">Orders History</h2>

    <!-- Loading State -->
    <div
      v-if="isLoadingOrders"
      class="space-y-4"
    >
      <Skeleton class="h-12 w-full" />
      <Skeleton
        v-for="i in 4"
        :key="i"
        class="h-16 w-full"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="orders.length === 0"
      class="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-16 text-center"
    >
      <div class="rounded-full bg-gray-100 p-4">
        <PackageIcon class="h-8 w-8 text-gray-400" />
      </div>
      <div class="space-y-1">
        <h3 class="text-lg font-semibold">No orders yet</h3>
        <p class="text-sm text-gray-500">
          When you place an order, it will appear here
        </p>
      </div>
      <RouterLink to="/shop">
        <Button
          variant="outline"
          class="mt-2"
        >
          <ShoppingBagIcon class="mr-2 h-4 w-4" />
          Start Shopping
        </Button>
      </RouterLink>
    </div>

    <!-- Orders Table - Desktop -->
    <div
      v-else
      class="hidden md:block"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[20%] text-left">Number ID</TableHead>
            <TableHead class="w-[25%] text-center">Date</TableHead>
            <TableHead class="w-[20%] text-center">Status</TableHead>
            <TableHead class="w-[20%] text-center">Price</TableHead>
            <TableHead class="w-[15%] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="order in orders"
            :key="order.id"
          >
            <TableCell class="text-left font-medium">
              #{{ order.orderNumber }}
            </TableCell>
            <TableCell class="text-center">
              {{ formatDate(order.createdAt) }}
            </TableCell>
            <TableCell class="text-center">
              <Badge :variant="getStatusVariant(order.status)">
                {{ formatStatus(order.status) }}
              </Badge>
            </TableCell>
            <TableCell class="text-center font-medium">
              {{ formatPrice(order.totalAmount) }}
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                      variant="ghost"
                      class="h-8 w-8 p-0"
                    >
                      <span class="sr-only">Open menu</span>
                      <MoreHorizontal class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem @click="openDetails(order)">
                      <EyeIcon class="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      v-if="order.status === OrderStatus.PENDING"
                      @click="openPaymentModal(order.id)"
                    >
                      <CreditCardIcon class="mr-2 h-4 w-4" />
                      Pay Now
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      v-if="order.status === OrderStatus.PENDING"
                      @click="handleCancelOrder(order.id)"
                      class="text-red-600 focus:text-red-600"
                    >
                      <XCircleIcon class="mr-2 h-4 w-4" />
                      Cancel Order
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      v-if="order.status === OrderStatus.PROCESSING"
                      @click="handleRequestRefund(order.id)"
                    >
                      <AlertCircleIcon class="mr-2 h-4 w-4" />
                      Request Refund
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="handleDownloadInvoice(order.id)">
                      <svg
                        class="mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
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
                      Download Invoice
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Orders List - Mobile -->
    <div class="space-y-4 md:hidden">
      <div
        v-for="order in orders"
        :key="order.id"
        class="rounded-lg border p-4 transition-colors hover:bg-gray-50"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="font-medium">#{{ order.orderNumber }}</p>
            <p class="text-sm text-gray-500">
              {{ formatDate(order.createdAt) }}
            </p>
          </div>
          <Badge :variant="getStatusVariant(order.status)">
            {{ formatStatus(order.status) }}
          </Badge>
        </div>

        <div class="mb-3 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="ghost"
                class="h-8 w-8 p-0"
              >
                <span class="sr-only">Open menu</span>
                <MoreHorizontal class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem @click="openDetails(order)">
                <EyeIcon class="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                v-if="order.status === OrderStatus.PENDING"
                @click="openPaymentModal(order.id)"
              >
                <CreditCardIcon class="mr-2 h-4 w-4" />
                Pay Now
              </DropdownMenuItem>
              <DropdownMenuItem
                v-if="order.status === OrderStatus.PENDING"
                @click="handleCancelOrder(order.id)"
                class="text-red-600 focus:text-red-600"
              >
                <XCircleIcon class="mr-2 h-4 w-4" />
                Cancel Order
              </DropdownMenuItem>
              <DropdownMenuItem
                v-if="order.status === OrderStatus.PROCESSING"
                @click="handleRequestRefund(order.id)"
              >
                <AlertCircleIcon class="mr-2 h-4 w-4" />
                Request Refund
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div class="flex items-center justify-between border-t pt-3">
          <span class="text-sm text-gray-500">Total</span>
          <span class="font-semibold">
            {{ formatPrice(order.totalAmount) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <Dialog
      v-model:open="isModalOpen"
      @update:open="closeModal"
    >
      <DialogContent class="max-h-[85vh] max-w-2xl overflow-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        <!-- Loading state -->
        <div
          v-if="isLoadingOrder"
          class="space-y-4 py-4"
        >
          <Skeleton class="h-6 w-32" />
          <Skeleton class="h-20 w-full" />
          <Skeleton class="h-20 w-full" />
          <Skeleton class="h-16 w-full" />
        </div>

        <!-- Order details -->
        <div
          v-else-if="order"
          class="space-y-6 py-4"
        >
          <!-- Shared Order Info -->
          <div
            v-if="getOrderLabel(order)"
            class="flex justify-center rounded-md bg-blue-50 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
          >
            {{ getOrderLabel(order) }}
          </div>

          <!-- Order info -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1">
              <p class="text-sm text-gray-500">Order number</p>
              <p class="font-medium">#{{ order.orderNumber }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-sm text-gray-500">Date</p>
              <p class="font-medium">
                {{ formatDate(order.createdAt) }}
              </p>
            </div>
            <div class="space-y-1">
              <p class="text-sm text-gray-500">Status</p>
              <Badge :variant="getStatusVariant(order.status)">
                {{ formatStatus(order.status) }}
              </Badge>
            </div>
            <div class="space-y-1">
              <p class="text-sm text-gray-500">Payment Method</p>
              <p class="font-medium">
                {{ getPaymentMethod(order.payments?.[0]?.provider) }}
              </p>
            </div>
          </div>

          <!-- Delivery Address -->
          <div class="border-t pt-4">
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

          <!-- Order items -->
          <div>
            <h3 class="mb-4 font-semibold">
              Items ({{ order.orderItems.length }})
            </h3>
            <div class="space-y-4">
              <div
                v-for="item in order.orderItems"
                :key="item.id"
                class="flex gap-4 rounded-lg border p-4"
              >
                <div
                  class="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100"
                >
                  <img
                    class="h-full w-full object-cover"
                    :src="getItemImage(item)"
                    :alt="getItemName(item)"
                  />
                </div>

                <div class="flex flex-1 flex-col justify-between">
                  <div>
                    <h4 class="font-medium text-gray-900">
                      {{ getItemName(item) }}
                    </h4>

                    <p
                      v-if="item.options && item.options.length > 0"
                      class="text-sm text-gray-500"
                    >
                      <span
                        v-for="(option, index) in item.options"
                        :key="index"
                      >
                        {{ option.attribute }}: {{ option.option }}
                        <span v-if="index < item.options.length - 1">,</span>
                      </span>
                    </p>
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">
                      {{ getItemQuantity(item) }} ×
                      {{ formatPrice(getItemPrice(item)) }}
                    </span>
                    <span class="font-medium">
                      {{
                        formatPrice(getItemPrice(item) * getItemQuantity(item))
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order summary -->
          <div class="border-t pt-4">
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal</span>
                <span>
                  {{ formatPrice(order.subtotalAmount) }}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Shipping</span>
                <span>{{ formatPrice(order.shippingCost) }}</span>
              </div>
              <div
                class="flex justify-between text-sm"
                :class="{ 'text-emerald-600': order.discountAmount > 0 }"
              >
                <span>
                  Discount
                  <span v-if="order.coupon && order.discountAmount > 0">
                    <span v-if="order.coupon?.type === 'PERCENTAGE'">
                      (-{{ order.coupon?.value }}%)
                    </span>
                    <span v-else>
                      (-{{ formatPrice(order.coupon?.value) }})
                    </span>
                  </span>
                </span>
                <span>
                  <span v-if="order.discountAmount > 0">-</span>
                  {{ formatPrice(order.discountAmount) }}
                </span>
              </div>
              <div
                class="flex justify-between border-t pt-2 text-lg font-semibold"
              >
                <span>Total</span>
                <span>{{ formatPrice(order.totalAmount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Payment Selection Modal -->
    <Dialog v-model:open="isPaymentModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Select a payment method to complete your order.
          </DialogDescription>
        </DialogHeader>

        <div class="py-4">
          <RadioGroup
            v-model="selectedPaymentMethod"
            class="grid gap-3"
          >
            <!-- Stripe -->
            <div
              class="flex cursor-pointer items-center justify-between rounded border p-4 transition-colors"
              :class="{
                'border-black bg-gray-50':
                  selectedPaymentMethod === PaymentProvider.STRIPE,
                'hover:border-gray-300':
                  selectedPaymentMethod !== PaymentProvider.STRIPE,
              }"
              @click="selectedPaymentMethod = PaymentProvider.STRIPE"
            >
              <div class="flex items-center gap-3">
                <RadioGroupItem
                  id="stripe"
                  :value="PaymentProvider.STRIPE"
                />
                <Label
                  for="stripe"
                  class="cursor-pointer font-normal"
                >
                  Credit Card
                </Label>
              </div>
              <CreditCardIcon class="h-5 w-5 text-gray-400" />
            </div>

            <!-- PayPal -->
            <div
              class="flex cursor-pointer items-center justify-between rounded border p-4 transition-colors"
              :class="{
                'border-black bg-gray-50':
                  selectedPaymentMethod === PaymentProvider.PAYPAL,
                'hover:border-gray-300':
                  selectedPaymentMethod !== PaymentProvider.PAYPAL,
              }"
              @click="selectedPaymentMethod = PaymentProvider.PAYPAL"
            >
              <div class="flex items-center gap-3">
                <RadioGroupItem
                  id="paypal"
                  :value="PaymentProvider.PAYPAL"
                />
                <Label
                  for="paypal"
                  class="cursor-pointer font-normal"
                >
                  PayPal
                </Label>
              </div>
              <WalletIcon class="h-5 w-5 text-blue-500" />
            </div>

            <!-- Kkiapay -->
            <div
              class="flex cursor-pointer items-center justify-between rounded border p-4 transition-colors"
              :class="{
                'border-black bg-gray-50':
                  selectedPaymentMethod === PaymentProvider.KKIAPAY,
                'hover:border-gray-300':
                  selectedPaymentMethod !== PaymentProvider.KKIAPAY,
              }"
              @click="selectedPaymentMethod = PaymentProvider.KKIAPAY"
            >
              <div class="flex items-center gap-3">
                <RadioGroupItem
                  id="kkiapay"
                  :value="PaymentProvider.KKIAPAY"
                />
                <Label
                  for="kkiapay"
                  class="cursor-pointer font-normal"
                >
                  Kkiapay
                </Label>
              </div>
              <SmartphoneIcon class="h-5 w-5 text-orange-500" />
            </div>

            <!-- Moneroo -->
            <div
              class="flex cursor-pointer items-center justify-between rounded border p-4 transition-colors"
              :class="{
                'border-black bg-gray-50':
                  selectedPaymentMethod === PaymentProvider.MONEROO,
                'hover:border-gray-300':
                  selectedPaymentMethod !== PaymentProvider.MONEROO,
              }"
              @click="selectedPaymentMethod = PaymentProvider.MONEROO"
            >
              <div class="flex items-center gap-3">
                <RadioGroupItem
                  id="moneroo"
                  :value="PaymentProvider.MONEROO"
                />
                <Label
                  for="moneroo"
                  class="cursor-pointer font-normal"
                >
                  Moneroo
                </Label>
              </div>
              <GlobeIcon class="h-5 w-5 text-purple-500" />
            </div>
          </RadioGroup>
        </div>

        <DialogFooter class="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            @click="isPaymentModalOpen = false"
          >
            Cancel
          </Button>

          <Button
            v-if="selectedPaymentMethod !== PaymentProvider.KKIAPAY"
            type="button"
            variant="secondary"
            :disabled="isProcessingPayment || isPaymentLinkCopied"
            @click="handleGenerateAndCopyLink"
          >
            <CheckIcon
              v-if="isPaymentLinkCopied"
              class="mr-2 h-4 w-4"
            />
            <CopyIcon
              v-else
              class="mr-2 h-4 w-4"
            />
            {{ isPaymentLinkCopied ? 'Copied' : 'Copy Link' }}
          </Button>

          <LoadingButton
            :loading="isProcessingPayment"
            :disabled="isProcessingPayment"
            @click="handleRetryPayment"
          >
            Proceed to Payment
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped></style>
