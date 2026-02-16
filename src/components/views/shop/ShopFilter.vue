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

const selectedCategories = computed(() => filters.value.categories ?? [])

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

  const existingIndex = curr.findIndex(
    (opt) =>
      Object.keys(opt)[0] === attributeName &&
      opt[attributeName] === optionName,
  )

  let newOptions

  if (!checked && existingIndex !== -1) {
    newOptions = curr.filter((_, index) => index !== existingIndex)
  } else if (checked && existingIndex === -1) {
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
  <section class="mt-8 flex w-full flex-col gap-6">
    <div class="flex flex-col gap-4">
      <h3 class="text-xs tracking-widest text-[#555] uppercase">
        Gamme de prix
      </h3>
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
      <AccordionItem
        value="categories"
        class="border-border-noir border-b"
      >
        <AccordionTrigger
          data-testid="accordion-trigger-category"
          class="hover:text-gold text-text py-4 text-xs tracking-widest uppercase"
        >
          Catégorie
        </AccordionTrigger>
        <AccordionContent>
          <div class="flex flex-col gap-3 pb-4">
            <div
              v-for="category in categories"
              :key="category.slug"
              class="flex items-center gap-3"
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
                class="checked:border-gold checked:bg-gold border-border-noir size-4 border bg-transparent"
              />
              <label
                class="hover:text-text cursor-pointer text-sm text-[#555] transition-colors"
                :for="category.slug"
              >
                {{ category.name }}
              </label>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem
        v-for="attribute in attributes"
        :key="attribute.slug"
        :value="attribute.slug"
        class="border-border-noir border-b"
      >
        <AccordionTrigger
          :data-testid="`accordion-trigger-${attribute.slug}`"
          class="hover:text-gold text-text py-4 text-xs tracking-widest uppercase"
        >
          {{ attribute.name }}
        </AccordionTrigger>
        <AccordionContent>
          <div class="flex flex-col gap-3 pb-4">
            <div
              v-for="option in attribute.options"
              :key="option.slug"
              class="flex items-center gap-3"
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
                class="checked:border-gold checked:bg-gold border-border-noir size-4 border bg-transparent"
              />
              <label
                class="hover:text-text cursor-pointer text-sm text-[#555] transition-colors"
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
