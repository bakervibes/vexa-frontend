<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useFilters } from '@/composables/useFilters'
import { useProducts } from '@/composables/useProducts'
import { formatPrice } from '@/utils/lib'
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

function handleCategoryCheckbox(selectedCategory: string, checked: boolean) {
  const curr = selectedCategories.value.slice()

  let newCategories

  if (!checked) {
    newCategories = curr.filter((category) => category !== selectedCategory)
  } else {
    newCategories = [...curr, selectedCategory]
  }

  setFilters({
    categories: newCategories.length > 0 ? newCategories : undefined,
  })
}

function handleOptionCheckbox(
  attributeName: string,
  optionName: string,
  checked: boolean,
) {
  const curr = selectedOptions.value.slice()

  // Check if this attribute-option pair already exists
  const existingIndex = curr.findIndex(
    (opt) =>
      Object.keys(opt)[0] === attributeName &&
      opt[attributeName] === optionName,
  )

  let newOptions

  if (!checked && existingIndex !== -1) {
    // Remove the option
    newOptions = curr.filter((_, index) => index !== existingIndex)
  } else if (checked && existingIndex === -1) {
    // Add the option as {attributeName: optionName}
    newOptions = [...curr, { [attributeName]: optionName }]
  } else {
    newOptions = curr
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
      type="multiple"
      class="w-full"
      :default-value="['categories', ...attributes.map((a) => a.slug)]"
    >
      <!-- Categories Filter -->
      <AccordionItem value="categories">
        <AccordionTrigger data-testid="accordion-trigger-category">
          Catégorie
        </AccordionTrigger>
        <AccordionContent>
          <div class="flex flex-col gap-2">
            <div
              v-for="category in categories"
              :key="category.slug"
              class="flex items-center gap-2"
            >
              <input
                type="checkbox"
                :id="category.slug"
                :checked="selectedCategories.includes(category.slug)"
                @change="
                  (event) =>
                    handleCategoryCheckbox(
                      category.slug,
                      (event.target as HTMLInputElement).checked,
                    )
                "
                class="size-4 rounded-lg border-2 border-black accent-black"
              />
              <label
                class="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                :for="category.slug"
              >
                {{ category.name }}
              </label>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <!-- Attributes Filters (dynamic) -->
      <AccordionItem
        v-for="attribute in attributes"
        :key="attribute.slug"
        :value="attribute.slug"
      >
        <AccordionTrigger :data-testid="`accordion-trigger-${attribute.slug}`">
          {{ attribute.name }}
        </AccordionTrigger>
        <AccordionContent>
          <div class="flex flex-col gap-2">
            <div
              v-for="option in attribute.options"
              :key="option.slug"
              class="flex items-center gap-2"
            >
              <input
                type="checkbox"
                :id="`${attribute.slug}-${option.slug}`"
                :checked="isOptionSelected(attribute.name, option.name)"
                @change="
                  (event) =>
                    handleOptionCheckbox(
                      attribute.name,
                      option.name,
                      (event.target as HTMLInputElement).checked,
                    )
                "
                class="size-4 rounded-lg border-2 border-black accent-black"
              />
              <label
                class="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                :for="`${attribute.slug}-${option.slug}`"
              >
                {{ option.name }}
              </label>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </section>
</template>

<style scoped></style>
