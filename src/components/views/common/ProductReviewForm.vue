<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import { useAuthModal } from '@/composables/useAuthModal'
import { useReviewsMutation } from '@/composables/useReviews'
import { useAuthStore } from '@/stores/auth'
import type { ProductWithDetails, ReviewWithUser } from '@/types'
import {
  addReviewSchema,
  updateReviewSchema,
} from '@/validators/reviews.validator'
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { Star, X } from 'lucide-vue-next'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import { computed } from 'vue'

interface Props {
  product: ProductWithDetails
  review?: ReviewWithUser
}

interface Emits {
  (e: 'cancel'): void
  (e: 'success'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const { addReview, updateReview, isAddingReview, isUpdatingReview } =
  useReviewsMutation()

const authStore = useAuthStore()
const { openAuthModal } = useAuthModal()

const resolver = computed(() => {
  if (props.review) {
    return zodResolver(updateReviewSchema)
  }
  return zodResolver(addReviewSchema)
})

const initialValues = {
  comment: props.review?.comment ?? '',
  rating: props.review?.rating ?? 0,
  ...(props.product.id && { productId: props.product.id }),
}

const submitReview = async (values: any) => {
  try {
    if (!props.review) {
      // Create new review
      await addReview({
        productId: props.product.id,
        comment: values.comment,
        rating: values.rating,
        slug: props.product.slug,
      })
    } else {
      // Update existing review
      await updateReview({
        id: props.review.id,
        data: {
          comment: values.comment,
          rating: values.rating,
        },
        slug: props.product.slug,
      })
    }
    emit('success')
  } catch (error) {
    console.error('Error submitting review:', error)
  }
}

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid) return

  if (!authStore.isAuthenticated) {
    openAuthModal('login', () => {
      submitReview(values)
    })
    return
  }
  await submitReview(values)
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <Form
    v-slot="$form"
    :initialValues="initialValues"
    :resolver="resolver"
    @submit="onFormSubmit"
    class="space-y-4"
  >
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <div class="flex gap-1">
          <button
            v-for="i in 5"
            :key="i"
            type="button"
            @click="$form.rating = i"
            class="size-6 cursor-pointer"
          >
            <Star
              :class="[
                'size-6 text-yellow-500',
                i <= $form.rating && 'fill-yellow-500',
              ]"
            />
          </button>
        </div>
        <Message
          v-if="$form.rating?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.rating.error?.message }}
        </Message>
      </div>

      <Button
        v-if="review"
        text
        type="button"
        @click="handleCancel"
        class="m-0 h-auto w-auto p-0"
      >
        <X class="size-4" />
      </Button>
    </div>

    <div class="flex flex-col gap-1">
      <Textarea
        name="comment"
        :rows="4"
        placeholder="Contenu de votre avis..."
      />
      <Message
        v-if="$form.comment?.invalid"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ $form.comment.error?.message }}
      </Message>
    </div>

    <LoadingButton
      :loading="isAddingReview || isUpdatingReview"
      type="submit"
      :disabled="isAddingReview || isUpdatingReview"
    >
      Envoyer
    </LoadingButton>
  </Form>
</template>
