<script setup lang="ts">
import { useUsers } from '@/composables/useUsers'

/**
 * Exemple d'utilisation de Vue Query avec notre fonction API
 * Utilise l'API publique JSONPlaceholder pour la démo
 */
const { data: users, isLoading, isError, error, refetch } = useUsers()
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Welcome to Vexa Front</h1>
      <p class="mt-2 text-gray-600">
        This is a demo showing Vue Router, TanStack Query (Vue Query), and type-safe API calls.
      </p>
    </div>

    <div class="rounded-lg bg-white p-6 shadow">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">Users List (Demo)</h2>
        <button
          @click="refetch()"
          class="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="py-8 text-center">
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
        ></div>
        <p class="mt-2 text-gray-600">Loading users...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="isError" class="rounded-lg bg-red-50 p-4">
        <p class="text-sm text-red-800">
          <strong>Error:</strong> {{ error?.message || 'Failed to load users' }}
        </p>
      </div>

      <!-- Success State -->
      <div v-else-if="users" class="overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Username
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {{ user.name }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {{ user.email }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {{ user.username }}
              </td>
            </tr>
          </tbody>
        </table>

        <p class="mt-4 text-sm text-gray-500">
          Loaded {{ users.length }} users from JSONPlaceholder API
        </p>
      </div>
    </div>

    <!-- API Usage Examples -->
    <div class="mt-8 rounded-lg bg-blue-50 p-6">
      <h3 class="mb-2 text-lg font-semibold text-blue-900">💡 API Usage Examples</h3>
      <div class="space-y-2 text-sm text-blue-800">
        <p><strong>Basic GET:</strong> <code>api&lt;User[]&gt;('/users', 'GET')</code></p>
        <p>
          <strong>POST with data:</strong>
          <code>api&lt;User&gt;('/users', 'POST', { name: 'John' })</code>
        </p>
        <p>
          <strong>PUT with config:</strong>
          <code>api&lt;User&gt;('/users/1', 'PUT', data, { timeout: 5000 })</code>
        </p>
        <p>
          <strong>Helper methods:</strong> <code>get&lt;User[]&gt;('/users')</code>,
          <code>post&lt;User&gt;('/users', data)</code>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
