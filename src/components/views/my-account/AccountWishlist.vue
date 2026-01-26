<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCarts } from '@/composables/useCarts'
import { useSharedWishlists } from '@/composables/useSharedWishlists'
import { useWishlists } from '@/composables/useWishlists'
import type { WishlistItemWithDetails } from '@/types'
import { formatPrice } from '@/utils/lib'
import {
  ArrowLeftIcon,
  CheckIcon,
  HeartIcon,
  Share2Icon,
  Trash2Icon,
  XIcon,
} from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

const {
  wishlistItems,
  isLoadingWishlist,
  removeWishlistItem,
  clearWishlist,
  isClearingWishlist,
} = useWishlists()
const { cartItems, addCartItem } = useCarts()

const { shareWishlist, isLoadingShareToken } = useSharedWishlists()

// Track individual item actions
const cartActionItemId = ref<string | null>(null)
const removeActionItemId = ref<string | null>(null)

// Check if any global action is in progress
const isGlobalActionInProgress = computed(
  () => isLoadingShareToken.value || isClearingWishlist.value,
)

// Check if any item action is in progress
const isItemActionInProgress = computed(
  () => cartActionItemId.value !== null || removeActionItemId.value !== null,
)

// Check if any action at all is in progress
const isAnyActionInProgress = computed(
  () => isGlobalActionInProgress.value || isItemActionInProgress.value,
)

const getItemKey = (productId: string, variantId?: string | null) => {
  return variantId ? `${productId}-${variantId}` : productId
}

const getItemPrice = (item: WishlistItemWithDetails) => {
  return (
    item.productVariant?.price ??
    item.productVariant?.basePrice ??
    item.product?.price ??
    item.product?.basePrice ??
    Math.min(...item.product.productVariants.map((v) => v.price ?? v.basePrice))
  )
}

// Check if specific item has cart action in progress
const isCartActioning = (productId: string, variantId?: string | null) => {
  return cartActionItemId.value === getItemKey(productId, variantId)
}

// Check if specific item has remove action in progress
const isRemoveActioning = (productId: string, variantId?: string | null) => {
  return removeActionItemId.value === getItemKey(productId, variantId)
}

const handleAddCartItem = async (item: WishlistItemWithDetails) => {
  if (isAnyActionInProgress.value) return

  const key = getItemKey(item.product.id, item.productVariant?.id)
  cartActionItemId.value = key
  try {
    await addCartItem(item.product.id, 1, item.productVariant?.id)
  } catch {
    // Error already handled by useCarts toast
  } finally {
    cartActionItemId.value = null
  }
}

const handleRemoveItem = async (item: WishlistItemWithDetails) => {
  if (isAnyActionInProgress.value) return

  const key = getItemKey(item.product.id, item.productVariant?.id)
  removeActionItemId.value = key
  try {
    await removeWishlistItem(item.product.id, item.productVariant?.id)
  } catch {
    // Error already handled by useWishlists toast
  } finally {
    removeActionItemId.value = null
  }
}

// Checks if the product requires variant selection
const needsVariantSelection = (item: WishlistItemWithDetails) => {
  return !item.product.basePrice && !item.productVariant
}

// Check if item is in cart
const isInCart = (productId: string, variantId?: string | null) => {
  return cartItems.value.some(
    (cartItem) =>
      cartItem.product.id === productId &&
      (cartItem.productVariant?.id ?? null) === (variantId ?? null),
  )
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Loading State -->
    <div
      v-if="isLoadingWishlist"
      class="space-y-4"
    >
      <Skeleton class="h-12 w-full" />
      <Skeleton
        v-for="i in 4"
        :key="i"
        class="h-20 w-full"
      />
    </div>

    <!-- Empty Wishlist State -->
    <div
      v-else-if="wishlistItems.length === 0"
      class="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-16 text-center"
    >
      <div class="rounded-full bg-gray-100 p-4">
        <HeartIcon class="h-8 w-8 text-gray-400" />
      </div>
      <div class="space-y-1">
        <h3 class="text-lg font-semibold">Your wishlist is empty</h3>
        <p class="text-sm text-gray-500">Add products to your wishlist</p>
      </div>
      <RouterLink to="/shop">
        <Button
          variant="outline"
          class="mt-2"
        >
          Continue browsing
        </Button>
      </RouterLink>
    </div>

    <!-- Wishlist Content -->
    <div
      v-else
      class="flex flex-col gap-4"
    >
      <div class="flex items-center justify-between">
        <h1 class="flex items-center gap-1">
          <span class="text-2xl font-bold">My wishlist</span>
          <span class="text-xl font-medium text-gray-500">
            ({{ wishlistItems.length }})
          </span>
        </h1>

        <div class="flex items-center gap-2">
          <LoadingButton
            :loading="isLoadingShareToken"
            :disabled="isAnyActionInProgress"
            variant="outline"
            @click="shareWishlist"
          >
            <Share2Icon class="h-4 w-4" />
            <span class="hidden text-sm sm:block">Share</span>
          </LoadingButton>

          <LoadingButton
            :loading="isClearingWishlist"
            :disabled="isAnyActionInProgress"
            variant="destructive"
            @click="clearWishlist()"
          >
            <Trash2Icon class="h-4 w-4" />
            <span class="hidden text-sm sm:block md:hidden">Clear</span>
            <span class="hidden md:block">Clear wishlist</span>
          </LoadingButton>
        </div>
      </div>

      <!-- Desktop View -->
      <div class="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[50%]">Product</TableHead>
              <TableHead class="text-center">Price</TableHead>
              <TableHead class="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="item in wishlistItems"
              :key="item.id"
            >
              <TableCell>
                <div class="flex items-center gap-4 py-2">
                  <button
                    @click="handleRemoveItem(item)"
                    class="cursor-pointer text-gray-500 transition-colors hover:text-red-500"
                    :disabled="isAnyActionInProgress"
                    :class="{
                      'animate-pulse': isRemoveActioning(
                        item.product.id,
                        item.productVariant?.id,
                      ),
                    }"
                    aria-label="Remove item"
                  >
                    <XIcon class="h-5 w-5" />
                  </button>
                  <RouterLink
                    :to="`/products/${item.product.slug}${item.productVariant ? `?${item.productVariant.productVariantOptions.map((option: any) => `${option.option.attribute.name}=${option.option.name}`).join('&')}` : ''}`"
                    class="flex items-center gap-4"
                  >
                    <div class="h-16 w-16 overflow-hidden rounded bg-gray-100">
                      <img
                        :src="item.product.images[0]"
                        :alt="item.product.name"
                        class="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div class="font-medium">
                        {{ item.product.name }}
                      </div>
                      <div v-if="!!item.productVariant">
                        <div
                          v-for="option in item.productVariant
                            .productVariantOptions"
                          :key="option.id"
                        >
                          <span class="text-gray-500">
                            {{ option.option.attribute.name }}:
                          </span>
                          {{ option.option.name }}
                        </div>
                      </div>
                    </div>
                  </RouterLink>
                </div>
              </TableCell>
              <TableCell class="text-center">
                <span
                  v-if="needsVariantSelection(item)"
                  class="text-gray-500"
                >
                  From
                </span>
                {{ formatPrice(getItemPrice(item)) }}
              </TableCell>
              <TableCell class="text-right">
                <!-- Product requiring variant selection -->
                <div
                  v-if="needsVariantSelection(item)"
                  class="flex w-full justify-end"
                >
                  <RouterLink
                    :to="`/products/${item.product.slug}`"
                    class="flex w-fit items-center"
                  >
                    <Button variant="link">
                      <ArrowLeftIcon class="h-4 w-4" />
                      Select options
                    </Button>
                  </RouterLink>
                </div>

                <!-- Product already in cart -->
                <div
                  v-else-if="isInCart(item.product.id, item.productVariant?.id)"
                  class="rounded-md text-green-500"
                >
                  <span class="flex items-center justify-end gap-2">
                    <CheckIcon class="h-4 w-4" />
                    Already in cart
                  </span>
                </div>

                <!-- Add to cart button -->
                <LoadingButton
                  v-else
                  :loading="
                    isCartActioning(item.product.id, item.productVariant?.id)
                  "
                  @click="handleAddCartItem(item)"
                  :disabled="isAnyActionInProgress"
                  class="h-10"
                >
                  Add to cart
                </LoadingButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Mobile View -->
      <div class="space-y-6 md:hidden">
        <div
          v-for="item in wishlistItems"
          :key="item.id"
          class="flex flex-col gap-4 border-b pb-6 last:border-0"
        >
          <div class="flex items-center gap-4">
            <button
              @click="handleRemoveItem(item)"
              class="cursor-pointer text-gray-500 transition-colors hover:text-red-500"
              :disabled="isAnyActionInProgress"
              :class="{
                'animate-pulse': isRemoveActioning(
                  item.product.id,
                  item.productVariant?.id,
                ),
              }"
              aria-label="Remove item"
            >
              <XIcon class="h-5 w-5" />
            </button>

            <div class="h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
              <img
                :src="item.product.images[0]"
                :alt="item.product.name"
                class="h-full w-full object-cover"
              />
            </div>

            <div class="flex flex-col justify-center gap-1">
              <div class="font-medium">{{ item.product.name }}</div>
              <div
                v-if="item.productVariant"
                class="text-sm text-gray-500"
              >
                <span
                  v-for="(option, index) in item.productVariant
                    .productVariantOptions"
                  :key="option.id"
                >
                  {{ option.option.attribute.name }}: {{ option.option.name }}
                  <span
                    v-if="
                      index <
                      item.productVariant.productVariantOptions.length - 1
                    "
                  >
                    ,
                  </span>
                </span>
              </div>
              <div class="mt-1 font-medium">
                <span
                  v-if="needsVariantSelection(item)"
                  class="text-gray-500"
                >
                  From
                </span>
                {{ formatPrice(getItemPrice(item)) }}
              </div>
            </div>
          </div>

          <!-- Product requiring variant selection -->
          <div
            v-if="needsVariantSelection(item)"
            class="flex w-full justify-end"
          >
            <RouterLink
              :to="`/products/${item.product.slug}`"
              class="flex w-fit items-center"
            >
              <Button variant="link">
                <ArrowLeftIcon class="h-4 w-4" />
                Select options
              </Button>
            </RouterLink>
          </div>

          <!-- Product already in cart (mobile) -->
          <div
            v-else-if="isInCart(item.product.id, item.productVariant?.id)"
            class="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-green-500 text-green-500"
          >
            <CheckIcon class="h-4 w-4" />
            Already in cart
          </div>

          <!-- Add to cart button (mobile) -->
          <LoadingButton
            v-else
            class="h-12 w-full"
            :loading="isCartActioning(item.product.id, item.productVariant?.id)"
            @click="handleAddCartItem(item)"
            :disabled="isAnyActionInProgress"
          >
            Add to cart
          </LoadingButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
