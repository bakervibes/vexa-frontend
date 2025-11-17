<script setup lang="ts">
import { Input } from '@/components/ui/input'
import {
  ChevronDownIcon,
  MenuIcon,
  SearchIcon,
  ShoppingCartIcon,
  UserIcon,
  XIcon,
} from 'lucide-vue-next'
import { computed, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

type MenuType = 'shop' | 'domaines' | 'search' | null

interface NavItem {
  label: string
  type: 'link' | 'menu'
  href?: string
  menuType?: 'shop' | 'domaines' | 'search'
  pathMatch?: string
}

const route = useRoute()
const activeMenu = ref<MenuType>(null)
const isMobileMenuOpen = ref(false)
const closeTimer = ref<number | null>(null)

const navItems: NavItem[] = [
  {
    label: 'Shop',
    type: 'menu',
    menuType: 'shop',
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

const isActiveLink = (pathMatch?: string) => {
  if (!pathMatch) return false
  if (route.path === '/') return pathMatch === '/'
  return route.path.startsWith(pathMatch)
}

// Timer pour fermer automatiquement après 1 minute
const startCloseTimer = () => {
  clearCloseTimer()
  closeTimer.value = window.setTimeout(() => {
    activeMenu.value = null
  }, 500) // 1 seconds
}

const clearCloseTimer = () => {
  if (closeTimer.value !== null) {
    window.clearTimeout(closeTimer.value)
    closeTimer.value = null
  }
}

// Gérer le hover sur les menus
const handleMenuEnter = (menu: MenuType) => {
  clearCloseTimer()
  activeMenu.value = menu
}

const handleMenuLeave = () => {
  startCloseTimer()
}

// Gérer le hover sur les liens simples
const handleLinkHover = () => {
  activeMenu.value = null
  clearCloseTimer()
}

// Gérer le hover sur le dropdown
const handleDropdownEnter = () => {
  clearCloseTimer()
}

// Gérer le leave du dropdown
const handleDropdownLeave = () => {
  startCloseTimer()
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Nettoyer le timer au démontage
onUnmounted(() => {
  clearCloseTimer()
})

// Fermer le menu mobile au changement de route
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
    activeMenu.value = null
    clearCloseTimer()
  },
)

// Classes pour la transition de hauteur
const headerClasses = computed(() => ({
  'fixed top-0 left-0 z-50 w-full bg-white text-gray-900 shadow-md transition-all duration-300': true,
  'lg:bg-white/95': activeMenu.value === null,
  'lg:bg-white': activeMenu.value !== null,
}))

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
  <header :class="headerClasses">
    <nav
      aria-label="Navigation principale"
      class="mx-auto max-w-7xl"
    >
      <!-- Barre de navigation principale -->
      <div
        class="z-40 flex h-14 w-full items-center justify-between px-4 transition-all duration-300 sm:h-18 sm:px-6"
      >
        <div class="flex h-full w-full flex-1 items-center gap-6">
          <!-- Logo -->
          <RouterLink
            to="/"
            class="relative h-12 w-auto shrink-0 transition-all duration-300 sm:h-15"
          >
            <img
              src="/logo.jpg"
              alt="Logo"
              class="h-full w-full object-contain"
            />
          </RouterLink>

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
                :class="[
                  'cursor-pointer text-sm whitespace-nowrap',
                  { 'text-green-600': isActiveLink(item.pathMatch) },
                ]"
                @mouseenter="handleLinkHover"
              >
                {{ item.label }}
              </RouterLink>

              <!-- Menu déroulant -->
              <div
                v-else
                @mouseenter="handleMenuEnter(item.menuType!)"
                @mouseleave="handleMenuLeave"
                :class="[
                  'flex cursor-pointer items-center gap-1 text-sm whitespace-nowrap',
                  { 'text-green-600': isActiveLink(item.pathMatch) },
                ]"
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

            <!-- La barre de recherche prend tout l'espace restant -->
            <div class="relative flex w-full flex-1 items-center">
              <SearchIcon
                class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-600"
              />
              <Input
                placeholder="Search"
                class="h-10 w-full rounded-full px-9 py-2"
              />
            </div>

            <div class="flex shrink-0 items-center gap-6">
              <ShoppingCartIcon class="size-5 cursor-pointer" />
              <UserIcon class="size-5 cursor-pointer" />
            </div>
          </ul>
        </div>

        <div class="flex items-center justify-end md:hidden">
          <button
            @click="toggleMobileMenu"
            class="p-2 text-black"
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
              <!-- Contenu Présentation -->
              <div v-if="activeMenu === 'shop'">
                <p class="text-sm text-gray-600">
                  Contenu du menu Présentation
                </p>
              </div>

              <!-- Contenu Domaines -->
              <div v-if="activeMenu === 'domaines'">
                <p class="text-sm text-gray-600">
                  Contenu du menu Domaines d'activité
                </p>
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
                :class="[
                  'block px-4 py-4 text-base font-medium hover:bg-gray-50',
                  isActiveLink(item.pathMatch)
                    ? 'text-green-600'
                    : 'text-gray-900',
                ]"
              >
                {{ item.label }}
              </RouterLink>

              <RouterLink
                to="/contact"
                @click="closeMobileMenu"
                class="mx-4 mt-2 block rounded-full bg-green-600 px-4 py-3 text-center font-medium text-white duration-200 hover:bg-green-600/80"
              >
                Contactez-nous
              </RouterLink>
            </div>
          </Transition>
        </div>
      </Transition>
    </nav>
  </header>
</template>

<style scoped>
/* Transition pour le contenu du menu desktop */
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

/* Transition pour le contenu du menu mobile */
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
