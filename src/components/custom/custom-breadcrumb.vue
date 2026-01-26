<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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
import { MoreHorizontal } from 'lucide-vue-next'
import { computed } from 'vue'

// Props
interface BreadcrumbItemType {
  label: string
  link?: string
}

const props = defineProps<{
  items: BreadcrumbItemType[]
}>()

// Logique : dropdown dès qu'il y a 4 éléments ou plus pour raccourcir
// En shadcn on garde souvent plus d'items, mais reproduisons la logique "collapse" si beaucoup d'items
// Ici la logique était "si 3 items ou plus, afficher seulement le dernier et un menu"
// Adaptons pour shadcn : Afficher le premier, ... (menu), et le dernier si > 3 items

const ITEMS_TO_DISPLAY = 3

const shouldCollapse = computed(() => props.items.length > ITEMS_TO_DISPLAY)

const firstItem = computed(() => props.items[0])
const lastItem = computed(() => props.items[props.items.length - 1])
const middleItems = computed(() => {
  if (!shouldCollapse.value) return []
  return props.items.slice(1, props.items.length - 1)
})
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <!-- Si pas de collapse, afficher tout -->
      <template v-if="!shouldCollapse">
        <template
          v-for="(item, index) in items"
          :key="index"
        >
          <BreadcrumbItem>
            <BreadcrumbLink
              v-if="item.link && index < items.length - 1"
              :href="item.link"
            >
              {{ item.label }}
            </BreadcrumbLink>
            <BreadcrumbPage v-else>
              {{ item.label }}
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator v-if="index < items.length - 1" />
        </template>
      </template>

      <!-- Si collapse -->
      <template v-else>
        <!-- Premier item -->
        <BreadcrumbItem>
          <BreadcrumbLink
            v-if="firstItem?.link"
            :href="firstItem.link"
          >
            {{ firstItem.label }}
          </BreadcrumbLink>
          <BreadcrumbPage v-else>
            {{ firstItem?.label }}
          </BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        <!-- Menu Dropdown -->
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger class="flex items-center gap-1">
              <MoreHorizontal class="h-4 w-4" />
              <span class="sr-only">Toggle menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                v-for="(item, index) in middleItems"
                :key="index"
              >
                <a
                  v-if="item.link"
                  :href="item.link"
                  class="w-full"
                >
                  {{ item.label }}
                </a>
                <span v-else>{{ item.label }}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        <!-- Dernier item -->
        <BreadcrumbItem>
          <BreadcrumbPage>
            {{ lastItem?.label }}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
