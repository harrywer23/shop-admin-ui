<template>
  <div >
    <div class="q-gutter-md row">
      <q-card
          v-for="item in items"
          :key="item.id"
          class="my-card col-3"
      >
        <q-card-section class="text-center">
        <q-img :src="item.image" class="card-image"  style="height: 160px;width: 160px"/>
        </q-card-section>
      <q-card-section class="text-center">
        <div class="text-h6">{{item.title}}</div>
        <div class="text-subtitle1 line-removed">{{item.intro}}</div>
        <div class="text-subtitle1 line-removed">{{item.intro}}</div>
      </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const items = ref([
  { id: 1, title: '卡片 1', image: '//cdn.cnbj1.fds.api.mi-img.com/nr-pub/202409251507_d9b4ae236e3ee8b78cc5faaf706c71a3.png?thumb=1&w=400&h=400&f=webp&q=90',intro:"前置6000万超广角人像｜静谧通话 2.0｜超高清高分辨率临境双屏",},

  { id: 2, title: '卡片 2', image: '//cdn.cnbj1.fds.api.mi-img.com/nr-pub/202409251507_d9b4ae236e3ee8b78cc5faaf706c71a3.png?thumb=1&w=400&h=400&f=webp&q=90' ,intro:"前置6000万超广角人像｜静谧通话 2.0｜超高清高分辨率临境双屏"},
  { id: 3, title: '卡片 3', image: '//cdn.cnbj1.fds.api.mi-img.com/nr-pub/202409251507_d9b4ae236e3ee8b78cc5faaf706c71a3.png?thumb=1&w=400&h=400&f=webp&q=90',intro:"前置6000万超广角人像｜静谧通话 2.0｜超高清高分辨率临境双屏" },
  { id: 4, title: '卡片 4', image: '//cdn.cnbj1.fds.api.mi-img.com/nr-pub/202409251507_d9b4ae236e3ee8b78cc5faaf706c71a3.png?thumb=1&w=400&h=400&f=webp&q=90',intro:"前置6000万超广角人像｜静谧通话 2.0｜超高清高分辨率临境双屏" },
  { id: 5, title: '卡片 5', image: '//cdn.cnbj1.fds.api.mi-img.com/nr-pub/202409251507_d9b4ae236e3ee8b78cc5faaf706c71a3.png?thumb=1&w=400&h=400&f=webp&q=90',intro:"前置6000万超广角人像｜静谧通话 2.0｜超高清高分辨率临境双屏" },
  { id: 6, title: '卡片 6', image: '//cdn.cnbj1.fds.api.mi-img.com/nr-pub/202409251507_d9b4ae236e3ee8b78cc5faaf706c71a3.png?thumb=1&w=400&h=400&f=webp&q=90',intro:"前置6000万超广角人像｜静谧通话 2.0｜超高清高分辨率临境双屏" },
  { id: 7, title: '卡片 7', image: '//cdn.cnbj1.fds.api.mi-img.com/nr-pub/202409251507_d9b4ae236e3ee8b78cc5faaf706c71a3.png?thumb=1&w=400&h=400&f=webp&q=90',intro:"前置6000万超广角人像｜静谧通话 2.0｜超高清高分辨率临境双屏" },
  { id: 8, title: '卡片 8', image: '//cdn.cnbj1.fds.api.mi-img.com/nr-pub/202409251507_d9b4ae236e3ee8b78cc5faaf706c71a3.png?thumb=1&w=400&h=400&f=webp&q=90' ,intro:"前置6000万超广角人像｜静谧通话 2.0｜超高清高分辨率临境双屏"},
  { id: 9, title: '卡片 9', image: '//cdn.cnbj1.fds.api.mi-img.com/nr-pub/202409251507_d9b4ae236e3ee8b78cc5faaf706c71a3.png?thumb=1&w=400&h=400&f=webp&q=90' ,intro:"前置6000万超广角人像｜静谧通话 2.0｜超高清高分辨率临境双屏"},
]);
</script>


<style scoped>
.card-image {
  height: 100px; /* 设置图片高度 */
  width: 100%; /* 让图片宽度适应卡片 */
}

.row {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  justify-content: flex-start; /* 靠左显示 */
}

.my-card {
  max-width: calc(25% - 16px); /* 让每个卡片的最大宽度为25%并考虑间距 */
  margin: 8px; /* 适当的间距 */
}
</style>
