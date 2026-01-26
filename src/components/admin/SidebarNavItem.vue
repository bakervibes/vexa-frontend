<script setup lang="ts">
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { ChevronRight } from 'lucide-vue-next'
import type { Component } from 'vue'
import { useRoute } from 'vue-router'

interface SubItem {
  title: string
  url: string
}

interface NavItem {
  title: string
  icon: Component
  url?: string
  items?: SubItem[]
}

const props = defineProps<{
  item: NavItem
}>()

const route = useRoute()
const { state } = useSidebar()

const isActive = (url: string) => {
  return route.path === url || route.path.startsWith(url + '/')
}

const isGroupActive = (items?: SubItem[]) => {
  if (!items) return false
  return items.some((item) => isActive(item.url))
}
</script>

<template>
  <!-- Item with sub-items when sidebar is expanded -->
  <Collapsible
    v-if="item.items && state === 'expanded'"
    as-child
    :default-open="isGroupActive(item.items)"
    class="group/collapsible"
  >
    <SidebarMenuItem>
      <CollapsibleTrigger as-child>
        <SidebarMenuButton :tooltip="item.title">
          <component
            :is="item.icon"
            class="size-4"
          />
          <span>{{ item.title }}</span>
          <ChevronRight
            class="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
          />
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          <SidebarMenuSubItem
            v-for="subItem in item.items"
            :key="subItem.title"
          >
            <SidebarMenuSubButton
              as-child
              :data-active="isActive(subItem.url)"
            >
              <RouterLink :to="subItem.url">
                <span>{{ subItem.title }}</span>
              </RouterLink>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      </CollapsibleContent>
    </SidebarMenuItem>
  </Collapsible>

  <!-- Item with sub-items when sidebar is collapsed (icon mode) -->
  <SidebarMenuItem v-else-if="item.items && state === 'collapsed'">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <SidebarMenuButton
          :tooltip="item.title"
          :data-active="isGroupActive(item.items)"
          class="cursor-pointer"
        >
          <component
            :is="item.icon"
            class="size-4"
          />
          <span>{{ item.title }}</span>
          <ChevronRight class="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="center"
        :side-offset="4"
        class="ml-3 min-w-48"
      >
        <DropdownMenuItem
          v-for="subItem in item.items"
          :key="subItem.title"
          as-child
        >
          <RouterLink
            :to="subItem.url"
            class="w-full"
            :class="{ 'bg-accent': isActive(subItem.url) }"
          >
            {{ subItem.title }}
          </RouterLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </SidebarMenuItem>

  <!-- Simple item (no sub-items) -->
  <SidebarMenuItem v-else>
    <SidebarMenuButton
      as-child
      :tooltip="item.title"
      :data-active="isActive(item.url!)"
    >
      <RouterLink :to="item.url!">
        <component
          :is="item.icon"
          class="size-4"
        />
        <span>{{ item.title }}</span>
      </RouterLink>
    </SidebarMenuButton>
  </SidebarMenuItem>
</template>
