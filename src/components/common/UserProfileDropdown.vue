<script setup lang="ts">
import { useAuthModal } from '@/composables/useAuthModal'
import { useAuthStore } from '@/stores/auth'
import { UserIcon } from 'lucide-vue-next'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const { openAuthModal } = useAuthModal()
const menu = ref()

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

const toggleMenu = (event: Event) => {
  menu.value.toggle(event)
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

const navigateTo = (path: string) => {
  router.push(path)
}

const menuItems = computed(() => [
  {
    label: authStore.user?.name || 'User',
    items: [
      {
        label: authStore.user?.email || '',
        disabled: true,
        class: 'text-xs text-gray-500',
      },
    ],
  },
  {
    separator: true,
  },
  {
    label: 'My Account',
    icon: 'pi pi-user',
    command: () => navigateTo('/my-account/profile'),
  },
  {
    label: 'Addresses',
    icon: 'pi pi-map-marker',
    command: () => navigateTo('/my-account/addresses'),
  },
  {
    label: 'Orders',
    icon: 'pi pi-box',
    command: () => navigateTo('/my-account/orders'),
  },
  {
    label: 'Wishlist',
    icon: 'pi pi-heart',
    command: () => navigateTo('/my-account/wishlist'),
  },
  {
    separator: true,
  },
  {
    label: 'Log out',
    icon: 'pi pi-sign-out',
    command: handleLogout,
    class: 'text-red-600',
  },
])
</script>

<template>
  <!-- Not authenticated: show clickable avatar that opens auth modal -->
  <Button
    v-if="!authStore.isAuthenticated"
    text
    plain
    @click="handleAvatarClick"
    class="!p-2"
    aria-label="Sign in"
  >
    <UserIcon class="size-5 cursor-pointer" />
  </Button>

  <!-- Authenticated: show dropdown with user info -->
  <div v-else>
    <Button
      text
      plain
      @click="toggleMenu"
      class="!p-2"
      aria-label="User menu"
    >
      <Avatar
        v-if="authStore.user?.image"
        :image="authStore.user.image"
        :label="userInitials"
        shape="circle"
        size="normal"
        class="cursor-pointer"
      />
      <Avatar
        v-else
        :label="userInitials"
        shape="circle"
        size="normal"
        class="cursor-pointer bg-green-600 text-white"
      />
    </Button>

    <Menu
      ref="menu"
      :model="menuItems"
      :popup="true"
      class="w-56"
    />
  </div>
</template>

<style scoped></style>
