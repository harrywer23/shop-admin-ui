<template>
  <q-card
    class="product-card"
    bordered
    flat
    @mouseleave="hoveredSku = null"
  >
    <q-img
      :src="getImageUrl(hoveredSku?.pic || product.pic)"
      :ratio="1"
      class="product-image"
    />

    <!-- SKU缩略图 -->
    <div class="sku-thumbnails q-pa-sm" v-if="product.skus?.length">
      <q-avatar
        v-for="sku in product.skus"
        :key="sku.skuId"
        size="32px"
        class="sku-thumbnail cursor-pointer q-mr-xs"
        @mouseenter="hoveredSku = sku"
      >
        <q-img :src="getImageUrl(sku.pic)" />
      </q-avatar>
    </div>

    <q-card-section>
      <div class="product-name text-subtitle1 ellipsis-2-lines">
        {{  getCurrentLanguageName(product.translations, product.prodName)  }}
      </div>

      <!-- 根据商品类型显示不同的价格信息 -->
      <div class="price-section q-mt-sm">
        <!-- 秒杀商品 -->
        <template v-if="product.prodType === ProductType.SECKILL">
          <div class="current-price text-h6 text-negative">
            ¥{{ product.seckillPrice }}
            <q-badge color="negative" class="q-ml-xs">秒杀</q-badge>
          </div>
          <div class="original-price text-grey-6 text-caption q-ml-sm">
            ¥{{ product.price }}
          </div>
        </template>

        <!-- 团购商品 -->
        <template v-else-if="product.prodType === ProductType.GROUP">
          <div class="current-price text-h6 text-primary">
            ¥{{ product.groupPrice }}
            <q-badge color="primary" class="q-ml-xs">
              {{ product.groupJoinedNum }}/{{ product.groupMinNum }}人团
            </q-badge>
          </div>
          <div class="original-price text-grey-6 text-caption q-ml-sm">
            ¥{{ product.price }}
          </div>
        </template>

        <!-- 预售商品 -->
        <template v-else-if="product.prodType === ProductType.PRESELL">
          <div class="current-price text-h6 text-warning">
            ¥{{ product.presellPrice }}
            <q-badge color="warning" class="q-ml-xs">预售</q-badge>
          </div>
          <div class="deposit-info text-caption q-ml-sm">
            定金:¥{{ product.presellDeposit }}
          </div>
        </template>

        <!-- 普通商品 -->
        <template v-else>
          <div class="current-price text-h6 text-primary">
            ¥{{ hoveredSku?.price || product.price }}
          </div>
          <div v-if="product.oriPrice > 0" class="original-price text-grey-6 text-caption q-ml-sm">
            ¥{{ hoveredSku?.oriPrice || product.oriPrice }}
          </div>
        </template>
      </div>

      <div class="sales-info text-grey-7 text-caption q-mt-xs">
        {{ $t('product.soldCount', { count: product.soldNum || 0 }) }}
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn
        flat
        :color="actionButtonColor"
        :label="actionButtonLabel"
        :to="`/product/detail?prodId=${product.prodId}`"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ProductType } from '~/utils/constants'
import {getCurrentLanguageName} from "~/utils/tools";

const { t } = useI18n()

// 定义props
interface Props {
  product: {
    prodId: number | string
    prodName: string
    translations:String
    pic: string
    price: number
    oriPrice: number
    soldNum: number
    prodType: ProductType
    seckillPrice?: number
    groupPrice?: number
    groupMinNum?: number
    groupJoinedNum?: number
    presellPrice?: number
    presellDeposit?: number
    skus?: Array<{
      skuId: number | string
      pic: string
      price: number
      oriPrice: number
    }>
  }
}

const props = defineProps<Props>()

// 状态
const hoveredSku = ref(null)

// 计算按钮颜色
const actionButtonColor = computed(() => {
  switch (props.product.prodType) {
    case ProductType.SECKILL:
      return 'negative'
    case ProductType.GROUP:
      return 'primary'
    case ProductType.PRESELL:
      return 'warning'
    default:
      return 'primary'
  }
})

// 计算按钮文本
const actionButtonLabel = computed(() => {
  switch (props.product.prodType) {
    case ProductType.SECKILL:
      return t('product.seckillNow')
    case ProductType.GROUP:
      return t('product.joinGroup')
    case ProductType.PRESELL:
      return t('product.preOrder')
    default:
      return t('product.viewDetails')
  }
})

</script>

<style lang="scss" scoped>
.product-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .product-image {
    transition: all 0.3s ease;
  }

  .sku-thumbnails {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    overflow-x: auto;

    .sku-thumbnail {
      transition: all 0.3s ease;
      border: 1px solid transparent;

      &:hover {
        border-color: var(--primary-color);
        transform: scale(1.1);
      }
    }
  }

  .product-name {
    min-height: 44px;
    line-height: 1.4;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
  }

  .price-section {
    display: flex;
    align-items: baseline;

    .current-price {
      font-weight: bold;
      display: flex;
      align-items: center;
    }

    .original-price {
      text-decoration: line-through;
    }

    .deposit-info {
      color: var(--q-warning);
    }
  }
}
</style>
