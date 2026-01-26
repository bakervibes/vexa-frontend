<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  ChevronDownIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  XIcon,
} from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import FlyoutCart from '../views/cart/FlyoutCart.vue'
import SearchModal from './SearchModal.vue'
import UserProfileDropdown from './UserProfileDropdown.vue'

const isSearchOpen = ref(false)

const openSearch = () => {
  isSearchOpen.value = true
}

// Handle Cmd+K / Ctrl+K keyboard shortcut
const handleGlobalKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    isSearchOpen.value = true
  }
}

type MenuType = 'shop' | 'search' | null

interface NavItem {
  label: string
  type: 'link' | 'menu'
  href?: string
  menuType?: 'shop' | 'search'
  pathMatch?: string
}

const route = useRoute()
const activeMenu = ref<MenuType>(null)
const isMobileMenuOpen = ref(false)
const closeTimer = ref<number | null>(null)
const atTop = ref(true)
const isMenuHovered = ref(false)

const navItems: NavItem[] = [
  {
    label: 'Shop',
    type: 'link',
    href: '/shop',
    pathMatch: '/shop',
  },
  {
    label: 'On sale',
    type: 'link',
    href: '/on-sale',
    pathMatch: '/on-sale',
  },
  {
    label: 'New arrivals',
    type: 'link',
    href: '/new-arrivals',
    pathMatch: '/new-arrivals',
  },
  {
    label: 'Brands',
    type: 'link',
    href: '/brands',
    pathMatch: '/brands',
  },
]

// Timer to automatically close after 1 second
const startCloseTimer = () => {
  clearCloseTimer()
  closeTimer.value = window.setTimeout(() => {
    activeMenu.value = null
    isMenuHovered.value = false
  }, 500)
}

const clearCloseTimer = () => {
  if (closeTimer.value !== null) {
    window.clearTimeout(closeTimer.value)
    closeTimer.value = null
  }
}

// Handle hover on menus
const handleMenuEnter = (menu: MenuType) => {
  clearCloseTimer()
  activeMenu.value = menu
  isMenuHovered.value = true
}

const handleMenuLeave = () => {
  startCloseTimer()
  isMenuHovered.value = false
}

// Handle hover on simple links
const handleLinkHover = () => {
  activeMenu.value = null
  clearCloseTimer()
  isMenuHovered.value = false
}

// Handle hover on dropdown
const handleDropdownEnter = () => {
  clearCloseTimer()
  isMenuHovered.value = true
}

// Handle leave on dropdown
const handleDropdownLeave = () => {
  startCloseTimer()
  isMenuHovered.value = false
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Handle Escape key to close mobile menu
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

// Clean up timer on unmount
onUnmounted(() => {
  clearCloseTimer()
  document.removeEventListener('keydown', handleKeydown)
})

// Close mobile menu on route change
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
    activeMenu.value = null
    clearCloseTimer()
    isMenuHovered.value = false
  },
)

// Header transparency logic
const handleScroll = () => {
  atTop.value = window.scrollY < 5
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('keydown', handleGlobalKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('keydown', handleGlobalKeydown)
})

const onEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = '0'
  element.style.transition = 'height 0.4s ease-in-out'
  element.style.height = element.scrollHeight + 'px'
}

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = element.scrollHeight + 'px'
  element.style.transition = 'height 0.4s ease-in-out'
  element.style.height = '0'
}

const _onEnterMobile = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = '0'
  element.style.transition = 'height 0.3s ease-in-out'
  element.style.height = element.scrollHeight + 'px'
}

const _onLeaveMobile = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = element.scrollHeight + 'px'
  element.style.transition = 'height 0.3s ease-in-out'
  element.style.height = '0'
}
</script>

<template>
  <header
    class="fixed top-0 z-50 w-full bg-white text-gray-900 shadow-md transition-all duration-300 dark:bg-gray-900 dark:text-gray-100"
  >
    <nav
      aria-label="Main navigation"
      class="mx-auto max-w-7xl"
    >
      <!-- Main navigation bar -->
      <div
        class="z-40 flex h-16 w-full items-center justify-between px-4 transition-all duration-300 sm:h-18 sm:px-6"
      >
        <div class="flex h-full w-full flex-1 items-center gap-6">
          <div class="flex items-center gap-2">
            <div class="flex items-center justify-end md:hidden">
              <button
                @click="toggleMobileMenu"
                class="text-black hover:cursor-pointer dark:text-white"
                :aria-label="
                  isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'
                "
                :aria-expanded="isMobileMenuOpen"
                aria-controls="mobile-menu"
              >
                <XIcon
                  v-if="isMobileMenuOpen"
                  class="size-6"
                />
                <MenuIcon
                  v-else
                  class="size-6"
                />
              </button>
            </div>

            <!-- Logo -->
            <RouterLink
              to="/"
              class="relative h-10 w-auto shrink-0 transition-all duration-300 sm:h-12"
            >
              <img
                src="/logo.jpg"
                alt="Logo"
                class="h-full w-full object-contain"
              />
            </RouterLink>
          </div>

          <!-- Desktop Navigation -->
          <ul
            class="hidden h-full w-full flex-1 items-center gap-6 md:flex lg:gap-10"
          >
            <li
              v-for="item in navItems"
              :key="item.label"
              class="relative flex h-full items-center"
            >
              <!-- Lien simple -->
              <RouterLink
                v-if="item.type === 'link'"
                :to="item.href!"
                class="cursor-pointer text-sm whitespace-nowrap"
                active-class="text-green-600"
                @mouseenter="handleLinkHover"
              >
                {{ item.label }}
              </RouterLink>

              <!-- Menu déroulant -->
              <div
                v-else
                @mouseenter="handleMenuEnter(item.menuType!)"
                @mouseleave="handleMenuLeave"
                class="flex cursor-pointer items-center gap-1 text-sm whitespace-nowrap"
                active-class="text-green-600"
              >
                <span>{{ item.label }}</span>
                <ChevronDownIcon
                  :class="[
                    'size-3 duration-300',
                    { 'rotate-180': activeMenu === item.menuType },
                  ]"
                />
              </div>
            </li>
          </ul>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            class="p-2"
            @click="openSearch"
          >
            <SearchIcon class="size-5" />
          </Button>

          <RouterLink to="/wishlist">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Wishlist"
              class="p-2"
            >
              <HeartIcon class="size-5" />
            </Button>
          </RouterLink>

          <FlyoutCart />

          <UserProfileDropdown />
        </div>
      </div>

      <!-- Menu Desktop - DIV COMMUNE avec contenu dynamique -->
      <Transition
        @enter="onEnter"
        @leave="onLeave"
      >
        <div
          v-if="activeMenu"
          class="z-40 hidden max-h-[calc(80vh-6rem)] overflow-y-auto md:block"
          style="overflow: hidden"
          @mouseenter="handleDropdownEnter"
          @mouseleave="handleDropdownLeave"
        >
          <Transition
            name="content-fade"
            mode="out-in"
          >
            <div
              :key="activeMenu"
              class="w-full px-8 py-6"
            >
              <!-- Shop menu content -->
              <div v-if="activeMenu === 'shop'">
                <p class="text-sm text-gray-600">Shop menu content</p>
              </div>

              <!-- Search menu content -->
              <div v-if="activeMenu === 'search'">
                <p class="text-sm text-gray-600">Search menu content</p>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>

      <!-- Mobile Menu Overlay -->
      <Transition name="fade">
        <div
          v-if="isMobileMenuOpen"
          class="fixed inset-0 z-40 bg-black/50 md:hidden"
          @click="closeMobileMenu"
          aria-hidden="true"
        />
      </Transition>

      <!-- Menu Mobile (Slide-in Drawer) -->
      <Transition name="slide-in">
        <div
          v-if="isMobileMenuOpen"
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
          class="fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-72 overflow-y-auto bg-white shadow-xl md:hidden dark:bg-gray-900"
        >
          <nav
            class="flex flex-col py-4"
            role="navigation"
            aria-label="Menu mobile"
          >
            <!-- Liens de navigation -->
            <RouterLink
              v-for="item in navItems.filter((i) => i.type === 'link')"
              :key="item.label"
              :to="item.href!"
              @click="closeMobileMenu"
              class="block px-6 py-4 text-base font-medium text-gray-900 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
              active-class="text-green-600 bg-green-50 dark:bg-green-900/20"
            >
              {{ item.label }}
            </RouterLink>

            <hr class="my-4 border-gray-200 dark:border-gray-700" />

            <RouterLink
              to="/contact"
              @click="closeMobileMenu"
              class="mx-4 block rounded-full bg-green-600 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-green-700"
            >
              Contact us
            </RouterLink>
          </nav>
        </div>
      </Transition>
    </nav>

    <!-- Search Modal -->
    <SearchModal v-model:open="isSearchOpen" />
  </header>
</template>

<style scoped>
/* Fade transition for overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide-in transition for mobile drawer */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: transform 0.3s ease;
}

.slide-in-enter-from,
.slide-in-leave-to {
  transform: translateX(-100%);
}

/* Transition for desktop menu content */
.content-fade-enter-active {
  transition:
    opacity 0.3s ease-out 0.1s,
    transform 0.3s ease-out 0.1s;
}

.content-fade-leave-active {
  transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out;
}

.content-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.content-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Transition for mobile menu content */
.mobile-content-enter-active {
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
}

.mobile-content-leave-active {
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
}

.mobile-content-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.mobile-content-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
