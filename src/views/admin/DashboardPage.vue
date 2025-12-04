<script setup lang="ts">
/**
 * DashboardPage
 * Admin dashboard page - uses AdminLayout
 */
import AdminDashboardStats from '@/components/admin/AdminDashboardStats.vue'
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">Dashboard</h1>
      <p class="mt-2 text-gray-600">Welcome to your administration area</p>
    </div>

    <AdminDashboardStats />

    <!-- Other dashboard widgets -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="rounded-lg bg-white p-6 shadow">
        <h3 class="text-xl font-semibold">Latest orders</h3>
        <p class="mt-2 text-gray-600">Widget to implement</p>
      </div>

      <div class="rounded-lg bg-white p-6 shadow">
        <h3 class="text-xl font-semibold">Recent activity</h3>
        <p class="mt-2 text-gray-600">Widget to implement</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
