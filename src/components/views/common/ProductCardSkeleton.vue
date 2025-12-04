<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <!-- Skeleton State -->
  <div class="h-full w-64 shrink-0">
    <div class="relative flex h-full flex-col gap-2">
      <!-- Skeleton Image -->
      <Skeleton class="h-80 w-full shrink-0 rounded-none" />

      <!-- Skeleton Product Info -->
      <div class="flex flex-col gap-1.5 px-1">
        <!-- Skeleton Rating (5 stars) -->
        <div class="flex gap-0.5">
          <Skeleton class="size-3.5 rounded-full" />
          <Skeleton class="size-3.5 rounded-full" />
          <Skeleton class="size-3.5 rounded-full" />
          <Skeleton class="size-3.5 rounded-full" />
          <Skeleton class="size-3.5 rounded-full" />
        </div>

        <!-- Skeleton Title (2 lines) -->
        <div class="flex flex-col gap-1">
          <Skeleton class="h-5 w-full" />
          <Skeleton class="h-5 w-3/4" />
        </div>

        <!-- Skeleton Price -->
        <div class="flex items-center gap-2">
          <Skeleton class="h-5 w-16" />
          <Skeleton class="h-4 w-12" />
        </div>
      </div>
    </div>
  </div>
</template>
