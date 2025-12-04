<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import { useCarts, useCartsMutation } from '@/composables/useCarts'
import { useWishlists, useWishlistsMutation } from '@/composables/useWishlists'
import type { WishlistItemWithDetails } from '@/types'
import { formatPrice } from '@/utils/lib'
import {
  ArrowLeftIcon,
  CheckIcon,
  HeartIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-vue-next'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Skeleton from 'primevue/skeleton'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const { items, isLoadingWishlist } = useWishlists()
const { items: cartItems } = useCarts()
const {
  removeWishlistItem,
  isRemovingWishlistItem,
  clearWishlist,
  isClearingWishlist,
} = useWishlistsMutation()
const { addToCart } = useCartsMutation()

// État local pour suivre quel item est en cours d'ajout
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
  // Créer un identifiant unique pour cet item
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

// Vérifie si le produit nécessite une sélection de variante
const needsVariantSelection = (item: WishlistItemWithDetails) => {
  // Produit avec variantes (pas de basePrice) mais aucune variante sélectionnée
  return !item.product.basePrice && !item.variant
}

// Pour l'affichage du prix avec "From"
const displayFrom = (item: WishlistItemWithDetails) => {
  return needsVariantSelection(item)
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Loading State -->
    <div
      v-if="isLoadingWishlist"
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

    <!-- Empty Wishlist State -->
    <div
      v-else-if="items.length === 0"
      class="flex flex-col items-center justify-center gap-4 py-20 text-center"
    >
      <div class="rounded-full bg-gray-100 p-6">
        <HeartIcon class="h-10 w-10 text-gray-400" />
      </div>
      <div class="space-y-1">
        <h3 class="text-lg font-semibold">Your wishlist is empty</h3>
        <p class="text-sm text-gray-500">Add products to your wishlist</p>
      </div>
      <RouterLink to="/shop">
        <Button
          outlined
          class="mt-4"
        >
          Continue browsing
        </Button>
      </RouterLink>
    </div>

    <!-- Wishlist Content -->
    <div
      v-else
      class="flex flex-col gap-6"
    >
      <div class="flex items-center justify-between">
        <h1 class="flex items-center gap-1">
          <span class="text-2xl font-bold">My wishlist</span>
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
            :loading="isClearingWishlist"
            :disabled="isClearingWishlist"
            severity="danger"
            size="large"
            @click="clearWishlist(items.map((item) => item.product.slug))"
          >
            <Trash2Icon class="h-4 w-4" />
            <span class="block text-sm sm:hidden">Clear</span>
            <span class="hidden sm:block">Clear wishlist</span>
          </LoadingButton>
        </div>
      </div>

      <!-- Desktop View -->
      <div class="hidden md:block">
        <DataTable :value="items">
          <Column
            header="Product"
            style="width: 50%"
          >
            <template #body="slotProps">
              <div class="flex items-center gap-6 py-3">
                <button
                  @click="handleRemoveItem(slotProps.data)"
                  class="cursor-pointer text-gray-500 transition-colors hover:text-red-500"
                  :disabled="isRemovingWishlistItem"
                  aria-label="Remove item"
                >
                  <XIcon class="h-5 w-5" />
                </button>
                <RouterLink
                  :to="`/products/${slotProps.data.product.slug}${slotProps.data.variant && `?${slotProps.data.variant.productVariantOptions.map((option: any) => `${option.option.attribute.name}=${option.option.name}`).join('&')}`}`"
                  class="flex items-center gap-4"
                >
                  <div class="h-24 w-24 overflow-hidden rounded bg-gray-100">
                    <img
                      :src="slotProps.data.product.images[0]"
                      :alt="slotProps.data.product.name"
                      class="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div class="text-base font-medium">
                      {{ slotProps.data.product.name }}
                    </div>
                    <div v-if="!!slotProps.data.variant">
                      <div
                        v-for="option in slotProps.data.variant
                          .productVariantOptions"
                        :key="option.id"
                        class="text-sm text-gray-600"
                      >
                        <span class="font-medium">
                          {{ option.option.attribute.name }}:
                        </span>
                        <span>{{ option.option.name }}</span>
                      </div>
                    </div>
                  </div>
                </RouterLink>
              </div>
            </template>
          </Column>
          <Column
            header="Price"
            class="text-center"
          >
            <template #body="slotProps">
              <div class="text-base">
                <span v-if="displayFrom(slotProps.data)">From</span>
                {{ formatPrice(getItemPrice(slotProps.data)) }}
              </div>
            </template>
          </Column>
          <Column
            header=""
            class="text-right"
          >
            <template #body="slotProps">
              <!-- Produit nécessitant une sélection de variante -->
              <div
                v-if="needsVariantSelection(slotProps.data)"
                class="flex w-full justify-end"
              >
                <RouterLink
                  :to="`/products/${slotProps.data.product.slug}`"
                  class="flex w-fit items-center"
                >
                  <Button link>
                    <ArrowLeftIcon class="h-4 w-4" />
                    Select options
                  </Button>
                </RouterLink>
              </div>

              <!-- Produit déjà dans le panier -->
              <div
                v-else-if="
                  cartItems.some(
                    (cartItem) =>
                      cartItem.product.id === slotProps.data.product.id &&
                      cartItem.variant?.id === slotProps.data.variant?.id,
                  )
                "
                class="rounded-md text-green-500"
              >
                <span class="flex items-center justify-end gap-2">
                  <CheckIcon class="h-4 w-4" />
                  Already in cart
                </span>
              </div>

              <!-- Bouton d'ajout au panier -->
              <LoadingButton
                v-else
                :loading="isItemLoading(slotProps.data)"
                @click="handleAddToCart(slotProps.data)"
                :disabled="isAnyItemLoading()"
                class="h-10 w-26"
              >
                Add to cart
              </LoadingButton>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Mobile View -->
      <div class="space-y-8 md:hidden">
        <div class="border-b pb-2 text-sm text-gray-500">Product</div>

        <div
          v-for="item in items"
          :key="item.id"
          class="flex flex-col gap-4 border-b pb-8 last:border-0"
        >
          <div class="flex items-center gap-4">
            <button
              @click="handleRemoveItem(item)"
              class="cursor-pointer text-gray-500 transition-colors hover:text-red-500"
              :disabled="isRemovingWishlistItem"
              aria-label="Remove item"
            >
              <XIcon class="h-5 w-5" />
            </button>

            <div class="h-24 w-24 shrink-0 overflow-hidden rounded bg-gray-100">
              <img
                :src="item.product.images[0]"
                :alt="item.product.name"
                class="h-full w-full object-cover"
              />
            </div>

            <div class="flex flex-col justify-center gap-1">
              <div class="text-base font-medium">{{ item.product.name }}</div>
              <div
                v-if="item.variant"
                class="text-sm text-gray-500"
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

          <!-- Produit nécessitant une sélection de variante -->
          <div
            v-if="needsVariantSelection(item)"
            class="flex w-full justify-end"
          >
            <RouterLink
              :to="`/products/${item.product.slug}`"
              class="flex w-fit items-center"
            >
              <Button link>
                <ArrowLeftIcon class="h-4 w-4" />
                Select options
              </Button>
            </RouterLink>
          </div>

          <!-- Produit déjà dans le panier (mobile) -->
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

          <!-- Bouton d'ajout au panier (mobile) -->
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
