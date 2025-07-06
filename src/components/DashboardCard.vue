<template>
  <div class="bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center">
    <div class="text-4xl">{{ icon }}</div>
    <h3 class="text-xl font-semibold mt-2">{{ title }}</h3>
    <p class="text-2xl font-bold text-blue-600 mt-1">{{ value }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: String
});
</script>
