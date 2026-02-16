<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/composables/useAuth'
import { useCarts } from '@/composables/useCarts'
import { useCoupons } from '@/composables/useCoupons'
import { useSharedCart } from '@/composables/useSharedCarts'
import { useWishlists } from '@/composables/useWishlists'
import type { ApiError } from '@/types'
import { formatPrice, formatRelativeTime } from '@/utils/lib'
import {
  CheckIcon,
  CreditCardIcon,
  HeartIcon,
  ImportIcon,
  MinusIcon,
  PlusIcon,
  Share2Icon,
  ShoppingCartIcon,
  TagIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { isAuthenticated, openAuthModal } = useAuth()

const {
  addWishlistItem,
  wishlistItems,
  removeWishlistItem,
  importFromCart,
  isImportingFromCart,
} = useWishlists()

const {
  isClearingCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  addCartItem,
  cartSubtotal,
  cartItems,
  cartLastActivityAt,
  isCartEmpty,
  isLoadingCart,
} = useCarts()

const {
  shareToken,
  isLoadingShared,
  shareCart,
  importSharedCart,
  isImportingSharedCart,
  sharedCartSubtotal,
  sharedCartItems,
  sharedCartLastActivityAt,
  isLoadingShareToken,
  errorShared,
  isErrorShared,
} = useSharedCart()

const subtotal = computed(() =>
  !!shareToken.value ? sharedCartSubtotal.value : cartSubtotal.value,
)

const isEmpty = computed(() =>
  !!shareToken.value ? sharedCartItems.value.length === 0 : isCartEmpty.value,
)

const isLoading = computed(() =>
  !!shareToken.value ? isLoadingShared.value : isLoadingCart.value,
)

const items = computed(() =>
  !!shareToken.value ? sharedCartItems.value : cartItems.value,
)

const lastModified = computed(() =>
  !!shareToken.value
    ? sharedCartLastActivityAt.value
    : cartLastActivityAt.value,
)

const wishlistActionItemId = ref<string | null>(null)
const importActionItemId = ref<string | null>(null)
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

const findCartItem = (productId: string, variantId?: string | null) => {
  return items.value.find(
    (item) =>
      item.productId === productId &&
      (item.productVariantId ?? null) === (variantId ?? null),
  )
}

const getMaxQuantity = (productId: string, variantId?: string | null) => {
  const item = findCartItem(productId, variantId)
  if (!item) return 0
  const remainingStock = item.productVariant?.stock ?? item.product?.stock ?? 0
  return item.quantity + remainingStock
}

const getDisplayQuantity = (productId: string, variantId?: string | null) => {
  const key = getItemKey(productId, variantId)
  const cartItem = findCartItem(productId, variantId)
  return pendingQuantities.value.get(key)?.quantity ?? cartItem?.quantity ?? 1
}

const getItemPrice = (item: (typeof items.value)[0]) => {
  return (
    item.productVariant?.price ??
    item.productVariant?.basePrice ??
    item.product?.price ??
    item.product?.basePrice ??
    0
  )
}

const getItemSubtotal = (item: (typeof items.value)[0]) => {
  const price = getItemPrice(item)
  const quantity = getDisplayQuantity(item.productId, item.productVariantId)
  return price * quantity
}

const isItemWishlistActioning = (
  productId: string,
  variantId?: string | null,
) => {
  return wishlistActionItemId.value === getItemKey(productId, variantId)
}

const isItemImportActioning = (
  productId: string,
  variantId?: string | null,
) => {
  return importActionItemId.value === getItemKey(productId, variantId)
}

const isAnyItemActioning = computed(() => {
  return (
    wishlistActionItemId.value !== null ||
    importActionItemId.value !== null ||
    isImportingFromCart.value ||
    isImportingSharedCart.value
  )
})

const isInWishlist = (productId: string, variantId?: string | null) => {
  return wishlistItems.value.some(
    (item) =>
      item.productId === productId &&
      (item.productVariantId ?? null) === (variantId ?? null),
  )
}

const isInMyCart = (productId: string, variantId?: string | null) => {
  return cartItems.value.some(
    (item) =>
      item.productId === productId &&
      (item.productVariantId ?? null) === (variantId ?? null),
  )
}

const isItemUpdating = (productId: string, variantId?: string | null) => {
  return updatingItemId.value === getItemKey(productId, variantId)
}

const isItemRemoving = (productId: string, variantId?: string | null) => {
  return removingItemId.value === getItemKey(productId, variantId)
}

const isItemDisabled = (productId: string, variantId?: string | null) => {
  const key = getItemKey(productId, variantId)
  return (
    (editingItemId.value !== null && editingItemId.value !== key) ||
    (updatingItemId.value !== null && updatingItemId.value !== key) ||
    (removingItemId.value !== null && removingItemId.value !== key)
  )
}

const handleToggleWishlist = async (
  productId: string,
  variantId?: string | null,
) => {
  const key = getItemKey(productId, variantId)
  wishlistActionItemId.value = key
  try {
    if (isInWishlist(productId, variantId)) {
      await removeWishlistItem(productId, variantId ?? undefined)
    } else {
      await addWishlistItem(productId, variantId ?? undefined)
    }
  } catch {
    // Error already handled by useCarts toast
  } finally {
    wishlistActionItemId.value = null
  }
}

const handleImportItem = async (
  productId: string,
  quantity: number,
  variantId?: string | null,
) => {
  const key = getItemKey(productId, variantId)
  importActionItemId.value = key
  try {
    await addCartItem(productId, quantity, variantId ?? undefined)
  } catch {
    // Error already handled by useCarts toast
  } finally {
    importActionItemId.value = null
  }
}

const handleQuantityChange = (
  productId: string,
  newQuantity: number,
  variantId?: string | null,
) => {
  if (newQuantity < 1) return

  const cartItem = findCartItem(productId, variantId)
  if (!cartItem) return

  const key = getItemKey(productId, variantId)
  const existing = pendingQuantities.value.get(key)

  if (existing?.timer) {
    clearTimeout(existing.timer)
  }

  const originalQuantity = existing?.original ?? cartItem.quantity

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
        await updateCartItem(cartItem.id, pending.quantity)
        // Recalculate discount after cart update
        await recalculateDiscount()
      } finally {
        updatingItemId.value = null
      }
    }

    editingItemId.value = null
  }, 500)

  pendingQuantities.value.set(key, {
    quantity: newQuantity,
    original: originalQuantity,
    timer,
  })
}

const handleRemoveItem = async (
  productId: string,
  variantId?: string | null,
) => {
  const cartItem = findCartItem(productId, variantId)
  if (!cartItem) return

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
    await removeCartItem(cartItem.id)
    // Recalculate discount after cart update
    await recalculateDiscount()
  } finally {
    removingItemId.value = null
  }
}

const {
  couponCode,
  appliedCoupon,
  discountAmount,
  hasAppliedCoupon,
  isApplyingCoupon,
  applyCoupon,
  removeCoupon,
  recalculateDiscount,
} = useCoupons({ cartSubtotal: subtotal })

const handleApplyCoupon = () => {
  applyCoupon()
}

const shippingOptions = [
  { id: 'free', label: 'Free shipping', price: 0 },
  { id: 'express', label: 'Express shipping', price: 15 },
  { id: 'pickup', label: 'Pick Up', price: 21, isPercentage: true },
]

const selectedShippingId = ref((route.query.shipping as string) || 'free')

const handleShippingChange = (shippingId: string) => {
  selectedShippingId.value = shippingId

  router.push({
    query: {
      ...route.query,
      shipping: shippingId,
    },
  })
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

const buildCheckoutUrl = () => {
  const params = new URLSearchParams()

  if (hasAppliedCoupon.value && appliedCoupon.value) {
    params.set('coupon', appliedCoupon.value.code)
  }

  if (selectedShippingId.value) {
    params.set('shipping', selectedShippingId.value)
  }

  if (shareToken.value) {
    params.set('share', shareToken.value)
  }

  const queryString = params.toString()
  return queryString ? `/checkout?${queryString}` : '/checkout'
}

const handleCheckout = () => {
  const checkoutPath = buildCheckoutUrl()

  if (!isAuthenticated.value) {
    openAuthModal('login', () => {
      router.push(checkoutPath)
    })
    return
  }

  router.push(checkoutPath)
}
</script>

<template>
  <!-- Loading State -->
  <div
    v-if="isLoading"
    class="bg-noir flex min-h-screen flex-col gap-4 p-6 py-8"
  >
    <div
      v-for="i in 3"
      :key="i"
      class="flex items-center gap-4"
    >
      <Skeleton class="h-24 w-24" />
      <div class="flex-1 space-y-2">
        <Skeleton class="h-4 w-3/4" />
        <Skeleton class="h-3 w-1/2" />
        <div class="flex items-center justify-between pt-2">
          <Skeleton class="h-8 w-24" />
          <Skeleton class="h-4 w-16" />
        </div>
      </div>
    </div>
  </div>

  <!-- Shared Cart Error State -->
  <div
    v-if="isErrorShared || !!errorShared"
    class="bg-noir flex min-h-screen flex-col items-center justify-center gap-4 p-6 py-10 text-center"
  >
    <div class="border-gold/40 border p-6">
      <ShoppingCartIcon class="text-gold h-10 w-10" />
    </div>
    <div class="space-y-1">
      <h3 class="font-display text-text text-2xl font-light">
        Unable to load shared cart
      </h3>
      <p class="text-text-muted text-sm">
        {{ (errorShared as ApiError)?.message }}
      </p>
    </div>
    <RouterLink to="/cart">
      <Button
        variant="outline"
        class="border-gold/40 text-gold hover:bg-gold/10 mt-4 border px-5 py-3 text-xs tracking-[0.2em] uppercase"
      >
        Return to my cart
      </Button>
    </RouterLink>
  </div>

  <!-- Empty Cart State -->
  <div
    v-else-if="isEmpty"
    class="bg-noir flex min-h-screen flex-col items-center justify-center gap-4 p-6 py-10 text-center"
  >
    <div class="border-border-noir border p-6">
      <ShoppingCartIcon class="text-text-muted h-10 w-10" />
    </div>
    <div class="space-y-1">
      <h3 class="font-display text-text text-5xl font-light">
        Your cart is empty
      </h3>
      <p class="text-text-muted text-sm">Add products to start shopping</p>
    </div>
    <RouterLink to="/shop">
      <Button
        variant="outline"
        class="border-gold/40 text-gold hover:bg-gold/10 mt-4 border px-5 py-3 text-xs tracking-[0.2em] uppercase"
      >
        Continue shopping
      </Button>
    </RouterLink>
  </div>

  <!-- Cart Content -->
  <div
    v-else
    class="bg-noir grid min-h-screen gap-8 p-6 lg:grid-cols-3"
  >
    <!-- Shared Cart Banner -->
    <div
      v-if="!!shareToken"
      class="border-gold/40 bg-surface flex items-center justify-between border p-4 lg:col-span-3"
    >
      <div class="flex items-center gap-3">
        <div class="border-gold/40 border p-2">
          <Share2Icon class="text-gold h-5 w-5" />
        </div>
        <div>
          <h3 class="text-text font-semibold">Viewing a Shared Cart</h3>
          <p class="text-text-muted text-sm">
            Updates are synced in real-time. You cannot checkout this cart
            directly.
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <LoadingButton
          :loading="isImportingFromCart"
          :disabled="isAnyItemActioning"
          variant="outline"
          size="sm"
          class="border-gold/40 text-gold hover:bg-gold/10 border px-5 py-3 text-xs tracking-[0.2em] uppercase"
          @click="importFromCart(shareToken)"
        >
          <ImportIcon class="mr-2 h-4 w-4" />
          Add all to Wishlist
        </LoadingButton>
        <LoadingButton
          :loading="isImportingSharedCart"
          :disabled="isAnyItemActioning"
          variant="outline"
          size="sm"
          class="border-gold/40 text-gold hover:bg-gold/10 border px-5 py-3 text-xs tracking-[0.2em] uppercase"
          @click="importSharedCart"
        >
          <ImportIcon class="mr-2 h-4 w-4" />
          Import to my cart
        </LoadingButton>
      </div>
    </div>

    <!-- Cart Items -->
    <div class="flex flex-col gap-4 lg:col-span-2">
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-1">
          <h1 class="flex items-center gap-3">
            <span class="font-display text-text text-5xl font-light">
              My Cart
            </span>
            <span class="text-gold text-xs tracking-[0.3em] uppercase">
              ({{ items.length }} products)
            </span>
          </h1>
          <p
            v-if="lastModified"
            class="text-text-muted text-sm"
          >
            Last modified {{ formatRelativeTime(lastModified) }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <template v-if="!shareToken">
            <LoadingButton
              :loading="isLoadingShareToken"
              :disabled="isLoadingShareToken"
              variant="outline"
              class="border-gold/40 text-gold hover:bg-gold/10 border px-5 py-3 text-xs tracking-[0.2em] uppercase"
              @click="shareCart"
            >
              <Share2Icon class="h-4 w-4" />
              <span class="hidden text-xs sm:block">Share</span>
            </LoadingButton>

            <LoadingButton
              :loading="isClearingCart"
              :disabled="isClearingCart"
              variant="destructive"
              class="border border-red-500/40 px-5 py-3 text-xs tracking-[0.2em] text-red-400 uppercase hover:bg-red-500/10"
              @click="clearCart()"
            >
              <Trash2Icon class="h-4 w-4" />
              <span class="hidden text-xs sm:block md:hidden">Clear</span>
              <span class="hidden md:block">Clear cart</span>
            </LoadingButton>
          </template>

          <template v-else>
            <Button
              variant="outline"
              :disabled="isAnyItemActioning"
              class="border-gold/40 text-gold hover:bg-gold/10 border px-5 py-3 text-xs tracking-[0.2em] uppercase"
            >
              <RouterLink to="/cart">Exit Shared View</RouterLink>
            </Button>
          </template>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow class="border-border-noir border-b hover:bg-transparent">
              <TableHead
                class="text-gold w-[45%] text-xs tracking-[0.3em] uppercase"
              >
                Product
              </TableHead>
              <TableHead
                class="text-gold text-center text-xs tracking-[0.3em] uppercase"
              >
                Quantity
              </TableHead>
              <TableHead
                class="text-gold text-center text-xs tracking-[0.3em] uppercase"
              >
                Price
              </TableHead>
              <TableHead
                class="text-gold text-right text-xs tracking-[0.3em] uppercase"
              >
                Subtotal
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="item in items"
              :key="item.id"
              class="border-border-noir hover:bg-surface/50 border-b"
            >
              <TableCell>
                <div class="flex items-center gap-4 py-3">
                  <RouterLink
                    :to="`/products/${item.product.slug}${item.productVariant ? `?${item.productVariant.productVariantOptions.map((option: any) => `${option.option.attribute.name}=${option.option.name}`).join('&')}` : ''}`"
                    class="flex items-center gap-4"
                  >
                    <div class="flex flex-col gap-2">
                      <button
                        @click.prevent="
                          handleToggleWishlist(
                            item.productId,
                            item.productVariantId,
                          )
                        "
                        :disabled="isAnyItemActioning"
                        class="text-text-muted flex w-fit cursor-pointer items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
                        :title="
                          isInWishlist(item.productId, item.productVariantId)
                            ? 'Remove from wishlist'
                            : 'Add to wishlist'
                        "
                      >
                        <Spinner
                          v-if="
                            isItemWishlistActioning(
                              item.productId,
                              item.productVariantId,
                            )
                          "
                          class="h-4 w-4"
                        />
                        <HeartIcon
                          v-else
                          class="hover:text-gold h-4 w-4"
                          :class="{
                            'text-gold': isInWishlist(
                              item.productId,
                              item.productVariantId,
                            ),
                            'fill-current': isInWishlist(
                              item.productId,
                              item.productVariantId,
                            ),
                          }"
                        />
                      </button>

                      <!-- Product already in my cart (shared view) -->
                      <div
                        v-if="
                          !!shareToken &&
                          isInMyCart(item.productId, item.productVariantId)
                        "
                        class="text-gold flex w-fit items-center gap-1"
                        title="Already in my cart"
                      >
                        <CheckIcon class="h-4 w-4" />
                      </div>

                      <!-- Add to my cart button (shared view) -->
                      <button
                        v-else-if="!!shareToken"
                        @click.prevent="
                          handleImportItem(
                            item.productId,
                            1,
                            item.productVariantId,
                          )
                        "
                        :disabled="isAnyItemActioning"
                        class="hover:text-gold text-text-muted flex w-fit cursor-pointer items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Add to my cart"
                      >
                        <Spinner
                          v-if="
                            isItemImportActioning(
                              item.productId,
                              item.productVariantId,
                            )
                          "
                          class="h-4 w-4"
                        />
                        <ImportIcon
                          v-else
                          class="h-4 w-4"
                        />
                      </button>

                      <button
                        v-if="!shareToken"
                        @click.prevent="
                          handleRemoveItem(
                            item.productId,
                            item.productVariantId,
                          )
                        "
                        :disabled="
                          editingItemId !== null ||
                          updatingItemId !== null ||
                          removingItemId !== null
                        "
                        class="text-text-muted flex w-fit cursor-pointer items-center gap-1 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Remove from cart"
                      >
                        <XIcon class="h-4 w-4" />
                      </button>
                    </div>
                    <div
                      class="border-border-noir bg-surface h-20 w-20 shrink-0 overflow-hidden border"
                    >
                      <img
                        :src="item.product.images[0]"
                        :alt="item.product.name"
                        class="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div class="text-text font-medium">
                        {{ item.product.name }}
                      </div>
                      <div
                        v-if="item.productVariant"
                        class="text-text-muted flex flex-col text-sm"
                      >
                        <span
                          v-for="option in item.productVariant
                            .productVariantOptions"
                          :key="option.id"
                        >
                          {{ option.option.attribute.name }}:
                          {{ option.option.name }}
                        </span>
                      </div>
                    </div>
                  </RouterLink>
                </div>
              </TableCell>
              <TableCell :class="{ 'text-center': !!shareToken }">
                <div
                  v-if="!!shareToken"
                  class="text-text"
                >
                  {{ item.quantity }}
                </div>
                <div
                  v-else
                  class="flex items-center justify-center"
                >
                  <div
                    class="border-border-noir bg-surface flex items-center border"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      class="hover:text-gold text-text-muted size-8 p-0 hover:bg-transparent"
                      @click="
                        handleQuantityChange(
                          item.productId,
                          getDisplayQuantity(
                            item.productId,
                            item.productVariantId,
                          ) - 1,
                          item.productVariantId,
                        )
                      "
                      :disabled="
                        !!shareToken ||
                        getDisplayQuantity(
                          item.productId,
                          item.productVariantId,
                        ) <= 1 ||
                        isItemDisabled(item.productId, item.productVariantId) ||
                        isItemUpdating(item.productId, item.productVariantId) ||
                        isItemRemoving(item.productId, item.productVariantId)
                      "
                    >
                      <MinusIcon class="h-4 w-4" />
                    </Button>
                    <span class="text-text w-10 text-center text-sm">
                      {{
                        getDisplayQuantity(
                          item.productId,
                          item.productVariantId,
                        )
                      }}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      class="hover:text-gold text-text-muted size-8 p-0 hover:bg-transparent"
                      @click="
                        handleQuantityChange(
                          item.productId,
                          getDisplayQuantity(
                            item.productId,
                            item.productVariantId,
                          ) + 1,
                          item.productVariantId,
                        )
                      "
                      :disabled="
                        !!shareToken ||
                        getDisplayQuantity(
                          item.productId,
                          item.productVariantId,
                        ) >=
                          getMaxQuantity(
                            item.productId,
                            item.productVariantId,
                          ) ||
                        isItemDisabled(item.productId, item.productVariantId) ||
                        isItemUpdating(item.productId, item.productVariantId) ||
                        isItemRemoving(item.productId, item.productVariantId)
                      "
                    >
                      <PlusIcon class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TableCell>
              <TableCell class="text-text-muted text-center">
                {{ formatPrice(getItemPrice(item)) }}
              </TableCell>
              <TableCell class="text-right">
                <span class="text-text font-medium">
                  {{ formatPrice(getItemSubtotal(item)) }}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Mobile View -->
      <div class="space-y-6 md:hidden">
        <div
          v-for="item in items"
          :key="item.id"
          class="border-border-noir flex gap-4 border-b pb-6"
        >
          <div class="flex flex-col gap-4">
            <button
              @click.prevent="
                handleToggleWishlist(item.productId, item.productVariantId)
              "
              :disabled="isAnyItemActioning"
              class="text-text-muted flex w-fit cursor-pointer items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Spinner
                v-if="
                  isItemWishlistActioning(item.productId, item.productVariantId)
                "
                class="h-4 w-4"
              />
              <HeartIcon
                v-else
                class="hover:text-gold h-4 w-4"
                :class="{
                  'text-gold': isInWishlist(
                    item.productId,
                    item.productVariantId,
                  ),
                  'fill-current': isInWishlist(
                    item.productId,
                    item.productVariantId,
                  ),
                }"
              />
            </button>

            <!-- Product already in my cart (shared view mobile) -->
            <div
              v-if="
                !!shareToken &&
                isInMyCart(item.productId, item.productVariantId)
              "
              class="text-gold flex w-fit items-center gap-1"
              title="Already in my cart"
            >
              <CheckIcon class="h-4 w-4" />
            </div>

            <!-- Add to my cart button (shared view mobile) -->
            <button
              v-else-if="!!shareToken"
              @click.prevent="
                handleImportItem(item.productId, 1, item.productVariantId)
              "
              :disabled="isAnyItemActioning"
              class="hover:text-gold text-text-muted flex w-fit cursor-pointer items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Spinner
                v-if="
                  isItemImportActioning(item.productId, item.productVariantId)
                "
                class="h-4 w-4"
              />
              <ImportIcon
                v-else
                class="h-4 w-4"
              />
            </button>
            <button
              v-if="!shareToken"
              @click="handleRemoveItem(item.productId, item.productVariantId)"
              :disabled="
                editingItemId !== null ||
                updatingItemId !== null ||
                removingItemId !== null
              "
              class="text-text-muted flex w-fit cursor-pointer items-center gap-1 text-sm hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XIcon class="h-4 w-4" />
            </button>
          </div>
          <div
            class="border-border-noir bg-surface h-20 w-20 shrink-0 overflow-hidden border"
          >
            <img
              :src="item.product.images[0]"
              :alt="item.product.name"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="flex flex-1 flex-col gap-2">
            <div class="text-text font-medium">
              {{ item.product.name }}
            </div>
            <div
              v-if="item.productVariant"
              class="text-text-muted flex flex-col text-sm"
            >
              <span
                v-for="option in item.productVariant.productVariantOptions"
                :key="option.id"
              >
                {{ option.option.attribute.name }}:
                {{ option.option.name }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <div
                class="border-border-noir bg-surface flex items-center border"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  class="hover:text-gold text-text-muted size-8 p-0 hover:bg-transparent"
                  @click="
                    handleQuantityChange(
                      item.productId,
                      getDisplayQuantity(
                        item.productId,
                        item.productVariantId,
                      ) - 1,
                      item.productVariantId,
                    )
                  "
                  :disabled="
                    getDisplayQuantity(item.productId, item.productVariantId) <=
                      1 ||
                    isItemDisabled(item.productId, item.productVariantId) ||
                    !!shareToken
                  "
                >
                  <MinusIcon class="h-4 w-4" />
                </Button>
                <span class="text-text w-10 text-center text-sm">
                  {{
                    getDisplayQuantity(item.productId, item.productVariantId)
                  }}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  class="hover:text-gold text-text-muted size-8 p-0 hover:bg-transparent"
                  @click="
                    handleQuantityChange(
                      item.productId,
                      getDisplayQuantity(
                        item.productId,
                        item.productVariantId,
                      ) + 1,
                      item.productVariantId,
                    )
                  "
                  :disabled="
                    getDisplayQuantity(item.productId, item.productVariantId) >=
                      getMaxQuantity(item.productId, item.productVariantId) ||
                    isItemDisabled(item.productId, item.productVariantId) ||
                    !!shareToken
                  "
                >
                  <PlusIcon class="h-4 w-4" />
                </Button>
              </div>
              <div class="text-text font-medium">
                {{ formatPrice(getItemSubtotal(item)) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart Summary -->
    <div class="lg:col-span-1">
      <div class="border-border-noir bg-surface sticky top-24 border p-6">
        <h3 class="font-display text-text mb-6 text-3xl font-light">
          Cart summary
        </h3>
        <div class="bg-gold/40 mx-auto mb-6 h-px w-24" />

        <RadioGroup v-model="selectedShippingId">
          <div class="space-y-3">
            <div
              v-for="option in shippingOptions"
              :key="option.id"
              class="flex cursor-pointer items-center justify-between border p-4 transition-colors"
              :class="{
                'border-gold/40 bg-gold/5': selectedShippingId === option.id,
                'border-border-noir': selectedShippingId !== option.id,
              }"
              @click="handleShippingChange(option.id)"
            >
              <div class="flex items-center gap-3">
                <RadioGroupItem
                  :value="option.id"
                  :id="option.id"
                  class="border-gold/40 text-gold"
                />
                <Label
                  :for="option.id"
                  class="text-text cursor-pointer font-normal"
                >
                  {{ option.label }}
                </Label>
              </div>
              <span class="text-gold text-sm font-medium">
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
        </RadioGroup>

        <!-- Coupon Section -->
        <div class="border-border-noir mt-6 border-t pt-4">
          <h3 class="text-gold mb-2 text-xs tracking-[0.3em] uppercase">
            Have a coupon?
          </h3>
          <p class="text-text-muted mb-4 text-sm">
            Add your code for an instant cart discount
          </p>

          <!-- Applied Coupon Display -->
          <div
            v-if="hasAppliedCoupon && appliedCoupon"
            class="border-gold/40 bg-border-noir mb-4 flex h-10 items-center justify-between border px-3"
          >
            <div class="flex items-center gap-2">
              <TagIcon class="text-gold h-4 w-4" />
              <span class="text-gold">
                {{ appliedCoupon.code }}
              </span>
              <span class="text-gold/70 text-sm">
                (-{{
                  appliedCoupon.type === 'PERCENTAGE'
                    ? `${appliedCoupon.value}%`
                    : formatPrice(appliedCoupon.discountAmount)
                }})
              </span>
            </div>
            <button
              @click="removeCoupon"
              class="text-gold hover:text-text cursor-pointer text-xs tracking-[0.2em] uppercase"
            >
              Remove
            </button>
          </div>

          <!-- Coupon Input -->
          <div
            v-else
            class="flex w-full items-end gap-2"
          >
            <div class="relative flex-1">
              <Input
                v-model="couponCode"
                placeholder="Coupon Code"
                class="focus:border-gold text-text placeholder:text-text-muted border-border-noir bg-surface h-10 w-full border pl-10 uppercase"
                :disabled="isApplyingCoupon"
                @keyup.enter="handleApplyCoupon"
              />
              <TagIcon
                class="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              />
            </div>
            <button
              class="border-gold/40 text-gold hover:bg-gold hover:text-noir h-10 border px-6 text-xs tracking-[0.2em] uppercase transition-all disabled:opacity-50"
              @click="handleApplyCoupon"
              :disabled="isApplyingCoupon || !couponCode"
            >
              {{ isApplyingCoupon ? 'Applying...' : 'Apply' }}
            </button>
          </div>
        </div>

        <!-- Totals -->
        <div class="border-border-noir mt-6 space-y-3 border-t pt-6">
          <div class="flex justify-between text-sm">
            <span class="text-text-muted">Subtotal</span>
            <span class="text-text">{{ formatPrice(subtotal) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-text-muted">Shipping</span>
            <span class="text-text">{{ formatPrice(shippingCost) }}</span>
          </div>
          <div
            v-if="hasAppliedCoupon"
            class="text-gold flex justify-between text-sm"
          >
            <span>Discount</span>
            <span>-{{ formatPrice(discountAmount) }}</span>
          </div>
          <div class="bg-border-noir mx-auto h-px w-12" />
          <div class="flex justify-between text-lg font-semibold">
            <span class="text-text">Total</span>
            <span class="text-gold">{{ formatPrice(total) }}</span>
          </div>
        </div>

        <!-- Checkout Button -->
        <Button
          v-if="!shareToken"
          class="border-gold/40 bg-gold hover:bg-gold/90 text-noir mt-6 h-12 w-full border text-xs tracking-[0.2em] uppercase"
          @click="handleCheckout"
        >
          Checkout
        </Button>
        <Button
          v-else
          class="border-gold/40 bg-gold hover:bg-gold/90 text-noir mt-6 h-12 w-full border text-xs tracking-[0.2em] uppercase"
          @click="handleCheckout"
        >
          <CreditCardIcon class="mr-2 h-4 w-4" />
          Pay for this cart
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
