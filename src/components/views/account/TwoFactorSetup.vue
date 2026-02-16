<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  InputOtp,
  InputOtpGroup,
  InputOtpSlot,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { api } from '@/utils/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Loader2,
  ShieldCheck,
  ShieldOff,
} from 'lucide-vue-next'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

interface TwoFactorStatus {
  enabled: boolean
  backupCodesRemaining: number
}

interface TwoFactorSetup {
  secret: string
  qrCode: string
  otpauthUrl: string
}

interface TwoFactorVerifyResponse {
  enabled: boolean
  backupCodes: string[]
}

const queryClient = useQueryClient()
const verificationCode = ref('')
const disablePassword = ref('')
const backupCodes = ref<string[]>([])
const showBackupCodes = ref(false)

const { data: status, isLoading: isLoadingStatus } = useQuery({
  queryKey: ['2fa', 'status'],
  queryFn: () => api<TwoFactorStatus>('/auth/2fa/status', 'GET'),
})

const { data: setupData, refetch: fetchSetup } = useQuery({
  queryKey: ['2fa', 'setup'],
  queryFn: () => api<TwoFactorSetup>('/auth/2fa/setup', 'POST'),
  enabled: false,
})

const verifyMutation = useMutation({
  mutationFn: (code: string) =>
    api<TwoFactorVerifyResponse>('/auth/2fa/verify', 'POST', { code }),
  onSuccess: (data) => {
    backupCodes.value = data.backupCodes
    showBackupCodes.value = true
    queryClient.invalidateQueries({ queryKey: ['2fa', 'status'] })
    toast.success('2FA activé', {
      description: "L'authentification à deux facteurs est maintenant activée.",
    })
  },
  onError: (error: Error) => {
    toast.error('Erreur', {
      description: error.message || 'Code invalide',
    })
  },
})

const disableMutation = useMutation({
  mutationFn: (password: string) =>
    api('/auth/2fa/disable', 'POST', { password }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['2fa', 'status'] })
    disablePassword.value = ''
    toast.success('2FA désactivé', {
      description: "L'authentification à deux facteurs a été désactivée.",
    })
  },
  onError: (error: Error) => {
    toast.error('Erreur', {
      description: error.message || 'Mot de passe incorrect',
    })
  },
})

const regenerateMutation = useMutation({
  mutationFn: (password: string) =>
    api<{ backupCodes: string[] }>('/auth/2fa/backup-codes', 'POST', {
      password,
    }),
  onSuccess: (data) => {
    backupCodes.value = data.backupCodes
    showBackupCodes.value = true
    toast.success('Codes régénérés', {
      description: 'Vos nouveaux codes de récupération sont prêts.',
    })
  },
  onError: (error: Error) => {
    toast.error('Erreur', {
      description: error.message || 'Mot de passe incorrect',
    })
  },
})

const startSetup = async () => {
  await fetchSetup()
}

const verifyCode = () => {
  if (verificationCode.value.length !== 6) {
    toast.error('Code invalide', {
      description: 'Le code doit contenir 6 chiffres.',
    })
    return
  }
  verifyMutation.mutate(verificationCode.value)
}

const disable2FA = () => {
  if (!disablePassword.value) {
    toast.error('Mot de passe requis', {
      description: 'Veuillez entrer votre mot de passe.',
    })
    return
  }
  disableMutation.mutate(disablePassword.value)
}

const copySecret = () => {
  if (setupData.value?.secret) {
    navigator.clipboard.writeText(setupData.value.secret)
    toast.success('Copié', {
      description: 'Secret copié dans le presse-papiers.',
    })
  }
}

const copyBackupCodes = () => {
  if (backupCodes.value.length > 0) {
    navigator.clipboard.writeText(backupCodes.value.join('\n'))
    toast.success('Copié', {
      description: 'Codes de récupération copiés.',
    })
  }
}
</script>

<template>
  <div class="space-y-6 bg-[#0A0A0A]">
    <div class="flex items-center gap-3 border-b border-[#1E1E1E] pb-6">
      <ShieldCheck class="h-6 w-6 text-[#C8A97E]" />
      <div>
        <p class="text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
          Security
        </p>
        <h3 class="font-display text-xl text-[#E8E8E8]">
          Authentification à deux facteurs
        </h3>
        <p class="text-text-muted text-sm">
          Ajoutez une couche de sécurité supplémentaire à votre compte
        </p>
      </div>
    </div>

    <div
      v-if="isLoadingStatus"
      class="flex items-center justify-center py-8"
    >
      <Loader2 class="text-text-muted h-8 w-8 animate-spin" />
    </div>

    <div
      v-else-if="status?.enabled"
      class="space-y-4"
    >
      <Alert class="bg-surface border-[#1E1E1E]">
        <CheckCircle class="h-4 w-4 text-[#C8A97E]" />
        <AlertDescription class="text-[#E8E8E8]">
          L'authentification à deux facteurs est
          <strong class="text-[#C8A97E]">activée</strong>
          .
          <span
            v-if="status.backupCodesRemaining <= 3"
            class="text-[#C8A97E]"
          >
            Il vous reste {{ status.backupCodesRemaining }} code(s) de
            récupération.
          </span>
        </AlertDescription>
      </Alert>

      <div class="bg-surface space-y-4 border border-[#1E1E1E] p-6">
        <p class="text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
          Settings
        </p>
        <h4 class="font-display text-lg text-[#E8E8E8]">Désactiver le 2FA</h4>
        <div class="space-y-2">
          <Label
            for="disable-password"
            class="text-text-muted text-xs tracking-widest uppercase"
          >
            Mot de passe actuel
          </Label>
          <Input
            id="disable-password"
            v-model="disablePassword"
            type="password"
            placeholder="Entrez votre mot de passe"
            class="placeholder:text-text-muted border-[#1E1E1E] bg-[#0A0A0A] text-[#E8E8E8] focus:border-[#C8A97E]"
          />
        </div>
        <div class="flex gap-3">
          <Button
            class="border border-red-500/40 bg-transparent tracking-wider text-red-400 uppercase hover:bg-red-500 hover:text-[#0A0A0A]"
            :disabled="disableMutation.isPending.value"
            @click="disable2FA"
          >
            <ShieldOff
              v-if="!disableMutation.isPending.value"
              class="mr-2 h-4 w-4"
            />
            <Loader2
              v-else
              class="mr-2 h-4 w-4 animate-spin"
            />
            Désactiver le 2FA
          </Button>
          <Button
            class="border border-[#C8A97E]/40 bg-transparent tracking-wider text-[#C8A97E] uppercase hover:bg-[#C8A97E] hover:text-[#0A0A0A]"
            :disabled="regenerateMutation.isPending.value"
            @click="regenerateMutation.mutate(disablePassword)"
          >
            Régénérer les codes
          </Button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <div v-if="!setupData">
        <Alert class="bg-surface border-[#1E1E1E]">
          <AlertCircle class="h-4 w-4 text-[#C8A97E]" />
          <AlertDescription class="text-[#E8E8E8]">
            L'authentification à deux facteurs n'est pas activée. Activez-la
            pour sécuriser votre compte.
          </AlertDescription>
        </Alert>
        <Button
          class="mt-4 border border-[#C8A97E]/40 bg-transparent tracking-wider text-[#C8A97E] uppercase hover:bg-[#C8A97E] hover:text-[#0A0A0A]"
          @click="startSetup"
        >
          <ShieldCheck class="mr-2 h-4 w-4" />
          Configurer le 2FA
        </Button>
      </div>

      <div
        v-else
        class="space-y-4"
      >
        <div class="bg-surface border border-[#1E1E1E] p-6">
          <p class="text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
            Step 1
          </p>
          <h4 class="font-display mb-4 text-lg text-[#E8E8E8]">
            Scannez le QR code
          </h4>
          <p class="text-text-muted mb-4 text-sm">
            Utilisez une application d'authentification (Google Authenticator,
            Authy, etc.) pour scanner ce QR code.
          </p>
          <div class="flex justify-center bg-[#0A0A0A] p-4">
            <img
              :src="setupData.qrCode"
              alt="QR Code 2FA"
              class="h-48 w-48"
            />
          </div>
        </div>

        <div class="bg-surface border border-[#1E1E1E] p-6">
          <p class="text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
            Alternative
          </p>
          <h4 class="font-display mb-2 text-lg text-[#E8E8E8]">
            Ou entrez le code manuellement
          </h4>
          <div class="flex items-center gap-2">
            <code
              class="flex-1 border border-[#1E1E1E] bg-[#0A0A0A] px-3 py-2 font-mono text-sm text-[#E8E8E8]"
            >
              {{ setupData.secret }}
            </code>
            <Button
              class="border border-[#C8A97E]/40 bg-transparent text-[#C8A97E] hover:bg-[#C8A97E] hover:text-[#0A0A0A]"
              size="icon"
              @click="copySecret"
            >
              <Copy class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div class="bg-surface border border-[#1E1E1E] p-6">
          <p class="text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
            Step 2
          </p>
          <h4 class="font-display mb-4 text-lg text-[#E8E8E8]">
            Entrez le code de vérification
          </h4>
          <div class="space-y-2">
            <Label class="text-text-muted text-xs tracking-widest uppercase">
              Code à 6 chiffres
            </Label>
            <InputOtp
              v-model="verificationCode"
              :maxlength="6"
              class="justify-center"
              @complete="verifyCode"
            >
              <InputOtpGroup>
                <InputOtpSlot
                  :index="0"
                  class="border-[#1E1E1E] bg-[#0A0A0A] text-[#E8E8E8] focus:border-[#C8A97E]"
                />
                <InputOtpSlot
                  :index="1"
                  class="border-[#1E1E1E] bg-[#0A0A0A] text-[#E8E8E8] focus:border-[#C8A97E]"
                />
                <InputOtpSlot
                  :index="2"
                  class="border-[#1E1E1E] bg-[#0A0A0A] text-[#E8E8E8] focus:border-[#C8A97E]"
                />
              </InputOtpGroup>
              <InputOtpGroup>
                <InputOtpSlot
                  :index="3"
                  class="border-[#1E1E1E] bg-[#0A0A0A] text-[#E8E8E8] focus:border-[#C8A97E]"
                />
                <InputOtpSlot
                  :index="4"
                  class="border-[#1E1E1E] bg-[#0A0A0A] text-[#E8E8E8] focus:border-[#C8A97E]"
                />
                <InputOtpSlot
                  :index="5"
                  class="border-[#1E1E1E] bg-[#0A0A0A] text-[#E8E8E8] focus:border-[#C8A97E]"
                />
              </InputOtpGroup>
            </InputOtp>
          </div>
          <Button
            class="mt-4 border border-[#C8A97E]/40 bg-transparent tracking-wider text-[#C8A97E] uppercase hover:bg-[#C8A97E] hover:text-[#0A0A0A]"
            :disabled="
              verifyMutation.isPending.value || verificationCode.length !== 6
            "
            @click="verifyCode"
          >
            <Loader2
              v-if="verifyMutation.isPending.value"
              class="mr-2 h-4 w-4 animate-spin"
            />
            Activer le 2FA
          </Button>
        </div>
      </div>
    </div>

    <div
      v-if="showBackupCodes && backupCodes.length > 0"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    >
      <div class="bg-surface mx-4 max-w-md border border-[#1E1E1E] p-8">
        <p class="text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
          Important
        </p>
        <h3 class="font-display mb-4 text-xl text-[#E8E8E8]">
          Codes de récupération
        </h3>
        <Alert class="mb-4 border-[#1E1E1E] bg-[#0A0A0A]">
          <AlertCircle class="h-4 w-4 text-[#C8A97E]" />
          <AlertDescription class="text-[#E8E8E8]">
            <strong class="text-[#C8A97E]">Important :</strong>
            Sauvegardez ces codes dans un endroit sûr. Vous en aurez besoin si
            vous perdez accès à votre application d'authentification.
          </AlertDescription>
        </Alert>
        <div
          class="mb-4 grid grid-cols-2 gap-2 border border-[#1E1E1E] bg-[#0A0A0A] p-4"
        >
          <code
            v-for="code in backupCodes"
            :key="code"
            class="font-mono text-sm text-[#E8E8E8]"
          >
            {{ code }}
          </code>
        </div>
        <div class="flex gap-3">
          <Button
            class="flex-1 border border-[#C8A97E]/40 bg-transparent tracking-wider text-[#C8A97E] uppercase hover:bg-[#C8A97E] hover:text-[#0A0A0A]"
            @click="copyBackupCodes"
          >
            <Copy class="mr-2 h-4 w-4" />
            Copier
          </Button>
          <Button
            class="flex-1 border border-[#C8A97E]/40 bg-[#C8A97E] tracking-wider text-[#0A0A0A] uppercase hover:bg-[#C8A97E]/80"
            @click="showBackupCodes = false"
          >
            J'ai sauvegardé mes codes
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
