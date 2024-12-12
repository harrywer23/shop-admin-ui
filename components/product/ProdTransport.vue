<template>
  <div class="prod-transport">
    <!-- 运费方式列表 -->
    <div class="transport-list">
      <div class="transport-item"
           v-for="method in transportMethods"
           :key="method.id"
           :class="{'active': selectedMethod?.id === method.id}"
           @click="handleMethodSelect(method)">
        <div class="method-info">
          <div class="method-name">{{ method.name }}</div>
         <div class="method-desc">{{ method.description }}</div>
        </div>
      </div>
    </div>

    <!-- 运费详细信息 -->
    <div class="transport-details" v-if="selectedMethod">
      <!-- 1. 运输方式基本信息 -->
      <div class="detail-section">
        <div class="section-header">
          <h3>运输方式信息</h3>
        </div>
        <div class="section-content">
          <div class="info-item">
            <span class="label">运输方式:</span>
            <span class="value">{{ selectedMethod.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">计费方式:</span>
            <span class="value">{{ getCalcTypeText(selectedMethod.calcType) }}</span>
          </div>
          <div class="info-item" v-if="selectedMethod.freeType">
            <span class="label">默认免运费条件:</span>
            <span class="value free">{{ getFreeTypeText(selectedMethod.freeType, selectedMethod.freeCondition) }}</span>
          </div>
        </div>
      </div>

      <!-- 2. 运费规则列表 -->
      <div class="detail-section">
        <div class="section-header">
          <h3>运费规则</h3>
        </div>
        <div class="section-content">
          <div v-for="(rule, index) in selectedMethod.rules" :key="index" class="rule-card">
            <!-- 区域信息 -->
            <div class="rule-area">
              <span class="area-label">适用区域:</span>
              <span class="area-value">
                {{ rule.country ? rule.country : '全部国家' }}
                {{ rule.province ? `- ${rule.province}` : '' }}
                {{ rule.city ? `- ${rule.city}` : '' }}
              </span>
            </div>

            <!-- 费用信息 -->
            <div class="rule-fees">
              <div class="fee-item">
                <span class="label">基础运费:</span>
                <span class="value price">¥{{ rule.firstFee }}</span>
                <span class="unit">({{ formatUnit(selectedMethod.calcType, rule.firstUnit) }}内)</span>
              </div>
              <div class="fee-item" v-if="rule.additionalFee">
                <span class="label">续费:</span>
                <span class="value price">¥{{ rule.additionalFee }}/{{ formatUnit(selectedMethod.calcType, rule.additionalUnit) }}</span>
              </div>
            </div>

            <!-- 限制条件 -->
            <div class="rule-limits">
              <div class="limit-item" v-if="rule.minOrderAmount || rule.maxOrderAmount">
                <span class="label">订单金额限制:</span>
                <span class="value">
                  <template v-if="rule.minOrderAmount && rule.maxOrderAmount">
                    ¥{{ rule.minOrderAmount }} - ¥{{ rule.maxOrderAmount }}
                  </template>
                  <template v-else-if="rule.minOrderAmount">
                    ≥ ¥{{ rule.minOrderAmount }}
                  </template>
                  <template v-else>
                    ≤ ¥{{ rule.maxOrderAmount }}
                  </template>
                </span>
              </div>
              <div class="limit-item" v-if="rule.minUnit || rule.maxUnit">
                <span class="label">{{ getUnitLabel(selectedMethod.calcType) }}限制:</span>
                <span class="value">
                  <template v-if="rule.minUnit && rule.maxUnit">
                    {{ formatUnit(selectedMethod.calcType, rule.minUnit) }} - {{ formatUnit(selectedMethod.calcType, rule.maxUnit) }}
                  </template>
                  <template v-else-if="rule.minUnit">
                    ≥ {{ formatUnit(selectedMethod.calcType, rule.minUnit) }}
                  </template>
                  <template v-else>
                    ≤ {{ formatUnit(selectedMethod.calcType, rule.maxUnit) }}
                  </template>
                </span>
              </div>
              <div class="limit-item" v-if="rule.freeType">
                <span class="label">特殊免运费:</span>
                <span class="value free">{{ getFreeTypeText(rule.freeType, rule.freeCondition) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 不可配送区域 -->
      <div class="detail-section" v-if="selectedMethod.excludeAreas?.length">
        <div class="section-header">
          <h3>不可配送区域</h3>
        </div>
        <div class="section-content">
          <div class="exclude-areas">
            <div v-for="area in selectedMethod.excludeAreas" :key="area.areaId" class="exclude-area">
              <i class="el-icon-warning"></i>
              {{ area.areaName }}
              <span class="level-tag">{{ getAreaLevelText(area.level) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  prodId: {
    type: Number,
    required: true
  },
  modelValue: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 数据定义
const transportMethods = ref<any[]>([])
const selectedMethod = ref<any>(null)
const selectedRule = ref<any>(null)

// 监听modelValue变化
watch(() => props.modelValue, (newVal) => {
  if(newVal && transportMethods.value.length) {
    const method = transportMethods.value.find(m => m.id === newVal)
    if(method) {
      selectMethod(method)
    }
  }
}, { immediate: true })

// 初始化数据
onMounted(async () => {
  await loadTransportMethods()
})

// 加载运费方式列表
async function loadTransportMethods() {
  try {
    const repos = await fetch('/api/transport/list')
    const data = repos.json()
    if(data.code == 200 ) {
      transportMethods.value = data.data;
      // 如果有modelValue,选中对应方式
      if(props.modelValue) {
        const method = transportMethods.value.find(m => m.id === props.modelValue);
        if(method) {
          selectMethod(method)
        }
      } else if(transportMethods.value.length) {
        // 否则选中第一个
        selectMethod(transportMethods.value[0])
      }
    }
  } catch(error) {
    console.error('加载运费方式失败:', error)
  }
}

// 加载运费方式详情
async function loadTransportDetail(id: number) {
  try {
    const repos = await fetch(`/api/transport/${id}`)
    const data = repos.json()
    if(data.code === 200) {
      // 更新选中方式的规则
      const detail = data.data
      selectedMethod.value = {
        ...selectedMethod.value,
        ...detail.method,
        rules: detail.areaRules,
        excludeAreas: detail.excludeAreas
      }
      // 默认选择第一个规则
      selectedRule.value = detail.areaRules?.[0] || null
      emit('update:modelValue', id);
    }
  } catch(error) {
    console.error('加载运费方式详情失败:', error)
  }
}

// 选择运费方式
async function selectMethod(method: any) {
  selectedMethod.value = method
  // 加载详细规则
  await loadTransportDetail(method.id)
}

// 处理运费方式选择
async function handleMethodSelect(method: any) {
  await selectMethod(method)
  // 更新v-model
  emit('update:modelValue', method.id)
  // 触发change事件
  emit('change', {
    methodId: method.id,
    method: selectedMethod.value,
    rule: selectedRule.value
  })
}

// 获取计费方式描述
function getCalcTypeText(type: number): string {
  const types: Record<number, string> = {
    1: '按重量计费',
    2: '按件数计费',
    3: '按体积计费'
  }
  return types[type] || '未知计费方式'
}

// 获取免运费类型描述
function getFreeTypeText(type: number, condition: number): string {
  if (!type || !condition) return '无免运费'

  const types: Record<number, string> = {
    1: `满${condition}元免运费`,
    2: `满${condition}件免运费`,
    3: `满${condition}kg免运费`
  }
  return types[type] || '未知免运费类型'
}

// 获取计量单位标签
function getUnitLabel(type: number): string {
  const labels: Record<number, string> = {
    1: '重量',
    2: '数量',
    3: '体积'
  }
  return labels[type] || ''
}

// 格式化计量单位
function formatUnit(type: number, value: number): string {
  const units: Record<number, string> = {
    1: 'kg',
    2: '件',
    3: 'm³'
  }
  return `${value}${units[type] || ''}`
}

// 获取区域级别文本
function getAreaLevelText(level: number): string {
  const levels: Record<number, string> = {
    1: '国家',
    2: '省份',
    3: '城市'
  }
  return levels[level] || ''
}
</script>

<style lang="scss" scoped>
.prod-transport {
  padding: 20px;
  display: flex;
  gap: 20px;

  .transport-list {
    width: 250px;
    flex-shrink: 0;
    border-right: 1px solid #eee;

    .transport-item {
      padding: 15px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 10px;

      &:hover {
        border-color: #409eff;
      }

      &.active {
        border-color: #409eff;
        background-color: #ecf5ff;
      }

      .method-info {
        .method-name {
          font-weight: 500;
          margin-bottom: 8px;
        }

        .method-desc {
          font-size: 13px;
          color: #606266;
          line-height: 1.4;
        }
      }
    }
  }

  .transport-details {
    flex: 1;

    .detail-section {
      background: #fff;
      border-radius: 4px;
      margin-bottom: 20px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);

      .section-header {
        padding: 15px;
        border-bottom: 1px solid #eee;

        h3 {
          margin: 0;
          font-size: 16px;
          color: #303133;
        }
      }

      .section-content {
        padding: 15px;

        .info-item {
          margin-bottom: 12px;
          line-height: 1.5;

          &.description {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px dashed #eee;
          }

          .label {
            color: #606266;
            margin-right: 8px;
            display: inline-block;
            min-width: 100px;
          }

          .value {
            color: #303133;

            &.free {
              color: #67c23a;
            }
          }
        }

        .rule-card {
          background: #f5f7fa;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 15px;

          .rule-area {
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px dashed #dcdfe6;

            .area-label {
              color: #606266;
              margin-right: 8px;
            }

            .area-value {
              color: #409eff;
              font-weight: 500;
            }
          }

          .rule-fees, .rule-limits {
            margin-bottom: 10px;

            .fee-item, .limit-item {
              margin-bottom: 8px;

              .label {
                color: #606266;
                margin-right: 8px;
                display: inline-block;
                min-width: 80px;
              }

              .value {
                &.price {
                  color: #f56c6c;
                  font-weight: 500;
                }

                &.free {
                  color: #67c23a;
                }
              }

              .unit {
                color: #909399;
                font-size: 12px;
                margin-left: 4px;
              }
            }
          }
        }

        .exclude-areas {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;

          .exclude-area {
            background: #fef0f0;
            color: #f56c6c;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 13px;

            i {
              margin-right: 4px;
            }

            .level-tag {
              background: #f56c6c;
              color: #fff;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 12px;
              margin-left: 6px;
            }
          }
        }
      }
    }
  }
}
</style>
