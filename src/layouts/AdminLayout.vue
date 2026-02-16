<script setup lang="ts">
import NotificationDropdown from '@/components/admin/NotificationDropdown.vue'
import SidebarNavItem from '@/components/admin/SidebarNavItem.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useAuth } from '@/composables/useAuth'
import {
  BarChart3,
  Boxes,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Sun,
  Tag,
  Truck,
  Users,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toaster } from 'vue-sonner'

const router = useRouter()
const route = useRoute()
const { user, logout } = useAuth()

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  const parts = user.value.name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
  }
  return user.value.name.substring(0, 2).toUpperCase()
})

const isDark = ref(false)

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark')
    isDark.value = true
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark')
    isDark.value = false
  } else {
    isDark.value = document.documentElement.classList.contains('dark')
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const handleLogout = async () => {
  const result = await logout()
  if (result.success) {
    router.push('/auth/sign-in')
  }
}

const navigationItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    url: '/admin/dashboard',
  },
  {
    title: 'Produits',
    icon: Package,
    items: [
      { title: 'Liste', url: '/admin/products' },
      { title: 'Catégories', url: '/admin/categories' },
      { title: 'Attributs', url: '/admin/attributes' },
    ],
  },
  {
    title: 'Commandes',
    icon: ShoppingCart,
    items: [
      { title: 'Toutes', url: '/admin/orders' },
      { title: 'Remboursements', url: '/admin/orders?status=refund' },
    ],
  },
  {
    title: 'Clients',
    icon: Users,
    url: '/admin/customers',
  },
  {
    title: 'Marketing',
    icon: Tag,
    items: [
      { title: 'Coupons', url: '/admin/coupons' },
      { title: 'Newsletter', url: '/admin/newsletter' },
    ],
  },
  {
    title: 'Stocks',
    icon: Boxes,
    url: '/admin/stock',
  },
  {
    title: 'Livraison',
    icon: Truck,
    url: '/admin/shipping',
  },
  {
    title: 'Rapports',
    icon: BarChart3,
    url: '/admin/reports',
  },
  {
    title: 'Paramètres',
    icon: Settings,
    url: '/admin/settings',
  },
]

const breadcrumbs = computed(() => {
  const paths = route.path.split('/').filter(Boolean)
  const crumbs = []
  let currentPath = ''

  for (const path of paths) {
    currentPath += `/${path}`
    const label =
      path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
    crumbs.push({ label, path: currentPath })
  }

  return crumbs
})
</script>

<template>
  <SidebarProvider>
    <Sidebar
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              as-child
            >
              <RouterLink to="/admin/dashboard">
                <div
                  class="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
                >
                  <Package class="size-4" />
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">VEXA</span>
                  <span class="text-muted-foreground truncate text-xs">
                    Administration
                  </span>
                </div>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarNavItem
                v-for="item in navigationItems"
                :key="item.title"
                :item="item"
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <SidebarMenuButton
                  size="lg"
                  class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar class="size-8 rounded-lg">
                    <AvatarImage
                      v-if="user?.image"
                      :src="user.image"
                      :alt="user.name"
                    />
                    <AvatarFallback class="rounded-lg">
                      {{ userInitials }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">
                      {{ user?.name }}
                    </span>
                    <span class="text-muted-foreground truncate text-xs">
                      {{ user?.email }}
                    </span>
                  </div>
                  <ChevronsUpDown class="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                :side-offset="4"
              >
                <DropdownMenuLabel class="p-0 font-normal">
                  <div
                    class="flex items-center gap-2 px-1 py-1.5 text-left text-sm"
                  >
                    <Avatar class="size-8 rounded-lg">
                      <AvatarImage
                        v-if="user?.image"
                        :src="user.image"
                        :alt="user.name"
                      />
                      <AvatarFallback class="rounded-lg">
                        {{ userInitials }}
                      </AvatarFallback>
                    </Avatar>
                    <div class="grid flex-1 text-left text-sm leading-tight">
                      <span class="truncate font-semibold">
                        {{ user?.name }}
                      </span>
                      <span class="text-muted-foreground truncate text-xs">
                        {{ user?.email }}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem as-child>
                  <RouterLink
                    to="/"
                    class="flex items-center gap-2"
                  >
                    <Package class="size-4" />
                    <span>Voir la boutique</span>
                  </RouterLink>
                </DropdownMenuItem>
                <DropdownMenuItem
                  @click="toggleTheme"
                  class="flex items-center gap-2"
                >
                  <Sun
                    v-if="isDark"
                    class="size-4"
                  />
                  <Moon
                    v-else
                    class="size-4"
                  />
                  <span>{{ isDark ? 'Mode clair' : 'Mode sombre' }}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  @click="handleLogout"
                  class="text-destructive focus:text-destructive flex items-center gap-2"
                >
                  <LogOut class="size-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>

    <SidebarInset>
      <!-- Header -->
      <header
        class="bg-background sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2">
          <SidebarTrigger class="-ml-1" />

          <Separator
            orientation="vertical"
            class="mr-2 h-4 text-white"
          />

          <Breadcrumb>
            <BreadcrumbList>
              <template
                v-for="(crumb, index) in breadcrumbs"
                :key="crumb.path"
              >
                <BreadcrumbItem v-if="index < breadcrumbs.length - 1">
                  <BreadcrumbLink as-child>
                    <RouterLink :to="crumb.path">
                      {{ crumb.label }}
                    </RouterLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator v-if="index < breadcrumbs.length - 1" />
                <BreadcrumbItem v-if="index === breadcrumbs.length - 1">
                  <BreadcrumbPage>{{ crumb.label }}</BreadcrumbPage>
                </BreadcrumbItem>
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div class="ml-auto flex items-center gap-2">
          <!-- Notifications -->
          <NotificationDropdown />
        </div>
      </header>

      <!-- Main Content -->
      <div class="flex-1 overflow-auto p-6">
        <RouterView />
      </div>
    </SidebarInset>
  </SidebarProvider>

  <Toaster
    richColors
    position="bottom-right"
    :duration="3000"
  />
</template>
