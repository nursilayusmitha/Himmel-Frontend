<script setup lang="ts">
const props = defineProps(['pageTitle', 'pageList'])
</script>

<template>
  <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <h2 class="text-title-md2 font-semibold text-black dark:text-white">
      {{ props.pageTitle }}
    </h2>

    <nav>
      <ol class="flex items-center gap-2">
        <li>
          <router-link class="font-medium" to="/"> Dashboard </router-link>
        </li>
        <li class="font-medium text-primary" v-if="!props.pageList"> / {{ props.pageTitle }}</li>
        <li v-else>
          <span v-for="data in props.pageList"> / <span class="font-medium text-primary">{{ data }}</span></span>
        </li>
      </ol>
    </nav>
  </div>
</template>
