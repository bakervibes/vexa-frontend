<script setup lang="ts" generic="T extends Record<string, any>">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronLeft, ChevronRight, Search } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import EmptyState from './EmptyState.vue'

export interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  class?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  pagination?: {
    page: number
    totalPages: number
    total: number
  } | null
  emptyTitle?: string
  emptyDescription?: string
}

const props = withDefaults(defineProps<DataTableProps<T>>(), {
  loading: false,
  searchable: false,
  searchPlaceholder: 'Rechercher...',
  emptyTitle: 'Aucune donnée',
  emptyDescription: 'Aucun élément à afficher.',
})

const emit = defineEmits<{
  (e: 'search', value: string): void
  (e: 'page-change', page: number): void
  (e: 'row-click', item: T): void
}>()

const searchQuery = ref('')

watch(searchQuery, (value) => {
  emit('search', value)
})

function handlePageChange(page: number) {
  if (page >= 1 && page <= (props.pagination?.totalPages || 1)) {
    emit('page-change', page)
  }
}

function getValue(item: T, key: keyof T | string): unknown {
  if (typeof key === 'string' && key.includes('.')) {
    return key
      .split('.')
      .reduce(
        (obj: Record<string, unknown>, k: string) =>
          obj?.[k] as Record<string, unknown>,
        item as Record<string, unknown>,
      )
  }
  return item[key as keyof T]
}
</script>

<template>
  <div class="space-y-4">
    <!-- Search -->
    <div
      v-if="searchable"
      class="flex items-center gap-2"
    >
      <div class="relative max-w-sm flex-1">
        <Search
          class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        />
        <Input
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          class="pl-9"
        />
      </div>
      <slot name="toolbar" />
    </div>

    <!-- Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              v-for="column in columns"
              :key="String(column.key)"
              :class="column.class"
            >
              {{ column.label }}
            </TableHead>
            <TableHead
              v-if="$slots.actions"
              class="w-[100px] text-right"
            >
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Loading state -->
          <TableRow v-if="loading">
            <TableCell
              :colspan="columns.length + ($slots.actions ? 1 : 0)"
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
            </TableCell>
          </TableRow>

          <!-- Empty state -->
          <TableRow v-else-if="data.length === 0">
            <TableCell
              :colspan="columns.length + ($slots.actions ? 1 : 0)"
              class="h-48"
            >
              <EmptyState
                :title="emptyTitle"
                :description="emptyDescription"
              >
                <template #action>
                  <slot name="empty-action" />
                </template>
              </EmptyState>
            </TableCell>
          </TableRow>

          <!-- Data rows -->
          <TableRow
            v-else
            v-for="(item, index) in data"
            :key="index"
            class="hover:bg-muted/50 cursor-pointer"
            @click="emit('row-click', item)"
          >
            <TableCell
              v-for="column in columns"
              :key="String(column.key)"
              :class="column.class"
            >
              <slot
                :name="`cell-${String(column.key)}`"
                :item="item"
                :value="getValue(item, column.key)"
              >
                {{ getValue(item, column.key) }}
              </slot>
            </TableCell>
            <TableCell
              v-if="$slots.actions"
              class="text-right"
            >
              <slot
                name="actions"
                :item="item"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination && pagination.totalPages > 1"
      class="flex items-center justify-between px-2"
    >
      <p class="text-muted-foreground text-sm">
        Page {{ pagination.page }} sur {{ pagination.totalPages }} ({{
          pagination.total
        }}
        éléments)
      </p>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.page <= 1"
          @click="handlePageChange(pagination.page - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.page >= pagination.totalPages"
          @click="handlePageChange(pagination.page + 1)"
        >
          Suivant
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
