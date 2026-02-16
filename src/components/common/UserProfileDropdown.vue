<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/composables/useAuth'
import {
  BoxIcon,
  HeartIcon,
  LogOutIcon,
  MapPinIcon,
  UserIcon,
} from 'lucide-vue-next'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { user, isAuthenticated, openAuthModal, logout } = useAuth()

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
  return user.value?.name || 'Utilisateur'
})

const handleAvatarClick = () => {
  if (!isAuthenticated.value) {
    openAuthModal('login')
  }
}

const handleLogout = async () => {
  await logout()
  router.push('/')
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <button
    v-if="!isAuthenticated"
    @click="handleAvatarClick"
    class="hover:text-gold p-2 text-[#555] transition-colors"
    aria-label="Connexion"
  >
    <UserIcon class="size-5 cursor-pointer" />
  </button>

  <div v-else>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button
          class="flex items-center justify-center"
          aria-label="Menu utilisateur"
        >
          <Avatar class="border-gold/40 h-8 w-8 cursor-pointer border">
            <AvatarImage
              v-if="user?.image"
              :src="user.image"
              :alt="fullName"
            />
            <AvatarFallback class="bg-gold text-noir text-xs">
              {{ userInitials }}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        class="text-text bg-noir border-border-noir w-56"
        align="end"
      >
        <DropdownMenuLabel class="font-normal">
          <div class="flex flex-col space-y-1">
            <p class="text-text text-sm leading-none font-medium">
              {{ fullName }}
            </p>
            <p class="text-xs leading-none text-[#555]">
              {{ user?.email || '' }}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator class="bg-border-noir" />
        <DropdownMenuItem
          @click="navigateTo('/my-account/profile')"
          class="hover:text-gold focus:text-gold cursor-pointer text-[#555] transition-colors"
        >
          <UserIcon class="mr-2 h-4 w-4" />
          <span>Mon Compte</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          @click="navigateTo('/my-account/addresses')"
          class="hover:text-gold focus:text-gold cursor-pointer text-[#555] transition-colors"
        >
          <MapPinIcon class="mr-2 h-4 w-4" />
          <span>Adresses</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          @click="navigateTo('/my-account/orders')"
          class="hover:text-gold focus:text-gold cursor-pointer text-[#555] transition-colors"
        >
          <BoxIcon class="mr-2 h-4 w-4" />
          <span>Commandes</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          @click="navigateTo('/my-account/wishlist')"
          class="hover:text-gold focus:text-gold cursor-pointer text-[#555] transition-colors"
        >
          <HeartIcon class="mr-2 h-4 w-4" />
          <span>Favoris</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator class="bg-border-noir" />
        <DropdownMenuItem
          @click="handleLogout"
          class="text-gold hover:text-text focus:text-text cursor-pointer transition-colors"
        >
          <LogOutIcon class="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
