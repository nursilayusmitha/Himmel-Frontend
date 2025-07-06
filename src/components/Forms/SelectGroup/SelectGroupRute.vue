<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, computed } from 'vue'
import { mdiMenuDown      } from '@mdi/js';


interface Option {
  label: string
  value: any
}

const props = defineProps<{
  options: Option[],
  modelValue: string | Option,
  placeholder?: string,
  disabled?: boolean,
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Option): void
}>()

const searchQuery = ref('')
const selectedLabel = ref('')
const isDropdownOpen = ref(false)

// Filter opsi berdasarkan input pencarian
const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  return props.options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Toggle dropdown
const toggleDropdown = () => {
  if (!props.disabled) {
    isDropdownOpen.value = !isDropdownOpen.value
    if (isDropdownOpen.value) searchQuery.value = '' // Reset search saat buka
  }
}

// Pilih opsi
const selectOption = (option: Option) => {
  selectedLabel.value = option.label
  emit('update:modelValue', option)
  isDropdownOpen.value = false
}

// Sinkronkan nilai awal
watch(
  () => props.modelValue,
  (newValue) => {
    selectedLabel.value = typeof newValue === 'string' ? newValue : newValue?.label || ''
  },
  { immediate: true }
)

// Tutup dropdown jika klik di luar
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.dropdown-wrapper')) {
    isDropdownOpen.value = false
  }
}

window.addEventListener('click', handleClickOutside)
</script>
<template>
  <div class="relative dropdown-wrapper" @click.stop>
    <!-- SELECT BUTTON -->
    <div
      class="relative z-20 bg-white dark:bg-form-input border border-stroke dark:border-form-strokedark rounded py-3 px-4 cursor-pointer flex items-center justify-between"
      @click="toggleDropdown"
      :class="{ 'opacity-50 cursor-not-allowed': props.disabled }"
    >
      <!-- TEKS DENGAN ELLIPSIS -->
      <div
        class="truncate-label text-black dark:text-white"
        style="max-width: calc(100% - 32px); overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"
      >
        {{ selectedLabel || placeholder || 'Pilih opsi' }}
      </div>

      <!-- ICON DROPDOWN -->
      <span class="ml-2 shrink-0">
        <svg
          class="fill-black dark:fill-white"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path :d="mdiMenuDown" />
        </svg>
      </span>
    </div>

    <!-- DROPDOWN -->
    <div 
      v-if="isDropdownOpen" 
      class="absolute z-30 w-full mt-2 bg-white dark:bg-form-input border border-stroke dark:border-form-strokedark rounded shadow-lg"
    >
      <!-- INPUT SEARCH -->
      <input 
        v-model="searchQuery"
        placeholder="Cari..."
        class="w-full py-2 px-4 border-b border-stroke dark:border-form-strokedark text-black dark:text-white bg-white dark:bg-form-input placeholder-gray-400 dark:placeholder-gray-500"
      />

      <!-- LIST OPSI -->
      <ul v-if="filteredOptions.length > 0" class="max-h-60 overflow-y-auto">
        <li 
          v-for="option in filteredOptions" 
          :key="option.label" 
          @click="selectOption(option)" 
          class="cursor-pointer px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 border-b border-gray-300 dark:border-gray-600"
        >
          <div class="font-semibold text-black dark:text-white">
            {{ option.value.bandaraName || option.value.stasiunName }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ option.value.bandaraLocation || option.value.stasiunLocation }}
          </div>
        </li>
      </ul>

      <div v-else class="text-center py-2 text-gray-500 dark:text-gray-400">Tidak ditemukan</div>
    </div>
  </div>
</template>
