<template>
  <div class="error-page">
    <h1>{{ error.statusCode === 404 ? '页面未找到' : '发生错误' }}</h1>
    <p>{{ error.message }}</p>
    <NuxtLink to="/">返回首页</NuxtLink>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
})
</script> 