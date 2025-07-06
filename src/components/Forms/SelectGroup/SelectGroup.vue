<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'

// Define the Option interface
interface Option {
  label: string
  [key: string]: any // Support extra fields
}

// Define props and emits
const props = defineProps<{
  options: Option[],
  modelValue: string | Option,
  placeholder?: string,
  disabled: boolean,
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Option): void
  (e: 'option-changed', value: Option): void // New custom event
}>()

// Local state for the selected option, using `label` instead of `value`
const selectedLabel = ref(
  typeof props.modelValue === 'string'
    ? props.modelValue
    : props.modelValue?.label || ''
)

// Watch for changes in `modelValue` prop to sync `selectedLabel`
watch(
  () => props.modelValue,
  (newValue) => {
    selectedLabel.value = typeof newValue === 'string' ? newValue : newValue?.label || ''
  },
  { immediate: true }
)

// Update both `modelValue` and emit events when the selection changes
const updateSelection = () => {
  const selectedOption = props.options.find(option => option.label === selectedLabel.value) || { label: '' }
  emit('update:modelValue', selectedOption)
  emit('option-changed', selectedOption)
}
</script>

<template>
  <div>
    <div class="relative z-20 bg-white dark:bg-form-input">
      <select
        :disabled="props.disabled"
        v-model="selectedLabel"
        @change="updateSelection"
        :class="props.disabled? 'bg-whiter ' : ''"
        class="w-full appearance-none rounded border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
      >
        <!-- Placeholder option -->
        <option value="" disabled
          class="text-black dark:text-white">
          {{ props.placeholder || 'Select an option' }}
        </option>
        <!-- Dynamic options using `label` as value -->
        <option
          v-for="option in props.options"
          :key="option.label"
          :value="option.label"
          class="text-black dark:text-white"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>
