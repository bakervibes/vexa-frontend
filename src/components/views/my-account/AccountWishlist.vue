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
import { useCarts, useCartsMutation } from '@/composables/useCarts'
import { useWishlists, useWishlistsMutation } from '@/composables/useWishlists'
import type { WishlistItemWithDetails } from '@/types'
import { formatPrice } from '@/utils/lib'
import { ArrowLeftIcon, CheckIcon, HeartIcon, XIcon } from 'lucide-vue-next'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const { items, isLoadingWishlist } = useWishlists()
const { items: cartItems } = useCarts()
const { removeWishlistItem, isRemovingWishlistItem } = useWishlistsMutation()
const { addToCart } = useCartsMutation()

// Local state to track which item is being added
const addingItemId = ref<string | null>(null)

const getItemPrice = (item: WishlistItemWithDetails) => {
  return (
    item.variant?.price ??
    item.variant?.basePrice ??
    item.product?.price ??
    item.product?.basePrice ??
    Math.min(...item.product.variants.map((v) => v.price ?? v.basePrice))
  )
}

const handleAddToCart = async (item: WishlistItemWithDetails) => {
  const itemId = `${item.product.id}-${item.variant?.id || 'no-variant'}`

  try {
    addingItemId.value = itemId
    await addToCart(item.product.id, 1, item.variant?.id, item.product.slug)
  } finally {
    addingItemId.value = null
  }
}

const handleRemoveItem = async (item: WishlistItemWithDetails) => {
  await removeWishlistItem(item.product.id, item.variant?.id)
}

const isItemLoading = (item: WishlistItemWithDetails) => {
  const itemId = `${item.product.id}-${item.variant?.id || 'no-variant'}`
  return addingItemId.value === itemId
}

const isAnyItemLoading = () => {
  return addingItemId.value !== null
}

// Checks if the product requires variant selection
const needsVariantSelection = (item: WishlistItemWithDetails) => {
  return !item.product.basePrice && !item.variant
}

// For displaying price with "From"
const displayFrom = (item: WishlistItemWithDetails) => {
  return needsVariantSelection(item)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <h2 class="text-xl font-semibold">Your Wishlist</h2>

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
      v-else-if="items.length === 0"
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
      <!-- Desktop View -->
      <div class="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[50%]">Product</TableHead>
              <TableHead class="text-center">Price</TableHead>
              <TableHead class="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="item in items"
              :key="item.id"
            >
              <TableCell class="py-5">
                <div class="flex items-center gap-4">
                  <button
                    @click="handleRemoveItem(item)"
                    class="hover:text-destructive cursor-pointer text-gray-500 transition-colors"
                    :disabled="isRemovingWishlistItem"
                    aria-label="Remove item"
                  >
                    <XIcon class="h-5 w-5" />
                  </button>
                  <RouterLink
                    :to="`/products/${item.product.slug}${item.variant && `?${item.variant.productVariantOptions.map((option) => `${option.option.attribute.name}=${option.option.name}`).join('&')}`}`"
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
                      <div v-if="!!item.variant">
                        <div
                          v-for="option in item.variant.productVariantOptions"
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
              <TableCell class="py-5 text-center">
                <span
                  v-if="displayFrom(item)"
                  class="text-gray-500"
                >
                  From
                </span>
                {{ formatPrice(getItemPrice(item)) }}
              </TableCell>
              <TableCell class="py-5 text-right">
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
                  v-else-if="
                    cartItems.some(
                      (cartItem) =>
                        cartItem.product.id === item.product.id &&
                        cartItem.variant?.id === item.variant?.id,
                    )
                  "
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
                  :loading="isItemLoading(item)"
                  @click="handleAddToCart(item)"
                  :disabled="isAnyItemLoading()"
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
          v-for="item in items"
          :key="item.id"
          class="flex flex-col gap-4 border-b pb-6 last:border-0"
        >
          <div class="flex items-center gap-4">
            <button
              @click="handleRemoveItem(item)"
              class="hover:text-destructive cursor-pointer text-gray-500 transition-colors"
              :disabled="isRemovingWishlistItem"
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
                v-if="item.variant"
                class="text-muted-foreground text-sm"
              >
                <span
                  v-for="(option, index) in item.variant.productVariantOptions"
                  :key="option.id"
                >
                  {{ option.option.attribute.name }}: {{ option.option.name }}
                  <span
                    v-if="index < item.variant.productVariantOptions.length - 1"
                  >
                    ,
                  </span>
                </span>
              </div>
              <div class="mt-1 font-medium">
                <span v-if="displayFrom(item)">From</span>
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
            v-else-if="
              cartItems.some(
                (cartItem) =>
                  cartItem.product.id === item.product.id &&
                  cartItem.variant?.id === item.variant?.id,
              )
            "
            class="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-green-500 text-green-500"
          >
            <CheckIcon class="h-4 w-4" />
            Already in cart
          </div>

          <!-- Add to cart button (mobile) -->
          <LoadingButton
            v-else
            class="h-12 w-full"
            :loading="isItemLoading(item)"
            @click="handleAddToCart(item)"
            :disabled="isAnyItemLoading()"
          >
            Add to cart
          </LoadingButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
