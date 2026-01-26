<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
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
import { useAuth } from '@/composables/useAuth'
import { useReviews } from '@/composables/useReviews'
import type { ProductWithDetails, ReviewWithUser } from '@/types'
import { formatDate } from '@/utils/lib'
import { MoreVertical, Pencil, StarIcon, Trash2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import ProductReviewForm from './ProductReviewForm.vue'

interface Props {
  product: ProductWithDetails
  review: ReviewWithUser
  isEditing: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'startEditing'): void
  (e: 'stopEditing'): void
  (e: 'reviewUpdated'): void
  (e: 'reviewDeleted'): void
}>()

const { user, isAuthenticated, openAuthModal } = useAuth()
const { deleteReview, isDeletingReview } = useReviews(props.product.id)

const dialogOpen = ref(false)

const isOwnReview = computed(() => {
  return user.value?.id === props.review.user.id
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

const handleDeleteClick = () => {
  dialogOpen.value = true
}

const handleCancel = () => {
  dialogOpen.value = false
}

const handleDelete = async () => {
  if (!isAuthenticated.value) {
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
    dialogOpen.value = false
    emit('reviewDeleted')
  } catch (error) {
    console.error('Error deleting review:', error)
  }
}

const handleEditSuccess = () => {
  emit('stopEditing')
  emit('reviewUpdated')
}

const handleEditCancel = () => {
  emit('stopEditing')
}

const getUserInitials = () => {
  const name = props.review.user.name
  if (name) {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  return 'U'
}

const getFullName = () => {
  return props.review.user.name || 'Anonymous'
}
</script>

<template>
  <ProductReviewForm
    v-if="isEditing"
    :review="review"
    :product="product"
    @success="handleEditSuccess"
    @cancel="handleEditCancel"
  />

  <li
    v-else
    class="space-y-4"
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

      <div v-if="isOwnReview">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8 p-0"
            >
              <MoreVertical class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="emit('startEditing')">
              <Pencil class="mr-2 h-4 w-4" />
              <span>Modifier</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              @click="handleDeleteClick"
              class="text-red-500 focus:text-red-500"
            >
              <Trash2 class="mr-2 h-4 w-4" />
              <span>Supprimer</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <p class="font-medium whitespace-pre-wrap text-black/80">
        {{ review.comment }}
      </p>
      <span class="text-xs font-medium text-gray-500">
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
        <Avatar class="h-10 w-10">
          <AvatarImage
            v-if="review.user.image"
            :src="review.user.image"
          />
          <AvatarFallback class="text-sm uppercase">
            {{ getUserInitials() }}
          </AvatarFallback>
        </Avatar>
        <span>{{ getFullName() }}</span>
      </div>
    </div>

    <!-- Delete Dialog -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>Êtes-vous sûr ?</DialogTitle>
          <DialogDescription>
            La suppression de cet avis est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            class="w-fit"
            @click="handleCancel"
          >
            Annuler
          </Button>

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
