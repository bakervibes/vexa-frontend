<script setup lang="ts">
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ref, watch } from 'vue'
import ModalSignInForm from './ModalSignInForm.vue'
import ModalSignUpForm from './ModalSignUpForm.vue'

type AuthMode = 'login' | 'register'

const props = withDefaults(
  defineProps<{
    open: boolean
    initialMode?: AuthMode
  }>(),
  {
    initialMode: 'login',
  },
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}>()

const currentMode = ref<AuthMode>(props.initialMode)

// Reset mode when modal opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      currentMode.value = props.initialMode
    }
  },
)

const switchToRegister = () => {
  currentMode.value = 'register'
}

const switchToLogin = () => {
  currentMode.value = 'login'
}

const handleSuccess = () => {
  emit('update:open', false)
  emit('success')
}

const handleOpenChange = (value: boolean) => {
  emit('update:open', value)
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="handleOpenChange"
  >
    <DialogContent class="max-w-[80vw] overflow-hidden p-0 md:max-w-[1024px]">
      <Transition
        name="fade"
        mode="out-in"
      >
        <ModalSignInForm
          v-if="currentMode === 'login'"
          @switch-to-register="switchToRegister"
          @success="handleSuccess"
        />
        <ModalSignUpForm
          v-else
          @switch-to-login="switchToLogin"
          @success="handleSuccess"
        />
      </Transition>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
