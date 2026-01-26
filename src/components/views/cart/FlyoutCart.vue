<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useCarts } from '@/composables/useCarts'
import { formatPrice } from '@/utils/lib'
import { Minus, Plus, ShoppingCartIcon, Trash2Icon } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

const {
  cartSubtotal,
  isCartEmpty,
  isLoadingCart,
  cartItemsCount,
  cartItems,
  isRemovingCartItem,
  isClearingCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = useCarts()

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

const isDrawerOpen = ref(false)
const showRemoveItemDialog = ref(false)
const showClearCartDialog = ref(false)

const itemToRemove = ref<{
  itemId: string
  productName: string
} | null>(null)

const getItemKey = (productId: string, variantId?: string | null) => {
  return `${productId}-${variantId ?? 'no-variant'}`
}

const findCartItem = (productId: string, variantId?: string | null) => {
  return cartItems.value.find(
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

const isGlobalActionDisabled = computed(() => {
  return (
    editingItemId.value !== null ||
    updatingItemId.value !== null ||
    removingItemId.value !== null ||
    isClearingCart.value
  )
})

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

const openRemoveItemDialog = (
  productId: string,
  variantId?: string | null,
  productName?: string,
) => {
  const cartItem = findCartItem(productId, variantId)
  if (!cartItem) return

  itemToRemove.value = {
    itemId: cartItem.id,
    productName: productName ?? 'this item',
  }
  showRemoveItemDialog.value = true
}

const confirmRemoveItem = async () => {
  if (!itemToRemove.value) return

  const { itemId } = itemToRemove.value

  // Clear any pending quantity changes for all items (we don't have the key easily)
  pendingQuantities.value.forEach((pending, key) => {
    if (pending?.timer) {
      clearTimeout(pending.timer)
    }
  })

  removingItemId.value = itemId

  try {
    await removeCartItem(itemId)
  } finally {
    removingItemId.value = null
    itemToRemove.value = null
    showRemoveItemDialog.value = false
  }
}

const cancelRemoveItem = () => {
  showRemoveItemDialog.value = false
  itemToRemove.value = null
}

const openClearCartDialog = () => {
  showClearCartDialog.value = true
}

const confirmClearCart = async () => {
  pendingQuantities.value.forEach((pending) => {
    if (pending.timer) {
      clearTimeout(pending.timer)
    }
  })
  pendingQuantities.value.clear()
  editingItemId.value = null

  try {
    await clearCart()
  } finally {
    showClearCartDialog.value = false
  }
}

const cancelClearCart = () => {
  showClearCartDialog.value = false
}

const getItemPrice = (item: (typeof cartItems.value)[0]) => {
  return (
    item.productVariant?.price ??
    item.productVariant?.basePrice ??
    item.product?.price ??
    item.product?.basePrice ??
    0
  )
}
</script>

<template>
  <Sheet v-model:open="isDrawerOpen">
    <SheetTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Shopping Cart"
        class="relative p-2"
      >
        <ShoppingCartIcon class="size-5" />
        <span
          v-if="cartItemsCount > 0"
          class="bg-primary absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-bold text-white"
        >
          {{ cartItemsCount }}
        </span>
      </Button>
    </SheetTrigger>
    <SheetContent
      side="right"
      class="flex h-full w-full flex-col sm:max-w-100"
    >
      <SheetHeader class="text-start">
        <SheetTitle class="text-lg font-semibold">
          My Cart ({{ cartItemsCount }})
        </SheetTitle>
      </SheetHeader>

      <!-- Loading State -->
      <div
        v-if="isLoadingCart"
        class="flex flex-1 flex-col gap-4 py-4"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="flex items-center gap-4"
        >
          <Skeleton class="h-20 w-20 rounded-md" />
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

      <!-- Empty Cart State -->
      <div
        v-else-if="isCartEmpty"
        class="flex flex-1 flex-col items-center justify-center gap-4 py-4 text-center"
      >
        <div class="rounded-full bg-gray-100 p-6">
          <ShoppingCartIcon class="size-10 text-gray-400" />
        </div>
        <div class="space-y-1">
          <h3 class="font-semibold">Your cart is empty</h3>
          <p class="text-sm text-gray-500">Add products to start shopping</p>
        </div>
        <Button
          variant="outline"
          class="mt-4"
          @click="isDrawerOpen = false"
        >
          Continue shopping
        </Button>
      </div>

      <!-- Cart Items -->
      <section
        v-else
        class="no-scrollbar h-full flex-1 overflow-y-auto px-2"
      >
        <div class="flex flex-col">
          <div
            v-for="(item, index) in cartItems"
            :key="item.id"
            class="flex gap-3 px-1 py-5"
            :class="{
              'border-b': index < cartItems.length - 1,
            }"
          >
            <RouterLink
              :to="`/products/${item.product.slug}${item.productVariant ? `?${item.productVariant.productVariantOptions.map((option) => `${option.option.attribute.name}=${option.option.name}`).join('&')}` : ''}`"
              class="relative h-30 w-26 shrink-0 overflow-hidden border bg-gray-100"
              @click="isDrawerOpen = false"
            >
              <img
                :src="item.product.images[0]"
                :alt="item.product.name"
                class="h-full w-full object-cover"
              />
            </RouterLink>

            <div class="flex w-full gap-4">
              <div class="flex w-2/3 flex-col gap-1">
                <RouterLink
                  :to="`/products/${item.product.slug}${item.productVariant ? `?${item.productVariant.productVariantOptions.map((option) => `${option.option.attribute.name}=${option.option.name}`).join('&')}` : ''}`"
                  class="line-clamp-2 font-medium"
                  @click="isDrawerOpen = false"
                >
                  {{ item.product.name }}
                </RouterLink>

                <p
                  v-if="item.productVariant"
                  class="flex flex-col text-xs text-gray-500"
                >
                  <span
                    v-if="item.productVariant.productVariantOptions.length > 0"
                  >
                    {{
                      item.productVariant.productVariantOptions[0]?.option
                        .attribute.name
                    }}:
                    {{
                      item.productVariant.productVariantOptions[0]?.option.name
                    }}
                  </span>
                  <span
                    v-if="item.productVariant.productVariantOptions.length > 1"
                    class="w-fit text-gray-500"
                  >
                    +{{ item.productVariant.productVariantOptions.length - 1 }}
                    more
                  </span>
                </p>

                <div class="flex w-fit items-center rounded border">
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-6 rounded-none rounded-l p-0"
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
                      getDisplayQuantity(
                        item.productId,
                        item.productVariantId,
                      ) <= 1 ||
                      isItemDisabled(item.productId, item.productVariantId) ||
                      isItemUpdating(item.productId, item.productVariantId) ||
                      isItemRemoving(item.productId, item.productVariantId)
                    "
                  >
                    <Minus class="size-3" />
                  </Button>
                  <span
                    class="relative flex w-8 items-center justify-center text-center text-sm"
                  >
                    {{
                      getDisplayQuantity(item.productId, item.productVariantId)
                    }}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-6 rounded-none rounded-r p-0"
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
                      getDisplayQuantity(
                        item.productId,
                        item.productVariantId,
                      ) >=
                        getMaxQuantity(item.productId, item.productVariantId) ||
                      isItemDisabled(item.productId, item.productVariantId) ||
                      isItemUpdating(item.productId, item.productVariantId) ||
                      isItemRemoving(item.productId, item.productVariantId)
                    "
                  >
                    <Plus class="size-3" />
                  </Button>
                </div>
              </div>

              <div class="flex w-1/3 flex-col items-end gap-1">
                <p class="text-sm font-medium">
                  {{ formatPrice(getItemPrice(item)) }}
                </p>

                <Button
                  variant="ghost"
                  size="icon"
                  @click="
                    openRemoveItemDialog(
                      item.productId,
                      item.productVariantId,
                      item.product?.name,
                    )
                  "
                  :disabled="
                    editingItemId !== null ||
                    updatingItemId !== null ||
                    removingItemId !== null
                  "
                  class="cursor-pointer p-1 text-red-500 hover:text-red-600"
                >
                  <Trash2Icon class="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Cart Footer -->
      <SheetFooter
        v-if="!isCartEmpty"
        class="flex flex-col gap-2 border-t p-4"
      >
        <div class="flex justify-between text-base font-medium">
          <span>Total</span>
          <span>{{ formatPrice(cartSubtotal) }}</span>
        </div>

        <div class="grid w-full grid-cols-2 gap-2">
          <LoadingButton
            :loading="isClearingCart"
            variant="outline"
            class="w-full"
            @click="openClearCartDialog"
            :disabled="isGlobalActionDisabled"
          >
            <Trash2Icon class="mr-2 size-4" />
            Clear cart
          </LoadingButton>

          <RouterLink
            to="/checkout"
            @click="isDrawerOpen = false"
            class="w-full"
          >
            <Button class="w-full">Checkout</Button>
          </RouterLink>
        </div>

        <div class="flex justify-center">
          <RouterLink
            to="/cart"
            class="border-b border-black text-sm font-medium"
            @click="isDrawerOpen = false"
          >
            View cart
          </RouterLink>
        </div>
      </SheetFooter>
    </SheetContent>
  </Sheet>

  <!-- Remove Item Dialog -->
  <Dialog v-model:open="showRemoveItemDialog">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Remove item from cart?</DialogTitle>
        <DialogDescription>
          Are you sure you want to remove "{{ itemToRemove?.productName }}" from
          your cart? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          variant="outline"
          @click="cancelRemoveItem"
          :disabled="isRemovingCartItem"
        >
          Cancel
        </Button>
        <LoadingButton
          :loading="isRemovingCartItem"
          :disabled="isRemovingCartItem"
          variant="destructive"
          @click="confirmRemoveItem"
        >
          Remove
        </LoadingButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Clear Cart Dialog -->
  <Dialog v-model:open="showClearCartDialog">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Clear your cart?</DialogTitle>
        <DialogDescription>
          Are you sure you want to remove all items from your cart? This action
          cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          variant="outline"
          @click="cancelClearCart"
          :disabled="isClearingCart"
        >
          Cancel
        </Button>
        <LoadingButton
          :loading="isClearingCart"
          :disabled="isClearingCart"
          variant="destructive"
          @click="confirmClearCart"
        >
          Clear cart
        </LoadingButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
