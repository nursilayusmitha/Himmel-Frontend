<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onUnmounted } from 'vue'

import { API } from "@/API/";

const props = defineProps<{
  modelValue: string | File | null;
  label: string;
  disabled: boolean;
}>();

const emits = defineEmits(['update:modelValue', 'update:file'])

const imageSrc = ref<string | null>(props.modelValue instanceof File ? URL.createObjectURL(props.modelValue) : props.modelValue)

const previewImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    // Update imageSrc with the preview URL for the new file
    imageSrc.value = URL.createObjectURL(file);
    emits('update:file', file);  // Emit the file
    emits('update:modelValue', file);  // Optionally, update modelValue
  }
};

// Cleanup URL objects to prevent memory leaks
onUnmounted(() => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value);
});

watch(() => props.modelValue, (newValue) => {
  if (newValue instanceof File) {
    imageSrc.value = URL.createObjectURL(newValue);  // Create preview URL for File
  } else {
    imageSrc.value = newValue as string | null;  // Use URL or reset to placeholder
  }
});
</script>

<template>
    <!-- Hidden file input with click-triggering label -->
    <input
      :disabled="props.disabled"
      type="file"
      accept="image/*"
      class="hidden"
      :id="label"
      @change="previewImage"
      ref="fileInput"
    />
    <label :for="label" class="px-4 py-2 rounded transition text-center" :class="props.disabled ? ' ' : 'cursor-pointer'">
      {{ label }}
    </label>
    
    <!-- Image preview with placeholder support and click to change -->
    <div class="mt-4">
      <img
        v-if="typeof props.modelValue === 'string'"
        :src="imageSrc ? API+'/images/user_eksternal/'+imageSrc : API+'/images/user_eksternal/profile.png'"
        alt="Uploaded Preview"
        class="w-[100px] h-[100px] object-cover rounded"
        :class="props.disabled ? 'cursor-default' : 'cursor-pointer'"
        @click="$refs.fileInput.click()"
      />
      <img
        v-else
        :src="imageSrc || API+'/images/user_eksternal/profile.png'"
        alt="Uploaded Preview"
        :class="props.disabled ? 'cursor-default' : 'cursor-pointer'"
        class="w-[100px] h-[100px] object-cover rounded"
        @click="$refs.fileInput.click()"
      />
    </div>
</template>
