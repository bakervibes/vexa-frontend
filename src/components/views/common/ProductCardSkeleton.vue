<script setup lang="ts"></script>

<template>
  <div class="h-full w-full shrink-0 sm:max-w-70">
    <div class="relative flex h-full flex-col gap-3">
      <div
        class="border-border-noir bg-surface relative h-80 w-full shrink-0 border"
      >
        <div class="bg-border-noir h-full w-full animate-pulse" />
      </div>

      <div class="flex flex-col gap-1.5 px-1">
        <div class="flex gap-0.5">
          <div class="bg-border-noir h-3 w-3 animate-pulse" />
          <div class="bg-border-noir h-3 w-3 animate-pulse" />
          <div class="bg-border-noir h-3 w-3 animate-pulse" />
          <div class="bg-border-noir h-3 w-3 animate-pulse" />
          <div class="bg-border-noir h-3 w-3 animate-pulse" />
        </div>

        <div class="flex flex-col gap-1">
          <div class="bg-border-noir h-5 w-full animate-pulse" />
          <div class="bg-border-noir h-5 w-3/4 animate-pulse" />
        </div>

        <div class="flex items-center gap-2">
          <div class="bg-border-noir h-4 w-16 animate-pulse" />
          <div class="bg-border-noir h-3 w-12 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
</template>
