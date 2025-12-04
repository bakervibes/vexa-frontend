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
import { useAuthModal } from '@/composables/useAuthModal'
import { useAuthStore } from '@/stores/auth'
import {
  HeartIcon,
  LogOutIcon,
  MapPinIcon,
  PackageIcon,
  UserIcon,
} from 'lucide-vue-next'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '../ui/button'

const authStore = useAuthStore()
const router = useRouter()
const { openAuthModal } = useAuthModal()

const userInitials = computed(() => {
  const name = authStore.user?.name
  if (!name) return 'U'
  const names = name.split(' ')
  if (names.length >= 2) {
    return `${names[0]?.[0] ?? ''}${names[1]?.[0] ?? ''}`.toUpperCase()
  }
  return names[0]?.substring(0, 2).toUpperCase() ?? 'U'
})

const handleAvatarClick = () => {
  if (!authStore.isAuthenticated) {
    openAuthModal('login')
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <!-- Not authenticated: show clickable avatar that opens auth modal -->
  <Button
    v-if="!authStore.isAuthenticated"
    type="button"
    variant="ghost"
    size="icon"
    @click="handleAvatarClick"
    class="relative flex items-center justify-center hover:bg-transparent"
    aria-label="Sign in"
  >
    <UserIcon class="size-5 cursor-pointer" />
  </Button>

  <!-- Authenticated: show dropdown with user info -->
  <DropdownMenu v-else>
    <DropdownMenuTrigger as-child>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="flex items-center justify-center hover:bg-transparent focus:outline-none"
        aria-label="User menu"
      >
        <Avatar class="size-8 cursor-pointer">
          <AvatarImage
            v-if="authStore.user?.image"
            :src="authStore.user.image"
            :alt="authStore.user?.name || 'User'"
          />
          <AvatarFallback
            class="bg-primary text-primary-foreground text-xs font-medium"
          >
            {{ userInitials }}
          </AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      align="end"
      class="w-56"
    >
      <DropdownMenuLabel class="font-normal">
        <div class="flex flex-col space-y-1">
          <p class="text-sm leading-none font-medium">
            {{ authStore.user?.name }}
          </p>
          <p class="text-muted-foreground text-xs leading-none">
            {{ authStore.user?.email }}
          </p>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        @click="navigateTo('/my-account/profile')"
        class="cursor-pointer"
      >
        <UserIcon class="mr-2 h-4 w-4" />
        <span>My Account</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        @click="navigateTo('/my-account/addresses')"
        class="cursor-pointer"
      >
        <MapPinIcon class="mr-2 h-4 w-4" />
        <span>Addresses</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        @click="navigateTo('/my-account/orders')"
        class="cursor-pointer"
      >
        <PackageIcon class="mr-2 h-4 w-4" />
        <span>Orders</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        @click="navigateTo('/my-account/wishlist')"
        class="cursor-pointer"
      >
        <HeartIcon class="mr-2 h-4 w-4" />
        <span>Wishlist</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        @click="handleLogout"
        class="cursor-pointer text-red-600 focus:text-red-600"
      >
        <LogOutIcon class="mr-2 h-4 w-4" />
        <span>Log out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style scoped></style>
