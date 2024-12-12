<template>
  <div class="category-products">
    <div class="category-header">
      <h2 class="category-title">{{ title }}</h2>
      <q-btn
        flat
        :label="$t('common.viewMore')"
        :to="moreLink"
        class="view-more"
      />
    </div>

    <div class="products-grid">
      <ProductCard
        v-for="product in products"
        :key="product.prodId"
        :product="product"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ProductCard from './product/ProductCard.vue'

const { t } = useI18n()

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  categoryId: {
    type: Number,
    required: true
  },
  moreLink: {
    type: String,
    default: ''
  }
})

const products = ref([])

const loadProducts = async () => {
  try {
    const response = await api.get(`/prod/listByCategoryId?categoryId=${props.categoryId}&pageSize=8`)
    const data = await response.data
    if(data.code === 200) {
      products.value = data.data
    }
  } catch (error) {
    console.error('Failed to load category products:', error)
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.category-products {
  margin-bottom: 40px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.category-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.view-more {
  color: var(--q-primary);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .category-title {
    font-size: 20px;
  }
}
</style>
