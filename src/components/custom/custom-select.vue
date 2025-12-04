<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/utils/lib'
import { Check, ChevronDown } from 'lucide-vue-next'
import { computed, ref } from 'vue'

interface Props {
  label: string
  modelValue?: string | number | null
  options: { label: string; value: string | number }[]
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Select an option',
  searchPlaceholder: 'Search...',
  disabled: false,
  options: () => [],
})

const emits = defineEmits<{
  'update:modelValue': [value: string | number | null]
  change: [value: string | number | null]
}>()

const open = ref(false)

const selectedLabel = computed(() => {
  const selected = props.options.find((opt) => opt.value === props.modelValue)
  return selected ? selected.label : ''
})

const handleSelect = (value: string | number) => {
  emits('update:modelValue', value)
  emits('change', value)
  open.value = false
}
</script>

<template>
  <div class="relative w-full border-b border-gray-300">
    <Popover v-model:open="open">
      <PopoverTrigger
        as-child
        class="px-0"
      >
        <Button
          variant="ghost"
          role="combobox"
          :aria-expanded="open"
          :disabled="disabled"
          class="hover:text-foreground h-auto w-full justify-between rounded-none border-none px-0 pt-8 pb-1 text-left font-normal hover:bg-transparent focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span
            v-if="modelValue"
            class="truncate text-base"
          >
            {{ selectedLabel }}
          </span>

          <span
            v-else
            class="text-transparent"
          >
            {{ placeholder }}
          </span>

          <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent class="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput :placeholder="searchPlaceholder" />
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandList>
            <CommandGroup>
              <CommandItem
                v-for="option in options"
                :key="option.value"
                :value="option.label"
                @select="handleSelect(option.value)"
                class="hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer justify-between px-2"
              >
                {{ option.label }}

                <Check
                  :class="
                    cn(
                      'ml-2 h-4 w-4',
                      modelValue === option.value ? 'opacity-100' : 'opacity-0',
                    )
                  "
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

    <label
      class="pointer-events-none absolute top-0 left-0 text-sm text-gray-500 transition-all duration-200 ease-in-out"
    >
      {{ label }}
    </label>
  </div>
</template>
