<script setup lang="ts">
import EmailForm from './EmailForm.vue'
import PasswordForm from './PasswordForm.vue'
import ProfileForm from './ProfileForm.vue'
import ProfileImageUpload from './ProfileImageUpload.vue'
</script>

<template>
  <div class="flex flex-col gap-10">
    <!-- Profile Image Section -->
    <section class="flex justify-center border-b pb-8 md:justify-start">
      <ProfileImageUpload />
    </section>

    <!-- Account Details Form -->
    <ProfileForm />

    <!-- Email Change Form -->
    <EmailForm />

    <!-- Password Change Form -->
    <PasswordForm />
  </div>
</template>

<style scoped></style>
