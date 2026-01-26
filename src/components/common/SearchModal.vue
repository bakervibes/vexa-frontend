<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useInstantSearch, usePopularSearches } from '@/composables/useSearch'
import {
  ArrowRight,
  Folder,
  Loader2,
  Search,
  ShoppingBag,
  TrendingUp,
} from 'lucide-vue-next'
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const router = useRouter()
const inputRef = ref<HTMLInputElement | null>(null)

const { query, results, isLoading, hasResults } = useInstantSearch()
const { searches: popularSearches } = usePopularSearches()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

// Focus input when modal opens
watch(isOpen, (open) => {
  if (open) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  } else {
    query.value = ''
  }
})

function formatPrice(price: number | null, basePrice: number | null): string {
  const displayPrice = price ?? basePrice ?? 0
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(displayPrice)
}

function handleProductClick(slug: string) {
  isOpen.value = false
  router.push(`/products/${slug}`)
}

function handleCategoryClick(slug: string) {
  isOpen.value = false
  router.push(`/shop?categories=${slug}`)
}

function handleSearch() {
  if (query.value.trim().length >= 2) {
    isOpen.value = false
    router.push(`/search?q=${encodeURIComponent(query.value.trim())}`)
  }
}

function handlePopularSearch(search: string) {
  query.value = search
  handleSearch()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleSearch()
  }
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-2xl gap-0 overflow-hidden p-0">
      <DialogHeader class="sr-only p-4 pb-0">
        <DialogTitle>Rechercher</DialogTitle>
      </DialogHeader>

      <!-- Search Input -->
      <div class="relative border-b">
        <Search
          class="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2"
        />
        <Input
          ref="inputRef"
          v-model="query"
          type="search"
          placeholder="Rechercher des produits, catégories..."
          class="h-14 rounded-none border-0 pr-12 pl-12 text-lg focus-visible:ring-0"
          @keydown="handleKeydown"
        />
      </div>

      <!-- Results Container -->
      <div class="max-h-[60vh] overflow-y-auto">
        <!-- Loading State -->
        <div
          v-if="isLoading && query.length >= 2"
          class="flex items-center justify-center py-12"
        >
          <Loader2 class="text-muted-foreground h-6 w-6 animate-spin" />
        </div>

        <!-- No Results -->
        <div
          v-else-if="query.length >= 2 && !hasResults && !isLoading"
          class="py-12 text-center"
        >
          <Search class="text-muted-foreground/50 mx-auto h-12 w-12" />
          <p class="text-muted-foreground mt-4 text-sm">
            Aucun résultat pour "{{ query }}"
          </p>
          <Button
            variant="outline"
            size="sm"
            class="mt-4"
            @click="handleSearch"
          >
            Voir tous les résultats
            <ArrowRight class="ml-2 h-4 w-4" />
          </Button>
        </div>

        <!-- Search Results -->
        <div
          v-else-if="hasResults"
          class="divide-y"
        >
          <!-- Categories -->
          <div
            v-if="results.categories.length > 0"
            class="p-4"
          >
            <h3
              class="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-semibold uppercase"
            >
              <Folder class="h-4 w-4" />
              Catégories
            </h3>
            <div class="flex flex-wrap gap-2">
              <Badge
                v-for="category in results.categories"
                :key="category.id"
                variant="secondary"
                class="hover:bg-secondary/80 cursor-pointer px-3 py-1.5"
                @click="handleCategoryClick(category.slug)"
              >
                {{ category.name }}
              </Badge>
            </div>
          </div>

          <!-- Products -->
          <div
            v-if="results.products.length > 0"
            class="p-4"
          >
            <h3
              class="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-semibold uppercase"
            >
              <ShoppingBag class="h-4 w-4" />
              Produits
            </h3>
            <ul class="space-y-2">
              <li
                v-for="product in results.products"
                :key="product.id"
                class="hover:bg-muted flex cursor-pointer items-center gap-4 rounded-lg p-2 transition-colors"
                @click="handleProductClick(product.slug)"
              >
                <div
                  class="bg-muted h-12 w-12 shrink-0 overflow-hidden rounded-md"
                >
                  <img
                    v-if="product.images[0]"
                    :src="product.images[0]"
                    :alt="product.name"
                    class="h-full w-full object-cover"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-medium">{{ product.name }}</p>
                  <p class="text-muted-foreground text-sm">
                    {{ product.category?.name || 'Sans catégorie' }}
                  </p>
                </div>
                <p class="shrink-0 font-semibold">
                  {{ formatPrice(product.price, product.basePrice) }}
                </p>
              </li>
            </ul>

            <!-- View All Button -->
            <Button
              variant="ghost"
              class="mt-4 w-full"
              @click="handleSearch"
            >
              Voir tous les résultats
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- Popular Searches (when no query) -->
        <div
          v-else-if="query.length < 2"
          class="p-4"
        >
          <h3
            class="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-semibold uppercase"
          >
            <TrendingUp class="h-4 w-4" />
            Recherches populaires
          </h3>
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="search in popularSearches"
              :key="search"
              variant="outline"
              class="hover:bg-muted cursor-pointer px-3 py-1.5"
              @click="handlePopularSearch(search)"
            >
              {{ search }}
            </Badge>
          </div>

          <p class="text-muted-foreground mt-6 text-center text-sm">
            Tapez au moins 2 caractères pour rechercher
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="bg-muted/50 text-muted-foreground flex items-center justify-between border-t px-4 py-3 text-xs"
      >
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1">
            <kbd
              class="bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]"
            >
              ↵
            </kbd>
            Rechercher
          </span>
          <span class="flex items-center gap-1">
            <kbd
              class="bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]"
            >
              Esc
            </kbd>
            Fermer
          </span>
        </div>
        <span>
          <kbd
            class="bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]"
          >
            ⌘
          </kbd>
          <kbd
            class="bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]"
          >
            K
          </kbd>
          Ouvrir
        </span>
      </div>
    </DialogContent>
  </Dialog>
</template>
