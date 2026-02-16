<script setup lang="ts">
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

const initialQuery = computed(() => (route.query.q as string) || '')

useSeo({
  title: computed(() =>
    initialQuery.value ? `Recherche: ${initialQuery.value}` : 'Recherche',
  ),
  description: computed(() =>
    initialQuery.value
      ? `Résultats de recherche pour "${initialQuery.value}" sur Vexa.`
      : 'Recherchez parmi notre large sélection de produits.',
  ),
  noIndex: true,
})

const searchInput = ref(initialQuery.value)
const sortBy = ref<string>('relevance')
const showFilters = ref(false)

const filters = ref<SearchFilters>({
  q: initialQuery.value,
  limit: 20,
  offset: 0,
})

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
  <div class="bg-noir min-h-screen">
    <div class="border-border-noir bg-surface border-b">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div class="flex items-center gap-6">
          <button
            class="hover:border-gold hover:text-gold border-border-noir flex h-10 w-10 items-center justify-center border text-[#555] transition-colors"
            @click="router.back()"
          >
            <ArrowLeft class="h-5 w-5" />
          </button>
          <div class="flex-1">
            <p class="text-gold text-xs tracking-[0.3em] uppercase">
              Recherche
            </p>
            <h1 class="font-display text-text text-5xl font-light">
              {{ filters.q || 'Rechercher' }}
            </h1>
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div class="relative flex-1">
          <Search
            class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#555]"
          />
          <input
            v-model="searchInput"
            type="search"
            placeholder="Rechercher des produits..."
            class="focus:border-gold text-text border-border-noir bg-surface h-12 w-full border px-4 py-3 pl-12 placeholder:text-[#555] focus:outline-none"
            @keydown="handleKeydown"
          />
          <button
            v-if="searchInput"
            class="hover:text-gold absolute top-1/2 right-3 -translate-y-1/2 text-[#555] transition-colors"
            @click="clearSearch"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="flex gap-3">
          <button
            class="border-gold/40 text-gold hover:bg-gold hover:text-noir border px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
            @click="handleSearch"
          >
            Rechercher
          </button>
          <button
            class="hover:border-gold hover:text-gold border-border-noir flex h-12 w-12 items-center justify-center border text-[#555] transition-colors sm:hidden"
            @click="showFilters = !showFilters"
          >
            <SlidersHorizontal class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div class="mb-8 hidden items-center justify-between sm:flex">
        <div class="flex items-center gap-2">
          <span
            v-if="filters.q"
            class="text-gold border-border-noir bg-surface inline-flex items-center gap-2 border px-4 py-2 text-xs tracking-[0.2em] uppercase"
          >
            {{ filters.q }}
            <X
              class="h-3 w-3 cursor-pointer"
              @click="clearSearch"
            />
          </span>

          <p
            v-if="filters.q"
            class="text-sm text-[#555]"
          >
            {{ totalResults }} résultat{{ totalResults !== 1 ? 's' : '' }} pour
            "{{ filters.q }}"
          </p>
        </div>
        <select
          v-model="sortBy"
          class="focus:border-gold text-text border-border-noir bg-surface border px-4 py-2 text-xs tracking-[0.2em] uppercase focus:outline-none"
        >
          <option value="relevance">Pertinence</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="name">Nom (A-Z)</option>
        </select>
      </div>

      <div
        v-if="isLoading"
        class="flex items-center justify-center py-20"
      >
        <Loader2 class="text-gold h-8 w-8 animate-spin" />
      </div>

      <div
        v-else-if="!filters.q || filters.q.length < 2"
        class="py-20 text-center"
      >
        <Search class="text-border-noir mx-auto h-16 w-16" />
        <h2 class="font-display text-text mt-6 text-3xl font-light">
          Commencez votre recherche
        </h2>
        <p class="mt-4 text-[#555]">
          Entrez au moins 2 caractères pour rechercher des produits
        </p>
        <button
          class="border-gold/40 text-gold hover:bg-gold hover:text-noir mt-8 border px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
          @click="router.push('/shop')"
        >
          Parcourir la boutique
        </button>
      </div>

      <div
        v-else-if="!hasResults"
        class="py-20 text-center"
      >
        <Search class="text-border-noir mx-auto h-16 w-16" />
        <h2 class="font-display text-text mt-6 text-3xl font-light">
          Aucun résultat
        </h2>
        <p class="mt-4 text-[#555]">
          Aucun produit ne correspond à "{{ filters.q }}"
        </p>
        <div class="mt-8 space-y-3">
          <p class="text-gold text-xs tracking-[0.3em] uppercase">
            Suggestions
          </p>
          <ul class="space-y-1 text-sm text-[#555]">
            <li>Vérifiez l'orthographe</li>
            <li>Utilisez des termes plus généraux</li>
            <li>Essayez des synonymes</li>
          </ul>
        </div>
        <button
          class="border-gold/40 text-gold hover:bg-gold hover:text-noir mt-8 border px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
          @click="router.push('/shop')"
        >
          Parcourir la boutique
        </button>
      </div>

      <div v-else>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ProductCard
            v-for="product in results.data"
            :key="product.id"
            :product="product as unknown as ProductWithDetails"
          />
        </div>

        <div
          v-if="results.data.length < totalResults"
          class="mt-12 text-center"
        >
          <button
            class="border-gold/40 text-gold hover:bg-gold hover:text-noir border px-8 py-3 text-xs tracking-[0.2em] uppercase transition-all"
            @click="filters.offset = (filters.offset || 0) + 20"
          >
            Charger plus de résultats
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
