<template>
  <div class="product-detail-container">
    <div class="product-gallery">
      <div class="main-image">
        <img
            :src="!currentImage?  product.pic:currentImage"
            :alt="product.prodName"
            @error="currentImage = product.pic"
        >
      </div>
      <div class="thumbnail-list" v-if="props.product.skus && props.product.skus.length > 0">
        <div
            v-for="(sku, index) in props.product.skus"
            :key="sku.skuId"
            class="thumbnail"
            :class="{
        active: currentSku?.skuId === sku.skuId
      }"
            @click="selectImage(index)"
        >
          <img
              :src="sku.pic || product.pic"
              :alt="sku.skuName"
              @error="handleImageError"
          >
        </div>
      </div>
    </div>

    <div class="product-info">
      <div class="product-title h1">{{ product.prodName }}</div>
      <div class="presell-tag" v-if="isPresell">预售商品</div>
      <div class="price-section">
        <template v-if="priceDisplay.presell">
          <div class="presell-price">
            <div class="price">预售价：¥{{ priceDisplay.presell.price }}</div>
            <div class="deposit">定金：¥{{ priceDisplay.presell.deposit }}</div>
            <div class="final">尾款：¥{{ priceDisplay.presell.finalPayment }}</div>
          </div>
        </template>
        <template v-else>
          <div class="current-price">¥{{ priceDisplay.current }}</div>
          <div v-if="priceDisplay.original > priceDisplay.current" class="original-price">
            <span class="label">原价：</span>
            <span class="price">¥{{ priceDisplay.original }}</span>
          </div>
        </template>
      </div>

      <div v-if="skuProps" class="sku-section">
        <div
            v-for="prop in skuProps"
            :key="prop.propId"
            class="sku-prop"
        >
          <div class="prop-name">{{ prop.propName }}</div>
          <div class="prop-values">
            <!-- 修改模板中的 SKU 按钮部分 -->
            <button
                v-for="value in prop.values"
                :key="value.valueId"
                class="sku-value-btn"
                :class="{
    active: selectedSkuProps[prop.propId] === value.valueId,
    disabled: !value.available || !isSkuValueAvailable(prop.propId, value.valueId)
  }"
                :disabled="!value.available || !isSkuValueAvailable(prop.propId, value.valueId)"
                @click="selectSkuProp(prop.propId, value.valueId)"
            >
              {{ value.valueName }}
              <span v-if="!value.available" class="sold-out-tag">已售罄</span>
            </button>
          </div>
        </div>

        <div v-if="currentSku" class="selected-sku-info">
          <div class="label">已选择：</div>
          <div class="value">{{ currentSku.skuName }}</div>
        </div>
      </div>

      <div class="quantity-section">
        <span class="label">数量：</span>
        <q-input
            v-model="quantity"
            type="number"
            :min="1"
            :max="currentSku?.actualStocks || product.totalStocks"
            dense
            outlined
            @update:model-value="updateQuantity"
        />
      </div>

      <div class="shipping-info">
        <div class="shipping-row">
          <span class="label">运费：</span>
          <span class="value">
              {{ shipping.isFree ? '包邮' : shipping.fee ? `¥${shipping.fee}` : '待计算' }}
            </span>
        </div>
      </div>
      <!-- 修改 action-buttons 部分 -->
      <div class="action-buttons">
        <template v-if="isPresell">
          <!-- 预售状态下的按钮 -->
          <q-btn
              color="primary"
              :disabled="!currentSku || !hasStock || isExceedStock"
              @click="handlePresell"
          >
            <div class="presell-btn-content">
              <span class="main-text">{{ t('product.preOrder') }}</span>
              <span class="sub-text">{{ t('product.deposit') }}: ¥{{ priceDisplay.presell?.deposit }}</span>
            </div>
          </q-btn>
          <q-btn
              outline
              color="primary"
              @click="showPresellInfo"
          >
            {{ t('product.presell.notice') }}
          </q-btn>
        </template>
        <template v-else>
          <!-- 普通商品的按钮 -->
          <q-btn
              color="primary"
              :disabled="!currentSku || !hasStock || isExceedStock"
              @click="addToCart"
          >
            {{ t('product.addToCart') }}
          </q-btn>
          <q-btn
              color="secondary"
              :disabled="!currentSku || !hasStock || isExceedStock"
              @click="buyNow"
          >
            {{ t('product.buyNow') }}
          </q-btn>
        </template>
      </div>
    </div>
  </div>
  <!-- 添加预售信息弹窗 -->
  <q-dialog v-model="presellDialogVisible">
    <q-card class="presell-info-dialog">
      <q-card-section>
        <div class="text-h6">预售说明</div>
      </q-card-section>

      <q-card-section>
        <div class="presell-info-content">
          <div class="info-item">
            <span class="label">预售价格：</span>
            <span class="value">¥{{ priceDisplay.presell?.price }}</span>
          </div>
          <div class="info-item">
            <span class="label">定金：</span>
            <span class="value">¥{{ priceDisplay.presell?.deposit }}</span>
          </div>
          <div class="info-item">
            <span class="label">尾款：</span>
            <span class="value">¥{{ priceDisplay.presell?.finalPayment }}</span>
          </div>
          <div class="info-item">
            <span class="label">预售时间：</span>
            <span class="value">{{ formatDate(presellInfo?.startTime) }} - {{ formatDate(presellInfo?.endTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">尾款支付时间：</span>
            <span class="value">{{ formatDate(presellInfo?.finalStartTime) }} - {{ formatDate(presellInfo?.finalEndTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">预计发货时间：</span>
            <span class="value">{{ formatDate(presellInfo?.deliveryTime) }}</span>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="关闭" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted} from 'vue'
import {useQuasar} from 'quasar'
import {useI18n} from 'vue-i18n'
import { useRouter } from 'vue-router'

const quantity = ref(1)

interface Sku {
  skuId: number
  properties: string
  price: number
  oriPrice: number
  stocks: number
  actualStocks: number
  isDelete: number
  skuName: string
  pic?: string
  presellPrice?: number
  presellDeposit?: number
  presellFinalPayment?: number
  status: number
}

interface SkuProperty {
  propId: string
  valueId: string
  propName: string
  valueName: string
}

const {t} = useI18n()

const props = defineProps<{
  product: {
    prodId: number
    prodName: string
    price: number
    oriPrice: number
    totalStocks: number
    pic: string
    imgs?: string
    content?: string
    presellStatus: number
    presellPrice: number
    presellDeposit: number
    presellFinalPayment: number
    presellStartTime: string
    presellEndTime: string
    presellDeliveryTime: string
    presellFinalStartTime: string
    presellFinalEndTime: string
    deliveryMode: string
    skus?: Sku[]
  }
}>()

//console.log('ProductDetail received props:', {
//   product: props.product,
//   quantity: quantity.value
// })

// 在组件挂载时也打印一次
onMounted(() => {
  //console.log('ProductDetail mounted with props:', {
  //   product: props.product,
  //   quantity: quantity.value
  // })
})

// 监听props变化
watch(() => props.product, (newVal) => {
  //console.log('Product prop changed:', newVal)
}, {deep: true})

watch(() => quantity.value, (newVal) => {
  //console.log('Quantity prop changed:', newVal)
})

const emit = defineEmits<{
  'update:quantity': [value: number]
  'add-to-cart': [sku: Sku]
  'buy-now': [sku: Sku]
  'pre-order': [sku: Sku]
}>()

const $q = useQuasar()
const currentImage = ref("");
const currentImageIndex = ref(0)
const currentSku = ref<Sku | undefined>(undefined)

const selectedSkuProps = ref<Record<string, string>>({})

// 添加图片错误处理函数
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = props.product.pic
  }
}
// 添加查找匹配 SKU 的辅助函���
const findMatchingSku = (selectedProps: Record<string, string>): Sku | undefined => {
  if (!props.product.skus?.length) return undefined

  // 将选中的属性转换为排序后的属性字符串
  const selectedPropsString = Object.entries(selectedProps)
      .map(([propId, valueId]) => `${propId}:${valueId}`)
      .sort()
      .join(';')

  // 查找完全匹配的 SKU
  return props.product.skus.find(sku => {
    const skuPropsString = sku.properties.split(';').sort().join(';')
    return skuPropsString === selectedPropsString
  })
}

// 修改 currentSku 的定义，改为 ref

// 修改 isSkuSelected 计算属性
const isSkuSelected = computed(() => {
  if (!props.product.skus?.length) return false

  // 获取所有必选的属性 ID
  const requiredPropIds = new Set<string>()
  props.product.skus.forEach(sku => {
    sku.properties.split(';').forEach(prop => {
      const propId = prop.split(':')[0].replace('p', '')
      requiredPropIds.add(propId)
    })
  })

  // 检查是否所有必选属性都已选择
  return Array.from(requiredPropIds).every(propId =>
      selectedSkuProps.value.hasOwnProperty(propId)
  )
})

// 修改 priceDisplay 计算属性
const priceDisplay = computed(() => {
  const sku = currentSku.value

  if (props.product.presellStatus === 1) {
    return {
      current: sku?.presellPrice || props.product.presellPrice,
      original: sku?.oriPrice || props.product.oriPrice,
      presell: {
        price: sku?.presellPrice || props.product.presellPrice,
        deposit: sku?.presellDeposit || props.product.presellDeposit,
        finalPayment: sku?.presellFinalPayment || props.product.presellFinalPayment
      }
    }
  }

  return {
    current: sku?.price || props.product.price,
    original: sku?.oriPrice || props.product.oriPrice,
    presell: null
  }
})

// 添加监听器
watch(currentSku, (newSku) => {
  if (newSku?.pic) {
    currentImage.value = newSku.pic
    const skuIndex = props.product.skus?.findIndex(sku => sku.skuId === newSku.skuId) ?? -1
    if (skuIndex !== -1) {
      currentImageIndex.value = skuIndex
    }
  }
}, {deep: true})

// 监听选中属性变化
watch(selectedSkuProps, (newProps) => {
  const matchedSku = findMatchingSku(newProps)
  if (matchedSku) {
    currentSku.value = matchedSku
    // 更新图片显示
    if (matchedSku.pic) {
      currentImage.value = matchedSku.pic
      const skuIndex = props.product.skus?.findIndex(sku => sku.skuId === matchedSku.skuId) ?? -1
      if (skuIndex !== -1) {
        currentImageIndex.value = skuIndex
      }
    }
  }
}, {deep: true})

// 修改数量更新处理函数
const updateQuantity = (value: string | number | null) => {
  if (value === null) return

  const numValue = typeof value === 'string' ? parseInt(value, 10) : value
  if (isNaN(numValue) || numValue < 1) {
    quantity.value = 1
    return
  }

  if (!currentSku.value) {
    $q.notify({
      type: 'warning',
      message: t('product.selectSku')
    })
    quantity.value = 1
    return
  }

  if (numValue > currentSku.value.actualStocks) {
    $q.notify({
      type: 'warning',
      message: t('product.quantity.exceed')
    })
    quantity.value = currentSku.value.actualStocks
    return
  }

  quantity.value = numValue
}


// 修改 productImages 计算属性的类型声明
const productImages = computed((): string[] => {
  const images: string[] = []

  // 添加所有 SKU 的图片
  props.product.skus?.forEach(sku => {
    if (sku.pic && !images.includes(sku.pic)) {
      images.push(sku.pic)
    }
  })

  // 添加商品的其他图片
  if (props.product.imgs) {
    const productImgs = props.product.imgs.split(',')
    productImgs.forEach(img => {
      if (!images.includes(img)) {
        images.push(img)
      }
    })
  }

  // 如果没有任何图��，使用商品主图
  if (images.length === 0) {
    images.push(props.product.pic)
  }

  return images
})


const showOriginalPrice = computed(() => {
  const sku = currentSku.value
  return sku
      ? sku.oriPrice > sku.price
      : props.product.oriPrice > props.product.price
})


// 方法
// 修改 selectImage 函数
const selectImage = (index: number) => {
  //console.log('selectImage index:', index);
  const sku = props.product.skus?.[index]
  if (!sku) return

  // 更新图片和索引
  currentImageIndex.value = index
  currentImage.value = sku.pic || props.product.pic

  // 解析 SKU 的属性并更新选中状态
  const properties = sku.properties.split(';')
  const newSelectedProps: Record<string, string> = {}

  properties.forEach(prop => {
    const [propStr, valueStr] = prop.split(':')
    const propId = propStr.replace('p', '')
    const valueId = valueStr.replace('v', '')
    newSelectedProps[propId] = valueId
  })

  // 更新选中的属性和当前 SKU
  selectedSkuProps.value = newSelectedProps
  currentSku.value = sku

  //console.log('Selected image index:', index)
  //console.log('Selected SKU:', sku)
  //console.log('Updated selectedSkuProps:', newSelectedProps)
}

const parseProperties = (propertiesStr: string): SkuProperty[] => {
  if (!propertiesStr) return []

  return propertiesStr.split(';')
      .filter(prop => prop.trim())
      .map(prop => {
        const [propId, valueId] = prop.split(':')

        // 从 SKU 名称中提取属性名和值
        const skuWithProps = props.product.skus?.find((sku: Sku) =>
            sku.properties.includes(`${propId}:${valueId}`)
        )

        let propName = ''
        let valueName = ''

        if (skuWithProps?.skuName) {
          const parts = skuWithProps.skuName.split(' ')
          const matchingPart = parts.find(part => part.startsWith(`${propId}:`))
          if (matchingPart) {
            const [name, value] = matchingPart.split(':')
            propName = name
            valueName = value
          }
        }

        return {
          propId,
          valueId,
          propName: propName || `${propId}`,
          valueName: valueName || valueId
        }
      })
}

// 修改 isSkuValueAvailable 函数
const isSkuValueAvailable = (propId: string, valueId: string): boolean => {
  if (!props.product.skus?.length) return false

  // 创建临时的选中属性对象
  const tempProps = {...selectedSkuProps.value, [propId]: valueId}

  // 检查是否有匹配的可用 SKU
  return props.product.skus.some(sku => {
    // 检查 SKU 是否可用且有库存
    if (sku.status === 0 || sku.actualStocks <= 0) {
      return false
    }

    // 解析当前 SKU 的属性
    const skuProperties = sku.properties.split(';').reduce((acc, prop) => {
      const [p, v] = prop.split(':')
      acc[p.replace('p', '')] = v.replace('v', '')
      return acc
    }, {} as Record<string, string>)

    // 检查临时选中的属性是否都匹配
    return Object.entries(tempProps).every(([pid, vid]) =>
        skuProperties[pid] === vid
    )
  })
}

// 修��� skuProps 计算属性
const skuProps = computed(() => {
  if (!props.product.skus?.length) return null

  const propMap = new Map<string, {
    propName: string,
    values: Map<string, { name: string, available: boolean }>
  }>()

  // 收集所有 SKU 的属性信息
  props.product.skus.forEach(sku => {
    // 跳过已删除的 SKU
    if (sku.isDelete) return

    const properties = sku.properties.split(';')
    properties.forEach(prop => {
      const [propStr, valueStr] = prop.split(':')
      const propId = propStr.replace('p', '')
      const valueId = valueStr.replace('v', '')

      if (!propMap.has(propId)) {
        propMap.set(propId, {
          propName: `${propId}`,
          values: new Map()
        })
      }

      const propInfo = propMap.get(propId)!
      if (!propInfo.values.has(valueId)) {
        propInfo.values.set(valueId, {
          name: getValueName(propId, valueId),
          available: sku.actualStocks > 0
        })
      }
    })
  })

  // 转换为组件需要的格式
  return Array.from(propMap.entries()).map(([propId, info]) => ({
    propId,
    propName: info.propName,
    values: Array.from(info.values.entries()).map(([valueId, value]) => ({
      valueId,
      valueName: value.name,
      available: value.available || isSkuValueAvailable(propId, valueId)
    }))
  }))
})

// 修改 selectSkuProp 函数
const selectSkuProp = (propId: string, valueId: string) => {
  // 检查是否可选
  if (!isSkuValueAvailable(propId, valueId)) {
    $q.notify({
      type: 'warning',
      message: t('product.skuUnavailable')
    })
    return
  }

  // 更新选中的规格属性
  selectedSkuProps.value = {
    ...selectedSkuProps.value,
    [propId]: valueId
  }

  // 查找匹配的 SKU
  const matchedSku = findMatchingSku(selectedSkuProps.value)
  if (matchedSku) {
    // 检查 SKU 状态和库存
    if (matchedSku.status === 0) {
      $q.notify({
        type: 'warning',
        message: t('product.skuUnavailable')
      })
      return
    }

    if (matchedSku.actualStocks <= 0) {
      $q.notify({
        type: 'warning',
        message: t('product.outOfStock')
      })
      return
    }

    // 如果当前选择的数量超过新 SKU 的库存，自动调整数量
    if (quantity.value > matchedSku.actualStocks) {
      quantity.value = matchedSku.actualStocks
      $q.notify({
        type: 'warning',
        message: t('product.quantity.exceed')
      })
    }

    currentSku.value = matchedSku
    if (matchedSku.pic) {
      currentImage.value = matchedSku.pic
    }
  }
}

const addToCart = () => {
  if (!currentSku.value) {
    $q.notify({
      type: 'warning',
      message: t('product.selectSku')
    })
    return
  }

  if (!hasStock.value) {
    $q.notify({
      type: 'warning',
      message: t('product.outOfStock')
    })
    return
  }

  // 检查购买数量是否超过库存
  if (quantity.value > currentSku.value.actualStocks) {
    $q.notify({
      type: 'warning',
      message: t('product.quantity.exceed')
    })
    return
  }

  emit('add-to-cart', currentSku.value)
}

const buyNow = () => {
  if (!currentSku.value) {
    $q.notify({
      type: 'warning',
      message: t('product.selectSku')
    })
    return
  }

  if (!hasStock.value) {
    $q.notify({
      type: 'warning',
      message: t('product.outOfStock')
    })
    return
  }

  // 检查购买数量是否超过库存
  if (quantity.value > currentSku.value.actualStocks) {
    $q.notify({
      type: 'warning',
      message: t('product.quantity.exceed')
    })
    quantity.value = currentSku.value.actualStocks
    return
  }

  // 构建订单项数据
  const orderItem = {
    prodId: props.product.prodId,
    skuId: currentSku.value.skuId,
    count: quantity.value,
    price: currentSku.value.price,
    prodName: props.product.prodName,
    pic: currentSku.value.pic || props.product.pic,
    skuName: currentSku.value.skuName
  }

  // 跳转到结账页面
  router.push({
    path: '/checkout',
    query: { direct: 'true' },
    state: { orderItems: [orderItem] }
  })
}

// 监听数量变化
watch(() => quantity.value, (newVal) => {
  // emit('update:quantity', newVal)
})

// 添加运费相关的计算属性
const isFreight = computed(() => {
  if (!props.product.deliveryMode) return false
  const mode = JSON.parse(props.product.deliveryMode)
  return mode.type === 'freight'
})

const isFreeShipping = computed(() => {
  if (!props.product.deliveryMode) return false
  const mode = JSON.parse(props.product.deliveryMode)
  return mode.type === 'free'
})

const shippingFee = computed(() => {
  if (!props.product.deliveryMode) return 0
  const mode = JSON.parse(props.product.deliveryMode)
  return mode.type === 'freight' ? mode.fee : 0
})

// 可以添加一个计算属性来格式化 SKU 名称显示（如果需要的话）
const formattedSkuName = computed(() => {
  if (!currentSku.value?.skuName) return ''
  return currentSku.value.skuName
})

// 获取选中值的显示文本
const getSelectedValueDisplay = (propId: string, valueId: number) => {
  const sku = props.product.skus?.find(sku => {
    const props = parseProperties(sku.properties)
    return props.some(p => p.propId === propId && parseInt(p.valueId) === valueId)
  })

  if (!sku) return ''

  // 从 SKU 名称中提取属性值显示
  const propValue = sku.skuName.split(' ').find(part =>
      part.includes(':') && part.split(':')[0].includes(propId)
  )

  return propValue || ''
}

const getSelectedSkuText = computed(() => {
  if (!currentSku.value) return ''

  const properties = parseProperties(currentSku.value.properties)
  return properties.map(prop =>
      `${prop.propName}: ${prop.valueName}`
  ).join('  ')
})

// 添加日志打印函数
const logSkuInfo = () => {
  //console.log('Product:', props.product)
  //console.log('Selected SKU Props:', selectedSkuProps.value)
  //console.log('Current SKU:', currentSku.value)
  //console.log('Presell Status:', props.product.presellStatus)
}

// 添加预售相关的计算属性
const isPresell = computed(() => {
  return props.product.presellStatus === 1
})

const presellInfo = computed(() => {
  if (!isPresell.value) return null

  return {
    price: props.product.presellPrice,
    deposit: props.product.presellDeposit,
    finalPayment: props.product.presellFinalPayment,
    startTime: new Date(props.product.presellStartTime),
    endTime: new Date(props.product.presellEndTime),
    deliveryTime: new Date(props.product.presellDeliveryTime),
    finalStartTime: new Date(props.product.presellFinalStartTime),
    finalEndTime: new Date(props.product.presellFinalEndTime)
  }
})

// 监听 SKU 变化
watch([currentSku, selectedSkuProps], () => {
  logSkuInfo()
})

// 辅助函数
const getValueName = (propId: string, valueId: string): string => {
  const sku = props.product.skus?.find(sku => {
    const props = sku.properties.split(';')
    return props.some(p => {
      const [pStr, vStr] = p.split(':')
      return pStr.replace('p', '') === propId && vStr.replace('v', '') === valueId
    })
  })

  if (!sku) return valueId

  // 从 SKU 名称中提取值名称
  const valuePart = sku.skuName.split(' ')
      .find(part => part.startsWith(`${propId}:`))

  return valuePart ? valuePart.split(':')[1] : valueId
}

// 运费相关计算属性
const shipping = computed(() => {
  if (!props.product.deliveryMode) return {type: 'unknown'}
  const mode = JSON.parse(props.product.deliveryMode)
  return {
    type: mode.type,
    fee: mode.type === 'freight' ? mode.fee : 0,
    isFree: mode.type === 'free'
  }
})
// 添加相关的状态和方法
const presellDialogVisible = ref(false)

// 处理预售按钮点击
const handlePresell = () => {
  if (!currentSku.value) {
    $q.notify({
      type: 'warning',
      message: t('product.selectSku')
    })
    return
  }

  if (!hasStock.value) {
    $q.notify({
      type: 'warning',
      message: t('product.outOfStock')
    })
    return
  }

  // 检查购买数量是否超过库存
  if (quantity.value > currentSku.value.actualStocks) {
    $q.notify({
      type: 'warning',
      message: t('product.quantity.exceed')
    })
    quantity.value = currentSku.value.actualStocks
    return
  }

  // 构建预售订单项数据
  const orderItem = {
    prodId: props.product.prodId,
    skuId: currentSku.value.skuId,
    count: quantity.value,
    price: currentSku.value.presellPrice || props.product.presellPrice,
    deposit: currentSku.value.presellDeposit || props.product.presellDeposit,
    prodName: props.product.prodName,
    pic: currentSku.value.pic || props.product.pic,
    skuName: currentSku.value.skuName,
    presellStatus: 1,
    presellPrice: currentSku.value.presellPrice || props.product.presellPrice,
    presellDeposit: currentSku.value.presellDeposit || props.product.presellDeposit,
    presellFinalPayment: currentSku.value.presellFinalPayment || props.product.presellFinalPayment
  }

  // 跳转到结账页面
  router.push({
    path: '/checkout',
    query: {
      direct: 'true',
      presell: 'true'
    },
    state: { orderItems: [orderItem] }
  })
}

// 显示预售信息
const showPresellInfo = () => {
  presellDialogVisible.value = true
}

// 格式化日的辅助函数
const formatDate = (date: Date | undefined) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const router = useRouter()

// 添加库存检查的计算属性
const hasStock = computed(() => {
  if (!currentSku.value) return false
  return currentSku.value.status === 1 && currentSku.value.actualStocks > 0
})

// 添加当前选择的数量是否超出库存的计算属性
const isExceedStock = computed(() => {
  if (!currentSku.value) return true
  return quantity.value > currentSku.value.actualStocks
})
</script>

<style scoped lang="scss">
.product-detail-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 1rem;
}

.product-gallery {
  .main-image {
    width: 100%;
    aspect-ratio: 1;
    margin-bottom: 1rem;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .thumbnail-list {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding: 0.5rem 0;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 2px;
    }

    .thumbnail {
      flex: 0 0 80px;
      width: 80px;
      height: 80px;
      border: 2px solid transparent;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;

      &.active {
        border-color: var(--q-primary);
      }

      &:hover {
        border-color: var(--q-primary);
        opacity: 0.8;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}

.product-info {
  .product-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .price-section {
    margin: 1rem 0;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;

    .sku-name {
      margin-bottom: 1rem;
      padding-bottom: 0.8rem;
      border-bottom: 1px dashed #ddd;

      .label {
        color: #666;
        margin-right: 0.5rem;
        font-size: 0.9rem;
      }

      .value {
        color: #333;
        font-weight: 500;
        font-size: 1rem;
      }
    }

    .current-price {
      color: var(--q-primary);
      font-size: 1.8rem;
      margin: 0.5rem 0;

      .currency {
        font-size: 1rem;
      }
    }

    .original-price {
      color: #999;
      text-decoration: line-through;
      font-size: 0.9rem;

      .label {
        margin-right: 0.5rem;
      }
    }
  }

  .shipping-info {
    margin: 1rem 0;
    padding: 0.8rem;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 4px;

    .shipping-row {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .label {
      color: #666;
      min-width: 60px;
      margin-right: 1rem;
    }

    .value {
      color: #333;
      flex: 1;
    }

    .shipping-note {
      font-size: 0.9rem;
      color: #999;
      margin-top: 0.5rem;

      .label {
        font-size: 0.9rem;
      }

      .value {
        font-size: 0.9rem;
      }
    }
  }

  .sku-section {
    margin: 1rem 0;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;

    .sku-prop {
      margin-bottom: 1.5rem;

      .prop-name {
        margin-bottom: 0.8rem;
        font-weight: 600;
        color: #333;
        font-size: 1rem;
      }

      .prop-values {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;

        .sku-value-btn {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover:not(.disabled) {
            border-color: var(--q-primary);
            color: var(--q-primary);
          }

          &.active {
            border-color: var(--q-primary);
            color: var(--q-primary);
            background-color: rgba(var(--q-primary-rgb), 0.1);
          }

          &.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background-color: #f5f5f5;
          }
        }
      }
    }

    .selected-sku-info {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dashed #ddd;

      .label {
        color: #666;
        margin-bottom: 0.5rem;
      }

      .value {
        color: var(--q-primary);
        font-weight: 500;
      }
    }
  }

  .quantity-section {
    margin: 1rem 0;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .product-detail-container {
    grid-template-columns: 1fr;
  }
}

.selected-sku {
  margin-top: 0.5rem;
  padding: 0.5rem 0;
  border-top: 1px dashed #eee;

  .label {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
  }

  .value {
    color: #333;
    font-size: 0.9rem;
    line-height: 1.4;
  }
}

.presell-tag {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: var(--q-primary);
  color: white;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.presell-price {
  .current-price {
    margin-bottom: 0.5rem;

    .label {
      font-size: 1rem;
      color: #666;
      margin-right: 0.5rem;
    }
  }

  .deposit-info {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;

    .deposit, .final-payment {
      .label {
        color: #666;
        margin-right: 0.3rem;
      }

      .amount {
        color: var(--q-primary);
        font-weight: 500;
      }
    }
  }
}

.presell-time-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #ddd;

  .time-item {
    margin-bottom: 0.5rem;

    .label {
      color: #666;
      margin-right: 0.5rem;
    }

    .value {
      color: #333;
    }
  }
}

// 添加样式
.sku-value-btn {
  position: relative;

  .sold-out-tag {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ff4d4f;
    color: white;
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 4px;
    transform: scale(0.8);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #f5f5f5;
    border-color: #d9d9d9;

    &:hover {
      border-color: #d9d9d9;
      color: inherit;
    }
  }
}
// 添加相关样式
.action-buttons {
  .presell-btn-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.2;

    .main-text {
      font-size: 16px;
    }

    .sub-text {
      font-size: 12px;
      opacity: 0.8;
    }
  }
}

.presell-info-dialog {
  min-width: 300px;
  max-width: 500px;

  .presell-info-content {
    .info-item {
      margin-bottom: 12px;
      display: flex;
      align-items: center;

      .label {
        color: #666;
        min-width: 120px;
      }

      .value {
        color: #333;
        font-weight: 500;
      }
    }
  }
}
</style>
