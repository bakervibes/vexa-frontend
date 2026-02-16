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

const editingReviewId = ref<string | null>(null)

const isEditingAnyReview = computed(() => editingReviewId.value !== null)

const setEditingReviewId = (reviewId: string | null) => {
  editingReviewId.value = reviewId
}
</script>

<template>
  <section
    v-if="product"
    class="mt-16 bg-[#0A0A0A]"
  >
    <div class="container mx-auto px-4">
      <Tabs default-value="reviews">
        <TabsList
          class="flex w-full items-center justify-start gap-10 border-b border-[#1E1E1E] bg-transparent"
        >
          <TabsTrigger
            value="additional"
            class="text-text-muted text-xs tracking-[0.3em] uppercase data-[state=active]:border-b-2 data-[state=active]:border-[#C8A97E] data-[state=active]:text-[#C8A97E]"
          >
            Additional Info
          </TabsTrigger>
          <TabsTrigger
            value="questions"
            class="text-text-muted text-xs tracking-[0.3em] uppercase data-[state=active]:border-b-2 data-[state=active]:border-[#C8A97E] data-[state=active]:text-[#C8A97E]"
          >
            Questions
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            class="text-text-muted text-xs tracking-[0.3em] uppercase data-[state=active]:border-b-2 data-[state=active]:border-[#C8A97E] data-[state=active]:text-[#C8A97E]"
          >
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="additional"
          class="py-8"
        >
          <div class="text-text-muted">
            No additional information available.
          </div>
        </TabsContent>

        <TabsContent
          value="questions"
          class="py-8"
        >
          <div class="text-text-muted">No questions yet.</div>
        </TabsContent>

        <TabsContent
          value="reviews"
          class="py-8"
        >
          <div class="space-y-6">
            <p class="text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
              Customer Feedback
            </p>
            <h3 class="font-display text-5xl font-light text-[#E8E8E8]">
              Reviews
            </h3>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <ProductRating :rating="product.averageRating ?? 0" />
                <span class="text-sm text-[#E8E8E8]">
                  {{ totalReviews }} Reviews
                </span>
              </div>

              <Select v-model="reviewsFilter">
                <SelectTrigger
                  class="bg-surface w-32 border-[#1E1E1E] text-[#E8E8E8]"
                >
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent
                  class="bg-surface border-[#1E1E1E] text-[#E8E8E8]"
                >
                  <SelectItem
                    v-for="option in filterOptions"
                    :key="option.value"
                    :value="option.value"
                    class="focus:bg-[#1E1E1E] focus:text-[#C8A97E]"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              v-if="product?.id && !isEditingAnyReview"
              class="bg-surface border border-[#1E1E1E] p-6"
            >
              <ProductReviewForm
                :product="product"
                @success="refreshReviews"
              />
            </div>

            <div class="space-y-8">
              <div
                v-if="isLoadingReviews && filteredReviews.length === 0"
                class="py-8 text-center"
              >
                <Loader2 class="mx-auto h-8 w-8 animate-spin text-[#C8A97E]" />
                <p class="text-text-muted mt-2">Loading reviews...</p>
              </div>

              <div
                v-else-if="filteredReviews.length === 0"
                class="text-text-muted py-8 text-center"
              >
                No reviews yet. Be the first to write one!
              </div>

              <template v-else>
                <ul class="space-y-6">
                  <ProductReviewCard
                    v-for="review in filteredReviews"
                    :key="review.id"
                    :review="review"
                    :product="product"
                    :is-editing="editingReviewId === review.id"
                    @start-editing="setEditingReviewId(review.id)"
                    @stop-editing="setEditingReviewId(null)"
                    @review-updated="refreshReviews"
                    @review-deleted="refreshReviews"
                  />
                </ul>

                <div
                  v-if="hasMoreReviews"
                  class="flex justify-center pt-4"
                >
                  <LoadingButton
                    type="button"
                    variant="outline"
                    :disabled="isFetchingReviews"
                    class="w-40 border border-[#C8A97E]/40 text-[#C8A97E] uppercase hover:bg-[#C8A97E] hover:text-[#0A0A0A]"
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
    </div>
  </section>
</template>
