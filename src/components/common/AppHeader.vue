<script setup lang="ts">
import {
  ChevronDownIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  XIcon,
} from 'lucide-vue-next'
import Button from 'primevue/button'
import { onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import FlyoutCart from '../views/cart/FlyoutCart.vue'
import UserProfileDropdown from './UserProfileDropdown.vue'

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

// Clean up timer on unmount
onUnmounted(() => {
  clearCloseTimer()
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
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
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

const onEnterMobile = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = '0'
  element.style.transition = 'height 0.3s ease-in-out'
  element.style.height = element.scrollHeight + 'px'
}

const onLeaveMobile = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = element.scrollHeight + 'px'
  element.style.transition = 'height 0.3s ease-in-out'
  element.style.height = '0'
}
</script>

<template>
  <header
    class="fixed top-0 z-50 w-full bg-white text-gray-900 shadow-md transition-all duration-300"
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
                class="text-black hover:cursor-pointer"
                aria-label="Menu"
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
            text
            plain
            aria-label="Search"
            class="!p-2"
          >
            <SearchIcon class="size-5 cursor-pointer" />
          </Button>

          <RouterLink to="/wishlist">
            <Button
              text
              plain
              aria-label="Wishlist"
              class="!p-2"
            >
              <HeartIcon class="size-5 cursor-pointer" />
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

      <!-- Menu Mobile -->
      <Transition
        @enter="onEnterMobile"
        @leave="onLeaveMobile"
      >
        <div
          v-if="isMobileMenuOpen"
          class="max-h-[calc(100vh-4.5rem)] overflow-y-auto bg-white md:hidden"
          style="overflow: hidden"
        >
          <Transition name="mobile-content">
            <div
              v-if="activeMenu"
              class="flex flex-col pb-4"
            >
              <!-- Liens simples -->
              <RouterLink
                v-for="item in navItems.filter((item) => item.type === 'link')"
                :key="item.label"
                :to="item.href!"
                @click="closeMobileMenu"
                class="block px-4 py-4 text-base font-medium text-gray-900 hover:bg-gray-50"
                active-class="text-green-600"
              >
                {{ item.label }}
              </RouterLink>

              <RouterLink
                to="/contact"
                @click="closeMobileMenu"
                class="mx-4 mt-2 block rounded-full bg-green-600 px-4 py-3 text-center font-medium text-white duration-200 hover:bg-green-600/80"
              >
                Contact us
              </RouterLink>
            </div>
          </Transition>
        </div>
      </Transition>
    </nav>
  </header>
</template>

<style scoped>
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
