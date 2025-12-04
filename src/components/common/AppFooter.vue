<script setup lang="ts">
import { Facebook, Instagram, Youtube } from 'lucide-vue-next'
</script>

<template>
  <footer class="bg-[#141718] px-8 py-12 font-['Poppins'] text-white">
    <div class="mx-auto max-w-7xl">
      <!-- Desktop Layout -->
      <div class="mb-12 hidden items-center justify-between md:flex">
        <div class="flex items-center gap-8">
          <router-link
            to="/"
            class="text-2xl font-medium"
          >
            3legant.
          </router-link>
          <div class="h-6 w-px bg-gray-600"></div>
          <span class="text-sm font-normal text-gray-300">
            Gift & Decoration Store
          </span>
        </div>

        <nav class="flex gap-10">
          <router-link
            to="/"
            class="text-sm transition-colors hover:text-gray-300"
          >
            Home
          </router-link>
          <router-link
            to="/shop"
            class="text-sm transition-colors hover:text-gray-300"
          >
            Shop
          </router-link>
          <router-link
            to="/product"
            class="text-sm transition-colors hover:text-gray-300"
          >
            Product
          </router-link>
          <router-link
            to="/blog"
            class="text-sm transition-colors hover:text-gray-300"
          >
            Blog
          </router-link>
          <router-link
            to="/contact"
            class="text-sm transition-colors hover:text-gray-300"
          >
            Contact Us
          </router-link>
        </nav>
      </div>

      <!-- Mobile Layout -->
      <div class="mb-10 flex flex-col items-center gap-8 md:hidden">
        <div class="flex flex-col items-center gap-4">
          <router-link
            to="/"
            class="text-2xl font-medium"
          >
            3legant.
          </router-link>
          <div class="h-px w-6 bg-gray-600"></div>
          <span class="text-sm font-normal text-gray-300">
            Gift & Decoration Store
          </span>
        </div>

        <nav class="flex flex-col items-center gap-4">
          <router-link
            to="/"
            class="text-sm transition-colors hover:text-gray-300"
          >
            Home
          </router-link>
          <router-link
            to="/shop"
            class="text-sm transition-colors hover:text-gray-300"
          >
            Shop
          </router-link>
          <router-link
            to="/product"
            class="text-sm transition-colors hover:text-gray-300"
          >
            Product
          </router-link>
          <router-link
            to="/blog"
            class="text-sm transition-colors hover:text-gray-300"
          >
            Blog
          </router-link>
          <router-link
            to="/contact"
            class="text-sm transition-colors hover:text-gray-300"
          >
            Contact Us
          </router-link>
        </nav>
      </div>

      <!-- Divider -->
      <div class="mb-8 h-px w-full bg-gray-800"></div>

      <!-- Bottom Section -->
      <div
        class="flex w-full flex-col items-center justify-between md:flex-row"
      >
        <!-- Desktop Left / Mobile Bottom -->
        <div
          class="order-3 flex flex-col items-center gap-4 md:order-1 md:flex-row md:gap-8"
        >
          <span class="order-2 text-xs text-gray-400 md:order-1">
            Copyright © 2023 3legant. All rights reserved
          </span>
          <div class="order-1 flex gap-6 md:order-2">
            <router-link
              to="/privacy"
              class="text-xs font-semibold text-white"
            >
              Privacy Policy
            </router-link>
            <router-link
              to="/terms"
              class="text-xs font-semibold text-white"
            >
              Terms of Use
            </router-link>
          </div>
        </div>

        <!-- Desktop Right / Mobile Top -->
        <div class="order-1 mb-8 flex gap-6 md:order-2 md:mb-0">
          <a
            href="#"
            class="transition-colors hover:text-gray-300"
          >
            <Instagram class="h-6 w-6" />
          </a>
          <a
            href="#"
            class="transition-colors hover:text-gray-300"
          >
            <Facebook class="h-6 w-6" />
          </a>
          <a
            href="#"
            class="transition-colors hover:text-gray-300"
          >
            <Youtube class="h-6 w-6" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Ensure font is applied if not inherited correctly, though main.css should handle it */
footer {
  font-family: 'Poppins', sans-serif;
}
</style>
