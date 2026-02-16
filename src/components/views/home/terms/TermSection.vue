<script lang="ts" setup>
import {
  CreditCardIcon,
  HeadphonesIcon,
  ShieldCheckIcon,
  TruckIcon,
} from 'lucide-vue-next'

const features = [
  {
    icon: TruckIcon,
    title: 'Livraison gratuite',
    desc: 'Pour toute commande supérieure à 50 000 XOF',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Garantie qualité',
    desc: 'Satisfait ou remboursé pendant 30 jours',
  },
  {
    icon: CreditCardIcon,
    title: 'Paiement sécurisé',
    desc: 'Transactions cryptées et protégées',
  },
  {
    icon: HeadphonesIcon,
    title: 'Support dédié',
    desc: 'Assistance disponible 7j/7',
  },
]
</script>

<template>
  <section class="border-border-noir bg-border-noir border-y">
    <div
      class="mx-auto grid max-w-6xl grid-cols-2 gap-px px-6 py-16 md:grid-cols-4"
    >
      <div
        v-for="(feature, i) in features"
        :key="i"
        class="flex flex-col items-start gap-4 bg-[#0D0D0D] p-6"
      >
        <component
          :is="feature.icon"
          class="text-gold size-8"
        />
        <h3 class="font-display text-text text-lg font-light">
          {{ feature.title }}
        </h3>
        <p class="text-xs leading-relaxed text-[#555]">
          {{ feature.desc }}
        </p>
      </div>
    </div>
  </section>
</template>
