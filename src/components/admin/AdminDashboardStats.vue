<script setup lang="ts">
/**
 * AdminDashboardStats
 * Example component for admin dashboard statistics
 */
import { ref } from 'vue'

const stats = ref([
  { label: 'Users', value: '1,234', change: '+12%', trend: 'up' },
  { label: 'Sales', value: '$5,678', change: '+8%', trend: 'up' },
  { label: 'Orders', value: '234', change: '-3%', trend: 'down' },
  { label: 'Revenue', value: '$12,345', change: '+15%', trend: 'up' },
])
</script>

<template>
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="rounded-lg bg-white p-6 shadow"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">{{ stat.label }}</p>
          <p class="mt-2 text-3xl font-bold">{{ stat.value }}</p>
        </div>
        <div
          :class="[
            'text-sm font-semibold',
            stat.trend === 'up' ? 'text-green-600' : 'text-red-600',
          ]"
        >
          {{ stat.change }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Dashboard statistics specific styles */
</style>
