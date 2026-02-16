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
  { label: 'Nouveautés', sortBy: SortBy.CREATED_AT, order: SortOrder.DESC },
  { label: 'Anciens', sortBy: SortBy.CREATED_AT, order: SortOrder.ASC },
  { label: 'Prix croissant', sortBy: SortBy.PRICE, order: SortOrder.ASC },
  { label: 'Prix décroissant', sortBy: SortBy.PRICE, order: SortOrder.DESC },
  { label: 'Nom A-Z', sortBy: SortBy.NAME, order: SortOrder.ASC },
  { label: 'Nom Z-A', sortBy: SortBy.NAME, order: SortOrder.DESC },
]

const currentSortOption = computed({
  get: () => {
    const currentSortBy = filters.value.sortBy
    const currentSortOrder = filters.value.sortOrder

    const option = sortOptions.find(
      (opt) => opt.sortBy === currentSortBy && opt.order === currentSortOrder,
    )

    return option?.label || 'Nouveautés'
  },
  set: (label: string) => {
    const option = sortOptions.find((opt) => opt.label === label)
    if (option) {
      handleSortChange(option)
    }
  },
})

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
  <Select v-model="currentSortOption">
    <SelectTrigger
      class="hover:border-gold/40 text-text border-border-noir w-40 bg-transparent text-xs tracking-widest uppercase"
    >
      <SelectValue placeholder="Trier par" />
    </SelectTrigger>
    <SelectContent class="text-text bg-noir border-border-noir">
      <SelectItem
        v-for="option in sortOptions"
        :key="option.label"
        :value="option.label"
        class="hover:text-gold focus:text-gold hover:bg-surface focus:bg-surface text-xs tracking-widest uppercase"
      >
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
