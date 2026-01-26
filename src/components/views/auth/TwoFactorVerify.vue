<script setup lang="ts">
/**
 * Composant pour la vérification du code 2FA lors de la connexion
 */
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  InputOtp,
  InputOtpGroup,
  InputOtpSlot,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { api } from '@/utils/api'
import { useMutation } from '@tanstack/vue-query'
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-vue-next'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

interface Props {
  userId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'success'): void
  (e: 'back'): void
}>()

const code = ref('')
const isBackupCode = ref(false)

const validateMutation = useMutation({
  mutationFn: () =>
    api<{ valid: boolean; method: string; remainingBackupCodes?: number }>(
      '/auth/2fa/validate',
      'POST',
      {
        userId: props.userId,
        code: code.value,
      },
    ),
  onSuccess: (data) => {
    if (data.method === 'backup' && data.remainingBackupCodes !== undefined) {
      toast.warning('Code de récupération utilisé', {
        description: `Il vous reste ${data.remainingBackupCodes} code(s) de récupération.`,
      })
    }
    emit('success')
  },
  onError: (error: Error) => {
    toast.error('Code invalide', {
      description: error.message || 'Veuillez vérifier votre code.',
    })
    code.value = ''
  },
})

const handleSubmit = () => {
  if (code.value.length < 6) {
    toast.error('Code invalide', {
      description: 'Veuillez entrer un code valide.',
    })
    return
  }
  validateMutation.mutate()
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center">
      <ShieldCheck class="mx-auto h-12 w-12 text-green-600" />
      <h2 class="mt-4 text-xl font-semibold">Vérification en deux étapes</h2>
      <p class="text-muted-foreground mt-2 text-sm">
        Entrez le code de votre application d'authentification
      </p>
    </div>

    <form
      class="space-y-4"
      @submit.prevent="handleSubmit"
    >
      <div class="space-y-2">
        <Label>
          {{ isBackupCode ? 'Code de récupération' : 'Code à 6 chiffres' }}
        </Label>

        <!-- Code TOTP avec InputOtp -->
        <InputOtp
          v-if="!isBackupCode"
          v-model="code"
          :maxlength="6"
          class="justify-center"
          @complete="handleSubmit"
        >
          <InputOtpGroup>
            <InputOtpSlot :index="0" />
            <InputOtpSlot :index="1" />
            <InputOtpSlot :index="2" />
          </InputOtpGroup>
          <InputOtpGroup>
            <InputOtpSlot :index="3" />
            <InputOtpSlot :index="4" />
            <InputOtpSlot :index="5" />
          </InputOtpGroup>
        </InputOtp>

        <!-- Code de récupération avec Input standard -->
        <Input
          v-else
          id="backup-code"
          v-model="code"
          type="text"
          inputmode="text"
          maxlength="8"
          placeholder="XXXXXXXX"
          class="text-center font-mono text-lg tracking-widest uppercase"
          autocomplete="one-time-code"
        />
      </div>

      <Button
        type="submit"
        class="w-full"
        :disabled="validateMutation.isPending.value"
      >
        <Loader2
          v-if="validateMutation.isPending.value"
          class="mr-2 h-4 w-4 animate-spin"
        />
        Vérifier
      </Button>
    </form>

    <div class="space-y-2">
      <Button
        variant="ghost"
        class="w-full text-sm"
        @click="isBackupCode = !isBackupCode"
      >
        {{
          isBackupCode
            ? "Utiliser le code de l'application"
            : 'Utiliser un code de récupération'
        }}
      </Button>

      <Button
        variant="ghost"
        class="w-full text-sm"
        @click="emit('back')"
      >
        <ArrowLeft class="mr-2 h-4 w-4" />
        Retour à la connexion
      </Button>
    </div>
  </div>
</template>
