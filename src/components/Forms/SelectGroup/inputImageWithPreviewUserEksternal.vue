<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onUnmounted } from 'vue';
import { API } from "@/API/";

const props = defineProps<{
  modelValue: string | File | null;
  label: string;
}>();

const emits = defineEmits(['update:modelValue', 'update:file', 'remove:image', 'update:condition']);

const imageSrc = ref<string | null>(props.modelValue instanceof File ? URL.createObjectURL(props.modelValue) : (typeof props.modelValue === 'string' ? API + '/images/user_eksternal/' + props.modelValue : null));
const fileInput = ref<HTMLInputElement | null>(null);

const previewImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    imageSrc.value = URL.createObjectURL(file);
    emits('update:file', file);
    emits('update:modelValue', file);
    emits('update:condition', 'ganti'); // Emit 'ganti' condition when image changes
  }
};

const removeImage = () => {
  imageSrc.value = null;  // Mengosongkan tampilan pratinjau
  emits('update:modelValue', null);  // Set modelValue ke null untuk memberitahu gambar telah dihapus
  emits('remove:image');  // Emit event bahwa gambar telah dihapus
  emits('update:condition', 'hapus');  // Emit kondisi hapus
};




// Reset the file input value to allow re-selection of the same file
const resetFileInput = () => {
  if (fileInput.value) {
    fileInput.value.value = ''; // Reset the input field value
  }
};

// Cleanup URL objects to prevent memory leaks
onUnmounted(() => {
  if (imageSrc.value && typeof imageSrc.value === 'string' && imageSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(imageSrc.value);
  }
});

// Watch for changes to modelValue and update image preview accordingly
watch(() => props.modelValue, (newValue) => {
  if (newValue instanceof File) {
    imageSrc.value = URL.createObjectURL(newValue);
    emits('update:condition', 'ganti');  // Gambar diubah
  } else if (typeof newValue === 'string' && newValue !== '') {
    imageSrc.value = API + '/images/user_eksternal/' + newValue;
    emits('update:condition', 'ada');    // Pertahankan gambar lama
  } else {
    emits('update:condition', 'hapus');  // Gambar dihapus
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
  <div class="mt-4 relative">
    <img
      :src="imageSrc || API + '/images/user_eksternal/profile.png'"
      alt="Uploaded Preview"
      class="w-[100px] h-[100px] object-cover rounded cursor-pointer"
      @click="fileInput?.click()"
    />

    <!-- Remove Image Button -->
    <button
      v-if="imageSrc"
      @click="removeImage"
      class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
    >
      X
    </button>
  </div>
</template>
