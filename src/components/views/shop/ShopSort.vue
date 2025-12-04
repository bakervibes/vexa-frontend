<script setup lang="ts">
import { useProducts } from '@/composables/useProducts'
import { SortBy, SortOrder } from '@/validators/common.schemas'
import Select from 'primevue/select'
import { computed } from 'vue'

const { filters, setFilters } = useProducts()

interface SortOption {
  label: string
  sortBy: SortBy
  order: SortOrder
}

const sortOptions: SortOption[] = [
  { label: 'Newest', sortBy: SortBy.CREATED_AT, order: SortOrder.DESC },
  { label: 'Oldest', sortBy: SortBy.CREATED_AT, order: SortOrder.ASC },
  { label: 'Price: Low to High', sortBy: SortBy.PRICE, order: SortOrder.ASC },
  { label: 'Price: High to Low', sortBy: SortBy.PRICE, order: SortOrder.DESC },
  { label: 'Name: A to Z', sortBy: SortBy.NAME, order: SortOrder.ASC },
  { label: 'Name: Z to A', sortBy: SortBy.NAME, order: SortOrder.DESC },
]

// Get the current selected option based on filters
const currentSortOption = computed(() => {
  const currentSortBy = filters.value.sortBy
  const currentSortOrder = filters.value.sortOrder

  // Find matching option
  const option = sortOptions.find(
    (opt) => opt.sortBy === currentSortBy && opt.order === currentSortOrder,
  )

  return option
})

// Handle sort selection
function handleSortChange(option: SortOption) {
  if (option) {
    setFilters({
      sortBy: option.sortBy,
      sortOrder: option.order,
    })
  }
}
</script>

<template>
  <Select
    :modelValue="currentSortOption"
    @update:modelValue="(value) => handleSortChange(value as SortOption)"
    :options="sortOptions"
    optionLabel="label"
    placeholder="Sort by"
    class="!h-11 w-50"
  />
</template>

<style scoped></style>
