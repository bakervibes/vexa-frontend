<script setup lang="ts">
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
  { name: 'Mon compte', path: '/my-account/profile', icon: UserIcon },
  { name: 'Adresses', path: '/my-account/addresses', icon: MapPinIcon },
  { name: 'Commandes', path: '/my-account/orders', icon: PackageIcon },
  { name: 'Favoris', path: '/my-account/wishlist', icon: HeartIcon },
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
  return user.value?.name || 'Invité'
})

const handleLogout = async () => {
  await logout()
  router.push('/')
}
</script>

<template>
  <div
    class="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-24 lg:flex-row lg:items-start lg:gap-12"
  >
    <aside class="w-full shrink-0 lg:sticky lg:top-24 lg:w-64">
      <div class="bg-surface border border-[#1E1E1E] p-6">
        <div class="mb-8 flex flex-col items-center">
          <Avatar class="h-20 w-20 border border-[#C8A97E]/40">
            <AvatarImage
              v-if="user?.image"
              :src="user.image"
              :alt="fullName"
            />
            <AvatarFallback
              class="bg-[#C8A97E] text-xl font-light text-[#0A0A0A]"
            >
              {{ userInitials }}
            </AvatarFallback>
          </Avatar>
          <h2 class="font-display mt-4 text-lg font-light text-[#E8E8E8]">
            {{ fullName }}
          </h2>
        </div>

        <div class="mx-auto mb-6 h-px w-16 bg-[#C8A97E]/40" />

        <nav class="flex flex-col gap-1">
          <RouterLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            :class="
              cn(
                'flex items-center gap-3 border-l-2 px-4 py-3 text-xs tracking-widest uppercase transition-colors',
                isActive(item.path)
                  ? 'border-[#C8A97E] bg-[#0A0A0A] text-[#C8A97E]'
                  : 'border-transparent text-[#555] hover:border-[#C8A97E]/40 hover:text-[#E8E8E8]',
              )
            "
          >
            <component
              :is="item.icon"
              class="h-4 w-4"
            />
            {{ item.name }}
          </RouterLink>

          <button
            @click="handleLogout"
            class="mt-6 flex cursor-pointer items-center gap-3 border-l-2 border-transparent px-4 py-3 text-xs tracking-widest text-[#555] uppercase transition-colors hover:border-[#C8A97E]/40 hover:text-[#C8A97E]"
          >
            <LogOutIcon class="h-4 w-4" />
            Déconnexion
          </button>
        </nav>
      </div>
    </aside>

    <div class="flex flex-1 flex-col">
      <div
        class="mb-6 text-center text-xs tracking-[0.3em] text-[#C8A97E] uppercase"
      >
        Espace client
      </div>

      <h1
        class="font-display mb-4 text-center text-4xl font-light text-[#E8E8E8] md:text-5xl"
      >
        Mon
        <span class="italic">compte</span>
      </h1>

      <div class="mx-auto my-8 h-px w-24 bg-[#C8A97E]/40" />

      <RouterView />
    </div>

    <Toaster
      richColors
      position="bottom-right"
      :duration="3000"
    />
  </div>
</template>
