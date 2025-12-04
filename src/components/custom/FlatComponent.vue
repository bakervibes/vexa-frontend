<script setup lang="ts">
interface Props {
  country: string
  title?: string
}

const props = defineProps<Props>()
</script>

<template>
  <span
    class="flex h-full w-full items-center justify-center"
    :title="props.title"
  >
    <span :class="`fi fi-${props.country.toLowerCase()}`"></span>
  </span>
</template>

<style scoped>
/* Ajuste la taille du drapeau si tu veux */
.fi {
  width: 100%;
  height: 100%;
  background-size: cover;
}
</style>
