<script setup lang="ts">
import { ref, computed } from 'vue';
import { onClickOutside } from '@vueuse/core';

interface Option {
  id: number;
  name: string;
}

const props = defineProps<{
  options: Option[];
  placeholder: String;
  disabled?: boolean;
}>();

const searchQuery = ref('');

// Filter options based on the search query
const filteredOptions = computed(() =>
  props.options.filter(option =>
    option.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);
</script>

<template>
  <div class="relative w-full" ref="dropdownRef">
    <!-- Selected Items -->
    <div
      :class="props.disabled?'bg-whiter':''"
      class="border-[1.5px] rounded-lg p-3 text-black bg-transparent transition focus:border-primary dark:text-white dark:bg-form-input"
    >
      <div class="flex flex-wrap gap-2">
        <template v-if="props.options && props.options.length">
          <span
            v-for="item in props.options"
            :key="item.id"
            class="bg-primary text-white rounded px-3 py-1 text-sm"
          >
            {{ item.name }}
          </span>
        </template>
        <span v-else class="text-gray-500">
            <span v-if="props.placeholder">{{ props.placeholder }}</span>
            <span v-else>Select options...</span>
        </span>
      </div>
    </div>

  </div>
</template>
