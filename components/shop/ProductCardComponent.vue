<script setup lang="ts">
import { defineProps } from 'vue';
import ImageComponent from "~/components/ImageStorageComponent.vue";
interface Product {
  imgUrl: string;
  id: string;
  title: string;
  createTime: string;
  price:number;
  intro:string;
  originalPrice:string;//折扣价
}

const props = defineProps<{ value: Product }>();
</script>

<template>
  <q-card bordered class="q-ma-sm item-card" flat style="width: 300px">
    <q-card-section>
       <image-component  :key="props.value.id" :src="props.value.imgUrl" class="item-card-image"></image-component>
    </q-card-section>
    <q-card-section>
      <div class="text-h6 one-line-clamp" style="width: 300px"><a :href='"/systemAlbum/detail?aid="+props.value.id'>{{ props.value.title }}</a></div>
      <div class="text-subtitle2 one-line-clamp">{{ props.value.intro }}</div>
      <div class="text-subtitle2 one-line-clamp">{{ props.value.price }} - {{ props.value.originalPrice }}</div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.one-line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
