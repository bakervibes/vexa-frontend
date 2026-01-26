<script setup lang="ts">
/**
 * Composant pour la configuration du 2FA (Two-Factor Authentication)
 * Affiche le QR code et permet d'activer/désactiver le 2FA
 */
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

// Query pour le statut 2FA
const { data: status, isLoading: isLoadingStatus } = useQuery({
  queryKey: ['2fa', 'status'],
  queryFn: () => api<TwoFactorStatus>('/auth/2fa/status', 'GET'),
})

// Query pour le setup 2FA
const { data: setupData, refetch: fetchSetup } = useQuery({
  queryKey: ['2fa', 'setup'],
  queryFn: () => api<TwoFactorSetup>('/auth/2fa/setup', 'POST'),
  enabled: false,
})

// Mutation pour vérifier et activer le 2FA
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

// Mutation pour désactiver le 2FA
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

// Mutation pour régénérer les codes de récupération
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
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <ShieldCheck class="h-6 w-6 text-green-600" />
      <div>
        <h3 class="text-lg font-semibold">Authentification à deux facteurs</h3>
        <p class="text-muted-foreground text-sm">
          Ajoutez une couche de sécurité supplémentaire à votre compte
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="isLoadingStatus"
      class="flex items-center justify-center py-8"
    >
      <Loader2 class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <!-- 2FA est activé -->
    <div
      v-else-if="status?.enabled"
      class="space-y-4"
    >
      <Alert>
        <CheckCircle class="h-4 w-4 text-green-600" />
        <AlertDescription>
          L'authentification à deux facteurs est
          <strong>activée</strong>
          .
          <span
            v-if="status.backupCodesRemaining <= 3"
            class="text-orange-600"
          >
            Il vous reste {{ status.backupCodesRemaining }} code(s) de
            récupération.
          </span>
        </AlertDescription>
      </Alert>

      <div class="space-y-4 rounded-lg border p-4">
        <h4 class="font-medium">Désactiver le 2FA</h4>
        <div class="space-y-2">
          <Label for="disable-password">Mot de passe actuel</Label>
          <Input
            id="disable-password"
            v-model="disablePassword"
            type="password"
            placeholder="Entrez votre mot de passe"
          />
        </div>
        <div class="flex gap-2">
          <Button
            variant="destructive"
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
            variant="outline"
            :disabled="regenerateMutation.isPending.value"
            @click="regenerateMutation.mutate(disablePassword)"
          >
            Régénérer les codes
          </Button>
        </div>
      </div>
    </div>

    <!-- 2FA n'est pas activé -->
    <div
      v-else
      class="space-y-4"
    >
      <!-- Étape 1: Démarrer le setup -->
      <div v-if="!setupData">
        <Alert>
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>
            L'authentification à deux facteurs n'est pas activée. Activez-la
            pour sécuriser votre compte.
          </AlertDescription>
        </Alert>
        <Button
          class="mt-4"
          @click="startSetup"
        >
          <ShieldCheck class="mr-2 h-4 w-4" />
          Configurer le 2FA
        </Button>
      </div>

      <!-- Étape 2: Scanner le QR code -->
      <div
        v-else
        class="space-y-4"
      >
        <div class="rounded-lg border p-4">
          <h4 class="mb-4 font-medium">1. Scannez le QR code</h4>
          <p class="text-muted-foreground mb-4 text-sm">
            Utilisez une application d'authentification (Google Authenticator,
            Authy, etc.) pour scanner ce QR code.
          </p>
          <div class="flex justify-center">
            <img
              :src="setupData.qrCode"
              alt="QR Code 2FA"
              class="h-48 w-48"
            />
          </div>
        </div>

        <div class="rounded-lg border p-4">
          <h4 class="mb-2 font-medium">Ou entrez le code manuellement</h4>
          <div class="flex items-center gap-2">
            <code class="bg-muted flex-1 rounded px-2 py-1 text-sm">
              {{ setupData.secret }}
            </code>
            <Button
              variant="outline"
              size="icon"
              @click="copySecret"
            >
              <Copy class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div class="rounded-lg border p-4">
          <h4 class="mb-4 font-medium">2. Entrez le code de vérification</h4>
          <div class="space-y-2">
            <Label>Code à 6 chiffres</Label>
            <InputOtp
              v-model="verificationCode"
              :maxlength="6"
              class="justify-center"
              @complete="verifyCode"
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
          </div>
          <Button
            class="mt-4"
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

    <!-- Modal des codes de récupération -->
    <div
      v-if="showBackupCodes && backupCodes.length > 0"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="mx-4 max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
        <h3 class="mb-4 text-lg font-semibold">Codes de récupération</h3>
        <Alert class="mb-4">
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>
            <strong>Important :</strong>
            Sauvegardez ces codes dans un endroit sûr. Vous en aurez besoin si
            vous perdez accès à votre application d'authentification.
          </AlertDescription>
        </Alert>
        <div class="bg-muted mb-4 grid grid-cols-2 gap-2 rounded p-4">
          <code
            v-for="code in backupCodes"
            :key="code"
            class="font-mono text-sm"
          >
            {{ code }}
          </code>
        </div>
        <div class="flex gap-2">
          <Button
            variant="outline"
            @click="copyBackupCodes"
          >
            <Copy class="mr-2 h-4 w-4" />
            Copier
          </Button>
          <Button @click="showBackupCodes = false">
            J'ai sauvegardé mes codes
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
