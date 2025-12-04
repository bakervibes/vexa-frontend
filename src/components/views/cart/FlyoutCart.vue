<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useCarts, useCartsMutation } from '@/composables/useCarts'
import { formatPrice } from '@/utils/lib'
import { Minus, Plus, ShoppingCartIcon, Trash2Icon } from 'lucide-vue-next'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const { subtotal, isEmpty, isLoadingCart, itemCount, items } = useCarts()

const {
  isRemovingCartItem,
  isClearingCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = useCartsMutation()

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

const showRemoveItemDialog = ref(false)
const showClearCartDialog = ref(false)

const itemToRemove = ref<{
  productId: string
  variantId?: string | null
  slug?: string
  productName: string
} | null>(null)

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

const isGlobalActionDisabled = () => {
  return (
    editingItemId.value !== null ||
    updatingItemId.value !== null ||
    removingItemId.value !== null ||
    isClearingCart.value
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
  slug?: string,
  productName?: string,
) => {
  itemToRemove.value = {
    productId,
    variantId,
    slug,
    productName: productName ?? 'this item',
  }
  showRemoveItemDialog.value = true
}

const confirmRemoveItem = async () => {
  if (!itemToRemove.value) return

  const { productId, variantId, slug } = itemToRemove.value
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
    await clearCart(items.value.map((item) => item.product.slug))
  } finally {
    showClearCartDialog.value = false
  }
}

const cancelClearCart = () => {
  showClearCartDialog.value = false
}
</script>

<template>
  <Sheet>
    <SheetTrigger as-child>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="relative hover:bg-transparent"
      >
        <ShoppingCartIcon class="size-5" />
        <span
          v-if="itemCount > 0"
          class="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-bold"
        >
          {{ itemCount }}
        </span>
      </Button>
    </SheetTrigger>
    <SheetContent class="flex h-full w-full flex-col px-2 sm:max-w-100">
      <SheetHeader class="px-2 pt-4">
        <SheetTitle>My Cart ({{ itemCount }})</SheetTitle>
      </SheetHeader>

      <div
        v-if="isLoadingCart"
        class="flex flex-1 flex-col gap-4 py-4"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="flex items-center gap-4"
        >
          <Skeleton class="size-20 rounded-md" />
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

      <div
        v-else-if="isEmpty"
        class="flex flex-1 flex-col items-center justify-center gap-4 py-4 text-center"
      >
        <div class="bg-muted rounded-full p-6">
          <ShoppingCartIcon class="text-muted-foreground size-10" />
        </div>
        <div class="space-y-1">
          <h3 class="font-semibold">Your cart is empty</h3>
          <p class="text-muted-foreground text-sm">
            Add products to start shopping
          </p>
        </div>
        <SheetTrigger as-child>
          <Button
            variant="outline"
            class="mt-4"
          >
            Continue shopping
          </Button>
        </SheetTrigger>
      </div>

      <section
        v-else
        class="no-scrollbar h-full flex-1 overflow-y-auto px-2"
      >
        <div class="flex flex-col">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex gap-3 border-b py-6"
          >
            <RouterLink
              :to="`/products/${item.product.slug}${item.variant && `?${item.variant.productVariantOptions.map((option) => `${option.option.attribute.name}=${option.option.name}`).join('&')}`}`"
              class="bg-muted relative h-30 w-26 shrink-0 overflow-hidden border"
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
                  :to="`/products/${item.product.slug}${item.variant && `?${item.variant.productVariantOptions.map((option) => `${option.option.attribute.name}=${option.option.name}`).join('&')}`}`"
                  class="line-clamp-2 font-medium"
                >
                  {{ item.product.name }}
                </RouterLink>

                <p
                  v-if="item.variant"
                  class="text-muted-foreground flex flex-col text-xs"
                >
                  <span v-if="item.variant.productVariantOptions.length > 0">
                    {{
                      item.variant.productVariantOptions[0]?.option.attribute
                        .name
                    }}:
                    {{ item.variant.productVariantOptions[0]?.option.name }}
                  </span>
                  <span
                    v-if="item.variant.productVariantOptions.length > 1"
                    class="w-fit text-gray-500"
                  >
                    +{{ item.variant.productVariantOptions.length - 1 }} more
                  </span>
                </p>

                <div class="flex w-fit items-center rounded border">
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-6 w-6 rounded-none rounded-l"
                    @click="
                      handleQuantityChange(
                        item.productId,
                        getDisplayQuantity(item.productId, item.variantId) - 1,
                        item.variantId ?? undefined,
                        item.product?.slug,
                      )
                    "
                    :disabled="
                      getDisplayQuantity(item.productId, item.variantId) <= 1 ||
                      isItemDisabled(item.productId, item.variantId) ||
                      isItemUpdating(item.productId, item.variantId) ||
                      isItemRemoving(item.productId, item.variantId)
                    "
                  >
                    <Minus class="size-3" />
                  </Button>
                  <span
                    class="relative flex w-8 items-center justify-center text-center text-sm"
                  >
                    <span>
                      {{ getDisplayQuantity(item.productId, item.variantId) }}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-6 w-6 rounded-none rounded-r"
                    @click="
                      handleQuantityChange(
                        item.productId,
                        getDisplayQuantity(item.productId, item.variantId) + 1,
                        item.variantId ?? undefined,
                        item.product?.slug,
                      )
                    "
                    :disabled="
                      getDisplayQuantity(item.productId, item.variantId) >=
                        getMaxQuantity(item.productId, item.variantId) ||
                      isItemDisabled(item.productId, item.variantId) ||
                      isItemUpdating(item.productId, item.variantId) ||
                      isItemRemoving(item.productId, item.variantId)
                    "
                  >
                    <Plus class="size-3" />
                  </Button>
                </div>
              </div>

              <div class="flex w-1/3 flex-col items-end gap-1">
                <p class="text-sm font-medium">
                  {{
                    formatPrice(
                      item.variant?.price ??
                        item.variant?.basePrice ??
                        item.product.price ??
                        item.product.basePrice ??
                        0,
                    )
                  }}
                </p>

                <Button
                  variant="ghost"
                  size="icon"
                  @click="
                    openRemoveItemDialog(
                      item.productId,
                      item.variantId ?? undefined,
                      item.product?.slug,
                      item.product?.name,
                    )
                  "
                  :disabled="
                    isItemDisabled(item.productId, item.variantId) ||
                    isItemRemoving(item.productId, item.variantId)
                  "
                  class="text-destructive hover:text-destructive cursor-pointer p-1"
                >
                  <Trash2Icon class="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SheetFooter
        v-if="!isEmpty"
        class="flex-col space-y-2 px-2 pt-2 pb-8"
      >
        <div class="flex justify-between text-base font-medium">
          <span>Total</span>
          <span>{{ formatPrice(subtotal) }}</span>
        </div>

        <div class="grid w-full grid-cols-2 gap-2">
          <LoadingButton
            :loading="isClearingCart"
            variant="outline"
            class="w-full"
            @click="openClearCartDialog"
            size="lg"
            :disabled="isGlobalActionDisabled()"
          >
            <Trash2Icon class="size-4" />
            Clear cart
          </LoadingButton>

          <SheetTrigger as-child>
            <RouterLink to="/checkout">
              <Button
                class="w-full"
                size="lg"
              >
                Checkout
              </Button>
            </RouterLink>
          </SheetTrigger>
        </div>

        <div class="flex justify-center">
          <SheetTrigger as-child>
            <RouterLink
              to="/cart"
              class="border-b border-black text-sm font-medium"
            >
              View cart
            </RouterLink>
          </SheetTrigger>
        </div>
      </SheetFooter>
    </SheetContent>
  </Sheet>

  <AlertDialog
    :open="showRemoveItemDialog"
    @update:open="(val) => !val && cancelRemoveItem()"
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Remove item from cart?</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to remove "{{ itemToRemove?.productName }}" from
          your cart? This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          @click="cancelRemoveItem"
          :disabled="isRemovingCartItem"
        >
          Cancel
        </AlertDialogCancel>
        <LoadingButton
          :loading="isRemovingCartItem"
          :disabled="isRemovingCartItem"
          variant="destructive"
          @click="confirmRemoveItem"
        >
          Remove
        </LoadingButton>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <AlertDialog
    :open="showClearCartDialog"
    @update:open="(val) => !val && cancelClearCart()"
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to remove all items from your cart? This action
          cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          @click="cancelClearCart"
          :disabled="isClearingCart"
        >
          Cancel
        </AlertDialogCancel>
        <LoadingButton
          :loading="isClearingCart"
          :disabled="isClearingCart"
          variant="destructive"
          @click="confirmClearCart"
        >
          Clear cart
        </LoadingButton>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
