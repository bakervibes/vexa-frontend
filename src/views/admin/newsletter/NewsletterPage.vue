<script setup lang="ts">
import { AdminPageHeader, StatCard } from '@/components/admin/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Switch } from '@/components/ui/switch'
import { useNewsletters } from '@/composables/useNewsletters'
import { Download, Mail, MailX, Users } from 'lucide-vue-next'

const {
  subscribers,
  pagination,
  stats,
  filters,
  isLoading,
  isLoadingStats,
  setPage,
  toggleActiveOnly,
  exportToCsv,
} = useNewsletters()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Newsletter"
      description="Gérez vos abonnés à la newsletter"
    >
      <template #actions>
        <Button
          variant="outline"
          :disabled="subscribers.length === 0"
          @click="exportToCsv"
        >
          <Download class="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </template>
    </AdminPageHeader>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Total abonnés"
        :value="stats?.total ?? 0"
        :loading="isLoadingStats"
        :icon="Users"
      />
      <StatCard
        title="Abonnés actifs"
        :value="stats?.active ?? 0"
        :loading="isLoadingStats"
        :icon="Mail"
        variant="success"
      />
      <StatCard
        title="Désabonnés"
        :value="stats?.inactive ?? 0"
        :loading="isLoadingStats"
        :icon="MailX"
        variant="warning"
      />
    </div>

    <!-- Filter -->
    <div class="bg-card flex items-center gap-3 rounded-lg border p-4">
      <Switch
        id="activeOnly"
        :checked="filters.activeOnly"
        @update:checked="toggleActiveOnly"
      />
      <label
        for="activeOnly"
        class="text-sm font-medium"
      >
        Afficher uniquement les abonnés actifs
      </label>
    </div>

    <!-- Subscribers Table -->
    <div class="rounded-md border">
      <table class="w-full">
        <thead>
          <tr class="bg-muted/50 border-b">
            <th
              class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
            >
              Email
            </th>
            <th
              class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
            >
              Statut
            </th>
            <th
              class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
            >
              Date d'inscription
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading state -->
          <tr v-if="isLoading">
            <td
              colspan="3"
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
          <tr v-else-if="subscribers.length === 0">
            <td
              colspan="3"
              class="text-muted-foreground h-24 text-center text-sm"
            >
              Aucun abonné trouvé
            </td>
          </tr>

          <!-- Subscribers -->
          <tr
            v-else
            v-for="subscriber in subscribers"
            :key="subscriber.id"
            class="hover:bg-muted/50 border-b transition-colors"
          >
            <td class="p-4">
              <div class="flex items-center gap-3">
                <div
                  class="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full"
                >
                  <Mail class="text-primary h-4 w-4" />
                </div>
                <span class="font-medium">{{ subscriber.email }}</span>
              </div>
            </td>
            <td class="p-4">
              <Badge :variant="subscriber.isActive ? 'default' : 'secondary'">
                {{ subscriber.isActive ? 'Actif' : 'Désabonné' }}
              </Badge>
            </td>
            <td class="text-muted-foreground p-4 text-sm">
              {{ formatDate(subscriber.createdAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination && pagination.totalPages > 1"
      class="flex justify-center"
    >
      <Pagination
        :total="pagination.total"
        :items-per-page="pagination.limit"
        :sibling-count="1"
        :default-page="pagination.page"
        show-edges
        @update:page="setPage"
      >
        <PaginationContent
          v-slot="{ items }"
          class="flex items-center gap-1"
        >
          <PaginationFirst />
          <PaginationPrevious />

          <template
            v-for="(item, index) in items"
            :key="index"
          >
            <PaginationItem
              v-if="item.type === 'page'"
              :value="item.value"
              as-child
            >
              <Button
                class="h-10 w-10 p-0"
                :variant="
                  item.value === pagination.page ? 'default' : 'outline'
                "
              >
                {{ item.value }}
              </Button>
            </PaginationItem>
            <PaginationEllipsis
              v-else
              :index="index"
            />
          </template>

          <PaginationNext />
          <PaginationLast />
        </PaginationContent>
      </Pagination>
    </div>
  </div>
</template>
