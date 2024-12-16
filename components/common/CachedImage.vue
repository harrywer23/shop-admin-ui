<template>
  <q-img
    :src="imageUrl"
    :ratio="ratio"
    :spinner-color="spinnerColor"
    :spinner-size="spinnerSize"
    :no-spinner="noSpinner"
    :alt="alt"
    :width="width"
    :height="height"
    :fit="fit"
  >
    <slot></slot>
  </q-img>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const config = useRuntimeConfig()

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  ratio: {
    type: [Number, String],
    default: 1
  },
  spinnerColor: {
    type: String,
    default: 'primary'
  },
  spinnerSize: {
    type: [Number, String],
    default: 42
  },
  noSpinner: {
    type: Boolean,
    default: false
  },
  alt: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: undefined
  },
  height: {
    type: String,
    default: undefined
  },
  fit: {
    type: String,
    default: 'cover'
  }
})

// 处理图片URL
const imageUrl = computed(() => {
  if (!props.src) return ''
  if (props.src.startsWith('http')) return props.src
  return getImageUrl(props.src)
})
</script>
