<script setup lang="ts">
import { useFilters } from '@/composables/useFilters'
import { useProducts } from '@/composables/useProducts'
import { formatPrice } from '@/utils/lib'
import Accordion from 'primevue/accordion'
import AccordionContent from 'primevue/accordioncontent'
import AccordionHeader from 'primevue/accordionheader'
import AccordionPanel from 'primevue/accordionpanel'
import Checkbox from 'primevue/checkbox'
import { computed } from 'vue'
import RangePicker from '../common/RangePicker.vue'

const { categories, attributes, priceRange } = useFilters()
const { filters, setFilters } = useProducts()

// Convert between priceRange object { min, max } and array [min, max] for RangePicker
const priceRangeModel = computed({
  get: () => {
    if (filters.value.priceRange) {
      return [
        filters.value.priceRange.min ?? priceRange.value.min,
        filters.value.priceRange.max ?? priceRange.value.max,
      ]
    }
    return [priceRange.value.min, priceRange.value.max]
  },
  set: (value: number[] | undefined) => {
    if (value && value.length >= 2) {
      setFilters({
        priceRange: { min: value[0], max: value[1] },
      })
    }
  },
})

// Assure that we always have a categories array (even if undefined in filters)
const selectedCategories = computed(() => filters.value.categories ?? [])

// Assure that we always have an options array (even if undefined in filters)
const selectedOptions = computed(() => filters.value.options ?? [])

function handleCategoryCheckbox(selectedCategory: string) {
  const curr = selectedCategories.value.slice()

  let newCategories

  if (curr.includes(selectedCategory)) {
    newCategories = curr.filter((category) => category !== selectedCategory)
  } else {
    newCategories = [...curr, selectedCategory]
  }

  setFilters({
    categories: newCategories.length > 0 ? newCategories : undefined,
  })
}

function handleOptionCheckbox(attributeName: string, optionName: string) {
  const curr = selectedOptions.value.slice()

  // Check if this attribute-option pair already exists
  const existingIndex = curr.findIndex(
    (opt) =>
      Object.keys(opt)[0] === attributeName &&
      opt[attributeName] === optionName,
  )

  let newOptions

  if (existingIndex !== -1) {
    // Remove the option
    newOptions = curr.filter((_, index) => index !== existingIndex)
  } else {
    // Add the option as {attributeName: optionName}
    newOptions = [...curr, { [attributeName]: optionName }]
  }

  setFilters({ options: newOptions.length > 0 ? newOptions : undefined })
}

function isOptionSelected(attributeName: string, optionName: string): boolean {
  return selectedOptions.value.some(
    (opt) =>
      Object.keys(opt)[0] === attributeName &&
      opt[attributeName] === optionName,
  )
}
</script>

<template>
  <section class="flex w-full flex-col gap-4">
    <div class="flex flex-col gap-4 pt-4">
      <div class="flex flex-col gap-4">
        <h3 class="text-base font-semibold">Price range</h3>
        <RangePicker
          v-model="priceRangeModel"
          :min="priceRange.min"
          :max="priceRange.max"
          :step="1"
          :default-value="[priceRange.min, priceRange.max]"
          :format-value="(value: number) => `${formatPrice(value)}`"
        />
      </div>

      <Accordion
        :value="['0']"
        multiple
      >
        <!-- Categories Filter -->
        <AccordionPanel value="0">
          <AccordionHeader>
            <span
              class="text-base font-semibold"
              data-testid="accordion-trigger-category"
            >
              Catégorie
            </span>
          </AccordionHeader>
          <AccordionContent>
            <div class="flex flex-col gap-1">
              <div
                v-for="category in categories"
                :key="category.slug"
                class="flex items-center gap-2"
              >
                <Checkbox
                  :inputId="category.slug"
                  :binary="true"
                  :modelValue="selectedCategories.includes(category.slug)"
                  @update:modelValue="handleCategoryCheckbox(category.slug)"
                />
                <label
                  class="cursor-pointer text-base"
                  :for="category.slug"
                >
                  {{ category.name }}
                </label>
              </div>
            </div>
          </AccordionContent>
        </AccordionPanel>

        <!-- Attributes Filters (dynamic) -->
        <AccordionPanel
          v-for="(attribute, index) in attributes"
          :key="attribute.slug"
          :value="`${index + 1}`"
        >
          <AccordionHeader>
            <span
              class="text-base font-semibold"
              :data-testid="`accordion-trigger-${attribute.slug}`"
            >
              {{ attribute.name }}
            </span>
          </AccordionHeader>
          <AccordionContent>
            <div class="flex flex-col gap-1">
              <div
                v-for="option in attribute.options"
                :key="option.slug"
                class="flex items-center gap-2"
              >
                <Checkbox
                  :inputId="`${attribute.slug}-${option.slug}`"
                  :binary="true"
                  :modelValue="isOptionSelected(attribute.name, option.name)"
                  @update:modelValue="
                    handleOptionCheckbox(attribute.name, option.name)
                  "
                />
                <label
                  class="cursor-pointer text-base"
                  :for="`${attribute.slug}-${option.slug}`"
                >
                  {{ option.name }}
                </label>
              </div>
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
  </section>
</template>

<style scoped></style>
