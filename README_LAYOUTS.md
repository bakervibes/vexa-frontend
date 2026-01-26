# 🎯 Guide d'utilisation - Layouts et Authentification

## 🚀 Démarrage rapide

Votre projet est maintenant organisé avec une architecture professionnelle basée sur des **layouts** et un système d'authentification fonctionnel.

---

## 📁 Structure simplifiée

```
src/
├── layouts/          # 3 layouts : Auth, Default, Admin
├── views/           # Pages organisées par contexte
├── components/      # Composants réutilisables (common, auth, admin, ui)
├── stores/          # Gestion d'état avec Pinia (auth.ts)
└── router/          # Configuration des routes avec protection
```

---

## 🧪 Tester l'authentification

### 1. **Connexion simple (utilisateur normal)**

Allez sur `/auth/sign-in` et utilisez :

- **Email** : `user@example.com`
- **Mot de passe** : n'importe quoi

➡️ Vous serez redirigé vers la **page d'accueil** avec le layout par défaut (header + footer)

### 2. **Connexion admin**

Allez sur `/auth/sign-in` et utilisez :

- **Email** : `admin@example.com` (doit contenir "admin")
- **Mot de passe** : n'importe quoi

➡️ Vous serez redirigé vers le **dashboard admin** avec la sidebar et le layout admin

### 3. **Inscription**

Allez sur `/auth/sign-up` et créez un compte
➡️ Vous serez automatiquement connecté et redirigé vers l'accueil

---

## 🎨 Les 3 Layouts

### 1. AuthLayout (Authentification)

- **Routes** : `/auth/sign-in`, `/auth/sign-up`
- **Design** : Centré, fond clair, minimaliste
- **Pas de** : Header ni footer

### 2. DefaultLayout (Utilisateur)

- **Routes** : `/`, `/shop`, etc.
- **Design** : Header de navigation + contenu + footer
- **Pour** : Toutes les pages publiques/utilisateur

### 3. AdminLayout (Administration)

- **Routes** : `/admin/*`
- **Design** : Sidebar + header admin + contenu
- **Protection** : Réservé aux utilisateurs avec le rôle "admin"

---

## 🔐 Système d'authentification

### Store Pinia (`stores/auth.ts`)

Le store gère :

- ✅ État de connexion (user, token, isAuthenticated)
- ✅ Actions : `login()`, `register()`, `logout()`
- ✅ Persistance dans localStorage
- ✅ Vérification du rôle (user/admin)

### Utilisation dans un composant

```vue
<script setup lang="ts">
import { useAuth } from '@/stores/auth'

const authStore = useAuth()

// Vérifier l'authentification
console.log(authStore.isAuthenticated) // true/false
console.log(authStore.isAdmin) // true/false
console.log(authStore.userName) // "John Doe"

// Se connecter
const handleLogin = async () => {
  const result = await authStore.login({
    email: 'user@example.com',
    password: 'password123',
  })

  if (result.success) {
    router.push('/')
  }
}

// Se déconnecter
const handleLogout = async () => {
  await authStore.logout()
  router.push('/auth/sign-in')
}
</script>
```

### Protection des routes

Les routes sont protégées automatiquement via les **navigation guards** dans `router/index.ts` :

```typescript
{
  path: '/admin/dashboard',
  meta: {
    requiresAuth: true,    // Nécessite d'être connecté
    requiresAdmin: true,   // Nécessite le rôle admin
  }
}
```

---

## 📝 Ajouter de nouvelles pages

### Page publique (avec DefaultLayout)

1. **Créer la page** :

```vue
<!-- src/views/about/AboutPage.vue -->
<script setup lang="ts">
// Votre logique
</script>

<template>
  <div class="container mx-auto py-12">
    <h1>À propos</h1>
  </div>
</template>
```

2. **Ajouter la route** dans `router/index.ts` :

```typescript
{
  path: '/',
  component: DefaultLayout,
  children: [
    // ... autres routes
    {
      path: 'about',
      name: 'about',
      component: () => import('@/views/about/AboutPage.vue'),
      meta: { title: 'À propos' }
    }
  ]
}
```

### Page admin (avec AdminLayout)

1. **Créer la page** :

```vue
<!-- src/views/admin/UsersPage.vue -->
<script setup lang="ts">
// Gestion des utilisateurs
</script>

<template>
  <div>
    <h2 class="mb-6 text-2xl font-bold">Gestion des utilisateurs</h2>
    <!-- Contenu de la page -->
  </div>
</template>
```

2. **Ajouter la route** dans le groupe admin :

```typescript
{
  path: '/admin',
  component: AdminLayout,
  children: [
    // ... autres routes
    {
      path: 'users',
      name: 'admin-users',
      component: () => import('@/views/admin/UsersPage.vue'),
      meta: {
        title: 'Utilisateurs',
        requiresAuth: true,
        requiresAdmin: true
      }
    }
  ]
}
```

3. **Ajouter le lien dans la sidebar** (`layouts/AdminLayout.vue`) :

```vue
<RouterLink to="/admin/users" class="block px-4 py-3 hover:bg-gray-800">
  <span v-if="isSidebarOpen">👥 Utilisateurs</span>
  <span v-else>👥</span>
</RouterLink>
```

---

## 🔧 Connecter à une vraie API

### 1. Créer un service API

```typescript
// src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

// Ajouter le token automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

### 2. Mettre à jour le store

```typescript
// Dans stores/auth.ts
import api from '@/services/api'

async function login(credentials: LoginCredentials) {
  isLoading.value = true
  error.value = null

  try {
    // Remplacer le mock par un vrai appel API
    const response = await api.post('/auth/login', credentials)

    user.value = response.data.user
    token.value = response.data.token

    localStorage.setItem('auth_token', token.value)
    localStorage.setItem('auth_user', JSON.stringify(user.value))

    return { success: true }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la connexion'
    return { success: false, error: error.value }
  } finally {
    isLoading.value = false
  }
}
```

---

## 🎓 Concepts importants

### 1. **Layout vs Page vs Component**

- **Layout** : Structure globale (header, sidebar, footer)
  - Exemple : `AuthLayout.vue`, `DefaultLayout.vue`
- **Page** : Contenu d'une route spécifique
  - Exemple : `HomePage.vue`, `SignInPage.vue`
  - Suffixe : toujours `*Page.vue`
- **Component** : Élément réutilisable
  - Exemple : `SignInForm.vue`, `ProductCard.vue`

### 2. **Routes imbriquées (Nested Routes)**

```typescript
{
  path: '/admin',           // Parent
  component: AdminLayout,   // Layout parent
  children: [
    {
      path: 'dashboard',    // Devient /admin/dashboard
      component: DashboardPage
    }
  ]
}
```

Le `<RouterView />` dans `AdminLayout` affichera `DashboardPage`.

### 3. **Navigation Guards**

Ce sont des fonctions qui s'exécutent avant chaque changement de route :

```typescript
router.beforeEach((to, from, next) => {
  // Vérifications avant de naviguer
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'sign-in' }) // Rediriger
  }

  next() // Autoriser la navigation
})
```

### 4. **Pinia Store**

Alternative moderne à Vuex pour la gestion d'état :

```typescript
export const useAuth = defineStore('auth', () => {
  const user = ref(null) // State
  const isAuthenticated = computed(() => !!user.value) // Getter

  function login() {
    /* ... */
  } // Action

  return { user, isAuthenticated, login }
})
```

---

## 🚀 Prochaines étapes

### À court terme :

1. ✅ Tester les 3 layouts en naviguant dans l'app
2. ✅ Essayer la connexion/inscription/déconnexion
3. ✅ Ajouter vos propres pages

### À moyen terme :

1. 🔄 Connecter le store à votre vraie API backend
2. 🔄 Ajouter la gestion des tokens JWT (expiration, refresh)
3. 🔄 Créer plus de pages admin (produits, commandes, etc.)

### À long terme :

1. 📊 Ajouter des graphiques au dashboard admin
2. 🔔 Système de notifications
3. 🌍 Internationalisation (i18n)

---

## 📚 Ressources

- [Vue 3 Documentation](https://vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Documentation détaillée du projet

---

## ❓ FAQ

**Q: Comment tester en tant qu'admin ?**
R: Utilisez un email contenant "admin" lors de la connexion (ex: `admin@example.com`)

**Q: Où sont stockées les données de connexion ?**
R: Dans le localStorage (clés `auth_token` et `auth_user`)

**Q: Comment ajouter un nouveau rôle (ex: "moderator") ?**
R:

1. Modifier le type `User` dans `stores/auth.ts` : `role: 'user' | 'admin' | 'moderator'`
2. Ajouter les vérifications dans le router guard
3. Créer un layout spécifique si nécessaire

**Q: Puis-je avoir plusieurs layouts sur la même route ?**
R: Non, mais vous pouvez créer des composants réutilisables et les composer.

---

**Bon apprentissage ! 🎓**
