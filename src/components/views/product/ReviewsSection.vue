<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProduct } from '@/composables/useProducts'
import { useReviews } from '@/composables/useReviews'
import { Loader2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import ProductRating from '../common/ProductRating.vue'
import ProductReviewCard from '../common/ProductReviewCard.vue'
import ProductReviewForm from '../common/ProductReviewForm.vue'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { product } = useProduct(slug)

// Paginated reviews - pass a getter for reactivity (query runs when product.id becomes available)
const {
  reviews,
  totalReviews,
  hasMoreReviews,
  isLoadingReviews,
  isFetchingReviews,
  loadMoreReviews,
  refreshReviews,
} = useReviews(() => product.value?.id)

const reviewsFilter = ref('newest')

const filterOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
]

const filteredReviews = computed(() => {
  if (!reviews.value || reviews.value.length === 0) {
    return []
  }

  return [...reviews.value].sort((a, b) => {
    if (reviewsFilter.value === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
  })
})

// Track which review is being edited (null = none)
const editingReviewId = ref<string | null>(null)

// Computed to check if any review is being edited
const isEditingAnyReview = computed(() => editingReviewId.value !== null)

const setEditingReviewId = (reviewId: string | null) => {
  editingReviewId.value = reviewId
}
</script>

<template>
  <!-- Reviews Section -->
  <section
    v-if="product"
    class="container mx-auto mt-16 px-4"
  >
    <Tabs default-value="reviews">
      <TabsList
        class="flex w-full items-center justify-start gap-10 border-b bg-white"
      >
        <TabsTrigger value="additional">Additional Info</TabsTrigger>
        <TabsTrigger value="questions">Questions</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>

      <TabsContent
        value="additional"
        class="py-8"
      >
        <div class="text-gray-500">No additional information available.</div>
      </TabsContent>

      <TabsContent
        value="questions"
        class="py-8"
      >
        <div class="text-gray-500">No questions yet.</div>
      </TabsContent>

      <TabsContent
        value="reviews"
        class="py-8"
      >
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-medium text-black">Customer Reviews</h3>
          </div>

          <!-- Reviews Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <ProductRating :rating="product.averageRating ?? 0" />
              <span class="text-sm text-black">{{ totalReviews }} Reviews</span>
            </div>

            <Select v-model="reviewsFilter">
              <SelectTrigger class="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in filterOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Write Review Form (hidden when editing a review) -->
          <div
            v-if="product?.id && !isEditingAnyReview"
            class="rounded-lg border p-6"
          >
            <ProductReviewForm
              :product="product"
              @success="refreshReviews"
            />
          </div>

          <!-- Reviews List -->
          <div class="space-y-8">
            <div
              v-if="isLoadingReviews && filteredReviews.length === 0"
              class="py-8 text-center"
            >
              <Loader2 class="mx-auto h-8 w-8 animate-spin text-gray-400" />
              <p class="mt-2 text-gray-500">Loading reviews...</p>
            </div>

            <div
              v-else-if="filteredReviews.length === 0"
              class="py-8 text-center text-gray-500"
            >
              No reviews yet. Be the first to write one!
            </div>

            <template v-else>
              <ul class="space-y-6">
                <div
                  v-for="review in filteredReviews"
                  :key="review.id"
                  class="border-b border-dashed border-black/40 pb-6"
                >
                  <ProductReviewCard
                    :review="review"
                    :product="product"
                    :is-editing="editingReviewId === review.id"
                    @start-editing="setEditingReviewId(review.id)"
                    @stop-editing="setEditingReviewId(null)"
                    @review-updated="refreshReviews"
                    @review-deleted="refreshReviews"
                  />
                </div>
              </ul>

              <!-- Load More Button -->
              <div
                v-if="hasMoreReviews"
                class="flex justify-center pt-4"
              >
                <LoadingButton
                  type="button"
                  variant="outline"
                  :disabled="isFetchingReviews"
                  class="w-40"
                  :loading="isFetchingReviews"
                  @click="loadMoreReviews"
                >
                  Load more
                </LoadingButton>
              </div>
            </template>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </section>
</template>
