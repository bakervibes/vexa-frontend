<script setup lang="ts">
interface Props {
  country: string
  title?: string
}

const props = defineProps<Props>()
</script>

<template>
  <span
    class="flex h-5 w-7 items-center justify-center overflow-hidden rounded border"
    :title="props.title"
  >
    <span
      :class="`fi fi-${props.country.toLowerCase()} h-full! w-full! bg-cover!`"
    ></span>
  </span>
</template>
