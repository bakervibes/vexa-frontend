<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import { useAuthModal } from '@/composables/useAuthModal'
import { useReviewsMutation } from '@/composables/useReviews'
import { useAuthStore } from '@/stores/auth'
import type { ProductWithDetails, ReviewWithUser } from '@/types'
import { formatDate } from '@/utils/lib'
import { MoreVertical, Pencil, StarIcon, Trash2 } from 'lucide-vue-next'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Menu from 'primevue/menu'
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
const menu = ref()

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

const menuItems = ref([
  {
    label: 'Modifier',
    icon: Pencil,
    command: () => {
      isEdit.value = true
    },
  },
  {
    label: 'Supprimer',
    icon: Trash2,
    command: () => {
      handleDeleteClick()
    },
    class: 'text-red-500',
  },
])

const handleEdit = () => {
  isEdit.value = true
}

const toggle = (event: Event) => {
  menu.value.toggle(event)
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

const getUserInitials = () => {
  return props.review.user.name.substring(0, 2).toUpperCase()
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

      <div v-if="isOwnReview">
        <Button
          type="button"
          text
          class="m-0 h-auto w-auto p-0"
          @click="toggle"
        >
          <MoreVertical class="size-4" />
        </Button>
        <Menu
          ref="menu"
          :model="menuItems"
          :popup="true"
        >
          <template #item="{ item }">
            <button
              @click="item.command"
              class="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-100"
              :class="item.class"
            >
              <component
                :is="item.icon"
                :size="16"
              />
              <span>{{ item.label }}</span>
            </button>
          </template>
        </Menu>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <p class="font-medium whitespace-pre-wrap text-black/80">
        {{ review.comment }}
      </p>
      <span class="text-sm font-medium text-gray-500">
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
        <Avatar
          v-if="review.user.image"
          :image="review.user.image"
          shape="circle"
          size="large"
        />
        <Avatar
          v-else
          :label="getUserInitials()"
          shape="circle"
          size="large"
          class="text-sm uppercase"
        />
        <span>{{ review.user.name }}</span>
      </div>
    </div>

    <!-- Delete Dialog -->
    <Dialog
      v-model:visible="dialogOpen"
      modal
      header="Êtes-vous sûr ?"
      :style="{ width: '25rem' }"
      :dismissableMask="true"
      @hide="handleCancel"
    >
      <p class="text-gray-600">La suppression de cet avis est irréversible.</p>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            outlined
            class="w-fit"
            @click="handleCancel"
          >
            Annuler
          </Button>

          <LoadingButton
            class="w-fit"
            :loading="isDeletingReview"
            :disabled="isDeletingReview"
            severity="danger"
            @click="handleDelete"
          >
            Supprimer
          </LoadingButton>
        </div>
      </template>
    </Dialog>
  </li>
</template>
