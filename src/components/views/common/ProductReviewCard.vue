<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthModal } from '@/composables/useAuthModal'
import { useReviewsMutation } from '@/composables/useReviews'
import { useAuthStore } from '@/stores/auth'
import type { ProductWithDetails, ReviewWithUser } from '@/types'
import { formatDate } from '@/utils/lib'
import { MoreVertical, Pencil, StarIcon, Trash2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import ProductReviewForm from './ProductReviewForm.vue'

interface Props {
  product: ProductWithDetails
  review: ReviewWithUser
}

const props = defineProps<Props>()

const emit = defineEmits<{
  deleted: []
  updated: []
}>()

const authStore = useAuthStore()
const { openAuthModal } = useAuthModal()
const { deleteReview, isDeletingReview } = useReviewsMutation()

const isEdit = ref(false)
const isDelete = ref(false)
const dialogOpen = ref(false)

const isOwnReview = computed(() => {
  return authStore.user?.id === props.review.user.id
})

// Renvoie un tableau de 5 valeurs entre 0 et 100 (% de remplissage par étoile)
const stars = computed(() => {
  const values: number[] = []
  let remaining = Number(props.review.rating)

  for (let i = 0; i < 5; i++) {
    if (remaining >= 1) {
      values.push(100) // étoile pleine
    } else if (remaining > 0) {
      values.push(remaining * 100) // pourcentage de remplissage
    } else {
      values.push(0) // vide
    }
    remaining -= 1
  }

  return values
})

const handleEdit = () => {
  isEdit.value = true
}

const handleDeleteClick = () => {
  isDelete.value = true
  dialogOpen.value = true
}

const handleCancel = () => {
  isDelete.value = false
  dialogOpen.value = false
}

const handleDelete = async () => {
  if (!authStore.isAuthenticated) {
    openAuthModal('login', () => {
      performDelete()
    })
    return
  }
  await performDelete()
}

const performDelete = async () => {
  try {
    await deleteReview({ id: props.review.id, slug: props.product.slug })
    isDelete.value = false
    dialogOpen.value = false
    emit('deleted')
  } catch (error) {
    console.error('Error deleting review:', error)
  }
}

const handleEditSuccess = () => {
  isEdit.value = false
  emit('updated')
}

const handleEditCancel = () => {
  isEdit.value = false
}
</script>

<template>
  <ProductReviewForm
    v-if="isEdit"
    :review="review"
    :product="product"
    @success="handleEditSuccess"
    @cancel="handleEditCancel"
  />

  <li
    v-else
    class="space-y-4 border-b border-dashed border-black/40 pb-6"
  >
    <div class="flex justify-between">
      <div class="flex items-center">
        <template
          v-for="(fillPercent, index) in stars"
          :key="index"
        >
          <div class="relative h-4 w-4">
            <!-- Contour gris -->
            <StarIcon
              class="absolute top-0 left-0 h-full w-full text-gray-300"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            />

            <!-- Remplissage dynamique -->
            <StarIcon
              class="absolute top-0 left-0 h-full w-full text-yellow-400"
              fill="currentColor"
              stroke="none"
              :style="{
                clipPath: `inset(0 ${100 - fillPercent}% 0 0)`,
              }"
            />
          </div>
        </template>
      </div>

      <DropdownMenu v-if="isOwnReview">
        <DropdownMenuTrigger as-child>
          <Button
            type="button"
            variant="ghost"
            class="m-0 h-auto w-auto p-0 hover:bg-transparent"
          >
            <MoreVertical class="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          class="space-y-1"
        >
          <DropdownMenuItem
            class="cursor-pointer"
            @click="handleEdit"
          >
            <Pencil
              :size="16"
              class="mr-2"
            />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            class="hover:text-destructive! cursor-pointer"
            @click="handleDeleteClick"
          >
            <Trash2
              :size="16"
              class="mr-2"
            />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="flex flex-col gap-2">
      <p class="font-medium whitespace-pre-wrap text-black/80">
        {{ review.comment }}
      </p>
      <span class="text-muted-foreground text-sm font-medium">
        {{ formatDate(review.updatedAt, true) }}
        <span
          v-if="
            review.updatedAt &&
            review.createdAt &&
            new Date(review.updatedAt).getTime() !==
              new Date(review.createdAt).getTime()
          "
        >
          (Edited)
        </span>
      </span>
    </div>

    <div class="flex items-center justify-between">
      <div class="text-primary flex items-center gap-4 font-semibold">
        <Avatar>
          <AvatarImage
            v-if="review.user.image"
            class="object-cover"
            :src="review.user.image"
          />
          <AvatarFallback
            v-else
            class="text-sm uppercase"
          >
            {{ review.user.name.substring(0, 2) }}
          </AvatarFallback>
        </Avatar>
        <span>{{ review.user.name }}</span>
      </div>
    </div>

    <!-- Delete Dialog -->
    <Dialog
      v-model:open="dialogOpen"
      @update:open="(value) => !value && handleCancel()"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Êtes-vous sûr ?</DialogTitle>
          <DialogDescription>
            La suppression de cet avis est irréversible.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter class="flex-row! justify-end gap-2">
          <DialogClose as-child>
            <Button
              variant="outline"
              class="w-fit"
              @click="handleCancel"
            >
              Annuler
            </Button>
          </DialogClose>

          <LoadingButton
            class="w-fit"
            :loading="isDeletingReview"
            :disabled="isDeletingReview"
            variant="destructive"
            @click="handleDelete"
          >
            Supprimer
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </li>
</template>
