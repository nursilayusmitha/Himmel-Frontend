<script setup lang="ts">
const props = defineProps(['subtitle', 'title', 'customClasses'])
</script>

<template>
  <!-- ====== Forms Section Start -->
  <div
    class="min-h-screen flex items-center justify-center bg-[url('@/assets/images/background/background.png')] bg-cover bg-center bg-no-repeat dark:bg-gray-900 px-4 sm:px-8"
  >
    <div
      class="rounded-lg shadow-lg overflow-hidden bg-white dark:bg-boxdark w-full max-w-4xl flex flex-col xl:flex-row"
      style="margin-top: 2rem; margin-bottom: 2rem;"
    >
      <!-- Left Section (Illustration) -->
      <div class="hidden xl:flex xl:w-1/2 bg-[#009ee5] dark:bg-gray-800 p-6 items-center justify-center">
        <div class="text-center">
          <router-link to="/" class="block mb-6">
            <img src="@/assets/images/logo/logo-no-bg.svg" alt="Logo" class="h-24 mx-auto dark:hidden">
            <img src="@/assets/images/logo/logo-no-bg.svg" alt="Logo" class="h-24 mx-auto hidden dark:block">
          </router-link>
          <p class="text-white dark:text-gray-400 text-xl">
            Travel kemana saja, kapan saja, semau Anda.
          </p>
          <p class="text-white dark:text-gray-400 mb-8">
            Pesan tiket pesawat dan kereta dari mana saja!
          </p>
          <img src="@/assets/images/illustration/illustration.png" alt="illustration" class="mt-8">
        </div>
      </div>

      <!-- Right Section (Form) -->
      <div class="w-full xl:w-1/2 p-6 sm:p-10 xl:px-12">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ props.title }}</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">{{ props.subtitle }}</p>

        <!-- Slot for form content -->
        <slot></slot>
        <div class="flex items-center justify-center mt-8.5">
  <!-- Logo -->
  <img 
    src="@/assets/images/logo/logo-blue.svg" 
    alt="Logo" 
    class="h-7 dark:hidden"
  >
  <!-- Paragraf -->
  <p class="text-sm">
    All Right Reserved.
  </p>
</div>

      </div>
    </div>
  </div>
  <!-- ====== Forms Section End -->
</template>
