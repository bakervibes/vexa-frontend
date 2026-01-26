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
import type { CategoryWithChildren } from '@/types'
import { Edit, MoreHorizontal, Trash2 } from 'lucide-vue-next'

interface Props {
  categories: CategoryWithChildren[]
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'edit', category: CategoryWithChildren): void
  (e: 'delete', category: CategoryWithChildren): void
}>()
</script>

<template>
  <div class="rounded-md border">
    <table class="w-full">
      <thead>
        <tr class="bg-muted/50 border-b">
          <th
            class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
          >
            Catégorie
          </th>
          <th
            class="text-muted-foreground h-12 px-4 align-middle text-sm font-medium"
          >
            Parent
          </th>
          <th
            class="text-muted-foreground h-12 px-4 align-middle text-sm font-medium"
          >
            Produits
          </th>
          <th
            class="text-muted-foreground h-12 px-4 align-middle text-sm font-medium"
          >
            Statut
          </th>
          <th
            class="text-muted-foreground h-12 w-[80px] px-4 text-right align-middle text-sm font-medium"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Loading state -->
        <tr v-if="loading">
          <td
            colspan="5"
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
        <tr v-else-if="categories.length === 0">
          <td
            colspan="5"
            class="text-muted-foreground h-24 text-center text-sm"
          >
            Aucune catégorie trouvée
          </td>
        </tr>

        <!-- Categories -->
        <tr
          v-else
          v-for="category in categories"
          :key="category.id"
          class="hover:bg-muted/50 border-b transition-colors"
        >
          <td class="p-4">
            <div class="flex items-center gap-3">
              <Avatar class="h-10 w-10 rounded">
                <AvatarImage
                  :src="category.image ?? ''"
                  :alt="category.name"
                  class="object-cover"
                />
                <AvatarFallback class="rounded">
                  {{ category.name.slice(0, 2).toUpperCase() }}
                </AvatarFallback>
              </Avatar>
              <div>
                <p class="font-medium">{{ category.name }}</p>
                <p class="text-muted-foreground text-sm">{{ category.slug }}</p>
              </div>
            </div>
          </td>
          <td class="p-4 text-center">
            <span
              v-if="category.parentCategory"
              class="text-sm"
            >
              {{ category.parentCategory.name }}
            </span>
            <span
              v-else
              class="text-muted-foreground text-sm"
            >
              -
            </span>
          </td>
          <td class="p-4 text-center">
            <Badge variant="secondary">
              {{ category._count?.products || 0 }} produit(s)
            </Badge>
          </td>
          <td class="p-4 text-center">
            <Badge :variant="category.isActive ? 'default' : 'outline'">
              {{ category.isActive ? 'Actif' : 'Inactif' }}
            </Badge>
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
                <DropdownMenuItem @click="emit('edit', category)">
                  <Edit class="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  class="text-destructive focus:text-destructive"
                  @click="emit('delete', category)"
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
