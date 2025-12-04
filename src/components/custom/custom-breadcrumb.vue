<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

// Props
interface BreadcrumbItemType {
  label: string
  link?: string
}

const props = defineProps<{
  items: BreadcrumbItemType[]
}>()

// Logique : dropdown dès qu'il y a 3 éléments ou plus
// Tous les éléments sauf le dernier vont dans le dropdown
const shouldShowDropdown = computed(() => props.items.length >= 3)

const displayedItems = computed(() => {
  if (props.items.length < 3) {
    // Moins de 3 éléments : affichage normal
    return { hidden: [], last: props.items }
  }

  // 3 éléments ou plus : tous dans le dropdown sauf le dernier
  return {
    hidden: props.items.slice(0, -1),
    last: [props.items[props.items.length - 1]],
  }
})
</script>

<template>
  <Breadcrumb class="shrink-0">
    <BreadcrumbList>
      <!-- Cas simple : moins de 3 éléments -->
      <template v-if="!shouldShowDropdown">
        <template
          v-for="(item, index) in displayedItems.last"
          :key="index"
        >
          <BreadcrumbItem>
            <RouterLink
              v-if="item?.link"
              :to="item.link"
              :title="item.label"
              class="hover:text-primary truncate text-lg transition-colors"
            >
              {{ item.label }}
            </RouterLink>
            <BreadcrumbPage
              v-else
              :title="item?.label"
              aria-current="page"
              class="truncate text-lg"
            >
              {{ item?.label }}
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator v-if="index < displayedItems.last.length - 1" />
        </template>
      </template>

      <!-- Cas avec dropdown : 3 éléments ou plus -->
      <template v-else>
        <!-- Dropdown contenant tous les éléments sauf le dernier -->
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger class="flex cursor-pointer items-center gap-1">
              <BreadcrumbEllipsis class="h-4 w-4" />
              <span class="sr-only">Afficher les éléments du chemin</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                v-for="(item, index) in displayedItems.hidden"
                :key="index"
                :as-child="!!item.link"
                class="cursor-pointer"
              >
                <RouterLink
                  v-if="item.link"
                  :to="item.link"
                  :title="item.label"
                  class="hover:text-primary block truncate transition-colors"
                >
                  {{ item.label }}
                </RouterLink>
                <span
                  v-else
                  :title="item.label"
                  class="block truncate"
                >
                  {{ item.label }}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <!-- Dernier élément avec priorité maximale d'affichage -->
        <BreadcrumbItem class="flex-1 overflow-hidden">
          <RouterLink
            v-if="displayedItems.last[0]?.link"
            :to="displayedItems.last[0]?.link"
            :title="displayedItems.last[0]?.label"
            class="hover:text-primary block truncate text-lg transition-colors"
          >
            {{ displayedItems.last[0]?.label }}
          </RouterLink>
          <BreadcrumbPage
            v-else
            :title="displayedItems.last[0]?.label"
            aria-current="page"
            class="block truncate text-lg"
          >
            {{ displayedItems.last[0]?.label }}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
