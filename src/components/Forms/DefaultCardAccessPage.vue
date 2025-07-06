<script setup lang="ts">
import SwitchFour from '@/components/Forms/Switchers/SwitchFour.vue'
const props = defineProps(['cardTitle'])
</script>

<template>
  <div
    class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
  >
    <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex justify-between items-center">
      <!-- Gunakan Flexbox untuk menempatkan judul dan switch dalam satu baris -->
      <h3 class="font-medium text-black dark:text-white">
        {{ props.cardTitle }}
      </h3>
      <!-- Switch akan berada di sisi kanan -->
      <!-- <SwitchFour /> -->
      <slot name="card-tools"></slot>
    </div>
    <slot></slot>
  </div>
</template>
