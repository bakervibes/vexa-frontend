<script setup lang="ts">
import { AdminPageHeader, ConfirmDialog } from '@/components/admin/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAttributes } from '@/composables/useAttributes'
import type {
  Attribute,
  AttributeOption,
  CreateAttributeInput,
  CreateOptionInput,
} from '@/services/attributes.service'
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-vue-next'
import { ref, watch } from 'vue'

const {
  attributes,
  isLoading,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  createOption,
  updateOption,
  deleteOption,
  isCreatingAttribute,
  isUpdatingAttribute,
  isDeletingAttribute,
  isCreatingOption,
  isUpdatingOption,
  isDeletingOption,
} = useAttributes()

// UI state
const expandedAttributes = ref<Set<string>>(new Set())
const showAttributeDialog = ref(false)
const showOptionDialog = ref(false)
const showDeleteAttributeDialog = ref(false)
const showDeleteOptionDialog = ref(false)

// Form state
const attributeToEdit = ref<Attribute | null>(null)
const optionToEdit = ref<AttributeOption | null>(null)
const currentAttributeId = ref<string | null>(null)
const attributeToDelete = ref<Attribute | null>(null)
const optionToDelete = ref<AttributeOption | null>(null)

const attributeForm = ref<CreateAttributeInput>({
  name: '',
  slug: '',
  isActive: true,
})

const optionForm = ref<CreateOptionInput>({
  name: '',
  slug: '',
  isActive: true,
})

// Helpers
function toggleExpand(attributeId: string) {
  if (expandedAttributes.value.has(attributeId)) {
    expandedAttributes.value.delete(attributeId)
  } else {
    expandedAttributes.value.add(attributeId)
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Watch for auto-slug
watch(
  () => attributeForm.value.name,
  (name) => {
    if (!attributeToEdit.value) {
      attributeForm.value.slug = generateSlug(name)
    }
  },
)

watch(
  () => optionForm.value.name,
  (name) => {
    if (!optionToEdit.value) {
      optionForm.value.slug = generateSlug(name)
    }
  },
)

// Attribute handlers
function handleCreateAttribute() {
  attributeToEdit.value = null
  attributeForm.value = { name: '', slug: '', isActive: true }
  showAttributeDialog.value = true
}

function handleEditAttribute(attribute: Attribute) {
  attributeToEdit.value = attribute
  attributeForm.value = {
    name: attribute.name,
    slug: attribute.slug,
    isActive: attribute.isActive,
  }
  showAttributeDialog.value = true
}

function handleDeleteAttribute(attribute: Attribute) {
  attributeToDelete.value = attribute
  showDeleteAttributeDialog.value = true
}

async function submitAttribute() {
  let success: boolean
  if (attributeToEdit.value) {
    const result = await updateAttribute(
      attributeToEdit.value.id,
      attributeForm.value,
    )
    success = result !== null
  } else {
    const result = await createAttribute(attributeForm.value)
    success = result !== null
  }

  if (success) {
    showAttributeDialog.value = false
    attributeToEdit.value = null
  }
}

async function confirmDeleteAttribute() {
  if (!attributeToDelete.value) return
  const success = await deleteAttribute(attributeToDelete.value.id)
  if (success) {
    showDeleteAttributeDialog.value = false
    attributeToDelete.value = null
  }
}

// Option handlers
function handleCreateOption(attributeId: string) {
  currentAttributeId.value = attributeId
  optionToEdit.value = null
  optionForm.value = { name: '', slug: '', isActive: true }
  showOptionDialog.value = true
}

function handleEditOption(option: AttributeOption, attributeId: string) {
  currentAttributeId.value = attributeId
  optionToEdit.value = option
  optionForm.value = {
    name: option.name,
    slug: option.slug,
    isActive: option.isActive,
  }
  showOptionDialog.value = true
}

function handleDeleteOption(option: AttributeOption) {
  optionToDelete.value = option
  showDeleteOptionDialog.value = true
}

async function submitOption() {
  if (!currentAttributeId.value) return

  let success: boolean
  if (optionToEdit.value) {
    const result = await updateOption(optionToEdit.value.id, optionForm.value)
    success = result !== null
  } else {
    const result = await createOption(
      currentAttributeId.value,
      optionForm.value,
    )
    success = result !== null
  }

  if (success) {
    showOptionDialog.value = false
    optionToEdit.value = null
    currentAttributeId.value = null
  }
}

async function confirmDeleteOption() {
  if (!optionToDelete.value) return
  const success = await deleteOption(optionToDelete.value.id)
  if (success) {
    showDeleteOptionDialog.value = false
    optionToDelete.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Attributs"
      description="Gérez les attributs de produits (taille, couleur, etc.) et leurs options"
    >
      <template #actions>
        <Button @click="handleCreateAttribute">
          <Plus class="mr-2 h-4 w-4" />
          Nouvel attribut
        </Button>
      </template>
    </AdminPageHeader>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center py-12"
    >
      <Loader2 class="text-muted-foreground h-8 w-8 animate-spin" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="attributes.length === 0"
      class="bg-card rounded-xl border p-8 text-center"
    >
      <p class="text-muted-foreground">Aucun attribut créé</p>
      <Button
        class="mt-4"
        @click="handleCreateAttribute"
      >
        <Plus class="mr-2 h-4 w-4" />
        Créer un attribut
      </Button>
    </div>

    <!-- Attributes list -->
    <div
      v-else
      class="space-y-4"
    >
      <div
        v-for="attribute in attributes"
        :key="attribute.id"
        class="bg-card rounded-xl border"
      >
        <!-- Attribute header -->
        <div
          class="hover:bg-muted/50 flex cursor-pointer items-center justify-between p-4"
          @click="toggleExpand(attribute.id)"
        >
          <div class="flex items-center gap-3">
            <ChevronDown
              v-if="expandedAttributes.has(attribute.id)"
              class="text-muted-foreground h-4 w-4"
            />
            <ChevronRight
              v-else
              class="text-muted-foreground h-4 w-4"
            />
            <div>
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ attribute.name }}</span>
                <Badge
                  variant="secondary"
                  class="text-xs"
                >
                  {{ attribute.options.length }} option(s)
                </Badge>
                <Badge
                  v-if="!attribute.isActive"
                  variant="outline"
                  class="text-xs"
                >
                  Inactif
                </Badge>
              </div>
              <p class="text-muted-foreground text-sm">{{ attribute.slug }}</p>
            </div>
          </div>
          <div
            class="flex items-center gap-2"
            @click.stop
          >
            <Button
              variant="outline"
              size="sm"
              @click="handleCreateOption(attribute.id)"
            >
              <Plus class="mr-1 h-3 w-3" />
              Option
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <MoreHorizontal class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="handleEditAttribute(attribute)">
                  <Edit class="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  class="text-destructive focus:text-destructive"
                  @click="handleDeleteAttribute(attribute)"
                >
                  <Trash2 class="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <!-- Options list -->
        <div
          v-if="expandedAttributes.has(attribute.id)"
          class="bg-muted/30 border-t"
        >
          <div
            v-if="attribute.options.length === 0"
            class="text-muted-foreground p-4 text-center text-sm"
          >
            Aucune option
          </div>
          <div
            v-else
            class="divide-y"
          >
            <div
              v-for="option in attribute.options"
              :key="option.id"
              class="flex items-center justify-between px-4 py-3 pl-12"
            >
              <div class="flex items-center gap-2">
                <span>{{ option.name }}</span>
                <span class="text-muted-foreground text-sm">
                  ({{ option.slug }})
                </span>
                <Badge
                  v-if="!option.isActive"
                  variant="outline"
                  class="text-xs"
                >
                  Inactif
                </Badge>
              </div>
              <div class="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  @click="handleEditOption(option, attribute.id)"
                >
                  <Edit class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="text-destructive hover:text-destructive"
                  @click="handleDeleteOption(option)"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Attribute Dialog -->
    <Dialog v-model:open="showAttributeDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {{ attributeToEdit ? "Modifier l'attribut" : 'Nouvel attribut' }}
          </DialogTitle>
        </DialogHeader>
        <form
          class="space-y-4"
          @submit.prevent="submitAttribute"
        >
          <div class="space-y-2">
            <Label for="attr-name">Nom *</Label>
            <Input
              id="attr-name"
              v-model="attributeForm.name"
              placeholder="Ex: Taille"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="attr-slug">Slug</Label>
            <Input
              id="attr-slug"
              v-model="attributeForm.slug"
              placeholder="taille"
            />
          </div>
          <div class="flex items-center gap-3">
            <Switch
              id="attr-active"
              v-model:checked="attributeForm.isActive"
            />
            <Label for="attr-active">Actif</Label>
          </div>
          <div class="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              @click="showAttributeDialog = false"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              :disabled="isCreatingAttribute || isUpdatingAttribute"
            >
              <Loader2
                v-if="isCreatingAttribute || isUpdatingAttribute"
                class="mr-2 h-4 w-4 animate-spin"
              />
              {{ attributeToEdit ? 'Mettre à jour' : 'Créer' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Option Dialog -->
    <Dialog v-model:open="showOptionDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {{ optionToEdit ? "Modifier l'option" : 'Nouvelle option' }}
          </DialogTitle>
        </DialogHeader>
        <form
          class="space-y-4"
          @submit.prevent="submitOption"
        >
          <div class="space-y-2">
            <Label for="opt-name">Nom *</Label>
            <Input
              id="opt-name"
              v-model="optionForm.name"
              placeholder="Ex: S, M, L, XL"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="opt-slug">Slug</Label>
            <Input
              id="opt-slug"
              v-model="optionForm.slug"
              placeholder="s, m, l, xl"
            />
          </div>
          <div class="flex items-center gap-3">
            <Switch
              id="opt-active"
              v-model:checked="optionForm.isActive"
            />
            <Label for="opt-active">Actif</Label>
          </div>
          <div class="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              @click="showOptionDialog = false"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              :disabled="isCreatingOption || isUpdatingOption"
            >
              <Loader2
                v-if="isCreatingOption || isUpdatingOption"
                class="mr-2 h-4 w-4 animate-spin"
              />
              {{ optionToEdit ? 'Mettre à jour' : 'Créer' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Delete Attribute Confirmation -->
    <ConfirmDialog
      v-model:open="showDeleteAttributeDialog"
      title="Supprimer l'attribut"
      :description="`Êtes-vous sûr de vouloir supprimer l'attribut « ${attributeToDelete?.name} » et toutes ses options ? Cette action est irréversible.`"
      confirm-text="Supprimer"
      variant="destructive"
      :loading="isDeletingAttribute"
      @confirm="confirmDeleteAttribute"
    />

    <!-- Delete Option Confirmation -->
    <ConfirmDialog
      v-model:open="showDeleteOptionDialog"
      title="Supprimer l'option"
      :description="`Êtes-vous sûr de vouloir supprimer l'option « ${optionToDelete?.name} » ? Cette action est irréversible.`"
      confirm-text="Supprimer"
      variant="destructive"
      :loading="isDeletingOption"
      @confirm="confirmDeleteOption"
    />
  </div>
</template>
