<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProducts } from '@/composables/useProducts'
import { SortBy, SortOrder } from '@/validators/common.schemas'
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

  return option?.label
})

// Handle sort selection
function handleSortChange(label: string) {
  const option = sortOptions.find((opt) => opt.label === label)

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
    :model-value="currentSortOption"
    @update:model-value="(value) => handleSortChange(value as string)"
  >
    <SelectTrigger class="h-11! w-50">
      <SelectValue placeholder="Sort by" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="option in sortOptions"
        :key="option.label"
        :value="option.label"
      >
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<style scoped></style>
