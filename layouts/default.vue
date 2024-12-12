<script setup lang="ts">
import AppHead from "~/components/AppHead.vue";
const router = useRouter();
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <app-head></app-head>
    <q-page-container>
      <slot />
    </q-page-container>
    <app-footer></app-footer>
  </q-layout>
</template>

<style scoped>
</style>
