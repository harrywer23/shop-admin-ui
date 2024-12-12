<template>
  <div class="cart-page">
    <h1 class="text-h4 q-mb-lg">{{ t('cart.title') }}</h1>

    <div v-if="availableItems.length || unavailableItems.length" class="cart-content">
      <!-- 可结算商品列表 -->
      <div v-if="availableItems.length" class="cart-list q-mb-lg">
        <div class="text-subtitle1 q-mb-md">{{ t('cart.availableItems') }}</div>
        <q-list bordered separator>
          <q-item v-for="item in availableItems" :key="item.basketId" class="cart-item">
            <!-- 选择框 -->
            <q-item-section avatar>
              <q-tooltip v-if="!item.stockEnough">
                {{ t('cart.stockInsufficient') }}
              </q-tooltip>
              <q-checkbox
                v-model="item.selected"
                :disable="!item.stockEnough"
                @update:model-value="handleItemSelect(item)"
              />
            </q-item-section>

            <!-- 商品图片 -->
            <q-item-section avatar>
              <q-img :src="getImageUrl(item.pic)" style="width: 100px; height: 100px" />
            </q-item-section>

            <!-- ���品信息 -->
            <q-item-section>
              <q-item-label>{{ item.prodName }}</q-item-label>
              <q-item-label caption v-if="item.skuName">
                {{ item.skuName }}
              </q-item-label>
              <q-item-label class="text-primary text-weight-bold">
                <span v-if="item.prodType === 2">{{ t('cart.presell.price', { price: item.presellPrice }) }} </span>
                <span v-if="item.prodType === 2">{{ t('cart.presell.deposit', { price: item.price }) }} </span>
                <span v-if="item.prodType === 1">{{ t('cart.normal.price', { price: item.price }) }} </span>
                <span v-if="item.prodType === 3">{{ t('cart.group.price', { price: item.price }) }} </span>
                <span v-if="item.prodType === 4">{{ t('cart.seckill.price', { price: item.price }) }} </span>
              </q-item-label>
              <!-- 库存提示 -->
              <q-item-label v-if="!item.stockEnough" class="text-negative">
                {{ t('cart.stockInsufficient') }}
              </q-item-label>
            </q-item-section>

            <!-- 数量控制 -->
            <q-item-section side style="width: 200px">
              <q-input
                v-model.number="item.basketCount"
                type="number"
                :min="1"
                :max="item.actualStocks"
                :disable="!item.stockEnough"
                outlined
                @update:model-value="(val) => updateQuantity(item, val)"
              >
                <template v-slot:prepend>
                  <q-btn
                    flat
                    dense
                    icon="remove"
                    :disable="item.basketCount <= 1 || !item.stockEnough"
                    @click="updateQuantity(item, item.basketCount - 1)"
                  />
                </template>
                <template v-slot:append>
                  <q-btn
                    flat
                    dense
                    icon="add"
                    :disable="item.basketCount >= item.actualStocks || !item.stockEnough"
                    @click="updateQuantity(item, item.basketCount + 1)"
                  />
                </template>
              </q-input>
              <!-- 库存提示 -->
              <div v-if="!item.stockEnough" class="text-negative text-caption q-mt-xs">
                {{ t('cart.stockInsufficient_desc', { count: item.actualStocks }) }}
              </div>
              <div v-else class="text-grey text-caption q-mt-xs">
                {{ t('cart.stockRemaining', { count: item.actualStocks }) }}
              </div>
            </q-item-section>

            <!-- 删除按钮 -->
            <q-item-section side>
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                @click="removeItem(item)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- 不可购买商品列表 -->
      <div v-if="unavailableItems.length" class="cart-list unavailable">
        <div class="text-subtitle1 q-mb-md">{{ t('cart.unavailableItems') }}</div>
        <q-list bordered separator>
          <q-item v-for="item in unavailableItems" :key="item.basketId" class="cart-item">
            <q-item-section avatar>
              <q-img :src="getImageUrl(item.pic)" style="width: 100px; height: 100px" class="unavailable-img" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-grey">{{ item.prodName }}</q-item-label>
              <q-item-label caption v-if="item.skuName" class="text-grey">
                {{ item.skuName }}
              </q-item-label>
              <q-item-label class="text-grey">
                {{ item.prodStatus === 0 ? t('cart.productOffline') : t('cart.productDeleted') }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn
                flat
                round
                color="grey"
                icon="delete"
                @click="removeItem(item)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- 结算区域 -->
      <div class="cart-summary">
        <div class="flex justify-between items-center">
          <q-checkbox
            v-model="allSelected"
            :label="t('cart.selectAll')"
            @update:model-value="toggleSelectAll"
          />
          <div class="summary-info">
            <span class="q-mr-md">
              {{ t('cart.selectedItems', { count: selectedCount }) }}
            </span>
            <span class="text-h6 text-primary">
              {{ t('cart.total', { amount: totalPrice }) }}
            </span>
          </div>
          <q-btn
            color="primary"
            :label="t('cart.checkout')"
            :disable="selectedCount === 0"
            @click="checkout"
          />
        </div>
      </div>
    </div>

    <!-- 空购物车提示 -->
    <div v-else class="empty-cart">
      <q-icon name="shopping_cart" size="100px" color="grey-4" />
      <p class="text-h6 text-grey-6">{{ t('cart.emptyCart.title') }}</p>
      <q-btn
        color="primary"
        :label="t('cart.emptyCart.goShopping')"
        @click="router.push('/')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed,  onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import {setCache} from "~/utils/storage";
import {getImageUrl} from "~/utils/tools";
import { useI18n } from 'vue-i18n'

const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()

// 购物车数据类型定义
interface CartItem {
  basketId: number
  prodId: number
  skuId?: number
  prodName: string
  skuName?: string
  price: number
  pic: string
  basketCount: number
  selected: boolean
  stockEnough: boolean
  actualStocks: number
  maxBuyCount: number
  prodStatus: number
  prodType: number
  oriPrice?: number
  quantity: number
  // 预售相关
  presellStatus?: boolean // 是否预售
  presellPrice?: number // 预售价格
  presellDeposit?: number // 预售定金
  presellFinalPayment?: number // 预售尾款
  presellStartTime?: string // 预售开始时间
  presellEndTime?: string // 预售结束时间
  presellDeliveryTime?: string // 预售发货时间
  presellFinalStartTime?: string // 尾款支付开始时间
  presellFinalEndTime?: string // 尾款支付结束时间
  groupPrice?: number // 团购价格
  groupMinNum?: number // 最低成团人数
  groupJoinedNum?: number // 已参团人数
  seckillPrice?: number // 秒杀价格
  seckillStartTime?: string // 秒杀开始时间
  seckillEndTime?: string // 秒杀结束时间
  isVirtual?:number
  isSkuItem?: number
  weight?: number
  volume?: number
}

// 购物车数据
const availableItems = ref<CartItem[]>([])
const unavailableItems = ref<CartItem[]>([])

// 计算属性
const selectedCount = computed(() => {
  return availableItems.value.filter(item => item.selected && item.stockEnough).length
})

const totalPrice = computed(() => {
  return availableItems.value
    .filter(item => item.selected && item.stockEnough)
    .reduce((total, item) => total + item.price * item.basketCount, 0)
    .toFixed(2)
})

const allSelected = computed({
  get: () => {
    const selectableItems = availableItems.value.filter(item => item.stockEnough)
    return selectableItems.length > 0 && selectableItems.every(item => item.selected)
  },
  set: (value) => {
    availableItems.value.forEach(item => {
      if (item.stockEnough) {
        item.selected = value
      }
    })
  }
})

// 处理单个商品选择
function handleItemSelect(item: CartItem) {
  if (!item.stockEnough) {
    item.selected = false
    $q.notify({
      type: 'warning',
      message: '该商品库存不足，无法选择'
    })
  }
}

// 方法定义
const getCartItems = async () => {
  try {
    const response = await api.get('/admin/basket/list/group')
    const data = await response.data
    if (data.code === 200) {
      availableItems.value = data.data.availableItems.map((item: any) => ({
        ...item,
        selected: item.stockEnough
      }))
      unavailableItems.value = data.data.unavailableItems
    }
  } catch (error) {
    console.error('获取购物车数据失败:', error)
    $q.notify({
      type: 'negative',
      message: '获取购物车数据失败'
    })
  }
}

const updateQuantity = async (item: CartItem, quantity: number) => {
  if (!item.stockEnough) {
    $q.notify({
      type: 'warning',
      message: '该商品库存不足，无法修改数量'
    })
    return
  }

  if (quantity < 1 || quantity > item.actualStocks) {
    $q.notify({
      type: 'warning',
      message: `购买数量必须在1-${item.actualStocks}之间`
    })
    return
  }

  try {
    await api.post('/admin/basket/update/count', {
      basketId: item.basketId,
      count: quantity
    })
    item.basketCount = quantity
  } catch (error) {
    console.error('更新数量失败:', error)
    $q.notify({
      type: 'negative',
      message: '更新数量失败'
    })
  }
}

const removeItem = async (item: CartItem) => {
  try {
    await api.delete(`/admin/basket/delete/${item.basketId}`)
    if (item.prodStatus === 1) {
      availableItems.value = availableItems.value.filter(i => i.basketId !== item.basketId)
    } else {
      unavailableItems.value = unavailableItems.value.filter(i => i.basketId !== item.basketId)
    }
    $q.notify({
      type: 'positive',
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除商品失败:', error)
    $q.notify({
      type: 'negative',
      message: '删除失败'
    })
  }
}

const toggleSelectAll = (value: boolean) => {
  availableItems.value.forEach(item => {
    if (item.stockEnough) {
      item.selected = value
    }
  })
}

const checkout = () => {
  const selectedItems = availableItems.value.filter(item => item.selected && item.stockEnough)
   console.log("选中的商品："  ,selectedItems)
  // 检查是否有选中的商品
  if (selectedItems.length === 0) {
    $q.notify({
      type: 'warning',
      message: '请选择要结算的商品'
    })
    return
  }

  // 将选中的商品保存到 localStorage
  if (process.client) {
    try {
      // 确保数据是可序列化的对象，并添加 quantity 字段
      const cartData = selectedItems.map(item => ({
        basketId: item.basketId,
        prodId: item.prodId,
        skuId: item.skuId,
        prodName: item.prodName,
        skuName: item.skuName,
        price: item.price,
        pic: item.pic,
        basketCount: item.basketCount,
        quantity: item.basketCount, // 添加 quantity 字段，值与 basketCount 相同
        selected: item.selected,
        stockEnough: item.stockEnough,
        actualStocks: item.actualStocks,
        maxBuyCount: item.maxBuyCount,
        prodStatus: item.prodStatus,
        prodType: item.prodType,
        oriPrice: item.oriPrice,
        // 预售相关信息
        presellStatus: item.presellStatus,
        presellPrice: item.presellPrice,
        presellDeposit: item.price,
        // 团购相关信息
        groupPrice: item.price,
        groupMinNum: item.groupMinNum,
        // 秒杀相关信息
        seckillPrice: item.price,
        isVirtual:  item.isVirtual ,
        isSkuItem: item.isSkuItem,
        weight: item?.weight,
        volume: item?.volume,
      }))

      // console.log('要保存的购物车数据:', cartData)
      setCache("cartStore", cartData)
    } catch (e) {
      // console.error('保存购物车数据失败:', e)
      $q.notify({
        type: 'negative',
        message: '保存购物车数据失败'
      })
      return
    }
  }

  router.push({
    path: '/checkout',
    query: { from: 'cart' }
  })
}

// 在组件挂载时获取购物车数据（仅在客户端执行）
onMounted(() => {
  if (process.client) {
    getCartItems()
  }
})
</script>

<style scoped lang="scss">
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-list {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &.unavailable {
    opacity: 0.8;

    .unavailable-img {
      filter: grayscale(100%);
    }
  }
}

.cart-summary {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  bottom: 0;
  z-index: 1;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
}

// 响应式布局
@media (max-width: 600px) {
  .cart-page {
    padding: 10px;
  }

  .cart-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
}

// 添加库存不足商品的样式
.cart-item {
  &.stock-insufficient {
    opacity: 0.7;

    .q-checkbox {
      cursor: not-allowed;
    }
  }
}

.stock-status {
  font-size: 12px;
  margin-top: 4px;

  &.insufficient {
    color: var(--q-negative);
  }
}
</style>
