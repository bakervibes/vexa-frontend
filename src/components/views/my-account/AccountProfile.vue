<script setup lang="ts">
import EmailForm from './EmailForm.vue'
import PasswordForm from './PasswordForm.vue'
import ProfileForm from './ProfileForm.vue'
import ProfileImageUpload from './ProfileImageUpload.vue'
</script>

<template>
  <div class="flex flex-col gap-16">
    <section
      class="flex justify-center border-b border-[#1E1E1E] pb-12 md:justify-start"
    >
      <ProfileImageUpload />
    </section>

    <ProfileForm />

    <div class="h-px w-full bg-[#1E1E1E]" />

    <EmailForm />

    <div class="h-px w-full bg-[#1E1E1E]" />

    <PasswordForm />
  </div>
</template>
