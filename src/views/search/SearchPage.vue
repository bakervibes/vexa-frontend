<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ProductCard from '@/components/views/common/ProductCard.vue'
import { useSearchResults } from '@/composables/useSearch'
import { useSeo } from '@/composables/useSeo'
import type { SearchFilters } from '@/services/search.service'
import type { ProductWithDetails } from '@/types'
import {
  ArrowLeft,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Get query from URL
const initialQuery = computed(() => (route.query.q as string) || '')

// SEO
useSeo({
  title: computed(() =>
    initialQuery.value ? `Recherche: ${initialQuery.value}` : 'Recherche',
  ),
  description: computed(() =>
    initialQuery.value
      ? `Résultats de recherche pour "${initialQuery.value}" sur Vexa.`
      : 'Recherchez parmi notre large sélection de produits.',
  ),
  noIndex: true, // Search pages should not be indexed
})

// Local state
const searchInput = ref(initialQuery.value)
const sortBy = ref<string>('relevance')
const showFilters = ref(false)

// Search filters
const filters = ref<SearchFilters>({
  q: initialQuery.value,
  limit: 20,
  offset: 0,
})

// Update filters when URL changes
watch(
  () => route.query.q,
  (newQuery) => {
    const query = (newQuery as string) || ''
    searchInput.value = query
    filters.value = { ...filters.value, q: query, offset: 0 }
  },
  { immediate: true },
)

const { results, isLoading } = useSearchResults(filters)

const hasResults = computed(() => results.value.data.length > 0)
const totalResults = computed(() => results.value.meta.total)

function handleSearch() {
  if (searchInput.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchInput.value.trim() },
    })
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleSearch()
  }
}

function clearSearch() {
  searchInput.value = ''
  router.push('/shop')
}
</script>

<template>
  <div class="bg-background min-h-screen">
    <!-- Header -->
    <div class="bg-card border-b">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div class="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            @click="router.back()"
          >
            <ArrowLeft class="h-5 w-5" />
          </Button>
          <div class="flex-1">
            <h1 class="text-2xl font-bold">Recherche</h1>
            <p
              v-if="filters.q"
              class="text-muted-foreground text-sm"
            >
              {{ totalResults }} résultat{{
                totalResults !== 1 ? 's' : ''
              }}
              pour "{{ filters.q }}"
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <!-- Search Bar -->
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div class="relative flex-1">
          <Search
            class="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2"
          />
          <Input
            v-model="searchInput"
            type="search"
            placeholder="Rechercher des produits..."
            class="h-11 pr-10 pl-10"
            @keydown="handleKeydown"
          />
          <Button
            v-if="searchInput"
            variant="ghost"
            size="icon"
            class="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
            @click="clearSearch"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>
        <div class="flex gap-2">
          <Button
            @click="handleSearch"
            class="h-11"
          >
            Rechercher
          </Button>
          <Button
            variant="outline"
            size="icon"
            class="h-11 sm:hidden"
            @click="showFilters = !showFilters"
          >
            <SlidersHorizontal class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- Filters & Sort (Desktop) -->
      <div class="mb-6 hidden items-center justify-between sm:flex">
        <div class="flex items-center gap-2">
          <Badge
            v-if="filters.q"
            variant="secondary"
            class="gap-1"
          >
            {{ filters.q }}
            <X
              class="h-3 w-3 cursor-pointer"
              @click="clearSearch"
            />
          </Badge>
        </div>
        <Select v-model="sortBy">
          <SelectTrigger class="w-35">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Pertinence</SelectItem>
            <SelectItem value="price-asc">Prix croissant</SelectItem>
            <SelectItem value="price-desc">Prix décroissant</SelectItem>
            <SelectItem value="name">Nom (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="flex items-center justify-center py-20"
      >
        <Loader2 class="text-muted-foreground h-8 w-8 animate-spin" />
      </div>

      <!-- No Query -->
      <div
        v-else-if="!filters.q || filters.q.length < 2"
        class="py-20 text-center"
      >
        <Search class="text-muted-foreground/50 mx-auto h-16 w-16" />
        <h2 class="mt-4 text-xl font-semibold">Commencez votre recherche</h2>
        <p class="text-muted-foreground mt-2">
          Entrez au moins 2 caractères pour rechercher des produits
        </p>
        <Button
          variant="outline"
          class="mt-4"
          @click="router.push('/shop')"
        >
          Parcourir la boutique
        </Button>
      </div>

      <!-- No Results -->
      <div
        v-else-if="!hasResults"
        class="py-20 text-center"
      >
        <Search class="text-muted-foreground/50 mx-auto h-16 w-16" />
        <h2 class="mt-4 text-xl font-semibold">Aucun résultat</h2>
        <p class="text-muted-foreground mt-2">
          Aucun produit ne correspond à "{{ filters.q }}"
        </p>
        <div class="mt-6 space-y-2">
          <p class="text-muted-foreground text-sm">Suggestions :</p>
          <ul class="text-muted-foreground text-sm">
            <li>Vérifiez l'orthographe</li>
            <li>Utilisez des termes plus généraux</li>
            <li>Essayez des synonymes</li>
          </ul>
        </div>
        <Button
          variant="outline"
          class="mt-6"
          @click="router.push('/shop')"
        >
          Parcourir la boutique
        </Button>
      </div>

      <!-- Results Grid -->
      <div v-else>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ProductCard
            v-for="product in results.data"
            :key="product.id"
            :product="product as unknown as ProductWithDetails"
          />
        </div>

        <!-- Load More -->
        <div
          v-if="results.data.length < totalResults"
          class="mt-8 text-center"
        >
          <Button
            variant="outline"
            @click="filters.offset = (filters.offset || 0) + 20"
          >
            Charger plus de résultats
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
