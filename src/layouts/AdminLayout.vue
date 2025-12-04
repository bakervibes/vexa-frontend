<script setup lang="ts">
/**
 * AdminLayout
 * Layout for the administration interface
 * Includes a sidebar, admin header, etc.
 */
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toaster } from 'vue-sonner'

const router = useRouter()
const authStore = useAuthStore()

const isSidebarOpen = ref(true)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleLogout = async () => {
  const result = await authStore.logout()

  if (result.success) {
    router.push('/auth/sign-in')
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-gray-900 text-white transition-all duration-300',
        isSidebarOpen ? 'w-64' : 'w-20',
      ]"
    >
      <div class="flex h-16 items-center justify-between px-4">
        <h2
          v-if="isSidebarOpen"
          class="text-xl font-bold"
        >
          Admin Panel
        </h2>
        <button
          @click="toggleSidebar"
          class="rounded p-2 hover:bg-gray-800"
        >
          <span v-if="isSidebarOpen">←</span>
          <span v-else>→</span>
        </button>
      </div>

      <!-- Admin navigation to develop -->
      <nav class="mt-8">
        <RouterLink
          to="/admin/dashboard"
          class="block px-4 py-3 hover:bg-gray-800"
        >
          <span v-if="isSidebarOpen">Dashboard</span>
          <span v-else>📊</span>
        </RouterLink>
        <!-- Add other admin links here -->
      </nav>
    </aside>

    <!-- Main content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Admin header -->
      <header
        class="flex h-16 items-center justify-between bg-white px-6 shadow"
      >
        <h1 class="text-2xl font-semibold">Administration</h1>
        <div class="flex items-center gap-4">
          <!-- User info -->
          <span class="text-sm text-gray-600">
            Hello,
            <strong>{{ authStore.userName }}</strong>
          </span>
          <!-- Logout button -->
          <button
            @click="handleLogout"
            class="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>

  <Toaster
    richColors
    position="bottom-right"
    :duration="3000"
  />
</template>

<style scoped>
/* Admin layout specific styles */
</style>
