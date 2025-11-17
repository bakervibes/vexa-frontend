# Guide d'Utilisation de l'API

Ce guide explique comment utiliser la fonction utilitaire API type-safe et Vue Query dans votre application.

## Table des Matières

- [Fonction API de Base](#fonction-api-de-base)
- [Helpers HTTP](#helpers-http)
- [Gestion des Erreurs](#gestion-des-erreurs)
- [Vue Query (TanStack Query)](#vue-query-tanstack-query)
- [Composables](#composables)
- [Exemples Pratiques](#exemples-pratiques)

## Fonction API de Base

La fonction `api()` est la fonction principale pour effectuer des requêtes HTTP.

### Signature

```typescript
api<TResponse>(url: string, method: HttpMethod, data?: unknown, config?: ApiRequestConfig): Promise<TResponse>
```

### Paramètres

- **url** : URL de l'endpoint (relative ou absolue)
- **method** : Méthode HTTP (`'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'`)
- **data** (optionnel) : Données à envoyer (ignoré pour GET)
- **config** (optionnel) : Configuration additionnelle

### Exemples

```typescript
import { api } from '@/utils/api'
import type { User } from '@/types/user'

// GET request
const users = await api<User[]>('/users', 'GET')

// POST request avec data
const newUser = await api<User>('/users', 'POST', {
  name: 'John Doe',
  email: 'john@example.com',
})

// PUT request avec config personnalisée
const updatedUser = await api<User>(
  '/users/1',
  'PUT',
  { name: 'Jane Doe' },
  {
    timeout: 5000,
    headers: { 'X-Custom-Header': 'value' },
  },
)

// DELETE request
await api<void>('/users/1', 'DELETE')
```

## Helpers HTTP

Pour plus de concision, utilisez les helpers HTTP :

```typescript
import { get, post, put, patch, del } from '@/utils/api'

// GET
const users = await get<User[]>('/users')

// POST
const newUser = await post<User>('/users', { name: 'John' })

// PUT
const updated = await put<User>('/users/1', { name: 'Jane' })

// PATCH
const patched = await patch<User>('/users/1', { email: 'new@email.com' })

// DELETE
await del('/users/1')
```

## Gestion des Erreurs

L'API utilise une classe `ApiError` personnalisée pour les erreurs HTTP :

```typescript
import { api, ApiError } from '@/utils/api'

try {
  const user = await api<User>('/users/999', 'GET')
} catch (error) {
  if (error instanceof ApiError) {
    console.error('Status:', error.status)
    console.error('Message:', error.message)
    console.error('Data:', error.data)

    // Gérer des codes d'erreur spécifiques
    switch (error.status) {
      case 404:
        console.log('User not found')
        break
      case 401:
        console.log('Unauthorized')
        break
      case 408:
        console.log('Request timeout')
        break
    }
  }
}
```

## Vue Query (TanStack Query)

Vue Query gère automatiquement le cache, les rechargements, et la synchronisation des données.

### Configuration

La configuration se trouve dans `src/plugins/vue-query.ts` :

```typescript
{
  staleTime: 5 minutes,      // Durée avant péremption des données
  gcTime: 10 minutes,         // Durée de conservation en cache
  retry: 2,                   // Nombre de tentatives en cas d'erreur
  refetchOnWindowFocus: true  // Recharger au focus de la fenêtre
}
```

### Utilisation Directe

```typescript
import { useQuery, useMutation } from '@tanstack/vue-query'
import { api } from '@/utils/api'

// Query (lecture)
const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ['users'],
  queryFn: () => api<User[]>('/users', 'GET'),
})

// Mutation (écriture)
const { mutate, isPending } = useMutation({
  mutationFn: (newUser: CreateUserDto) => api<User>('/users', 'POST', newUser),
  onSuccess: (data) => {
    console.log('User created:', data)
  },
})

// Utiliser la mutation
mutate({ name: 'John', email: 'john@example.com' })
```

## Composables

Les composables encapsulent la logique Vue Query pour une meilleure réutilisabilité.

### Créer un Composable

Exemple : `src/composables/useUsers.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/utils/api'
import type { User, CreateUserDto } from '@/types/user'

// Clés de requête
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: number) => [...userKeys.all, 'detail', id] as const,
}

// Récupérer tous les utilisateurs
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => api<User[]>('/users', 'GET'),
  })
}

// Récupérer un utilisateur
export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => api<User>(`/users/${id}`, 'GET'),
    enabled: id > 0, // Ne lance la requête que si ID valide
  })
}

// Créer un utilisateur
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserDto) => api<User>('/users', 'POST', data),
    onSuccess: () => {
      // Invalider le cache pour recharger la liste
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

// Mettre à jour un utilisateur
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
      api<User>(`/users/${id}`, 'PUT', data),
    onSuccess: (data, variables) => {
      // Mettre à jour le cache
      queryClient.setQueryData(userKeys.detail(variables.id), data)
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

// Supprimer un utilisateur
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => api<void>(`/users/${id}`, 'DELETE'),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.removeQueries({ queryKey: userKeys.detail(id) })
    },
  })
}
```

### Utiliser un Composable

```vue
<script setup lang="ts">
import { useUsers, useCreateUser, useDeleteUser } from '@/composables/useUsers'

// Récupérer les utilisateurs
const { data: users, isLoading, refetch } = useUsers()

// Mutation de création
const { mutate: createUser, isPending: isCreating } = useCreateUser()

// Mutation de suppression
const { mutate: deleteUser } = useDeleteUser()

// Créer un utilisateur
function handleCreate() {
  createUser({
    name: 'John Doe',
    email: 'john@example.com',
  })
}

// Supprimer un utilisateur
function handleDelete(id: number) {
  deleteUser(id)
}
</script>

<template>
  <div>
    <button @click="handleCreate" :disabled="isCreating">Create User</button>

    <div v-if="isLoading">Loading...</div>

    <div v-else-if="users">
      <div v-for="user in users" :key="user.id">
        {{ user.name }}
        <button @click="handleDelete(user.id)">Delete</button>
      </div>
    </div>
  </div>
</template>
```

## Exemples Pratiques

### 1. Liste avec Recherche

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUsers } from '@/composables/useUsers'

const search = ref('')
const { data: users, isLoading } = useUsers()

const filteredUsers = computed(() => {
  if (!users.value) return []
  return users.value.filter((u) => u.name.toLowerCase().includes(search.value.toLowerCase()))
})
</script>

<template>
  <input v-model="search" placeholder="Search users..." />
  <div v-for="user in filteredUsers" :key="user.id">
    {{ user.name }}
  </div>
</template>
```

### 2. Formulaire avec Mutation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useCreateUser } from '@/composables/useUsers'

const name = ref('')
const email = ref('')

const { mutate, isPending, isSuccess, isError, error } = useCreateUser()

function handleSubmit() {
  mutate(
    { name: name.value, email: email.value },
    {
      onSuccess: () => {
        // Reset form
        name.value = ''
        email.value = ''
      },
    },
  )
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="name" placeholder="Name" required />
    <input v-model="email" type="email" placeholder="Email" required />
    <button type="submit" :disabled="isPending">
      {{ isPending ? 'Creating...' : 'Create User' }}
    </button>

    <p v-if="isSuccess" class="success">User created!</p>
    <p v-if="isError" class="error">Error: {{ error.message }}</p>
  </form>
</template>
```

### 3. Détails avec Paramètre de Route

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUser } from '@/composables/useUsers'

const route = useRoute()
const userId = computed(() => Number(route.params.id))

const { data: user, isLoading, isError } = useUser(userId.value)
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="isError">User not found</div>
  <div v-else-if="user">
    <h1>{{ user.name }}</h1>
    <p>{{ user.email }}</p>
  </div>
</template>
```

### 4. Mutation avec Optimistic Update

```typescript
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
      api<User>(`/users/${id}`, 'PUT', data),

    // Avant la requête
    onMutate: async ({ id, data }) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: userKeys.detail(id) })

      // Sauvegarder les données actuelles
      const previous = queryClient.getQueryData(userKeys.detail(id))

      // Optimistically update
      queryClient.setQueryData(userKeys.detail(id), (old: User) => ({
        ...old,
        ...data,
      }))

      return { previous }
    },

    // En cas d'erreur, restaurer les données
    onError: (err, variables, context) => {
      queryClient.setQueryData(userKeys.detail(variables.id), context?.previous)
    },

    // Toujours refetch après
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      })
    },
  })
}
```

## Best Practices

### 1. Typage Strict

Toujours spécifier le type de retour :

```typescript
// ✅ Bon
const users = await api<User[]>('/users', 'GET')

// ❌ Mauvais
const users = await api('/users', 'GET') // Type 'unknown'
```

### 2. Query Keys Organisées

Utilisez une structure cohérente pour les query keys :

```typescript
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
}
```

### 3. Gestion des Erreurs

Toujours gérer les erreurs dans l'UI :

```vue
<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="isError" class="error">
    {{ error.message }}
  </div>
  <div v-else-if="data">
    <!-- Success state -->
  </div>
</template>
```

### 4. Composables Réutilisables

Créez des composables pour chaque ressource API :

```
src/composables/
  ├── useUsers.ts
  ├── useProducts.ts
  ├── useOrders.ts
  └── useAuth.ts
```

### 5. Configuration par Requête

Personnalisez la configuration selon les besoins :

```typescript
useQuery({
  queryKey: ['heavy-data'],
  queryFn: fetchHeavyData,
  staleTime: 1000 * 60 * 30, // 30 minutes pour données lourdes
  gcTime: 1000 * 60 * 60, // 1 heure en cache
})
```

## Ressources

- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/vue/overview)
- [Vue Router Documentation](https://router.vuejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
