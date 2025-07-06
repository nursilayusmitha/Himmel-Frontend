<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { mdiPlusCircleOutline } from "@mdi/js";

const props = defineProps<{ cardTitle: string, index?: number }>()
const emit = defineEmits<{
  (e: 'handle-click'): void
}>()

// Emit the event when the button is clicked
const handleClick = () => {
  emit('handle-click')
}
</script>

<template>
  <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
    <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex justify-between">
      <h3 class="font-medium text-black dark:text-white">{{ cardTitle }}</h3>
      <div
        class="flex justify-center cursor-pointer font-medium text-blue-600 hover:bg-opacity-90"
        @click="handleClick"
      >
        <svg
          class="fill-current"
          width="20"
          height="20"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path :d="mdiPlusCircleOutline" />
        </svg>
      </div>
    </div>
    <slot></slot>
  </div>
</template>
