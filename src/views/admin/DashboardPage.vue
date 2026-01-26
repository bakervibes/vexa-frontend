<script setup lang="ts">
import AdminDashboardStats from '@/components/admin/AdminDashboardStats.vue'
import {
  LowStockAlert,
  RecentOrdersWidget,
  RevenueChart,
  TopProductsWidget,
} from '@/components/admin/dashboard'
import { AdminPageHeader } from '@/components/admin/shared'
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Tableau de bord"
      description="Vue d'ensemble de votre boutique"
    />

    <!-- KPI Stats -->
    <AdminDashboardStats />

    <!-- Revenue Chart -->
    <RevenueChart />

    <!-- Widgets Grid -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <RecentOrdersWidget />
      <TopProductsWidget />
    </div>

    <!-- Low Stock Alert -->
    <LowStockAlert />
  </div>
</template>
