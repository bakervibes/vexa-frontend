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
import {
  DotIcon,
  MoreVertical,
  Pencil,
  StarIcon,
  Trash2,
} from 'lucide-vue-next'
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

const stars = computed(() => {
  const values: number[] = []
  let remaining = Number(props.review.rating)

  for (let i = 0; i < 5; i++) {
    if (remaining >= 1) {
      values.push(100)
    } else if (remaining > 0) {
      values.push(remaining * 100)
    } else {
      values.push(0)
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
    class="bg-surface space-y-4 border border-[#1E1E1E] p-6"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2">
          <Avatar class="h-9 w-9 border border-[#1E1E1E]">
            <AvatarImage
              v-if="review.user.image"
              :src="review.user.image"
            />
            <AvatarFallback
              class="font-display bg-[#1E1E1E] text-sm text-[#C8A97E] uppercase"
            >
              {{ getUserInitials() }}
            </AvatarFallback>
          </Avatar>

          <span class="font-display text-lg text-[#E8E8E8]">
            {{ getFullName() }}
          </span>
        </div>

        <DotIcon class="text-text-muted size-4" />

        <span class="text-text-muted text-sm font-medium">
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

      <div v-if="isOwnReview">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="text-text-muted h-8 w-8 p-0 hover:bg-[#1E1E1E] hover:text-[#E8E8E8]"
            >
              <MoreVertical class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            class="bg-surface border-[#1E1E1E]"
          >
            <DropdownMenuItem
              @click="emit('startEditing')"
              class="text-[#E8E8E8] focus:bg-[#1E1E1E] focus:text-[#C8A97E]"
            >
              <Pencil class="mr-2 h-4 w-4" />
              <span>Modifier</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              @click="handleDeleteClick"
              class="text-[#C8A97E] focus:bg-[#1E1E1E] focus:text-[#C8A97E]"
            >
              <Trash2 class="mr-2 h-4 w-4" />
              <span>Supprimer</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <p
      class="font-display text-lg leading-relaxed whitespace-pre-wrap text-[#E8E8E8]"
    >
      {{ review.comment }}
    </p>

    <div class="flex items-center gap-0.5">
      <template
        v-for="(fillPercent, index) in stars"
        :key="index"
      >
        <div class="relative h-5 w-5">
          <StarIcon
            class="text-text-muted absolute top-0 left-0 h-full w-full"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          />

          <StarIcon
            class="absolute top-0 left-0 h-full w-full text-[#C8A97E]"
            fill="currentColor"
            stroke="none"
            :style="{
              clipPath: `inset(0 ${100 - fillPercent}% 0 0)`,
            }"
          />
        </div>
      </template>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="bg-surface border-[#1E1E1E] sm:max-w-100">
        <DialogHeader>
          <DialogTitle class="font-display text-[#E8E8E8]">
            Êtes-vous sûr ?
          </DialogTitle>
          <DialogDescription class="text-text-muted">
            La suppression de cet avis est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            class="w-fit border-[#1E1E1E] text-[#E8E8E8] hover:bg-[#1E1E1E] hover:text-[#C8A97E]"
            @click="handleCancel"
          >
            Annuler
          </Button>

          <LoadingButton
            class="w-fit bg-[#C8A97E] text-[#0A0A0A] hover:bg-[#C8A97E]/90"
            :loading="isDeletingReview"
            :disabled="isDeletingReview"
            @click="handleDelete"
          >
            Supprimer
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </li>
</template>
