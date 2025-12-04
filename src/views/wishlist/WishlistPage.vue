<script setup lang="ts">
import CustomBreadcrumb from '@/components/custom/custom-breadcrumb.vue'
import Wishlist from '@/components/views/wishlist/Wishlist.vue'
</script>

<template>
  <section class="container mx-auto flex flex-col gap-8 px-4 py-8">
    <CustomBreadcrumb
      :items="[
        { label: 'Home', link: '/' },
        { label: 'Wishlist', link: '/wishlist' },
      ]"
    />

    <Wishlist />
  </section>
</template>

<style scoped></style>
