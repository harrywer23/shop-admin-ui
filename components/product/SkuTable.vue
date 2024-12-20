<template>
  <div class="sku-table">
    <q-table
      :rows="modelValue"
      :columns="columns"
      row-key="skuId"
      flat
      bordered
    >
      <!-- 规格属性 -->
      <template #body-cell-skuName="props">
        <q-td :props="props">
          <q-input
            v-model="props.row.skuName"
            dense
            outlined
            style="min-width: 200px"
          />
        </q-td>
      </template>
      <!-- 规格属性 -->
      <template #body-cell-properties="props">
        <q-td :props="props">
          <div class="properties-cell">
            {{ formatProperties(props.row.properties) }}
          </div>
        </q-td>
      </template>

      <!-- 原价 -->
      <template  #body-cell-oriPrice="props">
        <q-td :props="props">
          <q-input
            v-model.number="props.row.oriPrice"
            type="number"
            :rules="[
              val => Number(val) > 0 || '原价必须大于0'
            ]"
            filled
            fill-mask="0"
            reverse-fill-mask
            input-class="text-right"
            class="price-input"
            style="min-width: 150px"
            @update:model-value="val => updateValue(props.row)"
          />
        </q-td>
      </template>

      <!-- 售价 -->
      <template  v-if="prodType == 1 " #body-cell-price="props">
        <q-td :props="props">
          <q-input
            v-model.number="props.row.price"
            type="number"
            :rules="[
              val => val > 0 || '售价必须大于0',
              val => Number(val) <= Number(props.row.oriPrice) || '售价不能高于原价'
            ]"
            filled
            fill-mask="0"
            reverse-fill-mask
            input-class="text-right"
            @update:model-value="val => updateValue(props.row)"
          />
        </q-td>
      </template>

      <!-- 预售相关字段 -->
      <template v-if="prodType == 2" #body-cell-presellPrice="props">
        <q-td :props="props">
          <q-input
            v-model.number="props.row.presellPrice"
            type="number"
            :rules="[
              val => val > 0 || '预售价格必须大于0',
              val => Number(val) <= Number(props.row.oriPrice) || '预售价格不能高于原价'
            ]"
            filled
            fill-mask="0"
            reverse-fill-mask
            input-class="text-right"
            class="price-input"
            style="min-width: 150px"
            @update:model-value="val => updateValue(props.row)"
          />
        </q-td>
      </template>

      <template v-if="prodType == 2" #body-cell-presellDeposit="props">
        <q-td :props="props">
          <q-input
            v-model.number="props.row.presellDeposit"
            type="number"
            :rules="[
              val => val > 0 || '定金必须大于0',
              val => Number(val) < Number(props.row.presellPrice) || '定金不能大于预售价格'
            ]"
            filled
            fill-mask="0"
            reverse-fill-mask
            input-class="text-right"
            class="price-input"
            style="min-width: 150px"
            @update:model-value="val => updateValue(props.row)"
          />
        </q-td>
      </template>

      <template v-if="prodType == 2" #body-cell-presellFinalPayment="props">
        <q-td :props="props">
          <div class="text-subtitle2">
            {{ ( Number(props.row.presellPrice) -  Number(props.row.presellDeposit)).toFixed(2) }}
          </div>
        </q-td>
      </template>

      <!-- 库存 -->
      <template #body-cell-actualStocks="props">
        <q-td :props="props">
          <q-input
            v-model.number="props.row.actualStocks"
            type="number"
            dense
            outlined
            class="number-input"
            style="min-width: 150px"
            @update:model-value="val => updateValue(props.row)"
          />
        </q-td>
      </template>

      <!-- 团购价格 -->
      <template  v-if="prodType == 3" #body-cell-groupPrice="props">
        <q-td :props="props">
          <q-input
            v-model.number="props.row.groupPrice"
            type="number"
            :rules="[
              val => val > 0 || '团购价格必须大于0',
              val => Number(val) <= Number(props.row.oriPrice) || '团购价格不能高于原价'
            ]"
            filled
            fill-mask="0"
            reverse-fill-mask
            input-class="text-right"
            @update:model-value="val => updateValue(props.row)"
          />
        </q-td>
      </template>

      <!-- 最低成团人数 -->
      <template   v-if="prodType == 3" #body-cell-groupMinNum="props">
        <q-td :props="props">
          <q-input
            v-model.number="props.row.groupMinNum"
            type="number"
            :rules="[
              val => val >= 2 || '最低成团人数不能少于2人'
            ]"
            dense
            outlined
            @update:model-value="val => updateValue(props.row)"
          />
        </q-td>
      </template>

      <!-- 秒杀价格 -->
      <template v-if="prodType === 4" #body-cell-seckillPrice="props">
        <q-td :props="props">
          <q-input
            v-model.number="props.row.seckillPrice"
            type="number"
            :rules="[
              val => val > 0 || '秒杀价格必须大于0',
              val => Number(val) <= Number(props.row.oriPrice) || '秒杀价格不能高于原价'
            ]"
            filled
            fill-mask="0"
            reverse-fill-mask
            input-class="text-right"
            @update:model-value="val => updateValue(props.row)"
          />
        </q-td>
      </template>

      <!-- 重量 -->
      <template #body-cell-weight="props">
        <q-td :props="props">
          <q-input
            v-model.number="props.row.weight"
            type="number"
            dense
            outlined
            :rules="[
              val =>  Number(val) >= 0 || '重量不能为负数'
            ]"
            fill-mask="0.01"
            reverse-fill-mask
            input-class="text-right"
            @update:model-value="val => updateValue(props.row)"
          />
        </q-td>
      </template>

      <!-- 体积 -->
      <template #body-cell-volume="props">
        <q-td :props="props">
          <q-input
            v-model.number="props.row.volume"
            type="number"
            dense
            outlined
            :rules="[
              val => Number(val) >= 0 || '体积不能为负数'
            ]"
            fill-mask="0.01"
            reverse-fill-mask
            input-class="text-right"
            @update:model-value="val => updateValue(props.row)"
          />
        </q-td>
      </template>

      <!-- SKU 编码 -->
      <template #body-cell-skuCode="props">
        <q-td :props="props">
          <q-input
            v-model="props.row.skuCode"
            dense
            outlined
            :rules="[
              val => val.length <= 50 || 'SKU编码不能超过50个字符'
            ]"
          >
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                icon="autorenew"
                @click="generateSkuCode(props.row)"
              >
                <q-tooltip>生成编码</q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </q-td>
      </template>

      <!-- 状态 -->
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-btn
            :color="props.row.status === 1 ? 'positive' : 'grey-7'"
            :label="props.row.status === 1 ? '已上架' : '下架'"
            :icon="props.row.status === 1 ? 'visibility' : 'visibility_off'"
            flat
            dense
            @click="toggleStatus(props.row)"
          >
            <q-tooltip>
              {{ props.row.status === 1 ? '点击下架' : '点击上架' }}
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <!-- 修改操作列的模板 -->
      <template #body-cell-actions="props" class="action-column">
        <q-td :props="props">
          <q-btn
            flat
            round
            color="negative"
            icon="delete"
            size="sm"
            class="delete-btn"
            @click.stop="handleDelete(props.row)"
          >
            <q-tooltip anchor="center right" self="center left">
              删除此SKU
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 添加类型定义
interface SkuProps {
  [key: string]: {
    propName: string
    propId: number | string
    values: Array<{
      valueId: number | string
      prop_value: string
    }>
  }
}

// 添加行数据类型
interface SkuRow {
  skuId: number | string
  tempId: string  // 添加临时ID字段
  prodType:number
  properties: string
  oriPrice: number
  price: number
  actualStocks: number
  presellPrice?: number
  presellDeposit?: number
  presellFinalPayment?: number
  pic?: string
  groupPrice?: number    // 团购价格
  groupMinNum?: number   // 最低成团人数
  seckillPrice?: number  // 秒杀价格
  weight?: number  // 商品重量
  volume?: number  // 商品体积
  skuCode?: string  // SKU 编码
  status: number  // 0=下架, 1=上架
}

const props = defineProps({
  modelValue: {
    type: Array as PropType<SkuRow[]>,
    required: true
  },
  prodType: {
    type: Number,
    default: 1,
  },
  skuProps: {
    type: Object as PropType<SkuProps>,
    required: true
  },
  prodName: {
    type: String,
    default: ''
  },
  isPresell: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: SkuRow[]]
  'delete-sku': [value: { skuId: number | string, tempId: string }]
}>()

// 修改列定义计算属性
const columns = computed(() => {
  //console.log('生成列定义, 商品类型:', props.prodType)

  // 基础列始终显示
  const baseColumns = [
  {
      name: 'skuName',
      label: '名称',
      field: 'skuName',
      align: 'left' as const
    },
    {
      name: 'properties',
      label: '规格',
      field: 'properties',
      align: 'left' as const
    },
    {
      name: 'skuCode',
      label: 'SKU编码',
      field: 'skuCode',
      align: 'center' as const
    },
    {
      name: 'oriPrice',
      label: '原价',
      field: 'oriPrice',
      align: 'center' as const
    },
    {
      name: 'actualStocks',
      label: '库存',
      field: 'actualStocks',
      align: 'center' as const
    },
    {
      name: 'weight',
      label: '重量(kg)',
      field: 'weight',
      align: 'center' as const
    },
    {
      name: 'volume',
      label: '体积(cm³)',
      field: 'volume',
      align: 'center' as const
    },
    {
      name: 'status',
      label: '状态',
      field: 'status',
      align: 'center' as const
    },
    {
      name: 'actions',
      label: '操作',
      align: 'center',
      field: 'actions'
    }
  ]

  // 根据商品类型添加不同的价格列
  let priceColumns = []

  switch (props.prodType) {
    case 1: // 普通商品
      priceColumns = [{
        name: 'price',
        label: '售价',
        field: 'price',
        align: 'center' as const
      }]
      break

    case 2: // 预售商品
      priceColumns = [
        {
          name: 'presellPrice',
          label: '预售价格',
          field: 'presellPrice',
          align: 'center' as const
        },
        {
          name: 'presellDeposit',
          label: '定金',
          field: 'presellDeposit',
          align: 'center' as const
        },
        {
          name: 'presellFinalPayment',
          label: '尾款',
          field: 'presellFinalPayment',
          align: 'center' as const
        }
      ]
      break

    case 3: // 团购商品
      priceColumns = [
        {
          name: 'groupPrice',
          label: '团购价格',
          field: 'groupPrice',
          align: 'center' as const
        },
        {
          name: 'groupMinNum',
          label: '最低成团人数',
          field: 'groupMinNum',
          align: 'center' as const
        }
      ]
      break

    case 4: // 秒杀商品
      priceColumns = [{
        name: 'seckillPrice',
        label: '秒杀价格',
        field: 'seckillPrice',
        align: 'center' as const
      }]
      break
  }

  //console.log('最终列定义:', [...baseColumns, ...priceColumns])
  return [...baseColumns, ...priceColumns]
})

// 格式化规格属性
function formatProperties(propertiesStr: string): string {
  if (!propertiesStr) return ''

  try {
    //console.log('格式化属性字符串:', propertiesStr)
    //console.log('当前SKU属性置:', props.skuProps)

    const properties = propertiesStr.split(';')
    const formattedProps = properties.map(prop => {
      const [propName, propValue] = prop.split(':')
      return `${propName}: ${propValue}`
    })

    const result = formattedProps.join('; ')
    //console.log('最终格式化结果:', result)
    return result
  } catch (error) {
    console.error('格式化规格属性失败:', {
      error,
      propertiesStr,
      skuProps: props.skuProps
    })
    return propertiesStr
  }
}

// 在 script setup 中添加深拷贝函数
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// 修改更新方法的类型
function updateValue(row: SkuRow) {

  emit('update:modelValue', props.modelValue)
}


// 添加属性变化监听
watch(() => props.modelValue, (newValue) => {
}, { deep: true })

// 添加预售状态变化监听
watch(() => props.isPresell, (newValue) => {
}, { immediate: true })

// 添加预售状态变化监听
watch(() => props.prodType, (newValue) => {
  //console.log('产品类型发生改变:', {
  //   prodType: newValue,
  //   skuList: props.modelValue
  // })
}, { immediate: true })

// 添生成 SKU 编码的方法
function generateSkuCode(row: SkuRow) {
  // 生成规则：SPU编码 + 格值组合的 hash
  const prefix = props.prodCode || 'SKU'
  const hash = Math.random().toString(36).substring(2, 8).toUpperCase()
  row.skuCode = `${prefix}-${hash}`
  updateValue(row)
}

// 添加状态切换方法
function toggleStatus(row: SkuRow) {
  //console.log('切换SKU状态:', {
  //   skuId: row.skuId,
  //   oldStatus: row.status,
  //   newStatus: row.status === 1 ? 0 : 1
  // })

  // 更新状态
  row.status = row.status === 1 ? 0 : 1

  // 通知父组件
  emit('update:modelValue', props.modelValue)

  // 显示提示
  $q.notify({
    type: row.status === 1 ? 'positive' : 'warning',
    message: row.status === 1 ? 'SKU已上架' : 'SKU已下架',
    position: 'top',
    timeout: 1500
  })
}

// 修改生成新SKU时的默认值
const generateSkuCombinations = (properties: Record<string, any>) => {
  // ... 其他代码保持不变
  const sku = {
    // ... 其他字段
    status: 1,  // 默认上架
  }
  // ... 其他代码保持不变
}

// 修改删除处理函数
function handleDelete(row: SkuRow) {
  // 打印完整的行数据，用于调试
  console.log('准备删除的 SKU 行数据:', {
    skuId: row.skuId,
    tempId: row.tempId,
    properties: row.properties
  })
  
  $q.dialog({
    title: '确认删除',
    message: '确定要删除这个 SKU 吗？',
    cancel: {
      label: '取消',
      flat: true,
      color: 'grey-7'
    },
    ok: {
      label: '删除',
      color: 'negative'
    },
    persistent: true
  }).onOk(() => {
    // 使用深拷贝创建新数组
    const currentList = [...props.modelValue]
    
    // 使用 properties 作为唯一标识符来查找要删除的项
    const deleteIndex = currentList.findIndex(sku => 
      sku.properties === row.properties
    )

    if (deleteIndex !== -1) {
      // 获取要删除的项
      const deletedSku = currentList[deleteIndex]
      // 删除该项
      currentList.splice(deleteIndex, 1)
      console.log('删除后的 SKU 列表:', currentList)
      
      // 更新列表
      emit('update:modelValue', currentList)
      // 触发删除事件，确保传递正确的 ID
      emit('delete-sku', { 
        skuId: deletedSku.skuId || '', 
        tempId: deletedSku.tempId || '',
        properties: deletedSku.properties // 添加 properties 用于调试
      })

      $q.notify({
        type: 'positive',
        message: 'SKU 已删除',
        position: 'top'
      })
    } else {
      console.error('未找到要删除的 SKU:', {
        properties: row.properties,
        skuId: row.skuId,
        tempId: row.tempId
      })
      $q.notify({
        type: 'negative',
        message: '删除失败：未找到指定的 SKU',
        position: 'top'
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.sku-table {
  :deep(.q-table) {
    th {
      font-weight: 500;
      min-width: 150px;
    }

    td {
      padding: 8px;
      min-width: 150px;
    }

    // 统一设置所有数字输入框的样式
    .number-input,
    .price-input {
      .q-field__inner {
        min-width: 150px;
      }

      .q-field__control {
        height: 36px;
        padding: 0 8px;
      }

      input {
        font-size: 14px;
        text-align: right;
        padding-right: 8px;
      }
    }

    // 所有输入框统一宽度
    td {
      .q-field {
        margin: 0;
        min-width: 150px;
        
        &.q-field--outlined,
        &.q-field--filled {
          .q-field__control {
            min-height: 36px;
          }
          
          .q-field__inner {
            min-width: 150px;
          }
        }
      }
    }

    // 特殊列的处理
    td[aria-colindex="1"] {
      min-width: 200px;
    }

    td[aria-colindex="2"] {
      min-width: 200px;
    }

    td:last-child {
      min-width: 100px;
    }
  }

  // ���化表格整体布局
  .q-table__container {
    overflow-x: auto;
    
    table {
      min-width: 1500px;
    }
  }

  // 改输入框样式
  :deep(.q-input) {
    .q-field__inner {
      min-width: 150px;
    }
  }

  // 规格属性单元格样式
  .properties-cell {
    white-space: normal;
    word-break: break-all;
    min-width: 150px;
  }
}


</style>
