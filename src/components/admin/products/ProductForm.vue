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
import { Textarea } from '@/components/ui/textarea'
import { useCategories } from '@/composables/useCategories'
import type { ProductWithDetails } from '@/types'
import type { CreateProductInput } from '@/validators/products.validator'
import { Loader2, X } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

interface Props {
  product?: ProductWithDetails | null
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'submit', data: CreateProductInput): void
  (e: 'cancel'): void
}>()

const { categories } = useCategories()

// Form state
const form = ref<CreateProductInput>({
  categoryId: '',
  name: '',
  slug: '',
  description: '',
  basePrice: 0,
  price: 0,
  images: [],
  metaTitle: '',
  metaDescription: '',
})

const imageUrl = ref('')

// Populate form if editing
watch(
  () => props.product,
  (product) => {
    if (product) {
      form.value = {
        categoryId: product.categoryId || '',
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        basePrice: product.basePrice || 0,
        price: product.price || 0,
        images: product.images || [],
        metaTitle: '',
        metaDescription: '',
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

const isEditing = computed(() => !!props.product)

function addImage() {
  if (!form.value.images) {
    form.value.images = []
  }
  if (imageUrl.value && !form.value.images.includes(imageUrl.value)) {
    form.value.images.push(imageUrl.value)
    imageUrl.value = ''
  }
}

function removeImage(index: number) {
  form.value.images?.splice(index, 1)
}

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
      <Label for="name">Nom du produit *</Label>
      <Input
        id="name"
        v-model="form.name"
        placeholder="Ex: T-shirt Premium"
        required
      />
    </div>

    <!-- Category -->
    <div class="space-y-2">
      <Label for="category">Catégorie *</Label>
      <Select
        v-model="form.categoryId"
        required
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner une catégorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
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
        placeholder="Description du produit..."
        rows="4"
      />
    </div>

    <!-- Prices -->
    <div class="grid gap-6 md:grid-cols-2">
      <div class="space-y-2">
        <Label for="basePrice">Prix de base (XOF) *</Label>
        <Input
          id="basePrice"
          v-model.number="form.basePrice"
          type="number"
          min="0"
          placeholder="0"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="price">Prix de vente (XOF) *</Label>
        <Input
          id="price"
          v-model.number="form.price"
          type="number"
          min="0"
          placeholder="0"
          required
        />
        <p
          v-if="form.price !== undefined && form.basePrice > form.price"
          class="text-xs text-green-600"
        >
          Réduction de
          {{ Math.round((1 - (form.price ?? 0) / form.basePrice) * 100) }}%
        </p>
      </div>
    </div>

    <!-- Images -->
    <div class="space-y-2">
      <Label>Images</Label>
      <div class="flex gap-2">
        <Input
          v-model="imageUrl"
          placeholder="URL de l'image"
          @keyup.enter.prevent="addImage"
        />
        <Button
          type="button"
          variant="outline"
          @click="addImage"
        >
          Ajouter
        </Button>
      </div>
      <div
        v-if="form.images && form.images.length > 0"
        class="mt-3 flex flex-wrap gap-2"
      >
        <div
          v-for="(img, index) in form.images"
          :key="index"
          class="group relative"
        >
          <img
            :src="img"
            :alt="`Image ${index + 1}`"
            class="h-20 w-20 rounded-md border object-cover"
          />
          <button
            type="button"
            class="bg-destructive text-destructive-foreground absolute -top-2 -right-2 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
            @click="removeImage(index)"
          >
            <X class="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- SEO -->
    <div class="space-y-4 rounded-lg border p-4">
      <h3 class="font-medium">SEO</h3>
      <div class="space-y-2">
        <Label for="metaTitle">Meta Title</Label>
        <Input
          id="metaTitle"
          v-model="form.metaTitle"
          placeholder="Titre pour les moteurs de recherche"
        />
      </div>
      <div class="space-y-2">
        <Label for="metaDescription">Meta Description</Label>
        <Textarea
          id="metaDescription"
          v-model="form.metaDescription"
          placeholder="Description pour les moteurs de recherche"
          rows="2"
        />
      </div>
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
        {{ isEditing ? 'Mettre à jour' : 'Créer le produit' }}
      </Button>
    </div>
  </form>
</template>
