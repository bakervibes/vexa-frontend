<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DetailsSection from './DetailsSection.vue'
import RelatedSection from './RelatedSection.vue'
import ReviewsSection from './ReviewsSection.vue'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
</script>

<template>
  <DetailsSection :slug="slug" />

  <ReviewsSection :slug="slug" />

  <RelatedSection :slug="slug" />
</template>
