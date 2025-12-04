<script setup lang="ts">
import { useProduct } from '@/composables/useProducts'
import { useProductReviews } from '@/composables/useReviews'
import { Loader2 } from 'lucide-vue-next'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'
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

const reviewsFilter = ref<{ label: string; value: string }>({
  label: 'Newest',
  value: 'newest',
})

const filterOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
]

const filteredReviews = computed(() => {
  if (!paginatedReviews.value || paginatedReviews.value.length === 0) {
    return []
  }

  return [...paginatedReviews.value].sort((a, b) => {
    if (reviewsFilter.value.value === 'newest') {
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
    <Tabs value="2">
      <TabList>
        <Tab value="0">Additional Info</Tab>
        <Tab value="1">Questions</Tab>
        <Tab value="2">Reviews</Tab>
      </TabList>

      <TabPanels>
        <TabPanel
          value="0"
          class="py-8"
        >
          <div class="text-gray-500">No additional information available.</div>
        </TabPanel>

        <TabPanel
          value="1"
          class="py-8"
        >
          <div class="text-gray-500">No questions yet.</div>
        </TabPanel>

        <TabPanel
          value="2"
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
                <span class="text-sm text-black">
                  {{ totalReviews }} Reviews
                </span>
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
                <Select
                  v-model="reviewsFilter"
                  :options="filterOptions"
                  optionLabel="label"
                  placeholder="Sort by"
                  class="w-32"
                />
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
                    outlined
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
        </TabPanel>
      </TabPanels>
    </Tabs>
  </section>
</template>
