import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import AdminLayout from '@/layouts/AdminLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import CheckoutLayout from '@/layouts/CheckoutLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import MyAccountLayout from '@/layouts/MyAccountLayout.vue'

// Views - Auth
import SignInPage from '@/views/auth/SignInPage.vue'
import SignUpPage from '@/views/auth/SignUpPage.vue'

// Views - Public
import HomePage from '@/views/home/HomePage.vue'
import NotFoundPage from '@/views/NotFoundPage.vue'
import ShopPage from '@/views/shop/ShopPage.vue'

// Views - Admin
import DashboardPage from '@/views/admin/DashboardPage.vue'
import ProductPage from '@/views/shop/ProductPage.vue'
import WishlistPage from '@/views/wishlist/WishlistPage.vue'

// Views - Checkout Flow
import CartPage from '@/views/cart/CartPage.vue'
import CheckoutPage from '@/views/checkout/CheckoutPage.vue'
import CompletePage from '@/views/complete/CompletePage.vue'

// Views - My Account
import AddressesPage from '@/views/my-account/AddressesPage.vue'
import OrdersPage from '@/views/my-account/OrdersPage.vue'
import ProfilePage from '@/views/my-account/ProfilePage.vue'
import MyAccountWishlistPage from '@/views/my-account/WishlistPage.vue'

const routes: RouteRecordRaw[] = [
  // ========================================
  // Routes d'authentification (AuthLayout)
  // ========================================
  {
    path: '/auth',
    component: AuthLayout,
    meta: { requiresGuest: true },
    children: [
      {
        path: 'sign-in',
        name: 'sign-in',
        component: SignInPage,
        meta: {
          title: 'Connexion',
        },
      },
      {
        path: 'sign-up',
        name: 'sign-up',
        component: SignUpPage,
        meta: {
          title: 'Inscription',
        },
      },
    ],
  },

  // Redirections pour compatibilité
  {
    path: '/sign-in',
    redirect: '/auth/sign-in',
  },
  {
    path: '/sign-up',
    redirect: '/auth/sign-up',
  },

  // ========================================
  // Routes publiques (DefaultLayout)
  // ========================================
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomePage,
        meta: {
          title: 'Accueil',
        },
      },
      {
        path: 'shop',
        name: 'shop',
        component: ShopPage,
        meta: {
          title: 'Boutique',
        },
      },
      {
        path: 'products/:slug',
        name: 'product-detail',
        component: ProductPage,
        meta: {
          title: 'Détail produit',
        },
      },
      {
        path: 'wishlist',
        name: 'wishlist',
        component: WishlistPage,
        meta: {
          title: 'Wishlist',
        },
      },
      // ========================================
      // Routes checkout flow (CheckoutLayout)
      // ========================================
      {
        path: '',
        component: CheckoutLayout,
        children: [
          {
            path: 'cart',
            name: 'cart',
            component: CartPage,
            meta: {
              title: 'Cart',
            },
          },
          {
            path: 'checkout',
            name: 'checkout',
            component: CheckoutPage,
            meta: {
              title: 'Checkout',
            },
          },
          {
            path: 'complete',
            name: 'complete',
            component: CompletePage,
            meta: {
              title: 'Order Complete',
            },
          },
        ],
      },
    ],
  },

  // ========================================
  // Routes My Account (MyAccountLayout)
  // ========================================
  {
    path: '/my-account',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        component: MyAccountLayout,
        children: [
          {
            path: '',
            redirect: '/my-account/profile',
          },
          {
            path: 'profile',
            name: 'account-profile',
            component: ProfilePage,
            meta: {
              title: 'My Account - Profile',
            },
          },
          {
            path: 'addresses',
            name: 'account-addresses',
            component: AddressesPage,
            meta: {
              title: 'My Account - Addresses',
            },
          },
          {
            path: 'orders',
            name: 'account-orders',
            component: OrdersPage,
            meta: {
              title: 'My Account - Orders',
            },
          },
          {
            path: 'wishlist',
            name: 'account-wishlist',
            component: MyAccountWishlistPage,
            meta: {
              title: 'My Account - Wishlist',
            },
          },
        ],
      },
    ],
  },

  // ========================================
  // Routes admin (AdminLayout)
  // ========================================
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard',
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: DashboardPage,
        meta: {
          title: 'Dashboard Admin',
        },
      },
    ],
  },

  // ========================================
  // Route 404 (DefaultLayout)
  // ========================================
  {
    path: '/:pathMatch(.*)*',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'not-found',
        component: NotFoundPage,
        meta: {
          title: '404 - Page non trouvée',
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Si c'est juste un changement de query params sur la même page, ne pas scroller
    if (to.path === from.path && to.name === from.name) {
      return false // ou return {} pour ne rien faire
    }

    // Si on a une position sauvegardée (bouton back/forward du navigateur)
    if (savedPosition) {
      return savedPosition
    }

    // Si on a un hash (ancre), scroller vers l'élément
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

    // Sinon, scroller en haut de la page
    return { top: 0 }
  },
})

// ========================================
// Navigation Guards
// ========================================

router.beforeEach((to, from, next) => {
  // Mise à jour du titre de la page
  const title = to.meta.title as string | undefined
  if (title) {
    document.title = `${title} - ${import.meta.env.VITE_APP_NAME || 'Vexa'}`
  }

  const token = localStorage.getItem('auth_token')
  const userStr = localStorage.getItem('auth_user')

  let isAuthenticated = false
  let isAdmin = false

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr)
      isAuthenticated = true
      isAdmin = user.role === 'admin'
    } catch {
      isAuthenticated = false
    }
  }

  // Protéger les routes admin
  if (to.meta.requiresAdmin && !isAdmin) {
    return next({ name: 'sign-in' })
  }

  // Protéger les routes authentifiées
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'sign-in' })
  }

  // Rediriger les utilisateurs connectés depuis les pages d'auth
  if (to.meta.requiresGuest && isAuthenticated) {
    if (isAdmin) {
      return next({ name: 'admin-dashboard' })
    }
    return next({ name: 'home' })
  }

  next()
})

export default router
