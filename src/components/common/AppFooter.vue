<script setup lang="ts">
import { Facebook, Instagram, Youtube } from 'lucide-vue-next'
</script>

<template>
  <footer class="bg-noir border-border-noir border-t px-6 py-16">
    <div class="mx-auto max-w-6xl">
      <div class="grid gap-10 md:grid-cols-4">
        <div>
          <span
            class="font-display text-gold text-lg tracking-[0.2em] uppercase"
          >
            Vexa
          </span>
          <p class="mt-3 text-xs leading-relaxed text-[#555]">
            Commerce de luxe. Qualité exceptionnelle.
          </p>
        </div>

        <div>
          <h4 class="mb-3 text-[10px] tracking-[0.2em] text-[#555] uppercase">
            Navigation
          </h4>
          <ul class="space-y-2 text-xs text-[#444]">
            <li>
              <RouterLink
                to="/shop"
                class="hover:text-gold transition-colors"
              >
                Boutique
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/on-sale"
                class="hover:text-gold transition-colors"
              >
                Promotions
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/new-arrivals"
                class="hover:text-gold transition-colors"
              >
                Nouveautés
              </RouterLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="mb-3 text-[10px] tracking-[0.2em] text-[#555] uppercase">
            Légal
          </h4>
          <ul class="space-y-2 text-xs text-[#444]">
            <li>
              <RouterLink
                to="/privacy-policy"
                class="hover:text-gold transition-colors"
              >
                Confidentialité
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/terms-of-service"
                class="hover:text-gold transition-colors"
              >
                CGU
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/legal"
                class="hover:text-gold transition-colors"
              >
                Mentions légales
              </RouterLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="mb-3 text-[10px] tracking-[0.2em] text-[#555] uppercase">
            Contact
          </h4>
          <ul class="space-y-2 text-xs text-[#444]">
            <li>contact@vexa.com</li>
            <li>Paris, France</li>
          </ul>
          <div class="mt-6 flex gap-4">
            <a
              href="#"
              class="hover:text-gold text-[#555] transition-colors"
            >
              <Instagram class="size-5" />
            </a>
            <a
              href="#"
              class="hover:text-gold text-[#555] transition-colors"
            >
              <Facebook class="size-5" />
            </a>
            <a
              href="#"
              class="hover:text-gold text-[#555] transition-colors"
            >
              <Youtube class="size-5" />
            </a>
          </div>
        </div>
      </div>

      <div
        class="border-border-noir mt-12 border-t pt-8 text-center text-[10px] tracking-widest text-[#333] uppercase"
      >
        © 2026 Vexa. Tous droits réservés.
      </div>
    </div>
  </footer>
</template>
