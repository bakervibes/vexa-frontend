<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useAuthModal } from '@/composables/useAuthModal'
import { useReviewsMutation } from '@/composables/useReviews'
import { useAuthStore } from '@/stores/auth'
import type { ProductWithDetails, ReviewWithUser } from '@/types'
import {
  addReviewSchema,
  updateReviewSchema,
} from '@/validators/reviews.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { Star, X } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
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

const validationSchema = computed(() => {
  if (props.review) {
    return toTypedSchema(updateReviewSchema)
  }
  return toTypedSchema(addReviewSchema)
})

const form = useForm({
  validationSchema: validationSchema.value,
  initialValues: {
    comment: props.review?.comment ?? '',
    rating: props.review?.rating ?? 0,
    ...(props.product.id && { productId: props.product.id }),
  },
})

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
    form.resetForm()
    emit('success')
  } catch (error) {
    console.error('Error submitting review:', error)
  }
}

const onSubmit = form.handleSubmit(async (values) => {
  if (!authStore.isAuthenticated) {
    openAuthModal('login', () => {
      submitReview(values)
    })
    return
  }
  await submitReview(values)
})

const handleCancel = () => {
  form.resetForm()
  emit('cancel')
}
</script>

<template>
  <form
    @submit="onSubmit"
    class="space-y-4"
  >
    <div class="flex items-center justify-between">
      <FormField
        v-slot="{ componentField }"
        name="rating"
      >
        <FormItem>
          <FormControl>
            <div class="flex gap-1">
              <button
                v-for="i in 5"
                :key="i"
                type="button"
                @click="componentField.onChange(i)"
                class="size-6 cursor-pointer"
              >
                <Star
                  :class="[
                    'size-6 text-yellow-500',
                    i <= componentField.modelValue && 'fill-yellow-500',
                  ]"
                />
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <Button
        v-if="review"
        size="icon"
        type="button"
        variant="ghost"
        @click="handleCancel"
        class="m-0 h-auto w-auto p-0 hover:bg-transparent"
      >
        <X class="size-4" />
      </Button>
    </div>

    <FormField
      v-slot="{ componentField }"
      name="comment"
    >
      <FormItem>
        <FormControl>
          <Textarea
            :rows="4"
            placeholder="Contenu de votre avis..."
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <LoadingButton
      :loading="isAddingReview || isUpdatingReview"
      type="submit"
      :disabled="isAddingReview || isUpdatingReview"
    >
      Envoyer
    </LoadingButton>
  </form>
</template>
