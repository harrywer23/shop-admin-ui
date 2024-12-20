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
      <div class="values-list">
        <q-chip
          v-for="(value, valueIndex) in prop.values"
          :key="valueIndex"
          removable
          @remove.stop="removeValue(index, valueIndex)"
          color="primary"
          text-color="white"
          class="value-chip"
        >
          <div class="row items-center no-wrap">
            <span class="q-mr-sm">{{ value.propValue }}</span>
            <q-btn
              flat
              round
              dense
              color="white"
              icon="edit"
              size="xs"
              @click.stop="editValue(index, valueIndex)"
            >
              <q-tooltip>编辑属性值</q-tooltip>
            </q-btn>
          </div>
        </q-chip>
        
        <!-- 添加属性值按钮 -->
        <q-btn
          flat
          round
          size="sm"
          color="primary"
          icon="add"
          @click="showAddValueDialog(index)"
        >
          <q-tooltip>添加属性值</q-tooltip>
        </q-btn>
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

    <!-- 添加属性值对话框 -->
    <q-dialog v-model="showValueDialog" persistent>
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">{{ isEditingValue ? '编辑属性值' : '添加属性值' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newValueInput"
            label="属性值"
            outlined
            dense
            :rules="[val => !!val || '请输入属性值']"
            @keyup.enter="confirmValue"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn
            label="确定"
            color="primary"
            @click="confirmValue"
            :disable="!newValueInput"
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
    type: Array,
    default: () => ([])
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
  //console.log('计算已选规格:', propList.value)
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
const generateSkuCombinations = (properties: Record<string, any>) => {
  const propIds = Object.keys(properties)
  if (propIds.length === 0) {
    return []
  }

  const combinations: any[] = []
  const values = propIds.map(propId => properties[propId].values)

  const combine = (current: any[], index: number) => {
    if (index === propIds.length) {
      const propertiesStr = current.map((value, i) => {
        const propName = properties[propIds[i]].propName
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
        skuId: Date.now() + Math.floor(Math.random() * 1000),  // 使用时间戳+随机数作为临时ID
        tempId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,  // 添加临时ID
        skuCode: `SKU${Date.now()}${Math.floor(Math.random() * 1000)}`,
        status: 1
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
  return combinations
}

// 修改更新方法
const updateModelValue = () => {
  //console.log('开始更新数据')
  const result: Record<string, any> = {}

  propList.value.forEach((prop, index) => {
    if (prop.propName) {
      result[index + 1] = {
        propId: index + 1,
        propName: prop.propName,
        values: [...prop.values]
      }
    }
  })

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
watch(() => props.modelValue, (newValue) => {

  for (let i = 0; i <  newValue.length; i++) {
    const value =  newValue[i];
    propList.value.push(value)
  }
}, { immediate: true })

// 添加新的响应式变量
const showValueDialog = ref(false)
const newValueInput = ref('')
const currentPropIndex = ref(-1)
const currentValueIndex = ref(-1)
const isEditingValue = ref(false)

// 显示添加属性值对话框
function showAddValueDialog(propIndex: number) {
  currentPropIndex.value = propIndex
  isEditingValue.value = false
  newValueInput.value = ''
  showValueDialog.value = true
}

// 编辑属性值
function editValue(propIndex: number, valueIndex: number) {
  console.log('编辑属性值:', { propIndex, valueIndex })
  
  // 添加防御性检查
  if (propIndex < 0 || valueIndex < 0 || !propList.value[propIndex]) {
    console.error('无效的属性索引:', { propIndex, valueIndex })
    return
  }

  currentPropIndex.value = propIndex
  currentValueIndex.value = valueIndex
  isEditingValue.value = true

  const propValue = propList.value[propIndex]?.values[valueIndex]?.propValue
  if (propValue) {
    newValueInput.value = propValue
    showValueDialog.value = true
    console.log('打开编辑对话框:', { propValue, newValueInput: newValueInput.value })
  } else {
    console.error('无法获取属性值:', { 
      propIndex, 
      valueIndex, 
      prop: propList.value[propIndex],
      values: propList.value[propIndex]?.values 
    })
  }
}

// 确认添加/编辑属性值
function confirmValue() {
  if (!newValueInput.value) return

  const prop = propList.value[currentPropIndex.value]
  if (!prop) return

  try {
    if (isEditingValue.value) {
      // 编辑现有属性值
      if (prop.values[currentValueIndex.value]) {
        prop.values[currentValueIndex.value].propValue = newValueInput.value
        // 立即更新数据
        updateModelValue()
        showValueDialog.value = false
        newValueInput.value = ''
        
        $q.notify({
          type: 'positive',
          message: '属性值已更新'
        })
      }
    } else {
      // 检查属性值是否重复
      const isDuplicate = prop.values.some((v, index) => 
        v.propValue === newValueInput.value && 
        (!isEditingValue.value || index !== currentValueIndex.value)
      )

      if (isDuplicate) {
        $q.notify({
          type: 'warning',
          message: '属性值不能重复'
        })
        return
      }

      // 添加新属性值
      prop.values.push({
        valueId: Date.now() + Math.floor(Math.random() * 1000),
        propValue: newValueInput.value
      })
    }
  } catch (error) {
    console.error('更新属性值失败:', error)
    $q.notify({
      type: 'negative',
      message: '更新属性值失败'
    })
  }
}

// 添加处理点击事件的函数
function handleChipClick(propIndex: number, valueIndex: number) {
  console.log('Chip clicked:', { propIndex, valueIndex })
  editValue(propIndex, valueIndex)
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

  .values-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-top: 12px;

    .q-chip {
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
      }
    }
  }

  .q-btn.q-mb-lg {
    margin-top: 16px;
  }

  .value-chip {
    transition: all 0.3s ease;
    padding-right: 8px; // 为编辑按钮留出空间

    .q-btn {
      margin-left: 4px;
      opacity: 0.8;
      
      &:hover {
        opacity: 1;
      }
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    // 移除之前的点击相关样式
    &.q-chip--clickable,
    .q-chip__content {
      cursor: default;
    }
  }
}
</style>
