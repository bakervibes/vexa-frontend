<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useOrderById, useUserOrders } from '@/composables/useOrders'
import {
  OrderStatus,
  PaymentProvider,
  type OrderItem,
  type UserOrder,
} from '@/types'
import { formatPrice } from '@/utils/lib'
import { EyeIcon, PackageIcon, ShoppingBagIcon } from 'lucide-vue-next'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const { orders, isLoading } = useUserOrders()

// Modal state
const isModalOpen = ref(false)
const selectedOrderId = ref<string | null>(null)

// Fetch order details when modal opens
const { order: orderDetails, isLoading: isLoadingDetails } =
  useOrderById(selectedOrderId)

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
      return 'outline'
    case OrderStatus.CANCELLED:
      return 'destructive'
    case OrderStatus.REFUNDED:
      return 'destructive'
    default:
      return 'outline'
  }
}

// Format status for display
const formatStatus = (status: OrderStatus) => {
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
    case PaymentProvider.MANUAL:
      return 'Manual Payment'
    default:
      return provider
  }
}

// Item helpers
const getItemPrice = (item: OrderItem) => item.data.price
const getItemName = (item: OrderItem) => item.data.name
const getItemImage = (item: OrderItem) => item.data.image
const getItemQuantity = (item: OrderItem) => item.data.quantity

// Open order details modal
const openOrderDetails = (order: UserOrder) => {
  selectedOrderId.value = order.id
  isModalOpen.value = true
}

// Close modal
const closeModal = () => {
  isModalOpen.value = false
  selectedOrderId.value = null
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <h2 class="text-xl font-semibold">Orders History</h2>

    <!-- Loading State -->
    <div
      v-if="isLoading"
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
            <TableHead class="w-[20%]">Number ID</TableHead>
            <TableHead class="w-[25%]">Date</TableHead>
            <TableHead class="w-[20%]">Status</TableHead>
            <TableHead class="w-[20%] text-right">Price</TableHead>
            <TableHead class="w-[15%] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="order in orders"
            :key="order.id"
            class="cursor-pointer hover:bg-gray-50"
            @click="openOrderDetails(order)"
          >
            <TableCell class="py-5 font-medium">
              #{{ order.orderNumber }}
            </TableCell>
            <TableCell class="py-5">
              {{ formatDate(order.createdAt) }}
            </TableCell>
            <TableCell class="py-5">
              <Badge :variant="getStatusVariant(order.status)">
                {{ formatStatus(order.status) }}
              </Badge>
            </TableCell>
            <TableCell class="py-5 text-right font-medium">
              {{ formatPrice(order.totalAmount) }}
            </TableCell>
            <TableCell class="py-5 text-right">
              <Button
                variant="ghost"
                size="sm"
                @click.stop="openOrderDetails(order)"
              >
                <EyeIcon class="mr-1 h-4 w-4" />
                View
              </Button>
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
        class="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-gray-50"
        @click="openOrderDetails(order)"
      >
        <div class="mb-3 flex items-start justify-between">
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
      :open="isModalOpen"
      @update:open="(open) => !open && closeModal()"
    >
      <DialogContent class="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        <!-- Loading state -->
        <div
          v-if="isLoadingDetails"
          class="space-y-4 py-4"
        >
          <Skeleton class="h-6 w-32" />
          <Skeleton class="h-20 w-full" />
          <Skeleton class="h-20 w-full" />
          <Skeleton class="h-16 w-full" />
        </div>

        <!-- Order details -->
        <div
          v-else-if="orderDetails"
          class="space-y-6 py-4"
        >
          <!-- Order info -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1">
              <p class="text-sm text-gray-500">Order Number</p>
              <p class="font-medium">#{{ orderDetails.orderNumber }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-sm text-gray-500">Date</p>
              <p class="font-medium">
                {{ formatDate(orderDetails.createdAt) }}
              </p>
            </div>
            <div class="space-y-1">
              <p class="text-sm text-gray-500">Status</p>
              <Badge :variant="getStatusVariant(orderDetails.status)">
                {{ formatStatus(orderDetails.status) }}
              </Badge>
            </div>
            <div class="space-y-1">
              <p class="text-sm text-gray-500">Payment Method</p>
              <p class="font-medium">
                {{ getPaymentMethod(orderDetails.payments?.[0]?.provider) }}
              </p>
            </div>
          </div>

          <!-- Order items -->
          <div>
            <h3 class="mb-4 font-semibold">
              Items ({{ orderDetails.items.length }})
            </h3>
            <div class="space-y-4">
              <div
                v-for="item in orderDetails.items"
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
                      v-if="item.data.sku"
                      class="text-sm text-gray-500"
                    >
                      SKU: {{ item.data.sku }}
                    </p>
                    <p
                      v-if="item.data.variant"
                      class="text-sm text-gray-500"
                    >
                      <span
                        v-for="(option, index) in item.data.variant.options"
                        :key="index"
                      >
                        {{ option.attribute }}: {{ option.option }}
                        <span
                          v-if="index < item.data.variant.options.length - 1"
                        >
                          ,
                        </span>
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
                <span class="text-gray-500">Subtotal</span>
                <span>
                  {{
                    formatPrice(
                      orderDetails.totalAmount -
                        orderDetails.shippingCost +
                        (orderDetails.coupon?.value || 0),
                    )
                  }}
                </span>
              </div>
              <div
                v-if="orderDetails.shippingCost > 0"
                class="flex justify-between text-sm"
              >
                <span class="text-gray-500">Shipping</span>
                <span>{{ formatPrice(orderDetails.shippingCost) }}</span>
              </div>
              <div
                v-if="orderDetails.coupon"
                class="flex justify-between text-sm text-emerald-600"
              >
                <span>Discount ({{ orderDetails.coupon.code }})</span>
                <span>
                  -{{
                    orderDetails.coupon.type === 'PERCENTAGE'
                      ? `${orderDetails.coupon.value}%`
                      : formatPrice(orderDetails.coupon.value)
                  }}
                </span>
              </div>
              <div
                class="flex justify-between border-t pt-2 text-lg font-semibold"
              >
                <span>Total</span>
                <span>{{ formatPrice(orderDetails.totalAmount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped></style>
