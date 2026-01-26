<script setup lang="ts">
/**
 * MyAccountLayout
 * Layout for account pages with shared sidebar
 * Includes sidebar navigation for Account, Address, Orders, Wishlist
 */
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/composables/useAuth'
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
const { user, logout } = useAuth()

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
  const name = user.value?.name
  if (name) {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  return 'U'
})

const fullName = computed(() => {
  return user.value?.name || 'Guest'
})

const handleLogout = async () => {
  await logout()
  router.push('/')
}
</script>

<template>
  <div
    class="container mx-auto flex h-fit min-h-[calc(100vh-4rem)] flex-col gap-8 bg-white px-4 py-8 sm:min-h-[calc(100vh-4.5rem)] md:py-12 lg:flex-row lg:items-start lg:gap-12"
  >
    <!-- Sidebar -->
    <aside class="w-full shrink-0 lg:sticky lg:top-30 lg:w-64">
      <div class="rounded-lg bg-gray-50 py-6">
        <!-- User Avatar & Name -->
        <div class="mb-6 flex flex-col items-center">
          <Avatar class="h-20 w-20">
            <AvatarImage
              v-if="user?.image"
              :src="user.image"
              :alt="fullName"
            />
            <AvatarFallback
              class="bg-primary text-primary-foreground text-xl font-medium"
            >
              {{ userInitials }}
            </AvatarFallback>
          </Avatar>
          <h2 class="mt-4 text-lg font-semibold">
            {{ fullName }}
          </h2>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex flex-col gap-1 px-5 lg:pr-0">
          <RouterLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            :class="
              cn(
                'flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors lg:rounded-r-none',
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
    <div class="flex flex-1 flex-col">
      <h1
        class="mb-8 text-center font-serif text-4xl font-medium md:mb-12 md:text-5xl"
      >
        My Account
      </h1>

      <RouterView />
    </div>

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
