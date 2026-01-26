<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ProductWithDetails } from '@/types'
import { formatPrice } from '@/utils'
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-vue-next'

interface Props {
  products: ProductWithDetails[]
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'view', product: ProductWithDetails): void
  (e: 'edit', product: ProductWithDetails): void
  (e: 'delete', product: ProductWithDetails): void
}>()

function getStockBadge(stock: number): {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
} {
  if (stock === 0) return { label: 'Rupture', variant: 'destructive' }
  if (stock <= 10) return { label: 'Stock bas', variant: 'outline' }
  return { label: 'En stock', variant: 'default' }
}

function getMinimalPrice(product: ProductWithDetails): string {
  if (product.productVariants && product.productVariants.length > 0) {
    const prices = product.productVariants
      .map((variant) => variant.price)
      .filter((price): price is number => price !== null && price !== undefined)

    if (prices.length > 0) {
      return formatPrice(Math.min(...prices))
    }
  }

  return '-'
}
</script>

<template>
  <div class="rounded-md border">
    <table class="w-full">
      <thead>
        <tr class="bg-muted/50 border-b">
          <th
            class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
          >
            Produit
          </th>
          <th
            class="text-muted-foreground h-12 px-4 text-center align-middle text-sm font-medium"
          >
            Catégorie
          </th>
          <th
            class="text-muted-foreground h-12 px-4 text-center align-middle text-sm font-medium"
          >
            Prix
          </th>
          <th
            class="text-muted-foreground h-12 px-4 text-center align-middle text-sm font-medium"
          >
            Stock
          </th>
          <th
            class="text-muted-foreground h-12 px-4 text-center align-middle text-sm font-medium"
          >
            Variantes
          </th>
          <th
            class="text-muted-foreground h-12 w-20 px-4 text-right align-middle text-sm font-medium"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Loading state -->
        <tr v-if="loading">
          <td
            colspan="6"
            class="h-24 text-center"
          >
            <div class="flex items-center justify-center">
              <svg
                class="text-muted-foreground h-6 w-6 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </td>
        </tr>

        <!-- Empty state -->
        <tr v-else-if="products.length === 0">
          <td
            colspan="6"
            class="text-muted-foreground h-24 text-center text-sm"
          >
            Aucun produit trouvé
          </td>
        </tr>

        <!-- Products -->
        <tr
          v-else
          v-for="product in products"
          :key="product.id"
          class="hover:bg-muted/50 border-b transition-colors"
        >
          <td class="p-4">
            <div class="flex items-center gap-3">
              <Avatar class="h-10 w-10 rounded">
                <AvatarImage
                  :src="product.images?.[0] ?? ''"
                  :alt="product.name"
                  class="object-cover"
                />
                <AvatarFallback class="rounded">
                  {{ product.name.slice(0, 2).toUpperCase() }}
                </AvatarFallback>
              </Avatar>
              <div>
                <p class="font-medium">{{ product.name }}</p>
                <p class="text-muted-foreground text-sm">{{ product.slug }}</p>
              </div>
            </div>
          </td>
          <td class="p-4 text-center">
            <Badge variant="secondary">
              {{ product.category?.name || '-' }}
            </Badge>
          </td>
          <td class="p-4 text-center">
            <div>
              <p
                v-if="product.price"
                class="font-medium"
              >
                {{ formatPrice(product.price) }}
              </p>
              <p
                v-if="product.basePrice && product.basePrice !== product.price"
                class="text-sm"
                :class="{
                  'text-muted-foreground line-through':
                    product.price && product.basePrice !== product.price,
                }"
              >
                {{ formatPrice(product.basePrice) }}
              </p>
              <p
                v-else-if="!product.price && !product.basePrice"
                class="text-muted-foreground"
              >
                À partir de {{ getMinimalPrice(product) }}
              </p>
            </div>
          </td>
          <td class="p-4 text-center">
            <Badge :variant="getStockBadge(product.stock).variant">
              {{ product.stock }} {{ getStockBadge(product.stock).label }}
            </Badge>
          </td>
          <td class="p-4 text-center">
            <span class="text-sm">
              {{ product.productVariants?.length || 0 }} variante(s)
            </span>
          </td>
          <td class="p-4 text-right">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <MoreHorizontal class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="emit('view', product)">
                  <Eye class="mr-2 h-4 w-4" />
                  Voir
                </DropdownMenuItem>
                <DropdownMenuItem @click="emit('edit', product)">
                  <Edit class="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  class="text-destructive focus:text-destructive"
                  @click="emit('delete', product)"
                >
                  <Trash2 class="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
