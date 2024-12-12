<template>
  <div class="params-section">
    <ParamList :params="params" />
  </div>
</template>

<script setup lang="ts">
import ParamList from './ParamList.vue'

defineProps<{
  params: any[]
}>()
</script> 