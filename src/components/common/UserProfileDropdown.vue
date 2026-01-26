<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
  return user.value?.name || 'User'
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
  <!-- Not authenticated: show clickable avatar that opens auth modal -->
  <Button
    v-if="!isAuthenticated"
    variant="ghost"
    size="icon"
    @click="handleAvatarClick"
    class="p-2"
    aria-label="Sign in"
  >
    <UserIcon class="size-5 cursor-pointer" />
  </Button>

  <!-- Authenticated: show dropdown with user info -->
  <div v-else>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="rounded-full"
          aria-label="User menu"
        >
          <Avatar class="h-8 w-8 cursor-pointer">
            <AvatarImage
              v-if="user?.image"
              :src="user.image"
              :alt="fullName"
            />
            <AvatarFallback class="bg-green-600 text-white">
              {{ userInitials }}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        class="w-56"
        align="end"
      >
        <DropdownMenuLabel class="font-normal">
          <div class="flex flex-col space-y-1">
            <p class="text-sm leading-none font-medium">
              {{ fullName }}
            </p>
            <p class="text-muted-foreground text-xs leading-none">
              {{ user?.email || '' }}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="navigateTo('/my-account/profile')">
          <UserIcon class="mr-2 h-4 w-4" />
          <span>My Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem @click="navigateTo('/my-account/addresses')">
          <MapPinIcon class="mr-2 h-4 w-4" />
          <span>Addresses</span>
        </DropdownMenuItem>
        <DropdownMenuItem @click="navigateTo('/my-account/orders')">
          <BoxIcon class="mr-2 h-4 w-4" />
          <span>Orders</span>
        </DropdownMenuItem>
        <DropdownMenuItem @click="navigateTo('/my-account/wishlist')">
          <HeartIcon class="mr-2 h-4 w-4" />
          <span>Wishlist</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          @click="handleLogout"
          class="text-red-600 focus:text-red-600"
        >
          <LogOutIcon class="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<style scoped></style>
