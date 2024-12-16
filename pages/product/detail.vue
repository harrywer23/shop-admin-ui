<template>
  <div class="product-detail">
    <!-- 主要内容区域 -->
    <div class="product-content q-pa-md row q-col-gutter-md">
      <!-- 左侧图片区域 -->
      <div class="col-12 col-md-5">
        <q-card flat bordered>
          <!-- 主图 -->
          <q-img
            :src="currentImage || getImageUrl(productInfo?.pic)"
            :ratio="1"
            class="main-image"
          />

          <!-- SKU 图片列表 -->
          <div v-if="hasSku" class="sku-images q-pa-md">
            <q-scroll-area horizontal style="height: 100px">
              <div class="row no-wrap q-gutter-sm">
                <q-img
                  v-for="sku in productInfo?.skuList"
                  :key="sku.skuId"
                  :src="getImageUrl(sku.pic || productInfo?.pic)"
                  :ratio="1"
                  class="thumb-image cursor-pointer"
                  :class="{ 'active': isSkuSelected && currentSku?.skuId === sku.skuId }"
                  style="width: 80px"
                  @click="handleSkuImageClick(sku)"
                >
                  <div class="sku-name">{{ sku.skuName }}</div>
                </q-img>
              </div>
            </q-scroll-area>
          </div>

          <!-- 宣传图片列表 -->
          <div class="image-list q-pa-md" v-if="productInfo?.imgs">
            <q-scroll-area horizontal style="height: 100px">
              <div class="row no-wrap q-gutter-sm">
                <q-img
                  v-for="(img, index) in imgList"
                  :key="index"
                  :src="getImageUrl(img)"
                  :ratio="1"
                  class="thumb-image cursor-pointer"
                  style="width: 80px"
                  @click="previewImage(img)"
                />
              </div>
            </q-scroll-area>
          </div>
        </q-card>
      </div>

      <!-- 右侧商品信息 -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="product-info">
          <q-card-section>
            <!-- 商品名称 -->
            <div class="text-h6">{{ getCurrentLanguageName(productInfo?.translations, productInfo?.prodName)  }}</div>
            <div class="text-subtitle2 text-grey">编码: {{ productInfo?.prodCode || '暂无' }}</div>

            <!-- 商品简介 -->
<!--            <div class="brief q-mt-md">{{ productInfo?.brief }}</div>-->

            <!-- 价格信息 -->
            <div class="price-info q-mt-lg">
              <div class="row items-center q-gutter-x-md">
                <div class="text-h5 text-negative">
                  ¥{{ getCurrentPrice }}
                </div>
                <div class="text-grey text-strike" v-if="productInfo?.oriPrice">
                  ¥{{ productInfo?.oriPrice }}
                </div>
              </div>
            </div>

            <!-- 预售信息 -->
            <template v-if="productInfo?.prodType === ProductType.PRESELL">
              <div class="presell-info q-mt-md">
                <q-banner class="bg-orange-1">
                  <template v-slot:avatar>
                    <q-icon name="event" color="orange" />
                  </template>
                  <div class="text-subtitle1">{{ t('product.presell.title') }}</div>
                  <div class="row q-col-gutter-md q-mt-sm">
                    <div class="col-12 col-md-6">
                      <div class="text-caption">{{ t('product.presell.price') }}</div>
                      <div class="text-h6 text-orange">¥{{ productInfo.presellPrice }}</div>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="text-caption">{{ t('product.presell.deposit') }}</div>
                      <div class="text-h6 text-orange">¥{{ productInfo.presellDeposit }}</div>
                    </div>
                  </div>
                  <div class="row q-col-gutter-md q-mt-sm">
                    <div class="col-12">
                      <div class="text-caption">{{ t('product.presell.presellTime') }}</div>
                      <div>{{ formatDateTime(productInfo.presellStartTime) }} ~ {{ formatDateTime(productInfo.presellEndTime) }}</div>
                    </div>
                    <div class="col-12">
                      <div class="text-caption">{{ t('product.presell.deliveryTime') }}</div>
                      <div>{{ formatDateTime(productInfo.presellDeliveryTime) }}</div>
                    </div>
                  </div>
                </q-banner>
              </div>
            </template>

            <!-- 秒杀信息 -->
            <template v-if="productInfo?.prodType === ProductType.SECKILL">
              <div class="seckill-info q-mt-md">
                <q-banner class="bg-red-1">
                  <template v-slot:avatar>
                    <q-icon name="flash_on" color="red" />
                  </template>
                  <div class="text-subtitle1">{{ t('product.seckill.title') }}</div>
                  <div class="row q-col-gutter-md q-mt-sm">
                    <div class="col-12">
                      <div class="text-caption">{{ t('product.seckill.period') }}</div>
                      <div>{{ formatDateTime(productInfo.seckillStartTime) }} ~ {{ formatDateTime(productInfo.seckillEndTime) }}</div>
                    </div>
                  </div>
                </q-banner>
              </div>
            </template>

            <!-- 团购信息 -->
            <template v-if="productInfo?.prodType === ProductType.GROUP">
              <div class="group-info q-mt-md">
                <q-banner class="bg-green-1">
                  <template v-slot:avatar>
                    <q-icon name="group" color="green" />
                  </template>
                  <div class="text-subtitle1">{{ t('product.group.title') }}</div>
                  <div class="row q-col-gutter-md q-mt-sm">
                    <!-- 团购价格 -->
                    <div class="col-12 col-md-6">
                      <div class="text-caption">{{ t('product.group.price') }}</div>
                      <div class="text-h6 text-green">
                        ¥{{ hasSku ? currentSku?.groupPrice : productInfo.groupPrice }}
                      </div>
                      <div class="text-caption text-grey">
                        {{ t('product.group.originalPrice') }}: ¥{{ hasSku ? currentSku?.oriPrice : productInfo.oriPrice }}
                      </div>
                    </div>

                    <!-- 成团进度 -->
                    <div class="col-12 col-md-6">
                      <div class="text-caption">{{ t('product.group.progress') }}</div>
                      <div class="progress-info">
                        <q-linear-progress
                          :value="groupProgress"
                          color="green"
                          class="q-mb-sm"
                        />
                        <div class="text-caption">
                          {{ t('product.group.joined', { count: hasSku ? currentSku?.groupJoinedNum || 0 : productInfo.groupJoinedNum || 0 }) }}
                          / {{ t('product.group.minMembers', { count: hasSku ? currentSku?.groupMinNum || 2 : productInfo.groupMinNum || 2 }) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 团购规则说明 -->
                  <div class="group-rules q-mt-md">
                    <q-list dense>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="info" color="green" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <div class="text-caption">
                            {{ t('product.group.rules.minMember', { count: hasSku ? currentSku?.groupMinNum || 2 : productInfo.groupMinNum || 2 }) }}
                          </div>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="payments" color="green" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <div class="text-caption">
                            {{ t('product.group.rules.groupPrice', { price: hasSku ? currentSku?.groupPrice : productInfo.groupPrice }) }}
                          </div>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="schedule" color="green" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <div class="text-caption">
                            {{ t('product.group.rules.autoCancel') }}
                          </div>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </q-banner>
              </div>
            </template>

            <!-- SKU 选择区域，只在有 SKU 时显示 -->
            <div v-if="hasSku" class="sku-selection q-mt-lg">
              <div v-for="(prop, index) in productInfo?.propList" :key="index" class="sku-prop q-mb-lg">
                <div class="prop-name q-mb-sm">{{ getCurrentLanguageName( prop.translations,prop.propName) }}</div>
                <div class="prop-values">
                  <q-btn
                    v-for="value in prop.values"
                    :key="value.valueId"
                    :label="getCurrentLanguageName( value.translations,value.propValue) "
                    :class="{
                      'selected': isSelected(prop.propId, value.valueId),
                      'disabled': !isSkuValueAvailable(prop.propId, value.valueId),
                      'unselected': !isSelected(prop.propId, value.valueId) && isSkuValueAvailable(prop.propId, value.valueId)
                    }"
                    class="sku-value-btn"
                    @click="selectSkuValue(prop.propId, value.valueId)"
                    unelevated
                    no-caps
                  />
                </div>
              </div>
            </div>

            <!-- 库存和销量信息 -->
            <div class="stock-info q-mt-lg">
              <div class="row q-col-gutter-md">
                <div class="col-auto">
                  <div class="text-caption">{{ t('product.detail.stock') }}</div>
                  <div class="text-subtitle1">{{ productInfo?.totalStocks || 0 }}</div>
                </div>
                <div class="col-auto">
                  <div class="text-caption">{{ t('product.detail.sales') }}</div>
                  <div class="text-subtitle1">{{ productInfo?.soldNum || 0 }}</div>
                </div>
              </div>
            </div>

            <!-- 配送方式 -->
            <div class="delivery-info q-mt-lg">
              <div class="text-subtitle2 q-mb-sm">{{ t('product.detail.delivery.title') }}</div>
              <div class="row q-gutter-sm">
                <q-chip
                  v-if="deliveryMode?.hasShopDelivery"
                  icon="local_shipping"
                  color="primary"
                  text-color="white"
                >
                  {{ t('product.detail.delivery.merchant') }}
                </q-chip>
                <q-chip
                  v-if="deliveryMode?.hasUserPickUp"
                  icon="store"
                  color="teal"
                  text-color="white"
                >
                  {{ t('product.detail.delivery.pickup') }}
                </q-chip>
              </div>
            </div>

            <!-- 数量选择和购买按钮 -->
            <div class="purchase-actions q-mt-lg">
              <div class="row q-col-gutter-md">
                <!-- 数量选择 -->
                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="quantity"
                    type="number"
                    :label="t('product.detail.quantity')"
                    :rules="[
                      val => val > 0 || t('product.detail.quantityMin'),
                      val => val <= getMaxStock() || t('product.detail.quantityMax')
                    ]"
                    outlined
                    dense
                  >
                    <template v-slot:append>
                      <div class="row items-center">
                        <q-btn
                          flat
                          dense
                          icon="remove"
                          @click="updateQuantity(-1)"
                          :disable="quantity <= 1"
                        />
                        <q-btn
                          flat
                          dense
                          icon="add"
                          @click="updateQuantity(1)"
                          :disable="quantity >= getMaxStock()"
                        />
                      </div>
                    </template>
                  </q-input>
                </div>

                <!-- 收藏按钮 -->
                <div class="col-auto">
                  <q-btn
                    :color="isCollected ? 'red' : 'grey'"
                    :icon="isCollected ? 'favorite' : 'favorite_border'"
                    round
                    flat
                    @click="toggleCollection"
                  >
                    <q-tooltip>
                      {{ isCollected ? t('product.detail.favorite.remove') : t('product.detail.favorite.add') }}
                    </q-tooltip>
                  </q-btn>
                </div>

                <!-- 团购按钮 -->
                <template v-if="productInfo?.prodType === ProductType.GROUP">
                  <div class="col">
                    <q-btn
                      color="green"
                      class="full-width"
                      :label="t('product.group.startGroup', { price: getCurrentPrice })"
                      :disable="!canBuy"
                      @click="handleBuyNow"
                    />
                  </div>
                </template>

                <!-- 预售/普通购买按钮 -->
                <template v-else>
                  <div class="col">
                    <q-btn
                      color="primary"
                      class="full-width"
                      :label="productInfo?.presellStatus ? t('product.preOrder') : t('product.buyNow')"
                      :disable="!canBuy"
                      @click="handleBuyNow"
                    />
                  </div>
                </template>

                <!-- 加入购物车按钮 -->
                <div class="col">
                  <q-btn
                    color="orange"
                    class="full-width"
                    :label="t('product.detail.addToCart')"
                    :disable="!canBuy"
                    @click="handleAddToCart"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 商品详情内容 -->
    <div class="product-detail-content q-mt-md">
      <q-card flat bordered>
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="detail" label="商品详情" />
          <q-tab name="params" label="规格参数" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <q-tab-panel name="detail">
            <div class="detail-content" v-html="productInfo?.content"></div>
          </q-tab-panel>

          <q-tab-panel name="params">
            <div class="params-content">
              <q-list separator>
                <q-item v-for="(prop, index) in productInfo?.propList" :key="index">
                  <q-item-section>
                    <q-item-label class="param-name">{{getCurrentLanguageName(prop.translations,prop.propName )}}</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="param-values">
                      {{ prop.values.map((v: { propValue: string,translations:Translations }) => getCurrentLanguageName(v.translations,v.propValue )).join('、') }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>

    <div class="product-detail-content q-mt-md">
      <ProductComments
          :prod-id="prodId"
          @update:comments="updateComments"
      />
    </div>
    <!-- 图片预览对话框 -->
    <q-dialog v-model="previewDialog">
      <q-card style="width: 80vw; max-width: 800px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ t('product.detail.imagePreview') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-img :src="getImageUrl(previewUrl)" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useHead } from '#imports'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { ProductType } from '~/utils/constants'
import type {ProductDetail, Sku} from '~/types/product'
import ProductComments from '~/components/product/ProductComments.vue'
import {formatDateTime, getCurrentLanguageName, getImageUrl, getLanguageName} from "~/utils/tools";
import {useI18n} from "vue-i18n";
import { shanghaiToLocal } from '~/utils/format'
const { locale, t } = useI18n()
const lang = locale.value;
const route = useRoute()
const prodId = ref(route.query.prodId)
const $q = useQuasar()

const productInfo = ref<ProductDetail | null>(null)
const activeTab = ref('detail')
const selectedSkuValues = ref<Record<string, string | number>>({})
const previewDialog = ref(false)
const previewUrl = ref('')
const quantity = ref(1)
const currentSku = ref<Sku | null>(null)

// 添加当前显示图片
const currentImage = ref('')

// 计算宣传图片列表
const imgList = computed(() => {
  if (!productInfo.value?.imgs) return []
  return productInfo.value.imgs.split(',')
})

// 计算配送方式
const deliveryMode = computed(() => {
  if (!productInfo.value?.deliveryMode) return null
  try {
    return JSON.parse(productInfo.value.deliveryMode)
  } catch {
    return null
  }
})

function isProdProp(value1:string,value2:string){
  //console.log("判断是否等",value1,value2,(value1 === value2));
  if(value1 === value2){
    return true;
  }
  return false;
}

// 更新评论的处理函数
const updateComments = (comments: any) => {
  // 处理评论更新逻辑
}
// 加载商品数据
async function loadProductData() {
  try {
    // const response = await fetch(`/prod/detail/${prodId.value}&lang=${lang}`, {
    //       headers: {
    //         'Accept-Language': lang // 添加语言请求头
    //       }
    //     })
    const response = await api.get(`/prod/detail/${prodId.value}`)
    const result = await response.data
    if (result.code === 200) {
      productInfo.value = result.data;
    }
  } catch (error) {
    console.error('加载商品数据失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载商品数失败'
    })
  }
}

// 判断规格值是否已选中
function isSelected(propId: string | number, valueId: string | number): boolean {
  return selectedSkuValues.value[propId] === valueId
}

// 修改检查 SKU 值是否可选的函数
const isSkuValueAvailable = (propId: string | number, valueId: string | number): boolean => {
  try {
    // 获取当前规格和属性值
    const prop = productInfo.value?.propList.find(p => p.propId === propId)
    const value = prop?.values.find(v => v.valueId === valueId)
    if (!prop || !value) {
      return false
    }

    // 构建新的选择状态
    const newSelected = { ...selectedSkuValues.value }

    // 如果当前属性已选择其他值，先移除
    if (newSelected[propId] && newSelected[propId] !== valueId) {
      delete newSelected[propId]
    }
    newSelected[propId] = valueId
    // 检查是否有匹配的 SKU 且有库存
    const matchingSku = productInfo.value?.skuList.find(sku => {
      // 解析 SKU 的属性
      const skuProps = sku.properties.split(';').reduce((acc: any, prop: string) => {
        const [name, value] = prop.split(':')
        acc[name] = value
        return acc
      }, {})

      // 检查所有已选择的规格是否匹配
      const isMatch = Object.entries(newSelected).every(([key, val]) => {
        const matchingProp = productInfo.value?.propList.find(p => p.propId === key)
        const matchingValue = matchingProp?.values.find(v => v.valueId === val)

        if (!matchingProp || !matchingValue) return false

        const skuValue = skuProps[matchingProp.propName]
        const matches = skuValue === matchingValue.propValue

        return matches
      })

      return isMatch && sku.actualStocks > 0
    })

    const isAvailable = !!matchingSku
    return isAvailable
  } catch (error) {
    console.error('检查SKU值可用性失败:', error)
    return false
  }
}

// 修改选择 SKU 值的方法
function selectSkuValue(propId: string | number, valueId: string | number) {
  try {
    if (!isSkuValueAvailable(propId, valueId)) {
      return
    }

    const newSkuValues = { ...selectedSkuValues.value }

    if (newSkuValues[propId] === valueId) {
      // 取消选择
      delete newSkuValues[propId]
      //console.log('取消选择规格值')
    } else {
      // 选择新值
      newSkuValues[propId] = valueId
      //console.log('选择新规格值')
    }

    selectedSkuValues.value = newSkuValues
    //console.log('更新后的选择:', newSkuValues)

    // 查找匹配的 SKU
    const matchingSku = findMatchingSku(newSkuValues)
    if (matchingSku) {
      currentSku.value = matchingSku
      currentImage.value = getImageUrl(matchingSku.pic || productInfo.value?.pic)
    } else {
      currentSku.value = null
      currentImage.value = getImageUrl(productInfo.value?.pic)
      //console.log('未找到匹配的SKU')
    }
  } catch (error) {
    console.error('处理SKU值选择失败:', error)
  }
}

// 修改查找匹配 SKU 的辅助函数
function findMatchingSku(selectedValues: Record<string, string | number>) {
  //console.log('=== 查找匹配SKU ===')
  //console.log('选中的规格值:', selectedValues)

  try {
    const selectedProps = Object.entries(selectedValues).map(([propId, valueId]) => {
      const prop = productInfo.value.propList.find(p => p.propId === propId)
      const value = prop?.values.find(v => v.valueId === valueId)
      if (prop && value) {
        return `${prop.propName}:${value.propValue}`
      }
      return null
    }).filter(Boolean).sort().join(';')

    //console.log('构建的规格属性字符串:', selectedProps)

    const matchingSku = productInfo.value?.skuList.find((sku: any) => {
      const skuProps = sku.properties.split(';').sort().join(';')
      const isMatch = skuProps === selectedProps
      return isMatch
    })

    //console.log('找到匹配的SKU:', matchingSku)
    return matchingSku
  } catch (error) {
    console.error('查找匹配SKU失败:', error)
    return null
  }
}

// 预览图片
function previewImage(url: string) {
  previewUrl.value = url
  previewDialog.value = true
}



// ��算是否已选择完所有SKU
const isSkuSelected = computed(() => {
  if (!productInfo.value?.propList?.length) return true
  return productInfo.value.propList.every(prop =>
    selectedSkuValues.value[prop.propId]
  )
})

// 判断是否有SKU
const hasSku = computed(() => {
  return productInfo.value?.propList?.length > 0 && productInfo.value?.skuList?.length > 0
})

// 获取最大库存
function getMaxStock(): number {
  if (hasSku.value) {
    return currentSku.value?.actualStocks || 0
  }
  return productInfo.value?.totalStocks || 0
}

// 判断是否可以购买
const canBuy = computed(() => {
  if (hasSku.value) {
    return isSkuSelected.value && currentSku.value?.actualStocks > 0
  }
  return productInfo.value?.totalStocks > 0
})

// 获取当前价格
const getCurrentPrice = computed(() => {
  if (hasSku.value && currentSku.value) {
    return currentSku.value.price || currentSku.value.oriPrice
  }
  return productInfo.value?.price || productInfo.value?.oriPrice
})

// 修改立即购买方法
async function handleBuyNow() {
  if (hasSku.value && !currentSku.value) {
    $q.notify({
      type: 'warning',
      message: '请选择商品规格'
    })
    return
  }

  try {
    console.log("----------handleBuyNow---------------")
    const cartData =ref([]);
    if (hasSku.value && currentSku.value) {
      console.log("----------handleBuyNow-----1----------")
      // 购买 SKU 商品
      const  orderData = {
        prodId: currentSku.value.prodId,
        skuId: currentSku.value.skuId,
        prodName: getLanguageName(productInfo.value.translations,productInfo.value?.prodName,lang), // 使用商品名称
        skuName: getLanguageName(currentSku.value?.translations,currentSku.value?.skuName,lang),
        deliveryTemplateId:productInfo.value.deliveryTemplateId,
        price: currentSku.value.price,
        oriPrice: currentSku.value.oriPrice,
        pic: currentSku.value.pic || productInfo.value.pic,
        quantity: quantity.value,
        basketCount: quantity.value,
        prodType: productInfo.value.prodType, // 使用商品类型
        // 预售相关信息
        presellStatus: currentSku.value.presellStatus,
        presellPrice: currentSku.value.presellPrice,
        presellDeposit: currentSku.value.presellDeposit,
        // 团购相关信息
        groupPrice: currentSku.value.groupPrice,
        groupMinNum: currentSku.value.groupMinNum,
        // 秒杀相关信息
        seckillPrice: currentSku.value.seckillPrice,
        isVirtual: productInfo.value.isVirtual,
        isSkuItem: 1,
        weight: currentSku.value?.weight,
        volume: currentSku.value?.volume,
        translations: productInfo.value.translations,
        from: "direct"
      }
      cartData.value.push(orderData);
      setCache("cartStore", cartData.value)
      window.location.href = `/checkout?prodId=${currentSku.value.prodId}&skuId=${currentSku.value.skuId}`
    } else {
      console.log("----------handleBuyNow------2---------")
      // 购买普通商品
      const  orderData = {
        prodId: productInfo.value.prodId,
        prodName: productInfo.value.prodName,
        price: productInfo.value.price,
        oriPrice: productInfo.value.oriPrice,
        pic: productInfo.value.pic,
        quantity: quantity.value,
        basketCount: quantity.value,
        prodType: productInfo.value.prodType,
        deliveryTemplateId:productInfo.value.deliveryTemplateId,
        // 预售相关信息
        presellStatus: productInfo.value.presellStatus,
        presellPrice: productInfo.value.presellPrice,
        presellDeposit: productInfo.value.presellDeposit,
        // 团购相关信息
        groupPrice: productInfo.value.groupPrice,
        groupMinNum: productInfo.value.groupMinNum,
        // 秒杀相关信息
        seckillPrice: productInfo.value.seckillPrice,
        isVirtual: productInfo.value.isVirtual ,
        isSkuItem: 0,
        weight: productInfo.value?.weight,
        volume: productInfo.value?.volume,
        translations: productInfo.value.translations,
        from: "direct"
      }
      cartData.value.push(orderData);
      setCache("cartStore", cartData.value)
      window.location.href = `/checkout?prodId=${productInfo.value.prodId}&prodName=${productInfo.value.prodName}&`
    }

  } catch (error) {
    console.error('购买失败:', error)
    $q.notify({
      type: 'negative',
      message: '购买失败，请重试'
    })
  }
}

// 修改加入购物车方法
async function handleAddToCart() {
  if (hasSku.value && !currentSku.value) {
    $q.notify({
      type: 'warning',
      message: '请选择商品规格'
    })
    return
  }

  try {
    const response = await api.post('/admin/basket/add', {
      "prodId":productInfo.value!.prodId,
      "count":quantity.value,
      "skuId":hasSku.value ? currentSku.value!.skuId : undefined,
    })

    const result = await response.data

    if (result.code === 200) {
      $q.notify({
        type: 'positive',
        message: '已添加到购物车',
        actions: [
          {
            label: '去购物车',
            color: 'white',
            handler: () => {
              window.location.href = '/cart'
            }
          }
        ]
      })
    } else {
      throw new Error(result.msg || '添加失败')
    }
  } catch (error) {
    console.error('添加购物车失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '添加购物车失败'
    })
  }
}
// 修改更新数量方法
function updateQuantity(delta: number) {
  const newQuantity = quantity.value + delta
  const maxStock = getMaxStock()
  if (newQuantity >= 1 && newQuantity <= maxStock) {
    quantity.value = newQuantity
  }
}

// 监听SKU选择变化
watch(selectedSkuValues, (newValues) => {
  try {
    // 查找匹配的 SKU
    const matchingSku = findMatchingSku(newValues)

    if (matchingSku) {
      currentSku.value = matchingSku
      currentImage.value = getImageUrl(matchingSku.pic || productInfo.value?.pic)
    } else {
      currentSku.value = null
      currentImage.value = getImageUrl(productInfo.value?.pic)
    }

    // 重置数量
    quantity.value = 1

  } catch (error) {
    console.error('处理SKU值变化失败:', error)
  }
}, { deep: true })

// 监听 SKU 变化，更新显示图片
watch(currentSku, (newSku) => {
  if (newSku) {
    currentImage.value = getImageUrl(newSku.pic || productInfo.value?.pic)
  } else {
    currentImage.value = getImageUrl(productInfo.value?.pic)
  }
})


// 修改 SKU 图片点击处理函数
const handleSkuImageClick = (sku: any) => {
  try {
    // 设置当前显示图片
    currentImage.value = getImageUrl(sku.pic || productInfo.value?.pic)
    //console.log('设置当前显示图片:', currentImage.value)

    // 解析 SKU 的规格属性
    const properties = sku.properties.split(';')
    const newSkuValues: Record<string, string | number> = {}

    // 遍历每个属性对
    properties.forEach(prop => {
      const [propName, propValue] = prop.split(':')
      //console.log('解析规格属性:', { 规格名: propName, 属性值: propValue })

      if (propName && propValue) {
        // 找到对应的规格和属性值
        const matchingProp = productInfo.value?.propList.find(p => p.propName === propName)
        //console.log('匹配到的规格:', matchingProp)

        if (matchingProp) {
          const matchingValue = matchingProp.values.find(v => v.propValue === propValue)
          //console.log('匹配到的属性值:', matchingValue)

          if (matchingValue) {
            newSkuValues[matchingProp.propId] = matchingValue.valueId
          }
        }
      }
    })

    // 更新选中的规格值
    selectedSkuValues.value = newSkuValues
    //console.log('更新选中的规格值:', newSkuValues)

    // 更新当前 SKU
    currentSku.value = sku

  } catch (error) {
    console.error('处理SKU图片点击失败:', error)
  }
}

// 计算团购进度
const groupProgress = computed(() => {
  if (productInfo.value?.prodType !== ProductType.GROUP) return 0

  const joinedNum = hasSku.value
    ? currentSku.value?.groupJoinedNum || 0
    : productInfo.value?.groupJoinedNum || 0

  const minNum = hasSku.value
    ? currentSku.value?.groupMinNum || 2
    : productInfo.value?.groupMinNum || 2

  return Math.min(joinedNum / minNum, 1)
})

// 收藏状态
const isCollected = ref(false)

// 检查商品是否已收藏
const checkCollectionStatus = async () => {
  try {
    const response = await api.get(`/prod/favorite/check/${prodId.value}`)
    const { code, data } = await response.data
    if (code === 200) {
      isCollected.value = data
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 切换收藏状态
const toggleCollection = async () => {
  try {
    const url = isCollected.value
      ? `/prod/favorite/del/${prodId.value}`
      : `/prod/favorite/add/${prodId.value}`
    const response = await api.get(url)
    const { code, msg } = await response.data
    if (code === 200) {
      isCollected.value = !isCollected.value
      $q.notify({
        type: 'positive',
        message: isCollected.value ? '收藏成功' : '已取消收藏'
      })
    } else {
      Notify.create({
        type: 'negative',
        message: msg
      })
    }
  } catch (error) {
    console.error('操作收藏失败:', error)
    $q.notify({
      type: 'negative',
      message: isCollected.value ? '取消收藏失败' : '收藏失败'
    })
  }
}

// 在初始化时检查收藏状态
onMounted(async () => {
  await loadProductData()
  await checkCollectionStatus()
})


// 计算 Meta 标签内容
const metaTitle = computed(() => {
  return `${productInfo.value?.prodName} - ${t('common.title')}`
})

const metaDescription = computed(() => {
  return productInfo.value?.translations || `${productInfo.value?.prodName} - ${t('product.detail.defaultDescription')}`
})

const metaKeywords = computed(() => {
  const keywords = [
    productInfo.value?.prodName,
    productInfo.value?.translations
  ].filter(Boolean)
  return keywords.join(', ')
})

// 生成结构化数据
const structuredData = computed(() => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productInfo.value?.prodName,
    description: productInfo.value?.brief,
    image: productInfo.value?.pic,
    brand: {
      '@type': 'Brand',
      name: productInfo.value?.brand
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'CNY',
      price: productInfo.value?.price,
      availability: productInfo.value?.skuList.some(item => item.stocks > 0)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock'
    }
  }
})

// 设置页面 Meta 信息
useHead({
  title: metaTitle,
  meta: [
    { name: 'description', content: metaDescription },
    { name: 'keywords', content: metaKeywords },
    // Open Graph tags
    { property: 'og:title', content: metaTitle },
    { property: 'og:description', content: metaDescription },
    { property: 'og:image', content: productInfo.value?.pic },
    { property: 'og:type', content: 'product' },
    { property: 'og:price:amount', content: String(productInfo.value?.price) },
    { property: 'og:price:currency', content: 'CNY' },
    // Twitter Card tags
    { name: 'twitter:card', content: 'product' },
    { name: 'twitter:title', content: metaTitle },
    { name: 'twitter:description', content: metaDescription },
    { name: 'twitter:image', content: productInfo.value?.pic }
  ],
  link: [
    // 添加规范链接
    { rel: 'canonical', href: `${process.env.SITE_URL}/product/detail/${route.params.id}` }
  ],
  script: [
    // 添加结构化数据
    {
      type: 'application/ld+json',
      children: JSON.stringify(structuredData.value)
    }
  ]
})

// 加载商品详情
// const loadProductDetail = async () => {
//   try {
//     const response = await api.get(`/product/detail/${route.params.id}`)
//     if (response.data.code === 200) {
//       product.value = response.data.data
//     }
//   } catch (error) {
//     console.error('加载商品详情失败:', error)
//   }
// }
//
// onMounted(() => {
//   loadProductDetail()
// })
</script>

<style lang="scss" scoped>
.product-detail p {
  margin: 0px !important;
  padding: 0px !important;
  border: 0px !important;
  vertical-align: middle !important;
}


.product-detail {
  .main-image {
    max-height: 400px;
  }

  .thumb-image {
    border: 2px solid transparent;
    border-radius: 4px;
    transition: all 0.3s;
    position: relative;

    &:hover {
      border-color: var(--q-primary);
    }

    &.active {
      border-color: var(--q-primary);
    }

    .sku-name {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      font-size: 12px;
      padding: 2px 4px;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .product-info {
    .brief {
      color: #666;
      line-height: 1.5;
    }

    .price-info {
      padding: 16px;
      background: #fafafa;
      border-radius: 4px;
    }
  }

  .detail-content {
    padding: 20px;
    min-height: 300px;

    :deep(img) {
      max-width: 100%;
      height: auto;
    }
    p {
      margin: 0px;
      padding: 0px;
      border: 0px;
      vertical-align: middle;
    }
  }

  .params-content {
    .q-item {
      padding: 12px 16px;

      .param-name {
        color: #666;
        font-size: 14px;
        width: 120px;
      }

      .param-values {
        color: #333;
        font-size: 14px;
      }
    }

    .q-separator {
      margin: 0;
    }
  }

  .sku-selection {
    .sku-prop {
      .prop-name {
        font-size: 14px;
        color: #666;
        font-weight: 500;
      }

      .prop-values {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .sku-value-btn {
          min-width: 80px;
          height: 32px;
          padding: 0 16px;
          margin: 4px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          background: #fff;
          color: #333;
          transition: all 0.3s;

          // 未选中但可选状态
          &.unselected {
            &:hover {
              border-color: var(--q-primary);
              color: var(--q-primary);
            }
          }

          // 选中状态
          &.selected {
            border-color: var(--q-primary);
            background: var(--q-primary);
            color: white;
          }

          // 禁用状态
          &.disabled {
            cursor: not-allowed;
            background: #f5f7fa;
            border-color: #ebeef5;
            color: #c0c4cc;
            position: relative;

            &::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 0;
              width: 100%;
              height: 1px;
              background: #c0c4cc;
              transform: rotate(-45deg);
            }

            &:hover {
              border-color: #ebeef5;
              color: #c0c4cc;
            }
          }
        }
      }
    }
  }

  // 添加响应式布局优化
  @media (max-width: 768px) {
    .params-content {
      .q-item {
        flex-direction: column;
        align-items: flex-start;

        .param-name {
          width: 100%;
          margin-bottom: 4px;
        }
      }
    }

    .sku-selection {
      .sku-value-btn {
        min-width: 60px;
        height: 28px;
        padding: 0 12px;
        font-size: 12px;
      }
    }
  }

  .purchase-actions {
    padding: 20px;
    border-top: 1px solid #ebeef5;

    .q-btn {
      height: 44px;
      font-size: 16px;

      // 收藏按钮样式
      &[round] {
        width: 44px;

        &:hover {
          background: rgba(0, 0, 0, 0.05);
        }
      }
    }
  }

  .sku-images {
    border-bottom: 1px solid #ebeef5;
  }

  .image-list {
    border-top: 1px solid #ebeef5;
  }

  .group-info {
    .progress-info {
      .q-linear-progress {
        height: 8px;
        border-radius: 4px;
      }
    }
  }
}

</style>
