<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next'
import Breadcrumb from 'primevue/breadcrumb'
import Menu from 'primevue/menu'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

// Props
interface BreadcrumbItemType {
  label: string
  link?: string
}

const props = defineProps<{
  items: BreadcrumbItemType[]
}>()

const menu = ref()

// Logique : dropdown dès qu'il y a 3 éléments ou plus
const shouldShowDropdown = computed(() => props.items.length >= 3)

// Transformation des items pour PrimeVue Breadcrumb
const breadcrumbItems = computed(() => {
  if (props.items.length < 3) {
    // Moins de 3 éléments : affichage normal
    return props.items.map((item) => ({
      label: item.label,
      to: item.link,
    }))
  }

  // 3 éléments ou plus : afficher uniquement le dernier
  const lastItem = props.items[props.items.length - 1]
  if (!lastItem) return []
  return [
    {
      label: lastItem.label,
      to: lastItem.link,
    },
  ]
})

// Items pour le menu dropdown
const menuItems = computed(() => {
  if (props.items.length < 3) return []

  return props.items.slice(0, -1).map((item) => ({
    label: item.label,
    command: () => {
      if (item.link) {
        window.location.href = item.link
      }
    },
  }))
})

const toggleMenu = (event: Event) => {
  menu.value?.toggle(event)
}
</script>

<template>
  <div class="flex shrink-0 items-center gap-2">
    <!-- Bouton dropdown si 3+ éléments -->
    <button
      v-if="shouldShowDropdown"
      @click="toggleMenu"
      class="hover:text-primary flex cursor-pointer items-center gap-1 transition-colors"
      aria-label="Afficher les éléments du chemin"
    >
      <MoreHorizontal class="h-4 w-4" />
    </button>

    <Menu
      v-if="shouldShowDropdown"
      ref="menu"
      :model="menuItems"
      :popup="true"
    />

    <!-- Breadcrumb PrimeVue -->
    <Breadcrumb :model="breadcrumbItems">
      <template #item="{ item, props }">
        <RouterLink
          v-if="item.to"
          :to="item.to"
          v-bind="props.action"
          class="hover:text-primary truncate text-lg transition-colors"
        >
          {{ item.label }}
        </RouterLink>
        <span
          v-else
          v-bind="props.action"
          class="truncate text-lg"
        >
          {{ item.label }}
        </span>
      </template>
    </Breadcrumb>
  </div>
</template>
