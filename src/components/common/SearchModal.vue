<script setup lang="ts">
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
    <DialogContent
      class="text-text bg-noir border-border-noir max-w-2xl gap-0 overflow-hidden p-0"
    >
      <DialogHeader class="sr-only p-4 pb-0">
        <DialogTitle>Rechercher</DialogTitle>
      </DialogHeader>

      <div class="border-border-noir relative border-b">
        <Search
          class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#555]"
        />
        <Input
          ref="inputRef"
          v-model="query"
          type="search"
          placeholder="Rechercher des produits, catégories..."
          class="text-text h-14 rounded-none border-0 bg-transparent pr-12 pl-12 text-lg placeholder:text-[#555] focus-visible:ring-0"
          @keydown="handleKeydown"
        />
      </div>

      <div class="max-h-[60vh] overflow-y-auto">
        <div
          v-if="isLoading && query.length >= 2"
          class="flex items-center justify-center py-12"
        >
          <Loader2 class="text-gold h-6 w-6 animate-spin" />
        </div>

        <div
          v-else-if="query.length >= 2 && !hasResults && !isLoading"
          class="py-12 text-center"
        >
          <Search class="mx-auto h-12 w-12 text-[#555]/50" />
          <p class="mt-4 text-sm text-[#555]">
            Aucun résultat pour "{{ query }}"
          </p>
          <Button
            variant="outline"
            size="sm"
            class="border-gold/40 text-gold hover:bg-gold hover:text-noir mt-4"
            @click="handleSearch"
          >
            Voir tous les résultats
            <ArrowRight class="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div
          v-else-if="hasResults"
          class="divide-border-noir divide-y"
        >
          <div
            v-if="results.categories.length > 0"
            class="p-4"
          >
            <h3
              class="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-[#555] uppercase"
            >
              <Folder class="h-4 w-4" />
              Catégories
            </h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="category in results.categories"
                :key="category.id"
                class="hover:border-gold hover:text-gold border-border-noir border px-3 py-1.5 text-xs tracking-widest text-[#555] uppercase transition-colors"
                @click="handleCategoryClick(category.slug)"
              >
                {{ category.name }}
              </button>
            </div>
          </div>

          <div
            v-if="results.products.length > 0"
            class="p-4"
          >
            <h3
              class="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-[#555] uppercase"
            >
              <ShoppingBag class="h-4 w-4" />
              Produits
            </h3>
            <ul class="space-y-2">
              <li
                v-for="product in results.products"
                :key="product.id"
                class="hover:bg-surface flex cursor-pointer items-center gap-4 p-2 transition-colors"
                @click="handleProductClick(product.slug)"
              >
                <div class="bg-surface h-12 w-12 shrink-0 overflow-hidden">
                  <img
                    v-if="product.images[0]"
                    :src="product.images[0]"
                    :alt="product.name"
                    class="h-full w-full object-cover"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-text truncate font-medium">
                    {{ product.name }}
                  </p>
                  <p class="text-sm text-[#555]">
                    {{ product.category?.name || 'Sans catégorie' }}
                  </p>
                </div>
                <p class="text-gold shrink-0 font-semibold">
                  {{ formatPrice(product.price, product.basePrice) }}
                </p>
              </li>
            </ul>

            <Button
              variant="ghost"
              class="border-gold/40 text-gold hover:bg-gold hover:text-noir mt-4 w-full border"
              @click="handleSearch"
            >
              Voir tous les résultats
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          v-else-if="query.length < 2"
          class="p-4"
        >
          <h3
            class="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-[#555] uppercase"
          >
            <TrendingUp class="h-4 w-4" />
            Recherches populaires
          </h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="search in popularSearches"
              :key="search"
              class="hover:border-gold hover:text-gold border-border-noir border px-3 py-1.5 text-xs tracking-widest text-[#555] uppercase transition-colors"
              @click="handlePopularSearch(search)"
            >
              {{ search }}
            </button>
          </div>

          <p class="mt-6 text-center text-sm text-[#555]">
            Tapez au moins 2 caractères pour rechercher
          </p>
        </div>
      </div>

      <div
        class="border-border-noir bg-surface flex items-center justify-between border-t px-4 py-3 text-xs text-[#555]"
      >
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1">
            <kbd
              class="bg-noir border-border-noir border px-1.5 py-0.5 font-mono text-[10px]"
            >
              ↵
            </kbd>
            Rechercher
          </span>
          <span class="flex items-center gap-1">
            <kbd
              class="bg-noir border-border-noir border px-1.5 py-0.5 font-mono text-[10px]"
            >
              Esc
            </kbd>
            Fermer
          </span>
        </div>
        <span>
          <kbd
            class="bg-noir border-border-noir border px-1.5 py-0.5 font-mono text-[10px]"
          >
            ⌘
          </kbd>
          <kbd
            class="bg-noir border-border-noir border px-1.5 py-0.5 font-mono text-[10px]"
          >
            K
          </kbd>
          Ouvrir
        </span>
      </div>
    </DialogContent>
  </Dialog>
</template>
