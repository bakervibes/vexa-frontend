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
import { useAuth } from '@/composables/useAuth'
import { useReviews } from '@/composables/useReviews'
import type { ProductWithDetails, ReviewWithUser } from '@/types'
import {
  addReviewSchema,
  updateReviewSchema,
  type AddReviewInput,
  type UpdateReviewInput,
} from '@/validators/reviews.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { Star, X } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  product: ProductWithDetails
  review?: ReviewWithUser
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'success'): void
  (e: 'cancel'): void
}>()

const { addReview, updateReview, isAddingReview, isUpdatingReview } =
  useReviews(props.product.id)

const { isAuthenticated, openAuthModal } = useAuth()
const error = ref<string | null>(null)

const schema = computed(() => {
  if (props.review) {
    return toTypedSchema(updateReviewSchema)
  }
  return toTypedSchema(addReviewSchema)
})

const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    comment: props.review?.comment ?? '',
    rating: props.review?.rating ?? 0,
    ...(props.product.id && { productId: props.product.id }),
  },
})

const submitReview = async (formValues: AddReviewInput | UpdateReviewInput) => {
  error.value = null
  try {
    if (!props.review) {
      // Create new review
      await addReview({
        productId: props.product.id,
        comment: formValues.comment,
        rating: formValues.rating,
        slug: props.product.slug,
      })
    } else {
      // Update existing review
      await updateReview({
        id: props.review.id,
        data: {
          comment: formValues.comment,
          rating: formValues.rating,
        },
        slug: props.product.slug,
      })
    }
    toast.success(props.review ? 'Avis modifié' : 'Avis publié', {
      description: props.review
        ? 'Votre avis a été mis à jour.'
        : 'Merci pour votre avis !',
    })
    resetForm()
    emit('success')
  } catch (err: unknown) {
    console.error('Error submitting review:', err)
    error.value =
      err instanceof Error
        ? err.message
        : 'Une erreur est survenue lors de la soumission.'
    toast.error('Erreur', {
      description: error.value ?? undefined,
    })
  }
}

const onSubmit = handleSubmit(async (formValues) => {
  if (!isAuthenticated.value) {
    openAuthModal('login', () => {
      submitReview(formValues)
    })
    return
  }
  await submitReview(formValues)
})

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <form
    @submit="onSubmit"
    class="space-y-4"
  >
    <Alert
      v-if="error"
      variant="destructive"
    >
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div class="flex items-center justify-between">
      <FormField
        v-slot="{ componentField }"
        name="rating"
      >
        <FormItem class="flex flex-col gap-1">
          <div class="flex gap-1">
            <button
              v-for="i in 5"
              :key="i"
              type="button"
              @click="componentField['onUpdate:modelValue']?.(i)"
              class="size-6 cursor-pointer"
            >
              <Star
                :class="[
                  'size-6 text-yellow-500',
                  i <= (componentField.modelValue || 0) && 'fill-yellow-500',
                ]"
              />
            </button>
          </div>
          <FormMessage />
        </FormItem>
      </FormField>

      <Button
        v-if="review"
        variant="ghost"
        size="icon"
        type="button"
        @click="handleCancel"
        class="h-6 w-6"
      >
        <X class="size-4" />
      </Button>
    </div>

    <FormField
      v-slot="{ componentField }"
      name="comment"
    >
      <FormItem class="flex flex-col gap-1">
        <FormControl>
          <Textarea
            placeholder="Contenu de votre avis..."
            class="min-h-[100px]"
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
