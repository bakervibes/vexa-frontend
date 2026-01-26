<script setup lang="ts">
/**
 * ShopPage
 * Shop page - uses DefaultLayout
 */
import Shop from '@/components/views/shop/Shop.vue'
import { useSeo } from '@/composables/useSeo'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const categoryName = computed(() => {
  const category = route.query.category as string | undefined
  return category
    ? category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')
    : null
})

// SEO
useSeo({
  title: computed(() =>
    categoryName.value ? `${categoryName.value} - Boutique` : 'Boutique',
  ),
  description: computed(() =>
    categoryName.value
      ? `Découvrez notre sélection de ${categoryName.value}. Trouvez les meilleurs produits au meilleur prix.`
      : 'Explorez notre boutique en ligne. Large sélection de produits de qualité, livraison rapide et paiement sécurisé.',
  ),
})
</script>

<template>
  <Shop />
</template>

<style scoped></style>
