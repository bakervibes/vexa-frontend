<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
</script>

<template>
  <!-- Skeleton State -->
  <div class="h-full w-64 shrink-0">
    <div class="relative flex h-full flex-col gap-2">
      <!-- Skeleton Image -->
      <Skeleton
        width="100%"
        height="20rem"
        class="shrink-0 rounded-none"
      />

      <!-- Skeleton Product Info -->
      <div class="flex flex-col gap-1.5 px-1">
        <!-- Skeleton Rating (5 stars) -->
        <div class="flex gap-0.5">
          <Skeleton
            width="0.875rem"
            height="0.875rem"
            shape="circle"
          />
          <Skeleton
            width="0.875rem"
            height="0.875rem"
            shape="circle"
          />
          <Skeleton
            width="0.875rem"
            height="0.875rem"
            shape="circle"
          />
          <Skeleton
            width="0.875rem"
            height="0.875rem"
            shape="circle"
          />
          <Skeleton
            width="0.875rem"
            height="0.875rem"
            shape="circle"
          />
        </div>

        <!-- Skeleton Title (2 lines) -->
        <div class="flex flex-col gap-1">
          <Skeleton
            width="100%"
            height="1.25rem"
          />
          <Skeleton
            width="75%"
            height="1.25rem"
          />
        </div>

        <!-- Skeleton Price -->
        <div class="flex items-center gap-2">
          <Skeleton
            width="4rem"
            height="1.25rem"
          />
          <Skeleton
            width="3rem"
            height="1rem"
          />
        </div>
      </div>
    </div>
  </div>
</template>
