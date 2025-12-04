<script setup lang="ts">
/**
 * MyAccountLayout
 * Layout for account pages with shared sidebar
 * Includes sidebar navigation for Account, Address, Orders, Wishlist
 */
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/utils/lib'
import {
  HeartIcon,
  LogOutIcon,
  MapPinIcon,
  PackageIcon,
  UserIcon,
} from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Toaster } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const menuItems = [
  { name: 'Account', path: '/my-account/profile', icon: UserIcon },
  { name: 'Address', path: '/my-account/addresses', icon: MapPinIcon },
  { name: 'Orders', path: '/my-account/orders', icon: PackageIcon },
  { name: 'Wishlist', path: '/my-account/wishlist', icon: HeartIcon },
]

const isActive = (path: string) => {
  return route.path === path
}

const userInitials = computed(() => {
  const name = authStore.user?.name
  if (!name) return 'U'
  const names = name.split(' ')
  if (names.length >= 2) {
    return `${names[0]?.[0] ?? ''}${names[1]?.[0] ?? ''}`.toUpperCase()
  }
  return names[0]?.substring(0, 2).toUpperCase() ?? 'U'
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] bg-white sm:min-h-[calc(100vh-4.5rem)]">
    <main class="flex-1">
      <div class="container mx-auto px-4 py-8 md:py-12">
        <!-- Page Title -->
        <h1
          class="mb-8 text-center font-serif text-4xl font-medium md:mb-12 md:text-5xl"
        >
          My Account
        </h1>

        <div class="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <!-- Sidebar -->
          <aside class="w-full shrink-0 lg:w-64">
            <div class="rounded-lg bg-gray-50 py-6">
              <!-- User Avatar & Name -->
              <div class="mb-6 flex flex-col items-center">
                <Avatar class="h-20 w-20">
                  <AvatarImage
                    v-if="authStore.user?.image"
                    :src="authStore.user.image"
                    :alt="authStore.user?.name || 'User'"
                  />
                  <AvatarFallback
                    class="bg-primary text-primary-foreground text-xl font-medium"
                  >
                    {{ userInitials }}
                  </AvatarFallback>
                </Avatar>
                <h2 class="mt-4 text-lg font-semibold">
                  {{ authStore.user?.name || 'Guest' }}
                </h2>
              </div>

              <!-- Navigation Menu -->
              <nav class="flex flex-col gap-1 pl-4">
                <RouterLink
                  v-for="item in menuItems"
                  :key="item.path"
                  :to="item.path"
                  :class="
                    cn(
                      'flex items-center gap-3 rounded-l-sm px-4 py-3 text-sm font-medium transition-colors',
                      isActive(item.path)
                        ? 'bg-white text-black'
                        : 'text-gray-500 hover:text-gray-900',
                    )
                  "
                >
                  <component
                    :is="item.icon"
                    class="h-5 w-5"
                  />
                  {{ item.name }}
                </RouterLink>

                <button
                  @click="handleLogout"
                  class="mt-4 flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:text-red-600"
                >
                  <LogOutIcon class="h-5 w-5" />
                  Log Out
                </button>
              </nav>
            </div>
          </aside>

          <!-- Main Content -->
          <div class="flex-1">
            <RouterView />
          </div>
        </div>
      </div>
    </main>

    <Toaster
      richColors
      position="bottom-right"
      :duration="3000"
    />
  </div>
</template>

<style scoped>
/* MyAccount layout specific styles */
</style>
