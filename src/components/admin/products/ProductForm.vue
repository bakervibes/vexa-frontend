<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
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
import { useCategories } from '@/composables/useCategories'
import { useProducts } from '@/composables/useProducts'
import type { VariantInput } from '@/composables/useProductVariants'
import type { ProductWithDetails } from '@/types'
import {
  createProductSchema,
  type CreateProductInput,
} from '@/validators/products.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { Layers, Loader2, Package, X } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import ProductVariantsSection from './ProductVariantsSection.vue'

interface Props {
  product?: ProductWithDetails | null
}

const props = defineProps<Props>()

const router = useRouter()
const { categories } = useCategories()
const { createProduct, updateProduct, isCreatingProduct, isUpdatingProduct } =
  useProducts()

// Product type: simple or composite (with variants)
const isCompositeProduct = ref(false)

// Variants state (managed separately from form for complex nested logic)
const variants = ref<VariantInput[]>([])

// Step state for composite products (1 = attributes, 2 = pricing)
const variantsStep = ref(1)

// Reference to variants section
const variantsSectionRef = ref<InstanceType<
  typeof ProductVariantsSection
> | null>(null)

// Image URL input
const imageUrl = ref('')

// Computed states
const isEditing = computed(() => !!props.product)
const isLoading = computed(
  () => isCreatingProduct.value || isUpdatingProduct.value,
)

// Show previous button for composite products (step 2 only)
const showPrevButton = computed(
  () => isCompositeProduct.value && variantsStep.value === 2,
)

// Dynamic validation schema based on product type
const validationSchema = computed(() => {
  if (isCompositeProduct.value) {
    // Composite product: no basePrice/price/stock required at product level
    return toTypedSchema(
      createProductSchema.extend({
        basePrice: z.number().optional(),
        price: z.number().optional(),
        stock: z.number().optional(),
      }),
    )
  }
  // Simple product: basePrice and price required
  return toTypedSchema(
    createProductSchema.extend({
      basePrice: z.number().min(0, 'Le prix de base est requis'),
      price: z.number().min(0, 'Le prix de vente est requis'),
      stock: z.number().min(0).optional(),
    }),
  )
})

// Form setup with vee-validate
const { handleSubmit, values, setValues, errors, meta } = useForm<
  Omit<CreateProductInput, 'slug'> & { stock?: number }
>({
  validationSchema,
  initialValues: {
    categoryId: '',
    name: '',
    description: '',
    basePrice: 0,
    price: 0,
    stock: 0,
    images: [],
  },
})

// Can submit: form is valid + for composite products, must have variants in step 2
const canSubmit = computed(() => {
  if (isCompositeProduct.value) {
    return (
      meta.value.valid && variantsStep.value === 2 && variants.value.length > 0
    )
  }
  return meta.value.valid
})

// Populate form if editing
watch(
  () => props.product,
  (product) => {
    if (product) {
      setValues({
        categoryId: product.categoryId || '',
        name: product.name,
        description: product.description || '',
        basePrice: product.basePrice || 0,
        price: product.price || 0,
        stock: product.stock || 0,
        images: product.images || [],
      })
      // Detect if product has variants
      isCompositeProduct.value =
        (product.productVariants && product.productVariants.length > 0) || false
    }
  },
  { immediate: true },
)

function addImage() {
  if (imageUrl.value && !values.images?.includes(imageUrl.value)) {
    setValues({
      ...values,
      images: [...(values.images || []), imageUrl.value],
    })
    imageUrl.value = ''
  }
}

function removeImage(index: number) {
  const newImages = [...(values.images || [])]
  newImages.splice(index, 1)
  setValues({ ...values, images: newImages })
}

function handleStepChange(step: number) {
  variantsStep.value = step
}

function goToPrevStep() {
  variantsSectionRef.value?.goToStep1()
}

function handleCancel() {
  router.push('/admin/products')
}

function setCompositeProduct(val: boolean) {
  isCompositeProduct.value = val
}

// Submit handler
const onSubmit = handleSubmit(async (formValues) => {
  try {
    let data: CreateProductInput

    if (isCompositeProduct.value) {
      // Composite product: include variants, exclude main price/stock
      data = {
        categoryId: formValues.categoryId,
        name: formValues.name,
        description: formValues.description,
        images: formValues.images,
        variants: variants.value.map((v) => ({
          combinationKey: v.combinationKey,
          basePrice: v.basePrice,
          price: v.price,
          stock: v.stock,
          options: v.options,
        })),
      }
    } else {
      // Simple product: include price/stock, no variants
      data = {
        categoryId: formValues.categoryId,
        name: formValues.name,
        description: formValues.description,
        basePrice: formValues.basePrice,
        price: formValues.price,
        stock: formValues.stock,
        images: formValues.images,
      }
    }

    if (isEditing.value && props.product) {
      await updateProduct(props.product.id, data)
      toast.success('Produit mis a jour avec succes')
    } else {
      await createProduct(data)
      toast.success('Produit cree avec succes')
    }
    router.push('/admin/products')
  } catch {
    toast.error(
      isEditing.value
        ? 'Erreur lors de la mise a jour du produit'
        : 'Erreur lors de la creation du produit',
    )
  }
})
</script>

<template>
  <form
    @submit="onSubmit"
    class="space-y-6"
  >
    <!-- Images -->
    <FormField name="images">
      <FormItem>
        <FormLabel>Images</FormLabel>
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
          v-if="values.images && values.images.length > 0"
          class="mt-3 flex flex-wrap gap-2"
        >
          <div
            v-for="(img, index) in values.images"
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
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Basic Info -->
    <FormField
      v-slot="{ componentField }"
      name="name"
    >
      <FormItem>
        <FormLabel>Nom du produit *</FormLabel>
        <FormControl>
          <Input
            v-bind="componentField"
            placeholder="Ex: T-shirt Premium"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Category -->
    <FormField
      v-slot="{ componentField }"
      name="categoryId"
    >
      <FormItem>
        <FormLabel>Categorie *</FormLabel>
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Selectionner une categorie" />
            </SelectTrigger>
          </FormControl>
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
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Description -->
    <FormField
      v-slot="{ componentField }"
      name="description"
    >
      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Textarea
            v-bind="componentField"
            placeholder="Description du produit..."
            rows="4"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Product Type Switch (only for new products) -->
    <div
      v-if="!isEditing"
      class="rounded-lg border p-4"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            :class="[
              'flex h-10 w-10 items-center justify-center rounded-lg',
              isCompositeProduct
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground',
            ]"
          >
            <Package
              v-if="!isCompositeProduct"
              class="h-5 w-5"
            />
            <Layers
              v-else
              class="h-5 w-5"
            />
          </div>
          <div>
            <label
              for="product-type"
              class="cursor-pointer text-base font-medium"
            >
              {{
                isCompositeProduct ? 'Produit avec variantes' : 'Produit simple'
              }}
            </label>
            <p class="text-muted-foreground text-sm">
              {{
                isCompositeProduct
                  ? 'Ce produit a plusieurs declinaisons (taille, couleur, etc.)'
                  : "Ce produit n'a pas de variantes"
              }}
            </p>
          </div>
        </div>
        <Switch
          id="product-type"
          :checked="isCompositeProduct"
          @update:checked="setCompositeProduct"
        />
      </div>
    </div>

    <!-- Simple Product: Prices & Stock -->
    <div
      v-if="!isCompositeProduct"
      class="space-y-6"
    >
      <!-- Prices -->
      <div class="grid gap-6 md:grid-cols-2">
        <FormField
          v-slot="{ componentField }"
          name="basePrice"
        >
          <FormItem>
            <FormLabel>Prix de base (XOF) *</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                type="number"
                min="0"
                placeholder="0"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="price"
        >
          <FormItem>
            <FormLabel>Prix de vente (XOF) *</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                type="number"
                min="0"
                placeholder="0"
              />
            </FormControl>
            <p
              v-if="
                values.price !== undefined &&
                values.basePrice &&
                values.basePrice > values.price
              "
              class="text-xs text-green-600"
            >
              Reduction de
              {{
                Math.round(
                  (1 - (values.price ?? 0) / (values.basePrice || 1)) * 100,
                )
              }}%
            </p>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- Stock -->
      <FormField
        v-slot="{ componentField }"
        name="stock"
      >
        <FormItem>
          <FormLabel>Stock initial</FormLabel>
          <FormControl v-if="!isEditing">
            <Input
              v-bind="componentField"
              type="number"
              min="0"
              placeholder="0"
            />
          </FormControl>
          <div
            v-else
            class="bg-muted flex items-center gap-3 rounded-lg p-3"
          >
            <span class="text-muted-foreground text-sm">Stock actuel:</span>
            <Badge variant="secondary">{{ product?.stock ?? 0 }} unites</Badge>
            <RouterLink
              :to="`/admin/stock/${product?.id}`"
              class="text-primary text-sm underline"
            >
              Ajuster le stock
            </RouterLink>
          </div>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- Composite Product: Variants -->
    <ProductVariantsSection
      v-else
      ref="variantsSectionRef"
      v-model="variants"
      :is-editing="isEditing"
      :existing-variants="product?.productVariants"
      @update:step="handleStepChange"
    />

    <!-- Form Actions -->
    <div class="flex justify-end gap-4 pt-6">
      <Button
        type="button"
        variant="outline"
        @click="handleCancel"
      >
        <X class="mr-2 h-4 w-4" />
        Annuler
      </Button>
      <Button
        type="submit"
        :disabled="!canSubmit || isLoading"
      >
        <Loader2
          v-if="isLoading"
          class="mr-2 h-4 w-4 animate-spin"
        />
        {{ isEditing ? 'Mettre a jour' : 'Creer le produit' }}
      </Button>
    </div>

    <!-- Debug: show errors in dev -->
    <div
      v-if="Object.keys(errors).length > 0"
      class="text-destructive text-xs"
    >
      <pre>{{ errors }}</pre>
    </div>
  </form>
</template>
