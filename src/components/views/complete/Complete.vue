<script setup lang="ts">
import { useOrder } from '@/composables/useOrders'
import type { OrderItem, PaymentProvider } from '@/types'
import { formatPrice } from '@/utils/lib'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Skeleton from 'primevue/skeleton'
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const isModalOpen = ref(false)

// orderNumber from query
const orderNumber = computed(() => {
  const value = route.query.orderNumber
  return typeof value === 'string' ? value : null
})

// ❗ No orderNumber = invalid request
const isOrderNumberMissing = computed(() => !orderNumber.value)

// Fetch order
const { order, isLoading, isError } = useOrder(orderNumber)

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
    case 'STRIPE':
      return 'Credit Card'
    case 'PAYPAL':
      return 'PayPal'
    case 'MANUAL':
      return 'Manual Payment'
    default:
      return provider
  }
})

const total = computed(() => order.value?.totalAmount ?? 0)
const items = computed(() => order.value?.items ?? [])

// Item helpers
const getItemPrice = (item: OrderItem) => item.data.price
const getItemName = (item: OrderItem) => item.data.name
const getItemImage = (item: OrderItem) => item.data.image
const getItemQuantity = (item: OrderItem) => item.data.quantity
</script>

<template>
  <div class="flex justify-center">
    <Card class="w-full max-w-2xl">
      <template #content>
        <div class="p-8 text-center">
          <!-- LOADING -->
          <div
            v-if="isLoading"
            class="space-y-6"
          >
            <Skeleton
              width="12rem"
              height="2rem"
              class="mx-auto"
            />
            <Skeleton
              width="16rem"
              height="3rem"
              class="mx-auto"
            />
            <Skeleton
              width="10rem"
              height="2.5rem"
              class="mx-auto"
            />
            <div class="mx-auto max-w-sm space-y-4">
              <Skeleton
                width="100%"
                height="2.5rem"
              />
              <Skeleton
                width="100%"
                height="2.5rem"
              />
              <Skeleton
                width="100%"
                height="2.5rem"
              />
              <Skeleton
                width="100%"
                height="2.5rem"
              />
            </div>
          </div>

          <!-- ERROR: Missing orderNumber -->
          <div
            v-else-if="isOrderNumberMissing"
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
            v-else-if="isError"
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

            <h2 class="text-xl font-semibold text-yellow-600">
              Order not found
            </h2>
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
              <h2 class="text-3xl font-semibold">
                Your order has been received
              </h2>
            </div>

            <!-- Modal Trigger -->
            <div class="mb-8">
              <Button
                outlined
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
                  <path
                    d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"
                  />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                View order items ({{ items.length }})
              </Button>

              <Dialog
                v-model:visible="isModalOpen"
                modal
                header="Order Items"
                :style="{ width: '32rem', maxWidth: '90vw' }"
                :contentStyle="{ maxHeight: '80vh', overflow: 'auto' }"
              >
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
                      </div>

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

                  <div
                    v-if="items.length > 0"
                    class="border-t pt-4"
                  >
                    <div class="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{{ formatPrice(total) }}</span>
                    </div>
                  </div>
                </div>
              </Dialog>
            </div>

            <!-- Order details -->
            <div class="mx-auto max-w-sm space-y-4 text-left">
              <div class="flex justify-between border-b pb-3">
                <span class="text-gray-500">Order code:</span>
                <span class="font-medium">{{ order.orderNumber }}</span>
              </div>
              <div class="flex justify-between border-b pb-3">
                <span class="text-gray-500">Date:</span>
                <span class="font-medium">{{ orderDate }}</span>
              </div>
              <div class="flex justify-between border-b pb-3">
                <span class="text-gray-500">Total:</span>
                <span class="font-medium">{{ formatPrice(total) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Payment method:</span>
                <span class="font-medium">{{ paymentMethod }}</span>
              </div>
            </div>

            <div class="mt-8">
              <RouterLink to="/orders">
                <Button class="h-12 px-8">Purchase history</Button>
              </RouterLink>
            </div>
          </template>
        </div>
      </template>
    </Card>
  </div>
</template>
