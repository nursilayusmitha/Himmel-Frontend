<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps(['label', 'type', 'placeholder', 'modelValue', 'isTextarea']);
const emit = defineEmits();

const showPass = ref(false);

// Emit event when the input changes
const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit('update:modelValue', target.value); // Emit updated value
};
</script>

<template>
  <div class="mb-4">
    <label class="mb-2.5 block font-medium text-black dark:text-white">{{ props.label }}</label>
    <div class="relative">
      <!-- Conditionally render input or textarea -->
      <input
        v-if="!props.isTextarea"
        :value="props.modelValue"  
        @input="updateValue" 
        :type="showPass ? 'text' : props.type"
        :placeholder="props.placeholder"
        class="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary text-black dark:text-white"
      />
      <textarea
        v-else
        :value="props.modelValue"
        @input="updateValue"
        :placeholder="props.placeholder"
        class="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary text-black dark:text-white"
      />

      <div v-if="props.type === 'password'" class="flex items-center mt-2">
        <input type="checkbox" v-model="showPass" id="show-password" class="mr-2" />
        <label for="show-password" class="text-sm text-black dark:text-white">Show Password</label>
      </div>

      <span class="absolute right-4 top-4">
        <slot></slot>
      </span>
    </div>
  </div>
</template>
