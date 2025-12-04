<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import { useCarts, useCartsMutation } from '@/composables/useCarts'
import { useCoupons } from '@/composables/useCoupons'
import { formatPrice } from '@/utils/lib'
import {
  ArrowLeftIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  TagIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-vue-next'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'
import Skeleton from 'primevue/skeleton'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

const { subtotal, isEmpty, isLoadingCart, items } = useCarts()

const { isClearingCart, updateCartItem, removeCartItem, clearCart } =
  useCartsMutation()

// Initialize coupon composable with cart subtotal
const {
  couponCode,
  appliedCoupon,
  discountAmount,
  hasAppliedCoupon,
  isApplyingCoupon,
  applyCoupon,
  removeCoupon,
  recalculateDiscount,
} = useCoupons(() => subtotal.value)

// Shipping options
const shippingOptions = [
  { id: 'free', label: 'Free shipping', price: 0 },
  { id: 'express', label: 'Express shipping', price: 15 },
  { id: 'pickup', label: 'Pick Up', price: 21, isPercentage: true },
]

const selectedShippingId = ref('free')

// Pending quantities for debounced updates
const pendingQuantities = ref<
  Map<
    string,
    {
      quantity: number
      original: number
      timer: ReturnType<typeof setTimeout> | null
    }
  >
>(new Map())
const updatingItemId = ref<string | null>(null)
const removingItemId = ref<string | null>(null)
const editingItemId = ref<string | null>(null)

const getItemKey = (productId: string, variantId?: string | null) => {
  return `${productId}-${variantId ?? 'no-variant'}`
}

const getMaxQuantity = (productId: string, variantId?: string | null) => {
  const item = items.value.find(
    (item) =>
      item.productId === productId &&
      (item.variantId ?? null) === (variantId ?? null),
  )
  if (!item) return 0
  // Get remaining stock (what's still available to add)
  const remainingStock = item.variant?.stock ?? item.product?.stock ?? 0
  // Max quantity = current quantity in cart + remaining stock available
  return item.quantity + remainingStock
}

const getDisplayQuantity = (productId: string, variantId?: string | null) => {
  const key = getItemKey(productId, variantId)

  return (
    pendingQuantities.value.get(key)?.quantity ??
    items.value.find(
      (item) =>
        item.productId === productId &&
        (item.variantId ?? null) === (variantId ?? null),
    )?.quantity ??
    1
  )
}

const isItemUpdating = (productId: string, variantId?: string | null) => {
  const key = getItemKey(productId, variantId)
  return updatingItemId.value === key
}

const isItemRemoving = (productId: string, variantId?: string | null) => {
  const key = getItemKey(productId, variantId)
  return removingItemId.value === key
}

const isItemDisabled = (productId: string, variantId?: string | null) => {
  const key = getItemKey(productId, variantId)

  return (
    (editingItemId.value !== null && editingItemId.value !== key) ||
    (updatingItemId.value !== null && updatingItemId.value !== key) ||
    (removingItemId.value !== null && removingItemId.value !== key)
  )
}

const handleQuantityChange = (
  productId: string,
  newQuantity: number,
  variantId?: string | null,
  slug?: string,
) => {
  if (newQuantity < 1) return

  const key = getItemKey(productId, variantId)
  const existing = pendingQuantities.value.get(key)

  if (existing?.timer) {
    clearTimeout(existing.timer)
  }

  const originalQuantity =
    existing?.original ??
    items.value.find(
      (item) =>
        item.productId === productId &&
        (item.variantId ?? null) === (variantId ?? null),
    )?.quantity ??
    newQuantity

  // If the new quantity equals the original, cancel immediately and reset state
  if (newQuantity === originalQuantity) {
    pendingQuantities.value.delete(key)
    editingItemId.value = null
    return
  }

  editingItemId.value = key

  const timer = setTimeout(async () => {
    const pending = pendingQuantities.value.get(key)

    if (pending && pending.quantity !== pending.original) {
      updatingItemId.value = key
      try {
        await updateCartItem(
          productId,
          pending.quantity,
          variantId ?? undefined,
          slug,
        )
        // Recalculate discount after cart update
        await recalculateDiscount()
      } finally {
        updatingItemId.value = null
      }
    }

    editingItemId.value = null
  }, 2000)

  pendingQuantities.value.set(key, {
    quantity: newQuantity,
    original: originalQuantity,
    timer,
  })
}

const handleRemoveItem = async (
  productId: string,
  variantId?: string | null,
  slug?: string,
) => {
  const key = getItemKey(productId, variantId ?? null)

  const pending = pendingQuantities.value.get(key)

  if (pending?.timer) {
    clearTimeout(pending.timer)
    pendingQuantities.value.delete(key)
  }

  if (editingItemId.value === key) {
    editingItemId.value = null
  }

  removingItemId.value = key

  try {
    await removeCartItem(productId, variantId ?? undefined, slug)
    // Recalculate discount after cart update
    await recalculateDiscount()
  } finally {
    removingItemId.value = null
  }
}

const getItemPrice = (item: (typeof items.value)[0]) => {
  return (
    item.variant?.price ??
    item.variant?.basePrice ??
    item.product?.price ??
    item.product?.basePrice ??
    0
  )
}

const getItemSubtotal = (item: (typeof items.value)[0]) => {
  const price = getItemPrice(item)
  const quantity = getDisplayQuantity(item.productId, item.variantId)
  return price * quantity
}

const shippingCost = computed(() => {
  const option = shippingOptions.find((o) => o.id === selectedShippingId.value)

  if (!option) return 0

  if (option.isPercentage) {
    return (subtotal.value * option.price) / 100
  }
  return option.price
})

const total = computed(() => {
  return subtotal.value + shippingCost.value - discountAmount.value
})

// Build checkout URL with coupon and shipping option if applied
const checkoutUrl = computed(() => {
  const params = new URLSearchParams()

  // Add coupon if applied
  if (hasAppliedCoupon.value && appliedCoupon.value) {
    params.set('coupon', appliedCoupon.value.code)
  }

  // Add shipping option
  if (selectedShippingId.value) {
    params.set('shipping', selectedShippingId.value)
  }

  const queryString = params.toString()
  return queryString ? `/checkout?${queryString}` : '/checkout'
})

const handleApplyCoupon = () => {
  applyCoupon()
}
</script>

<template>
  <!-- Loading State -->
  <div
    v-if="isLoadingCart"
    class="flex flex-col gap-4 py-8"
  >
    <div
      v-for="i in 3"
      :key="i"
      class="flex items-center gap-4"
    >
      <Skeleton
        width="6rem"
        height="6rem"
        class="rounded-md"
      />
      <div class="flex-1 space-y-2">
        <Skeleton
          width="75%"
          height="1rem"
        />
        <Skeleton
          width="50%"
          height="0.75rem"
        />
        <div class="flex items-center justify-between pt-2">
          <Skeleton
            width="6rem"
            height="2rem"
          />
          <Skeleton
            width="4rem"
            height="1rem"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Empty Cart State -->
  <div
    v-else-if="isEmpty"
    class="flex flex-col items-center justify-center gap-4 py-10 text-center"
  >
    <div class="rounded-full bg-gray-100 p-6">
      <ShoppingCartIcon class="h-10 w-10 text-gray-400" />
    </div>
    <div class="space-y-1">
      <h3 class="text-lg font-semibold">Your cart is empty</h3>
      <p class="text-sm text-gray-500">Add products to start shopping</p>
    </div>
    <RouterLink to="/shop">
      <Button
        outlined
        class="mt-4"
      >
        Continue shopping
      </Button>
    </RouterLink>
  </div>

  <!-- Cart Content -->
  <div
    v-else
    class="grid gap-8 lg:grid-cols-3"
  >
    <!-- Cart Items -->
    <div class="flex flex-col gap-4 lg:col-span-2">
      <div class="flex items-center justify-between">
        <h1 class="flex items-center gap-1">
          <span class="text-2xl font-bold">My cart</span>
          <span class="text-xl font-medium text-gray-500">
            ({{ items.length }})
          </span>
        </h1>

        <div class="flex items-center gap-2">
          <RouterLink to="/shop">
            <Button link>
              <ArrowLeftIcon class="h-4 w-4" />
              <span class="block text-sm sm:hidden">Shop</span>
              <span class="hidden sm:block">Continue shopping</span>
            </Button>
          </RouterLink>

          <LoadingButton
            :loading="isClearingCart"
            :disabled="isClearingCart"
            severity="danger"
            size="large"
            @click="clearCart(items.map((item) => item.product.slug))"
          >
            <Trash2Icon class="h-4 w-4" />
            <span class="block text-sm sm:hidden">Clear</span>
            <span class="hidden sm:block">Clear cart</span>
          </LoadingButton>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:block">
        <DataTable :value="items">
          <Column
            header="Product"
            style="width: 45%"
          >
            <template #body="slotProps">
              <div class="flex items-center gap-4 py-3">
                <RouterLink
                  :to="`/products/${slotProps.data.product.slug}`"
                  class="flex items-center gap-4"
                >
                  <div
                    class="h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-100"
                  >
                    <img
                      :src="slotProps.data.product.images[0]"
                      :alt="slotProps.data.product.name"
                      class="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div class="font-medium">
                      {{ slotProps.data.product.name }}
                    </div>
                    <div
                      v-if="slotProps.data.variant"
                      class="flex flex-col text-sm text-gray-500"
                    >
                      <span
                        v-for="option in slotProps.data.variant
                          .productVariantOptions"
                        :key="option.id"
                      >
                        {{ option.option.attribute.name }}:
                        {{ option.option.name }}
                      </span>
                    </div>
                    <button
                      @click.prevent="
                        handleRemoveItem(
                          slotProps.data.productId,
                          slotProps.data.variantId,
                          slotProps.data.product.slug,
                        )
                      "
                      :disabled="
                        isItemRemoving(
                          slotProps.data.productId,
                          slotProps.data.variantId,
                        )
                      "
                      class="mt-1 flex w-fit cursor-pointer items-center gap-1 text-sm text-gray-500 hover:text-red-500"
                    >
                      <XIcon class="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </RouterLink>
              </div>
            </template>
          </Column>
          <Column
            header="Quantity"
            class="text-center"
          >
            <template #body="slotProps">
              <div class="flex items-center justify-center">
                <div class="flex items-center rounded border">
                  <Button
                    text
                    size="small"
                    class="!h-8 !w-8 rounded-none rounded-l"
                    @click="
                      handleQuantityChange(
                        slotProps.data.productId,
                        getDisplayQuantity(
                          slotProps.data.productId,
                          slotProps.data.variantId,
                        ) - 1,
                        slotProps.data.variantId,
                        slotProps.data.product.slug,
                      )
                    "
                    :disabled="
                      getDisplayQuantity(
                        slotProps.data.productId,
                        slotProps.data.variantId,
                      ) <= 1 ||
                      isItemDisabled(
                        slotProps.data.productId,
                        slotProps.data.variantId,
                      ) ||
                      isItemUpdating(
                        slotProps.data.productId,
                        slotProps.data.variantId,
                      ) ||
                      isItemRemoving(
                        slotProps.data.productId,
                        slotProps.data.variantId,
                      )
                    "
                  >
                    <MinusIcon class="h-4 w-4" />
                  </Button>
                  <span class="w-10 text-center text-sm">
                    {{
                      getDisplayQuantity(
                        slotProps.data.productId,
                        slotProps.data.variantId,
                      )
                    }}
                  </span>
                  <Button
                    text
                    size="small"
                    class="!h-8 !w-8 rounded-none rounded-r"
                    @click="
                      handleQuantityChange(
                        slotProps.data.productId,
                        getDisplayQuantity(
                          slotProps.data.productId,
                          slotProps.data.variantId,
                        ) + 1,
                        slotProps.data.variantId,
                        slotProps.data.product.slug,
                      )
                    "
                    :disabled="
                      getDisplayQuantity(
                        slotProps.data.productId,
                        slotProps.data.variantId,
                      ) >=
                        getMaxQuantity(
                          slotProps.data.productId,
                          slotProps.data.variantId,
                        ) ||
                      isItemDisabled(
                        slotProps.data.productId,
                        slotProps.data.variantId,
                      ) ||
                      isItemUpdating(
                        slotProps.data.productId,
                        slotProps.data.variantId,
                      ) ||
                      isItemRemoving(
                        slotProps.data.productId,
                        slotProps.data.variantId,
                      )
                    "
                  >
                    <PlusIcon class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </template>
          </Column>
          <Column
            header="Price"
            class="text-center"
          >
            <template #body="slotProps">
              {{ formatPrice(getItemPrice(slotProps.data)) }}
            </template>
          </Column>
          <Column
            header="Subtotal"
            class="text-right"
          >
            <template #body="slotProps">
              <span class="font-medium">
                {{ formatPrice(getItemSubtotal(slotProps.data)) }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Mobile View -->
      <div class="space-y-6 md:hidden">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex gap-4 border-b pb-6"
        >
          <div class="h-24 w-24 shrink-0 overflow-hidden rounded bg-gray-100">
            <img
              :src="item.product.images[0]"
              :alt="item.product.name"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="flex flex-1 flex-col gap-2">
            <div class="font-medium">{{ item.product.name }}</div>
            <div
              v-if="item.variant"
              class="flex flex-col text-sm text-gray-500"
            >
              <span
                v-for="option in item.variant.productVariantOptions"
                :key="option.id"
              >
                {{ option.option.attribute.name }}:
                {{ option.option.name }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center rounded border">
                <Button
                  text
                  size="small"
                  class="!h-8 !w-8 rounded-none rounded-l"
                  @click="
                    handleQuantityChange(
                      item.productId,
                      getDisplayQuantity(item.productId, item.variantId) - 1,
                      item.variantId,
                      item.product.slug,
                    )
                  "
                  :disabled="
                    getDisplayQuantity(item.productId, item.variantId) <= 1 ||
                    isItemDisabled(item.productId, item.variantId)
                  "
                >
                  <MinusIcon class="h-4 w-4" />
                </Button>
                <span class="w-10 text-center text-sm">
                  {{ getDisplayQuantity(item.productId, item.variantId) }}
                </span>
                <Button
                  text
                  size="small"
                  class="!h-8 !w-8 rounded-none rounded-r"
                  @click="
                    handleQuantityChange(
                      item.productId,
                      getDisplayQuantity(item.productId, item.variantId) + 1,
                      item.variantId,
                      item.product.slug,
                    )
                  "
                  :disabled="
                    getDisplayQuantity(item.productId, item.variantId) >=
                      getMaxQuantity(item.productId, item.variantId) ||
                    isItemDisabled(item.productId, item.variantId)
                  "
                >
                  <PlusIcon class="h-4 w-4" />
                </Button>
              </div>
              <div class="font-medium">
                {{ formatPrice(getItemSubtotal(item)) }}
              </div>
            </div>
            <button
              @click="
                handleRemoveItem(
                  item.productId,
                  item.variantId,
                  item.product.slug,
                )
              "
              :disabled="isItemRemoving(item.productId, item.variantId)"
              class="flex w-fit cursor-pointer items-center gap-1 text-sm text-gray-500 hover:text-red-500"
            >
              <XIcon class="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart Summary -->
    <div class="lg:col-span-1">
      <div class="rounded-lg border p-6">
        <h3 class="mb-6 text-xl font-semibold">Cart summary</h3>

        <!-- Shipping Options -->
        <div class="space-y-3">
          <div
            v-for="option in shippingOptions"
            :key="option.id"
            class="flex cursor-pointer items-center justify-between rounded-lg border p-4"
            :class="{
              'border-black': selectedShippingId === option.id,
            }"
            @click="selectedShippingId = option.id"
          >
            <div class="flex items-center gap-3">
              <RadioButton
                v-model="selectedShippingId"
                :value="option.id"
                :inputId="option.id"
              />
              <label
                :for="option.id"
                class="cursor-pointer font-normal"
              >
                {{ option.label }}
              </label>
            </div>
            <span class="text-sm font-medium">
              {{
                option.price === 0
                  ? formatPrice(0)
                  : option.isPercentage
                    ? `${option.price}%`
                    : formatPrice(option.price)
              }}
            </span>
          </div>
        </div>

        <!-- Coupon Section -->
        <div class="mt-8 border-t pt-8">
          <h3 class="mb-2 text-lg font-semibold">Have a coupon?</h3>
          <p class="mb-4 text-sm text-gray-500">
            Add your code for an instant cart discount
          </p>

          <!-- Applied Coupon Display -->
          <div
            v-if="hasAppliedCoupon && appliedCoupon"
            class="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3"
          >
            <div class="flex items-center gap-2">
              <TagIcon class="h-4 w-4 text-emerald-600" />
              <span class="font-medium text-emerald-700">
                {{ appliedCoupon.code }}
              </span>
              <span class="text-sm text-emerald-600">
                (-{{
                  appliedCoupon.type === 'PERCENTAGE'
                    ? `${appliedCoupon.value}%`
                    : formatPrice(appliedCoupon.discountAmount)
                }})
              </span>
            </div>
            <button
              @click="removeCoupon"
              class="text-sm text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <!-- Coupon Input -->
          <div
            v-else
            class="flex max-w-md gap-2"
          >
            <div class="relative flex-1">
              <InputText
                v-model="couponCode"
                placeholder="Coupon Code"
                class="h-10 w-full pl-10 uppercase"
                :disabled="isApplyingCoupon"
                @keyup.enter="handleApplyCoupon"
              />
              <svg
                class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <Button
              class="h-10 px-6"
              @click="handleApplyCoupon"
              :disabled="isApplyingCoupon || !couponCode.trim()"
            >
              {{ isApplyingCoupon ? 'Applying...' : 'Apply' }}
            </Button>
          </div>
        </div>

        <!-- Totals -->
        <div class="mt-6 space-y-3 border-t pt-6">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Subtotal</span>
            <span>{{ formatPrice(subtotal) }}</span>
          </div>
          <div
            v-if="shippingCost > 0"
            class="flex justify-between text-sm"
          >
            <span class="text-gray-500">Shipping</span>
            <span>{{ formatPrice(shippingCost) }}</span>
          </div>
          <div
            v-if="hasAppliedCoupon && discountAmount > 0"
            class="flex justify-between text-sm text-emerald-600"
          >
            <span>Discount</span>
            <span>-{{ formatPrice(discountAmount) }}</span>
          </div>
          <div class="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
        </div>

        <!-- Checkout Button -->
        <RouterLink
          :to="checkoutUrl"
          class="mt-6 block"
        >
          <Button class="h-12 w-full text-base">Checkout</Button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
