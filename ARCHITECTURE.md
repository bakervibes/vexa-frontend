# 📐 Architecture du Projet Vexa

## Vue d'ensemble

Ce projet utilise Vue 3 avec une architecture basée sur des **layouts** pour gérer différents contextes d'affichage (authentification, utilisateur, admin).

---

## 🗂️ Structure des dossiers

```
src/
├── layouts/              # Layouts de l'application
│   ├── AuthLayout.vue       # Layout pour authentification (minimal)
│   ├── DefaultLayout.vue    # Layout par défaut (header + footer)
│   └── AdminLayout.vue      # Layout admin (sidebar + header admin)
│
├── views/               # Pages de l'application
│   ├── auth/               # Pages d'authentification
│   │   ├── SignInPage.vue
│   │   └── SignUpPage.vue
│   ├── home/              # Pages publiques
│   │   └── HomePage.vue
│   ├── shop/
│   │   └── ShopPage.vue
│   ├── admin/             # Pages d'administration
│   │   └── DashboardPage.vue
│   └── NotFoundPage.vue
│
├── components/          # Composants réutilisables
│   ├── common/            # Composants communs (Header, Footer)
│   │   ├── AppHeader.vue
│   │   └── AppFooter.vue
│   ├── auth/              # Composants d'authentification
│   │   ├── SignInForm.vue
│   │   └── SignUpForm.vue
│   ├── admin/             # Composants admin
│   │   └── AdminDashboardStats.vue
│   └── ui/                # Composants UI de base (Button, Input, etc.)
│
├── router/              # Configuration des routes
│   └── index.ts
│
└── App.vue              # Point d'entrée (simple RouterView)
```

---

## 🎨 Concept des Layouts

### Qu'est-ce qu'un Layout ?

Un **layout** est un composant Vue qui définit la structure visuelle globale d'un groupe de pages. Au lieu de répéter le header/footer sur chaque page, on les définit une fois dans le layout.

### Les 3 Layouts du projet

#### 1. **AuthLayout** (`/auth/*`)

- **Usage** : Pages de connexion et inscription
- **Caractéristiques** :
  - Design minimaliste et centré
  - Pas de header ni footer
  - Fond avec style spécifique à l'authentification

#### 2. **DefaultLayout** (`/`, `/shop`, etc.)

- **Usage** : Pages publiques/utilisateur
- **Caractéristiques** :
  - Header de navigation
  - Footer
  - Zone de contenu principale

#### 3. **AdminLayout** (`/admin/*`)

- **Usage** : Interface d'administration
- **Caractéristiques** :
  - Sidebar de navigation admin
  - Header admin avec menu utilisateur
  - Design adapté à la gestion
  - Routes protégées par authentification

---

## 🛣️ Configuration des Routes

### Structure hiérarchique

```typescript
routes = [
  // Auth (AuthLayout)
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: 'sign-in', component: SignInPage },
      { path: 'sign-up', component: SignUpPage },
    ],
  },

  // Public (DefaultLayout)
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', component: HomePage },
      { path: 'shop', component: ShopPage },
    ],
  },

  // Admin (AdminLayout)
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: 'dashboard', component: DashboardPage },
      // Autres routes admin...
    ],
  },
]
```

### Navigation Guards

Le routeur implémente des **guards** pour :

- ✅ Protéger les routes admin (vérification de l'authentification et du rôle)
- ✅ Rediriger les utilisateurs connectés depuis les pages d'auth
- ✅ Mettre à jour le titre de la page dynamiquement

```typescript
router.beforeEach((to, from, next) => {
  // Mise à jour du titre
  document.title = `${to.meta.title} - Vexa`

  // Vérifications d'authentification
  if (to.meta.requiresAdmin && !isAdmin) {
    return next({ name: 'sign-in' })
  }

  next()
})
```

---

## 📦 Organisation des Composants

### Principes

1. **Composants spécifiques au contexte** : `auth/`, `admin/`, etc.
2. **Composants partagés** : `common/` pour Header, Footer
3. **Composants UI génériques** : `ui/` pour Input, Button, etc.

### Exemples

```vue
<!-- Page utilise le Layout et les Composants -->
<template>
  <!-- SignInPage.vue utilise AuthLayout automatiquement -->
  <SignInForm />
</template>

<!-- Composant réutilisable -->
<!-- SignInForm.vue peut être utilisé ailleurs -->
<template>
  <form @submit="handleSubmit">
    <Input v-model="email" />
    <Input
      v-model="password"
      type="password"
    />
    <button>Se connecter</button>
  </form>
</template>
```

---

## 🔐 Gestion de l'Authentification (à implémenter)

### Recommandations

1. **Créer un store Pinia** (`src/stores/auth.ts`) :

```typescript
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
  }),
  actions: {
    async login(credentials) {
      /* ... */
    },
    async logout() {
      /* ... */
    },
    checkAuth() {
      /* ... */
    },
  },
})
```

2. **Mettre à jour le router guard** :

```typescript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const isAdmin = authStore.user?.role === 'admin'

  // Logique de protection...
})
```

3. **Composants d'authentification** :

- `SignInForm.vue` appelle `authStore.login()`
- `SignUpForm.vue` appelle `authStore.register()`
- AdminLayout affiche `authStore.user.name`

---

## 🚀 Ajouter de nouvelles pages

### Page publique (avec DefaultLayout)

1. Créer la page dans `views/` :

```vue
<!-- src/views/about/AboutPage.vue -->
<template>
  <div>Page À propos</div>
</template>
```

2. Ajouter la route dans le groupe DefaultLayout :

```typescript
{
  path: '/',
  component: DefaultLayout,
  children: [
    // ... autres routes
    { path: 'about', component: AboutPage, meta: { title: 'À propos' } }
  ]
}
```

### Page admin (avec AdminLayout)

1. Créer la page dans `views/admin/` :

```vue
<!-- src/views/admin/UsersPage.vue -->
<template>
  <div>Gestion des utilisateurs</div>
</template>
```

2. Ajouter la route dans le groupe AdminLayout :

```typescript
{
  path: '/admin',
  component: AdminLayout,
  children: [
    // ... autres routes
    {
      path: 'users',
      component: UsersPage,
      meta: { title: 'Utilisateurs', requiresAdmin: true }
    }
  ]
}
```

---

## 🎯 Bonnes Pratiques

### Nomenclature

- **Pages** : `XxxPage.vue` (ex: `HomePage.vue`, `DashboardPage.vue`)
- **Composants** : `XxxForm.vue`, `XxxCard.vue`, etc. (ex: `SignInForm.vue`)
- **Layouts** : `XxxLayout.vue` (ex: `AuthLayout.vue`)

### Structure d'un composant

```vue
<script setup lang="ts">
/**
 * Nom du composant
 * Description de son rôle
 */
import { ref } from 'vue'

// Props, emits, composables...
</script>

<template>
  <!-- Template -->
</template>

<style scoped>
/* Styles spécifiques */
</style>
```

### Métadonnées des routes

Toujours ajouter des métadonnées utiles :

```typescript
{
  path: '/admin/users',
  name: 'admin-users',
  component: UsersPage,
  meta: {
    title: 'Gestion des utilisateurs',    // Pour le titre de page
    requiresAuth: true,                    // Protection
    requiresAdmin: true,                   // Rôle requis
    breadcrumb: 'Utilisateurs',            // Pour fil d'Ariane (si besoin)
  }
}
```

---

## 📚 Ressources et Documentation

- [Vue Router - Nested Routes](https://router.vuejs.org/guide/essentials/nested-routes.html)
- [Vue Router - Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html)
- [Pinia - State Management](https://pinia.vuejs.org/)

---

## ❓ FAQ

### Pourquoi des layouts au lieu de répéter le header/footer ?

✅ **Avantages** :

- Code DRY (Don't Repeat Yourself)
- Changement global facile (un seul fichier à modifier)
- Meilleure séparation des responsabilités
- Transitions entre pages du même layout fluides

### Comment ajouter un nouveau layout (ex: "Checkout") ?

1. Créer `src/layouts/CheckoutLayout.vue`
2. Définir sa structure (ex: sans header mais avec progress bar)
3. Ajouter un groupe de routes dans le router avec ce layout

### Peut-on avoir plusieurs layouts sur une même route ?

Non, une route utilise un seul layout. Par contre, vous pouvez **composer** des layouts en incluant des parties communes.

---

**Auteur** : Vexa Team  
**Dernière mise à jour** : 2025-11-19
