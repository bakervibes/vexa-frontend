<script setup lang="ts">
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from '@/composables/useUsers'
import { createUserSchema, type CreateUserDto, type User } from '@/types/user'
import { computed, ref } from 'vue'
import { z } from 'zod'

// État pour le formulaire
const formData = ref<CreateUserDto>({
  name: '',
  email: '',
  username: '',
  phone: '',
  website: '',
})

// État pour l'édition
const editingUser = ref<User | null>(null)
const isEditMode = computed(() => editingUser.value !== null)

// État pour les erreurs de validation
const formErrors = ref<Record<string, string>>({})

// Recherche
const searchQuery = ref('')

// Récupérer les utilisateurs
const { data: users, isLoading, isError, error } = useUsers()

// Mutations
const { mutate: createUser, isPending: isCreating } = useCreateUser({
  onSuccess: () => {
    resetForm()
    alert('✅ User created successfully!')
  },
  onError: (err) => {
    alert(`❌ Error creating user: ${err.message}`)
  },
})

const { mutate: updateUser, isPending: isUpdating } = useUpdateUser({
  onSuccess: () => {
    resetForm()
    alert('✅ User updated successfully!')
  },
  onError: (err) => {
    alert(`❌ Error updating user: ${err.message}`)
  },
})

const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser({
  onSuccess: () => {
    alert('✅ User deleted successfully!')
  },
  onError: (err) => {
    alert(`❌ Error deleting user: ${err.message}`)
  },
})

// Filtrer les utilisateurs
const filteredUsers = computed(() => {
  if (!users.value) return []
  if (!searchQuery.value.trim()) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter(
    (user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query),
  )
})

// Valider le formulaire
function validateForm(): boolean {
  formErrors.value = {}

  try {
    createUserSchema.parse(formData.value)
    return true
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.issues.forEach((err: z.ZodIssue) => {
        const field = err.path[0] as string
        formErrors.value[field] = err.message
      })
    }
    return false
  }
}

// Soumettre le formulaire
function handleSubmit() {
  if (!validateForm()) {
    return
  }

  if (isEditMode.value && editingUser.value) {
    updateUser({
      id: editingUser.value.id,
      data: formData.value,
    })
  } else {
    createUser(formData.value)
  }
}

// Éditer un utilisateur
function handleEdit(user: User) {
  editingUser.value = user
  formData.value = {
    name: user.name,
    email: user.email,
    username: user.username,
    phone: user.phone,
    website: user.website,
  }
  // Scroll vers le formulaire
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Supprimer un utilisateur
function handleDelete(id: number) {
  if (confirm('Are you sure you want to delete this user?')) {
    deleteUser(id)
  }
}

// Réinitialiser le formulaire
function resetForm() {
  formData.value = {
    name: '',
    email: '',
    username: '',
    phone: '',
    website: '',
  }
  editingUser.value = null
  formErrors.value = {}
}

// État pour le mode d'affichage
const isPending = computed(() => isCreating.value || isUpdating.value || isDeleting.value)
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <!-- Header -->
    <header class="mb-8">
      <h1 class="mb-2 text-4xl font-bold text-gray-900">🚀 Starter Vue.js</h1>
      <p class="text-lg text-gray-600">
        Example CRUD with Vue 3 + TypeScript + TanStack Query + Zod
      </p>
    </header>

    <!-- Formulaire -->
    <section class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-2xl font-semibold text-gray-800">
        {{ isEditMode ? '✏️ Edit User' : '➕ Create New User' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- Name -->
          <div>
            <label for="name" class="mb-1 block text-sm font-medium text-gray-700"> Name * </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              :class="{ 'border-red-500': formErrors.name }"
            />
            <p v-if="formErrors.name" class="mt-1 text-sm text-red-600">{{ formErrors.name }}</p>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="mb-1 block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              :class="{ 'border-red-500': formErrors.email }"
            />
            <p v-if="formErrors.email" class="mt-1 text-sm text-red-600">{{ formErrors.email }}</p>
          </div>

          <!-- Username -->
          <div>
            <label for="username" class="mb-1 block text-sm font-medium text-gray-700">
              Username *
            </label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              :class="{ 'border-red-500': formErrors.username }"
            />
            <p v-if="formErrors.username" class="mt-1 text-sm text-red-600">
              {{ formErrors.username }}
            </p>
          </div>

          <!-- Phone -->
          <div>
            <label for="phone" class="mb-1 block text-sm font-medium text-gray-700"> Phone </label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              :class="{ 'border-red-500': formErrors.phone }"
            />
            <p v-if="formErrors.phone" class="mt-1 text-sm text-red-600">{{ formErrors.phone }}</p>
          </div>

          <!-- Website -->
          <div class="md:col-span-2">
            <label for="website" class="mb-1 block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              id="website"
              v-model="formData.website"
              type="url"
              placeholder="https://example.com"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              :class="{ 'border-red-500': formErrors.website }"
            />
            <p v-if="formErrors.website" class="mt-1 text-sm text-red-600">
              {{ formErrors.website }}
            </p>
          </div>
        </div>

        <!-- Boutons -->
        <div class="flex gap-2">
          <button
            type="submit"
            :disabled="isPending"
            class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ isPending ? '⏳ Processing...' : isEditMode ? '💾 Update' : '➕ Create' }}
          </button>

          <button
            v-if="isEditMode"
            type="button"
            @click="resetForm"
            :disabled="isPending"
            class="rounded-md bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ❌ Cancel
          </button>
        </div>
      </form>
    </section>

    <!-- Liste des utilisateurs -->
    <section class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-800">👥 Users</h2>

        <!-- Barre de recherche -->
        <div class="w-64">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="🔍 Search users..."
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="py-12 text-center">
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
        ></div>
        <p class="mt-2 text-gray-600">Loading users...</p>
      </div>

      <!-- Error -->
      <div v-else-if="isError" class="rounded-md bg-red-50 p-4 text-red-800">
        <p class="font-semibold">❌ Error loading users</p>
        <p class="mt-1 text-sm">{{ error?.message }}</p>
      </div>

      <!-- Liste -->
      <div v-else-if="filteredUsers.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Website</th>
              <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm text-gray-900">{{ user.id }}</td>
              <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ user.name }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ user.email }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ user.username }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ user.phone || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">
                <a
                  v-if="user.website"
                  :href="user.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:underline"
                >
                  {{ user.website }}
                </a>
                <span v-else>-</span>
              </td>
              <td class="px-4 py-3 text-right text-sm">
                <button
                  @click="handleEdit(user)"
                  :disabled="isPending"
                  class="mr-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  @click="handleDelete(user.id)"
                  :disabled="isPending"
                  class="text-red-600 hover:text-red-800 disabled:opacity-50"
                  title="Delete"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- No results -->
      <div v-else class="py-12 text-center text-gray-500">
        <p class="text-lg">{{ searchQuery ? 'No users found' : 'No users yet' }}</p>
      </div>
    </section>

    <!-- Info -->
    <footer class="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-4">
      <p class="text-sm text-blue-800">
        💡 <strong>This is a demo using JSONPlaceholder API.</strong> Create/Update/Delete
        operations are simulated and won't persist. Check the
        <a href="/docs/API_GUIDE.md" class="font-medium underline">API Guide</a> to learn how to
        integrate your own backend.
      </p>
    </footer>
  </div>
</template>

<style scoped>
/* Vous pouvez ajouter des styles personnalisés ici si nécessaire */
</style>
