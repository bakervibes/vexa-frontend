import { ref } from 'vue'

type AuthMode = 'login' | 'register'

const isOpen = ref(false)
const initialMode = ref<AuthMode>('login')
const onSuccessCallback = ref<(() => void) | null>(null)

export function useAuthModal() {
  const openAuthModal = (mode: AuthMode = 'login', onSuccess?: () => void) => {
    initialMode.value = mode
    onSuccessCallback.value = onSuccess || null
    isOpen.value = true
  }

  const closeAuthModal = () => {
    isOpen.value = false
    onSuccessCallback.value = null
  }

  const handleSuccess = () => {
    if (onSuccessCallback.value) {
      onSuccessCallback.value()
    }
    closeAuthModal()
  }

  return {
    isOpen,
    initialMode,
    openAuthModal,
    closeAuthModal,
    handleSuccess,
  }
}
