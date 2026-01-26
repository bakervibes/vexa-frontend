import { getUser } from '@/lib/auth-client'
import { UserRole } from '@/types/models'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import AdminLayout from '@/layouts/AdminLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import CheckoutLayout from '@/layouts/CheckoutLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import MyAccountLayout from '@/layouts/MyAccountLayout.vue'

// Views - Auth
import ForgotPasswordPage from '@/views/auth/ForgotPasswordPage.vue'
import ResetPasswordPage from '@/views/auth/ResetPasswordPage.vue'
import SignInPage from '@/views/auth/SignInPage.vue'
import SignUpPage from '@/views/auth/SignUpPage.vue'

// Views - Public
// Views - Public
import HomePage from '@/views/home/HomePage.vue'
import NotFoundPage from '@/views/NotFoundPage.vue'
import AboutPage from '@/views/pages/AboutPage.vue'
import FAQPage from '@/views/pages/FAQPage.vue'
import LegalPage from '@/views/pages/LegalPage.vue'
import PrivacyPage from '@/views/pages/PrivacyPage.vue'
import TermsPage from '@/views/pages/TermsPage.vue'
import ShopPage from '@/views/shop/ShopPage.vue'

// Views - Admin
import AdminAttributesPage from '@/views/admin/attributes/AttributesPage.vue'
import AdminCategoriesPage from '@/views/admin/categories/CategoriesPage.vue'
import AdminCouponsPage from '@/views/admin/coupons/CouponsPage.vue'
import AdminCustomerDetailPage from '@/views/admin/customers/CustomerDetailPage.vue'
import AdminCustomersPage from '@/views/admin/customers/CustomersPage.vue'
import DashboardPage from '@/views/admin/DashboardPage.vue'
import AdminNewsletterPage from '@/views/admin/newsletter/NewsletterPage.vue'
import AdminNotificationsPage from '@/views/admin/notifications/NotificationsPage.vue'
import AdminOrderDetailPage from '@/views/admin/orders/OrderDetailPage.vue'
import AdminOrdersPage from '@/views/admin/orders/OrdersPage.vue'
import AdminProductCreatePage from '@/views/admin/products/ProductCreatePage.vue'
import AdminProductEditPage from '@/views/admin/products/ProductEditPage.vue'
import AdminProductsPage from '@/views/admin/products/ProductsPage.vue'
import AdminRefundsPage from '@/views/admin/refunds/RefundsPage.vue'
import AdminReportsPage from '@/views/admin/reports/ReportsPage.vue'
import AdminSettingsPage from '@/views/admin/settings/SettingsPage.vue'
import AdminShippingPage from '@/views/admin/shipping/ShippingPage.vue'
import AdminStockPage from '@/views/admin/stock/StockPage.vue'

// Views - Shop
import SearchPage from '@/views/search/SearchPage.vue'
import ProductPage from '@/views/shop/ProductPage.vue'
import WishlistPage from '@/views/wishlist/WishlistPage.vue'

// Views - Checkout Flow
import CartPage from '@/views/cart/CartPage.vue'
import CheckoutPage from '@/views/checkout/CheckoutPage.vue'
import CompletePage from '@/views/complete/CompletePage.vue'

// Views - My Account
import ContactPage from '@/views/contact/ContactPage.vue'
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
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: ForgotPasswordPage,
        meta: {
          title: 'Mot de passe oublié',
        },
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: ResetPasswordPage,
        meta: {
          title: 'Réinitialisation du mot de passe',
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
  {
    path: '/login',
    redirect: '/auth/sign-in',
  },
  {
    path: '/register',
    redirect: '/auth/sign-up',
  },
  {
    path: '/auth/login',
    redirect: '/auth/sign-in',
  },
  {
    path: '/auth/register',
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
      {
        path: 'search',
        name: 'search',
        component: SearchPage,
        meta: {
          title: 'Recherche',
        },
      },

      {
        path: 'contact',
        name: 'contact',
        component: ContactPage,
        meta: {
          title: 'Contact',
        },
      },
      {
        path: 'about',
        name: 'about',
        component: AboutPage,
        meta: {
          title: 'À propos',
        },
      },
      {
        path: 'terms-and-conditions',
        name: 'terms-and-conditions',
        component: TermsPage,
        meta: {
          title: 'CGV',
        },
      },
      {
        path: 'privacy-policy',
        name: 'privacy-policy',
        component: PrivacyPage,
        meta: {
          title: 'Politique de confidentialité',
        },
      },
      {
        path: 'legal',
        name: 'legal',
        component: LegalPage,
        meta: {
          title: 'Mentions légales',
        },
      },
      {
        path: 'faq',
        name: 'faq',
        component: FAQPage,
        meta: {
          title: 'FAQ',
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
              // Auth is handled by the page itself via openAuthModal on submit
            },
          },
          {
            path: 'complete',
            name: 'complete',
            component: CompletePage,
            meta: {
              title: 'Order Complete',
              requiresAuth: true,
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
          title: 'Dashboard',
        },
      },
      // Products
      {
        path: 'products',
        name: 'admin-products',
        component: AdminProductsPage,
        meta: {
          title: 'Produits',
        },
      },
      {
        path: 'products/create',
        name: 'admin-product-create',
        component: AdminProductCreatePage,
        meta: {
          title: 'Nouveau Produit',
        },
      },
      {
        path: 'products/:id/edit',
        name: 'admin-product-edit',
        component: AdminProductEditPage,
        meta: {
          title: 'Modifier Produit',
        },
      },
      // Categories
      {
        path: 'categories',
        name: 'admin-categories',
        component: AdminCategoriesPage,
        meta: {
          title: 'Catégories',
        },
      },
      // Attributes
      {
        path: 'attributes',
        name: 'admin-attributes',
        component: AdminAttributesPage,
        meta: {
          title: 'Attributs',
        },
      },
      // Orders
      {
        path: 'orders',
        name: 'admin-orders',
        component: AdminOrdersPage,
        meta: {
          title: 'Commandes',
        },
      },
      {
        path: 'orders/:id',
        name: 'admin-order-detail',
        component: AdminOrderDetailPage,
        meta: {
          title: 'Détail Commande',
        },
      },
      // Customers
      {
        path: 'customers',
        name: 'admin-customers',
        component: AdminCustomersPage,
        meta: {
          title: 'Clients',
        },
      },
      {
        path: 'customers/:id',
        name: 'admin-customer-detail',
        component: AdminCustomerDetailPage,
        meta: {
          title: 'Détail Client',
        },
      },
      // Coupons
      {
        path: 'coupons',
        name: 'admin-coupons',
        component: AdminCouponsPage,
        meta: {
          title: 'Coupons',
        },
      },
      // Newsletter
      {
        path: 'newsletter',
        name: 'admin-newsletter',
        component: AdminNewsletterPage,
        meta: {
          title: 'Newsletter',
        },
      },
      // Reports
      {
        path: 'reports',
        name: 'admin-reports',
        component: AdminReportsPage,
        meta: {
          title: 'Rapports',
        },
      },
      // Settings
      {
        path: 'settings',
        name: 'admin-settings',
        component: AdminSettingsPage,
        meta: {
          title: 'Paramètres',
        },
      },
      // Stock
      {
        path: 'stock',
        name: 'admin-stock',
        component: AdminStockPage,
        meta: {
          title: 'Gestion des stocks',
        },
      },
      // Shipping
      {
        path: 'shipping',
        name: 'admin-shipping',
        component: AdminShippingPage,
        meta: {
          title: 'Livraison',
        },
      },
      // Notifications
      {
        path: 'notifications',
        name: 'admin-notifications',
        component: AdminNotificationsPage,
        meta: {
          title: 'Notifications',
        },
      },
      // Refunds
      {
        path: 'refunds',
        name: 'admin-refunds',
        component: AdminRefundsPage,
        meta: {
          title: 'Remboursements',
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

router.beforeEach(async (to, _from, next) => {
  // Mise à jour du titre de la page
  const title = to.meta.title as string | undefined
  if (title) {
    document.title = `${title} - ${import.meta.env.VITE_APP_NAME || 'Vexa'}`
  }

  // Vérifier l'authentification via better-auth (session cookies)
  const user = await getUser()
  const isAuthenticated = !!user
  const isAdmin = user?.role === UserRole.ADMIN

  // Protéger les routes admin
  if (to.meta.requiresAdmin && !isAdmin) {
    return next({ name: 'sign-in', query: { redirect: to.fullPath } })
  }

  // Protéger les routes authentifiées
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'sign-in', query: { redirect: to.fullPath } })
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
