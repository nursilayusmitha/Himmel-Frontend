<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onUnmounted } from 'vue';
import { API } from "@/API/";

const props = defineProps<{
  modelValue: string | File | null;
  label: string;
  disabled: boolean;
}>();

const emits = defineEmits(['update:modelValue', 'update:file']);

const imageSrc = ref<string | null>(
  props.modelValue instanceof File
    ? URL.createObjectURL(props.modelValue)
    : props.modelValue
);

const fileInput = ref<HTMLInputElement | null>(null); // Ref for file input

const previewImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    // Update imageSrc with the preview URL for the new file
    imageSrc.value = URL.createObjectURL(file);
    emits('update:file', file); // Emit the file
    emits('update:modelValue', file); // Update modelValue
  }
};

const removeImage = () => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value); // Cleanup the URL
  imageSrc.value = null; // Clear the image preview
  emits('update:file', null); // Emit null to reset the file
  emits('update:modelValue', null); // Update modelValue to null
  if (fileInput.value) fileInput.value.value = ''; // Reset the input value
};

// Cleanup URL objects to prevent memory leaks
onUnmounted(() => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value);
});

// Watch for changes to modelValue and update the image preview
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
    :disabled="disabled"
    type="file"
    accept="image/*"
    class="hidden"
    :id="label"
    @change="previewImage"
    ref="fileInput"
  />
  <label
    :for="label"
    class="px-4 py-2 rounded transition text-center"
    :class="disabled ? 'opacity-50 cursor-default' : 'cursor-pointer'"
  >
    {{ label }}
  </label>

  <!-- Image preview with placeholder support -->
  <div class="mt-4 relative">
    <img
      v-if="typeof modelValue === 'string'"
      :src="imageSrc ? `${API}/images/admin_logistik/${imageSrc}` : 'https://placehold.co/150'"
      alt="Uploaded Preview"
      class="w-[100px] h-[100px] object-cover rounded"
      :class="disabled ? 'cursor-default' : 'cursor-pointer'"
      @click="!disabled && fileInput?.click()"
    />
    <img
      v-else
      :src="imageSrc || 'https://placehold.co/150'"
      alt="Uploaded Preview"
      class="w-[100px] h-[100px] object-cover rounded"
      :class="disabled ? 'cursor-default' : 'cursor-pointer'"
      @click="!disabled && fileInput?.click()"
    />
    <!-- Remove button -->
    <button
      v-if="imageSrc && !disabled"
      @click="removeImage"
      class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
    >
      X
    </button>
  </div>
</template>
