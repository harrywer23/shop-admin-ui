<template>
  <div class="section-container">
    <div class="section-header">
      <h2 class="section-title">{{ title  }}</h2>
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
import { useI18n } from 'vue-i18n'
import ProductCard from './product/ProductCard.vue'

const { t } = useI18n()

defineProps({
  title: {
    type: String,
    required: true
  },
  products: {
    type: Array,
    required: true
  },
  moreLink: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.section-container {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
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

  .section-title {
    font-size: 20px;
  }
}
</style>
