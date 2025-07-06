<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

interface Props {
  icon?: string;
  label?: string;
  buttonClass?: string;
  disabled?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'click'): void;
}>();

const handleClick = () => {
  if (!props.disabled) {
    emit('click');
  }
};
</script>

<template>
  <button
    :class="`${props.buttonClass} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`"
    :disabled="props.disabled"
    @click="handleClick"
  >
    <svg
      v-if="props.icon"
      class="fill-current"
      width="20"
      height="20"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path :d="props.icon" />
    </svg>
    <span v-if="props.label" class="ml-2">{{ props.label }}</span>
  </button>
</template>
