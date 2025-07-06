<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onUnmounted } from 'vue';

const props = defineProps<{
  modelValue: string | File | null;
  label: string;
}>();

const emits = defineEmits(['update:modelValue', 'update:file', 'remove:image']);

const imageSrc = ref<string | null>(props.modelValue instanceof File ? URL.createObjectURL(props.modelValue) : props.modelValue);
const fileInput = ref<HTMLInputElement | null>(null); // Add a ref for the input element

// Handle file input change
const previewImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    // Update imageSrc with the preview URL for the new file
    imageSrc.value = URL.createObjectURL(file);
    emits('update:file', file); // Emit the file
    emits('update:modelValue', file); // Optionally, update modelValue
  }
};

// Handle removing the image
const removeImage = () => {
  imageSrc.value = null;
  emits('update:modelValue', null); // Emit null to reset the modelValue
  resetFileInput(); // Reset the file input element
};

// Reset the file input value
const resetFileInput = () => {
  if (fileInput.value) {
    fileInput.value.value = ''; // Reset the input field value
  }
};

// Cleanup URL objects to prevent memory leaks
onUnmounted(() => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value);
});

// Watch for changes to modelValue and update image preview
watch(() => props.modelValue, (newValue) => {
  if (newValue instanceof File) {
    imageSrc.value = URL.createObjectURL(newValue); // Create preview URL for File
  } else {
    imageSrc.value = newValue as string | null; // Use URL or reset to placeholder
  }
});
</script>

<template>
  <!-- Hidden file input with click-triggering label -->
  <input
    type="file"
    accept="image/*"
    class="hidden"
    :id="label"
    @change="previewImage"
    ref="fileInput"
    :key="imageSrc"
  />
  <label :for="label" class="cursor-pointer px-4 py-2 rounded transition text-center">
    {{ label }}
  </label>

  <!-- Image preview with placeholder support and click to change -->
  <div class="mt-4">
    <img
      :src="imageSrc || 'https://placehold.co/150'"
      alt="Uploaded Preview"
      class="w-[100px] h-[100px] object-cover rounded cursor-pointer"
      @click="fileInput?.click()"
    />
  </div>

  <!-- Remove Image Button -->
  <button
    v-if="imageSrc"
    @click="removeImage"
    class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
  >
    X
  </button>
</template>
