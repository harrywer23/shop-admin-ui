<template>
  <div class="sku-tag">
    <!-- 属性列表 -->
    <div v-for="(prop, index) in propList" :key="index" class="prop-item q-mb-lg">
      <div class="row items-center q-mb-sm">
        <q-input
          v-model="prop.propName"
          label="规格名"
          class="col-4 q-mr-md"
          outlined
          dense
          :rules="[val => !!val || '请输入规格名']"
        />
        <q-btn
          flat
          round
          color="negative"
          icon="delete"
          @click="removeProp(index)"
        />
      </div>

      <!-- 属性值列表 -->
      <div class="prop-values-section">
        <div class="values-list">
          <q-chip
            v-for="(value, valueIndex) in prop.values"
            :key="valueIndex"
            removable
            @remove="removeValue(index, valueIndex)"
            color="primary"
            text-color="white"
          >
            {{ value.propValue }}
          </q-chip>
        </div>

        <!-- 添加属性值输入框 -->
        <div class="add-value-input q-mt-sm">
          <q-input
            v-model="prop.newValue"
            dense
            outlined
            placeholder="输入新的属性值"
            class="value-input"
            :rules="[
              val => !prop.values.some(v => v.propValue === val) || '该属性值已存在'
            ]"
          >
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                icon="add"
                color="primary"
                @click="addValueToProp(index)"
                :disable="!prop.newValue || prop.values.some(v => v.propValue === prop.newValue)"
              >
                <q-tooltip>添加属性值</q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </div>
      </div>
    </div>

    <!-- 添加规格按钮 -->
    <q-btn
      color="primary"
      icon="add"
      label="添加规格"
      @click="showAddPropDialog = true"
      class="q-mb-lg"
    />

    <!-- 添加规格对话框 -->
    <q-dialog v-model="showAddPropDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">添加规格</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md">
            <!-- 规格选择 -->
            <div class="col-12">
              <q-select
                v-model="selectedProp"
                :options="availableProps"
                option-label="propName"
                label="选择规格"
                outlined
                emit-value
                map-options
                @update:model-value="handlePropSelect"
              />
            </div>

            <!-- 规格值多选 -->
            <div class="col-12">
              <q-select
                v-model="selectedValues"
                :options="availableValues"
                option-label="propValue"
                label="选择规格值"
                multiple
                outlined
                :disable="!selectedProp"
              >
                <template v-slot:selected-item="scope">
                  <q-chip
                    removable
                    @remove="scope.removeAtIndex(scope.index)"
                    :label="scope.opt.propValue"
                    color="primary"
                    text-color="white"
                  />
                </template>
              </q-select>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn
            label="确定"
            color="primary"
            @click="confirmAddProp"
            :disable="!selectedProp || !selectedValues.length"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  modelValue: {
    type: [Array, Object],
    default: () => ({})
  }
})

interface PropValueItem {
  valueId: number | string
  propValue: string
  propId: number
}

// 修改 emit 定义
const emit = defineEmits(['update:modelValue', 'update:skuList', 'prop-lists-change', 'selected-props-change'])

// 属性列表
const propList = ref<any[]>([])

// 添加规格相关
const showAddPropDialog = ref(false)
const selectedProp = ref(null)
const selectedValues = ref([])
const availableValues = ref([])

// 获取可用的规格列表
const dbTags = ref([])
// 添加已选规格和规格值的计算属性
const selectedProps = computed(() => {
  return propList.value.map(prop => ({
    propId: prop.propId || prop.propId,
    propName: prop.propName,
    rule: 1 // 默认规则为1
  }))
})

const selectedPropValues = computed(() => {
  //console.log('计算已选规格值:', propList.value)
  const values: PropValueItem[] = []

  propList.value.forEach(prop => {
    const propId = prop.propId || prop.propId
    prop.values.forEach(value => {
      values.push({
        valueId: value.valueId,
        propValue: value.propValue,
        propId: propId
      })
    })
  })

  return values
})

// 监听已选规格变化
watch([selectedProps, selectedPropValues], ([props, values]) => {
  emit('selected-props-change', {
    selectedProps: props,
    selectedPropValues: values
  })
}, { deep: true })

// 初始化数据
const initData = async () => {
  try {
    // 获取规格列表
    const response = await fetch('/api/specs/list')
    const data = await response.json()
    dbTags.value = data.data
  } catch (error) {
    console.error('获取规格列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '获取规格列表失败'
    })
  }
}

// 计算可用的规格列表（过滤掉已选的规格）
const availableProps = computed(() => {
  const usedPropNames = propList.value.map(prop => prop.propName)
  return dbTags.value.filter(tag => !usedPropNames.includes(tag.propName))
})

// 在组件挂载时初始化数据
onMounted(() => {
  initData()
})

// 处理规格选择
const handlePropSelect = async (prop: any) => {
  if (!prop) {
    availableValues.value = []
    selectedValues.value = []
    return
  }

  try {
    // 获取选中规格的规格值列表
    const response = await fetch(`/api/specs/${prop.propId}/values`)
    const data = await response.json()
    if(data.code == 200){


    // 过滤掉已经在其他规格中使用的值
    const usedValues = propList.value.flatMap(p => p.values.map(v => v.propValue))
    availableValues.value = data.data.filter(value => !usedValues.includes(value.propValue))

    selectedValues.value = []
    }
  } catch (error) {
    console.error('获取规格值列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '获取规格值列表失败'
    })
  }
}

// 确认添加规格
const confirmAddProp = () => {
  if (!selectedProp.value || !selectedValues.value.length) {
    $q.notify({
      type: 'warning',
      message: '请选择规格和规格值'
    })
    return
  }


  const newProp = {
    propName: selectedProp.value.propName,
    propId: selectedProp.value.propId,
    values: selectedValues.value.map(value => ({
      valueId: value.valueId,
      propValue: value.propValue
    }))
  }

  propList.value.push(newProp)
  updateModelValue()

  // 重置选择状态
  showAddPropDialog.value = false
  selectedProp.value = null
  selectedValues.value = []
  availableValues.value = []
}

// 移除规格
const removeProp = (index: number) => {
  propList.value = propList.value.filter((_, i) => i !== index)
  updateModelValue()
}

// 移除规格值
const removeValue = (propIndex: number, valueIndex: number) => {
  const prop = propList.value[propIndex]
  const newValues = prop.values.filter((_, i) => i !== valueIndex)

  propList.value = propList.value.map((p, index) =>
    index === propIndex
      ? { ...p, values: newValues }
      : p
  )

  updateModelValue()
}

// 修改生成SKU组合方法
const generateSkuCombinations = (properties: any[]) => {

  if (!Array.isArray(properties) || properties.length === 0) {
    return []
  }

  const combinations: any[] = []
  const values = properties.map(prop => prop.values)

  const combine = (current: any[], index: number) => {
    if (index === properties.length) {
      // 生成属性字符串时直接使用属性名和属性值
      const propertiesStr = current.map((value, i) => {
        const propName = properties[i].propName
        const propValue = value.propValue
        return `${propName}:${propValue}`
      }).join(';')

      const sku = {
        properties: propertiesStr,
        skuName: current.map(value => value.propValue).join('-'),
        ori_price: 0,
        price: 0,
        stocks: 0,
        pic: '',
        sku_id: Date.now() + Math.floor(Math.random() * 1000),
        skuCode: `SKU${Date.now()}${Math.floor(Math.random() * 1000)}`,
      }
      combinations.push(sku)
      return
    }

    for (const value of values[index]) {
      current[index] = value
      combine([...current], index + 1)
    }
  }

  combine([], 0)
  //console.log('生成的所有SKU组合:', combinations)
  return combinations
}

// 修改更新方法
const updateModelValue = () => {
  //console.log('开始更新数据')

  // 转换为数组格式
  const result = propList.value.map((prop, index) => ({
    propId: prop.propId || index + 1,
    propName: prop.propName,
    values: prop.values
  }))

  //console.log('更新的数据:', result)
  emit('update:modelValue', result)

  // 生成并更新SKU列表
  const skuList = generateSkuCombinations(result)
  //console.log('更新的SKU列表:', skuList)
  emit('update:skuList', skuList)

  // 发送已选规格和规格值
  emit('selected-props-change', {
    selectedProps: selectedProps.value,
    selectedPropValues: selectedPropValues.value
  })
}

// 修改 watch 函数
watch(() => props.modelValue, (newValue) => {
  // 检查 newValue 是否为数组
  if (!Array.isArray(newValue)) {
    console.warn('modelValue 不是数组:', newValue)
    propList.value = []
    return
  }

  // 转换数据结构
  propList.value = Object.values(newValue).map(prop => ({
    propId: prop.propId,
    propName: prop.propName,
    values: Array.isArray(prop.values) ? [...prop.values] : [],
    newValue: '' // 添加新的属性值输入字段
  }))

}, { immediate: true, deep: true })

// 添加新的属性值
const addValueToProp = async (propIndex: number) => {
  const prop = propList.value[propIndex]
  if (!prop.newValue) return

  try {

    // 生成新的属性值ID
    const newValueId = Date.now() + Math.floor(Math.random() * 1000)

    // 添加新属性值
    const newValue = {
      valueId: newValueId,
      propValue: prop.newValue,
      propId: prop.propId
    }

    // 更新属性值列表
    prop.values.push(newValue)

    // 清空输入
    prop.newValue = ''

    // 更新数据
    updateModelValue()

    $q.notify({
      type: 'positive',
      message: '属性值添加成功'
    })
  } catch (error) {
    console.error('添加属性值失败:', error)
    $q.notify({
      type: 'negative',
      message: '添加属性值失败'
    })
  }
}
</script>

<style lang="scss" scoped>
.sku-tag {
  .prop-item {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
    background: white;
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
  }

  .prop-values-section {
    .values-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-top: 12px;
      min-height: 40px;
      padding: 8px;
      border: 1px dashed #e0e0e0;
      border-radius: 4px;
      background: #f8f9fa;

      .q-chip {
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
        }
      }
    }

    .add-value-input {
      max-width: 300px;

      .value-input {
        .q-field__append {
          padding-right: 4px;
        }
      }

      .q-btn {
        margin-left: 4px;

        &:not(:disabled) {
          &:hover {
            background: rgba(0, 0, 0, 0.05);
          }
        }
      }
    }
  }

  .q-btn.q-mb-lg {
    margin-top: 16px;
  }
}
</style>
