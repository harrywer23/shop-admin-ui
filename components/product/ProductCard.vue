<template>
  <div class="product-card" @click="navigateToProduct(product.prodId)">
    <q-img
      :src="getImageUrl(product.pic)"
      :ratio="1"
      class="product-image"
    >
      <template v-slot:loading>
        <q-spinner-dots color="white" />
      </template>

      <!-- 标签展示 -->
      <div class="product-tags absolute-top-right q-pa-sm">
        <q-chip
          v-if="product.status"
          dense
          color="purple"
          text-color="white"
          size="sm"
        >
          {{ $t('product.presell') }}
        </q-chip>
        <q-chip
          v-if="isNew"
          dense
          color="green"
          text-color="white"
          size="sm"
        >
          {{ $t('common.new') }}
        </q-chip>
      </div>
    </q-img>

    <div class="product-info">
      <div class="product-name">{{ product.prodName }}</div>
<!--      <div class="product-brief">{{ product.brief }}</div>-->
      <div class="product-price">
        <span class="current-price">¥{{ product.price }}</span>
        <span class="original-price">¥{{ product.oriPrice }}</span>
      </div>
      <div class="product-footer">
        <span class="product-sales">
          {{ $t('product.soldCount', { count: product.soldNum }) }}
        </span>
        <q-btn
          flat
          round
          dense
          color="grey"
          icon="shopping_cart"
          @click.stop="addToCart"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import {useI18n} from "vue-i18n";

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()

// 判断是否为新品（7天内）
const isNew = computed(() => {
  const createTime = new Date(props.product.create_time).getTime()
  const now = new Date().getTime()
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  return (now - createTime) < sevenDays
})

// 跳转到商品详情
const navigateToProduct = (productId: number) => {
  router.push(`/product/detail?prodId=${productId}`)
}

// 添加到购物车
const addToCart = () => {
  // TODO: 实现添加到购物车的逻辑
  $q.notify({
    type: 'positive',
    message: $t('product.addCartSuccess')
  })
}
</script>

<style scoped>
.product-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s;
  cursor: pointer;
  background: white;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.product-image {
  aspect-ratio: 1;
  object-fit: cover;
}

.product-tags {
  display: flex;
  gap: 4px;
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  min-height: 2.8em;
}

.product-brief {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.current-price {
  color: #ff4081;
  font-size: 18px;
  font-weight: bold;
}

.original-price {
  color: #999;
  font-size: 14px;
  text-decoration: line-through;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-sales {
  font-size: 12px;
  color: #666;
}
</style>
