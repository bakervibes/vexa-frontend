<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { CategoryWithChildren } from '@/types'
import type { CreateCategoryInput } from '@/validators/categories.validator'
import { Loader2 } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

interface Props {
  category?: CategoryWithChildren | null
  categories: CategoryWithChildren[]
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'submit', data: CreateCategoryInput): void
  (e: 'cancel'): void
}>()

// Form state
const form = ref<CreateCategoryInput>({
  name: '',
  slug: '',
  description: '',
  image: '',
  position: { x: 0, y: 0 },
  parentCategoryId: null,
  isActive: true,
})

// Filter out current category from parent options
const parentOptions = computed(() => {
  if (!props.category) return props.categories
  return props.categories.filter((c) => c.id !== props.category?.id)
})

// Populate form if editing
watch(
  () => props.category,
  (category) => {
    if (category) {
      form.value = {
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '',
        position: category.position || { x: 0, y: 0 },
        parentCategoryId: category.parentCategoryId || null,
        isActive: category.isActive,
      }
    }
  },
  { immediate: true },
)

// Auto-generate slug from name
watch(
  () => form.value.name,
  (name) => {
    form.value.slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  },
)

const isEditing = computed(() => !!props.category)

function handleSubmit() {
  emit('submit', form.value)
}
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    class="space-y-6"
  >
    <!-- Basic Info -->
    <div class="space-y-2">
      <Label for="name">Nom de la catégorie *</Label>
      <Input
        id="name"
        v-model="form.name"
        placeholder="Ex: Vêtements"
        required
      />
    </div>

    <!-- Parent Category -->
    <div class="space-y-2">
      <Label for="parent">Catégorie parente</Label>
      <Select v-model="form.parentCategoryId">
        <SelectTrigger>
          <SelectValue placeholder="Aucune (catégorie racine)" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem :value="null">Aucune (catégorie racine)</SelectItem>
            <SelectItem
              v-for="cat in parentOptions"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>

    <!-- Description -->
    <div class="space-y-2">
      <Label for="description">Description</Label>
      <Textarea
        id="description"
        v-model="form.description"
        placeholder="Description de la catégorie..."
        rows="3"
      />
    </div>

    <!-- Image -->
    <div class="space-y-2">
      <Label for="image">URL de l'image</Label>
      <Input
        id="image"
        v-model="form.image"
        placeholder="https://..."
      />
      <div
        v-if="form.image"
        class="mt-2"
      >
        <img
          :src="form.image"
          alt="Aperçu"
          class="h-20 w-20 rounded-md border object-cover"
        />
      </div>
    </div>

    <!-- Active Status -->
    <div class="flex items-center gap-3">
      <Switch
        id="isActive"
        v-model:checked="form.isActive"
      />
      <Label for="isActive">Catégorie active</Label>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-4">
      <Button
        type="button"
        variant="outline"
        @click="emit('cancel')"
      >
        Annuler
      </Button>
      <Button
        type="submit"
        :disabled="loading"
      >
        <Loader2
          v-if="loading"
          class="mr-2 h-4 w-4 animate-spin"
        />
        {{ isEditing ? 'Mettre à jour' : 'Créer la catégorie' }}
      </Button>
    </div>
  </form>
</template>
