<script setup lang="ts">
import { Minus } from 'lucide-vue-next'
</script>

<template>
  <div role="separator">
    <slot>
      <Minus class="text-muted-foreground" />
    </slot>
  </div>
</template>
