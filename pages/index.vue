<script setup lang="ts">
import { ref, onMounted } from 'vue'

const slide = ref(0)

const banners = ref([])
// 商品数据
const hotProdList = ref([])
const newProdList = ref([])
const moreProdList = ref([])
// 加载Banner列表
const loadBanners = async () => {
  try {
    const response = await api.get(`/banner/list?position=home`)
    const { code, data, total } = response.data

    if (code === 200) {
      banners.value = data
    } else {
      banners.value = []
      throw new Error('加载Banner列表失败')
    }
  } catch (error) {
    console.error('加载Banner列表失败:', error)

  }
}

// 加载商品数据
const loaHotProducts = async () => {
  try {
    const response = await api.get('/prod/listByTagId?pageNum=1&pageSize=8&tagId=2')
    const data = await response.data;
    hotProdList.value = data.data
    //console.log('hotProdList', hotProdList.value)
  } catch (error) {
    console.error('获取商品数据失败:', error)
  }
}
const loaNewProducts = async () => {
  try {
    const response = await api.get('/prod/listByTagId?page=1&pageSize=8&tagId=1')
    const data = await response.data;
    newProdList.value = data.data
    //console.log('newProdList', newProdList.value)
  } catch (error) {
    console.error('获取商品数据失败:', error)
  }
}
const loaMoreProducts = async () => {
  try {
    const response = await api.get('/prod/listByTagId?page=1&pageSize=8&tagId=3')
    const data = await response.data;
    moreProdList.value = data.data
    //console.log('moreProdList', moreProdList.value)
  } catch (error) {
    console.error('获取商品数据失败:', error)
  }
}
onMounted(() => {
  loadBanners()
  // fetchSystemRandom()
  loaHotProducts()
  loaNewProducts()
  loaMoreProducts()

})
</script>

<template>
  <div class="home-container">
    <div class="main-content">
      <!-- 左侧分类导航 -->
      <div class="category-nav">
        <ClassComponent />
      </div>

      <!-- 右侧轮播图区域 -->
      <div class="carousel-section">
        <q-carousel
          v-model="slide"
          animated
          arrows
          navigation
          infinite
          :autoplay="3000"
          class="carousel-custom"
        >
          <q-carousel-slide
            v-for="(banner, index) in banners"
            :key="index"
            :name="banner.title"
          >
            <q-img
              :src="getImageUrl(banner.imgUrl)"
              :ratio="16/9"
              class="full-height full-width"
            >
              <div class="banner-content absolute-bottom">
                <h2 class="text-h4 text-weight-bold q-mb-sm">{{ banner.title }}</h2>
                <p class="text-subtitle1 q-mb-none">{{ banner.description }}</p>
              </div>
            </q-img>
          </q-carousel-slide>
        </q-carousel>
      </div>
    </div>

    <!-- 商品展示区域 -->
    <div class="products-section q-mt-lg">
      <!-- 特色商品 -->
      <section4-component
        :title="$t('home.sections.newProducts')"
        :products="newProdList"
        more-link="/product/sort"
      />

      <!-- 新品上市 -->
      <section4-component
        :title="$t('home.sections.hotSales')"
        :products="hotProdList"
        more-link="/product/sort?sort=newest"
      />
      <section4-component
          :title="$t('home.sections.moreItems')"
          :products="moreProdList"
          more-link="/product/sort?sort=newest"
      />
    </div>

    <!-- 添加分类产品展示 -->
    <div class="category-sections">
      <!-- 写真集 -->
      <CategoryProducts
        :title="$t('home.categories.anime')"
        :category-id="1"
        more-link="/product/list?parentId=1"
      />

      <!-- COS -->
      <CategoryProducts
        :title="$t('home.categories.game')"
        :category-id="2"
        more-link="/product/list?parentId=2"
      />

      <!-- 其他 -->
      <CategoryProducts
        :title="$t('home.categories.movie')"
        :category-id="3"
        more-link="/product/list?parentId=3"
      />

      <!-- 动漫轻娱 -->
      <CategoryProducts
        :title="$t('home.categories.novel')"
        :category-id="4"
        more-link="/product/list?parentId=4"
      />
      <!-- 动漫轻娱 -->
      <CategoryProducts
          :title="$t('home.categories.general')"
          :category-id="5"
          more-link="/product/list?parentId=5"
      />
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.main-content {
  display: flex;
  gap: 20px;
  position: relative;
  height: 400px;
  margin-bottom: 40px;
}

.category-nav {
  flex: none;
  width: 220px;
  position: relative;
  z-index: 20;
}

.carousel-section {
  flex: 1;
  position: relative;
  z-index: 10;
  margin-left: 20px;
}

:deep(.sub-categories-panel) {
  width: calc(100vw - 280px) !important;
  max-width: 900px !important;
  min-width: 600px !important;
}

.carousel-custom {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.banner-content {
  padding: 24px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
}

.banner-content h2 {
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.banner-content p {
  color: rgba(255,255,255,0.9);
  margin: 8px 0 0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.products-section {
  margin-top: 40px;
}

.category-sections {
  margin-top: 40px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    height: auto;
    gap: 12px;
  }

  .category-nav {
    width: 100%;
  }

  .carousel-section {
    margin-left: 0;
    height: 300px;
  }

  :deep(.sub-categories-panel) {
    width: calc(100vw - 40px) !important;
    min-width: unset !important;
    left: 20px !important;
  }
}
</style>
