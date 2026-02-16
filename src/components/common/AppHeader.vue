<script setup lang="ts">
import { HeartIcon, MenuIcon, SearchIcon, XIcon } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import FlyoutCart from '../views/cart/FlyoutCart.vue'
import SearchModal from './SearchModal.vue'
import UserProfileDropdown from './UserProfileDropdown.vue'

const isSearchOpen = ref(false)

const openSearch = () => {
  isSearchOpen.value = true
}

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    isSearchOpen.value = true
  }
}

interface NavItem {
  label: string
  href: string
  pathMatch: string
}

const route = useRoute()
const isMobileMenuOpen = ref(false)

const navItems: NavItem[] = [
  { label: 'Boutique', href: '/shop', pathMatch: '/shop' },
  { label: 'Promotions', href: '/on-sale', pathMatch: '/on-sale' },
  { label: 'Nouveautés', href: '/new-arrivals', pathMatch: '/new-arrivals' },
  { label: 'Marques', href: '/brands', pathMatch: '/brands' },
]

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
  },
)

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('keydown', handleGlobalKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

const onEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = '0'
  element.style.transition = 'height 0.3s ease-in-out'
  element.style.height = element.scrollHeight + 'px'
}

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = element.scrollHeight + 'px'
  element.style.transition = 'height 0.3s ease-in-out'
  element.style.height = '0'
}
</script>

<template>
  <header
    class="bg-noir/95 border-border-noir fixed top-0 right-0 left-0 z-40 border-b backdrop-blur-md"
  >
    <nav class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <div class="flex items-center gap-2">
        <button
          @click="toggleMobileMenu"
          class="hover:text-gold text-[#555] md:hidden"
          :aria-label="isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
        >
          <XIcon
            v-if="isMobileMenuOpen"
            class="size-5"
          />
          <MenuIcon
            v-else
            class="size-5"
          />
        </button>

        <RouterLink
          to="/"
          class="font-display text-gold text-xl font-light tracking-[0.2em] uppercase"
        >
          Vexa
        </RouterLink>
      </div>

      <div class="hidden items-center gap-10 md:flex">
        <RouterLink
          v-for="item in navItems"
          :key="item.href"
          :to="item.href"
          class="hover:text-gold text-xs tracking-[0.15em] text-[#555] uppercase transition-colors"
          :class="{ 'text-gold': route.path.startsWith(item.pathMatch) }"
        >
          {{ item.label }}
        </RouterLink>
      </div>

      <div class="flex items-center gap-3">
        <button
          variant="ghost"
          size="icon"
          aria-label="Search"
          class="hover:text-gold p-2 text-[#555] transition-colors"
          @click="openSearch"
        >
          <SearchIcon class="size-5" />
        </button>

        <RouterLink
          to="/wishlist"
          class="hover:text-gold p-2 text-[#555] transition-colors"
        >
          <HeartIcon class="size-5" />
        </RouterLink>

        <FlyoutCart />

        <UserProfileDropdown />
      </div>
    </nav>

    <Transition
      @enter="onEnter"
      @leave="onLeave"
    >
      <div
        v-if="isMobileMenuOpen"
        class="bg-noir border-border-noir border-t px-6 py-6 md:hidden"
        style="overflow: hidden"
      >
        <nav class="flex flex-col gap-4">
          <RouterLink
            v-for="item in navItems"
            :key="item.href"
            :to="item.href"
            @click="closeMobileMenu"
            class="hover:text-gold text-xs tracking-[0.15em] text-[#555] uppercase transition-colors"
            :class="{ 'text-gold': route.path.startsWith(item.pathMatch) }"
          >
            {{ item.label }}
          </RouterLink>
          <div class="bg-border-noir my-4 h-px w-full" />
          <RouterLink
            to="/contact"
            @click="closeMobileMenu"
            class="border-gold/40 text-gold hover:bg-gold hover:text-noir border px-5 py-3 text-center text-xs tracking-[0.2em] uppercase transition-all"
          >
            Contact
          </RouterLink>
        </nav>
      </div>
    </Transition>

    <SearchModal v-model:open="isSearchOpen" />
  </header>
</template>
