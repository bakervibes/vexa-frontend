<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProduct } from '@/composables/useProducts'
import { useProductReviews } from '@/composables/useReviews'
import { Loader2 } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductRating from '../common/ProductRating.vue'
import ProductReviewCard from '../common/ProductReviewCard.vue'
import ProductReviewForm from '../common/ProductReviewForm.vue'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { product } = useProduct(slug)

// Paginated reviews
const productId = computed(() => product.value?.id)
const {
  reviews: paginatedReviews,
  totalReviews,
  hasMore,
  isLoading: isLoadingReviews,
  isLoadingMore,
  fetchReviews,
  loadMore,
  refresh: refreshReviews,
} = useProductReviews(productId)

const reviewsFilter = ref<'newest' | 'oldest'>('newest')

const filteredReviews = computed(() => {
  if (!paginatedReviews.value || paginatedReviews.value.length === 0) {
    return []
  }

  return [...paginatedReviews.value].sort((a, b) => {
    if (reviewsFilter.value === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
  })
})

// Fetch reviews when product loads
watch(
  () => product.value?.id,
  (newId) => {
    if (newId) {
      fetchReviews(1)
    }
  },
  { immediate: true },
)

const showReviewForm = ref(false)

const handleReviewSuccess = () => {
  showReviewForm.value = false
  refreshReviews()
}

const handleReviewCancel = () => {
  showReviewForm.value = false
}
</script>

<template>
  <!-- Reviews Section -->
  <section
    v-if="product"
    class="container mx-auto mt-16 px-4"
  >
    <Tabs default-value="reviews">
      <TabsList class="w-full justify-start rounded-none bg-transparent p-0">
        <TabsTrigger
          value="additional-info"
          class="rounded-none border-0 border-b border-gray-400 px-8 py-3 text-gray-500 data-[state=active]:border data-[state=active]:border-b-3 data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none"
        >
          Additional Info
        </TabsTrigger>
        <TabsTrigger
          value="questions"
          class="rounded-none border-0 border-b border-gray-400 px-8 py-3 text-gray-500 data-[state=active]:border data-[state=active]:border-b-3 data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none"
        >
          Questions
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          class="rounded-none border-0 border-b border-gray-400 px-8 py-3 text-gray-500 data-[state=active]:border data-[state=active]:border-b-3 data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none"
        >
          Reviews
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="additional-info"
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
        <div class="space-y-8">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-medium text-black">Customer Reviews</h3>
          </div>

          <!-- Reviews Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <ProductRating :rating="product.averageRating ?? 0" />
              <span class="text-sm text-black">{{ totalReviews }} Reviews</span>
            </div>
            <div class="hidden font-medium text-black lg:block">
              {{ product.name }}
            </div>
          </div>

          <!-- Write Review Form -->
          <div class="rounded-lg border p-6">
            <ProductReviewForm
              v-if="product?.id"
              :product="product"
              @success="handleReviewSuccess"
              @cancel="handleReviewCancel"
            />
          </div>

          <!-- Reviews List -->
          <div class="space-y-8">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-medium text-black">
                {{ totalReviews }} Reviews
              </h3>
              <Select v-model="reviewsFilter">
                <SelectTrigger
                  class="w-32"
                  size="sm"
                >
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                <ProductReviewCard
                  v-for="review in filteredReviews"
                  :key="review.id"
                  :review="review"
                  :product="product"
                  @deleted="refreshReviews"
                  @updated="refreshReviews"
                />
              </ul>

              <!-- Load More Button -->
              <div
                v-if="hasMore"
                class="flex justify-center pt-4"
              >
                <Button
                  variant="outline"
                  :disabled="isLoadingMore"
                  class="min-w-[150px]"
                  @click="loadMore"
                >
                  <Loader2
                    v-if="isLoadingMore"
                    class="mr-2 h-4 w-4 animate-spin"
                  />
                  {{ isLoadingMore ? 'Loading...' : 'Load more' }}
                </Button>
              </div>
            </template>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </section>
</template>
