<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/composables/useAuth'
import { env } from '@/env'
import { generateVueHelpers } from '@uploadthing/vue'
import { CameraIcon, Loader2Icon } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

const { user, accessToken, fetchUserProfile } = useAuth()

const { useUploadThing } = generateVueHelpers({
  url: `${env.VITE_API_URL}/uploadthing`,
})

const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

const userInitials = computed(() => {
  const name = user.value?.name
  if (!name) return 'U'
  const names = name.split(' ')
  if (names.length >= 2) {
    return `${names[0]?.[0] ?? ''}${names[1]?.[0] ?? ''}`.toUpperCase()
  }
  return names[0]?.substring(0, 2).toUpperCase() ?? 'U'
})

const { startUpload } = useUploadThing('profileImage', {
  headers: (): Record<string, string> => {
    const token = accessToken
    if (token) {
      return { Authorization: `Bearer ${token}` }
    }
    return {}
  },
  onClientUploadComplete: async () => {
    isUploading.value = false
    await fetchUserProfile()
    toast.success('Profile image updated successfully!')
  },
  onUploadError: (error: Error) => {
    isUploading.value = false
    toast.error(error.message || 'Failed to upload image')
  },
  onUploadBegin: () => {
    isUploading.value = true
  },
})

const handleAvatarClick = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  const file = files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file')
    return
  }

  if (file.size > 4 * 1024 * 1024) {
    toast.error('Image must be less than 4MB')
    return
  }

  try {
    await startUpload([file])
  } catch (error) {
    console.error('Error uploading file:', error)
    toast.error('Failed to upload image')
  }

  target.value = ''
}

const isLoading = computed(() => isUploading.value)
</script>

<template>
  <div
    class="flex flex-col items-center border border-[#1E1E1E] bg-[#0A0A0A] p-8"
  >
    <div class="relative">
      <Avatar class="h-28 w-28 border-2 border-[#1E1E1E]">
        <AvatarImage
          v-if="user?.image"
          :src="user.image"
          :alt="user?.name || 'User'"
        />
        <AvatarFallback class="bg-surface text-2xl font-medium text-[#C8A97E]">
          {{ userInitials }}
        </AvatarFallback>
      </Avatar>

      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center rounded-full bg-[#0A0A0A]/80"
      >
        <Loader2Icon class="h-6 w-6 animate-spin text-[#C8A97E]" />
      </div>

      <button
        v-else
        @click="handleAvatarClick"
        class="bg-surface absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center border border-[#C8A97E]/40 text-[#C8A97E] transition-colors hover:bg-[#C8A97E] hover:text-[#0A0A0A]"
        aria-label="Change profile picture"
      >
        <CameraIcon class="h-4 w-4" />
      </button>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileChange"
      />
    </div>

    <h2 class="mt-5 text-lg font-medium text-[#E8E8E8]">
      {{ user?.name || 'Guest' }}
    </h2>
    <p class="text-text-muted text-sm">{{ user?.email }}</p>

    <button
      :disabled="isLoading"
      @click="handleAvatarClick"
      class="mt-4 border border-[#C8A97E]/40 px-4 py-2 text-xs tracking-widest text-[#C8A97E] uppercase transition-colors hover:bg-[#C8A97E] hover:text-[#0A0A0A] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <CameraIcon class="mr-2 inline h-4 w-4" />
      {{ isLoading ? 'Uploading...' : 'Change photo' }}
    </button>
  </div>
</template>

<style scoped></style>
