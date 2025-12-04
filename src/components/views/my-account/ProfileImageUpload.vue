<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { env } from '@/env'
import { useAuthStore } from '@/stores/auth'
import { generateVueHelpers } from '@uploadthing/vue'
import { CameraIcon, Loader2Icon } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

const authStore = useAuthStore()

// Generate uploadthing helpers with your backend URL
const { useUploadThing } = generateVueHelpers({
  url: `${env.VITE_API_URL}/uploadthing`,
})

const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

const userInitials = computed(() => {
  const name = authStore.user?.name
  if (!name) return 'U'
  const names = name.split(' ')
  if (names.length >= 2) {
    return `${names[0]?.[0] ?? ''}${names[1]?.[0] ?? ''}`.toUpperCase()
  }
  return names[0]?.substring(0, 2).toUpperCase() ?? 'U'
})

const { startUpload } = useUploadThing('profileImage', {
  headers: (): Record<string, string> => {
    // Include the authorization header with JWT token
    const token = authStore.accessToken
    if (token) {
      return { Authorization: `Bearer ${token}` }
    }
    return {}
  },
  onClientUploadComplete: async () => {
    isUploading.value = false
    // The backend already updates the user image in onUploadComplete
    // We just need to refresh the user data in the store
    await authStore.fetchUserProfile()
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

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file')
    return
  }

  // Validate file size (max 4MB)
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

  // Reset input
  target.value = ''
}

const isLoading = computed(() => isUploading.value)
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="relative">
      <Avatar class="h-24 w-24">
        <AvatarImage
          v-if="authStore.user?.image"
          :src="authStore.user.image"
          :alt="authStore.user?.name || 'User'"
        />
        <AvatarFallback
          class="bg-primary text-primary-foreground text-2xl font-medium"
        >
          {{ userInitials }}
        </AvatarFallback>
      </Avatar>

      <!-- Loading overlay -->
      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50"
      >
        <Loader2Icon class="h-6 w-6 animate-spin text-white" />
      </div>

      <!-- Upload button -->
      <button
        v-else
        @click="handleAvatarClick"
        class="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gray-800"
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

    <h2 class="mt-4 text-lg font-semibold">
      {{ authStore.user?.name || 'Guest' }}
    </h2>
    <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>

    <Button
      variant="outline"
      size="sm"
      class="mt-3"
      :disabled="isLoading"
      @click="handleAvatarClick"
    >
      <CameraIcon class="mr-2 h-4 w-4" />
      {{ isLoading ? 'Uploading...' : 'Change photo' }}
    </Button>
  </div>
</template>

<style scoped></style>
