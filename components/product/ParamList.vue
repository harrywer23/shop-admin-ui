<template>
  <div class="param-list">
    <div v-for="group in params" :key="group.groupName" class="param-group">
      <div class="group-name">{{ group.groupName }}</div>
      <div class="param-items">
        <div v-for="param in group.params" :key="param.paramId" class="param-item">
          <span class="param-name">
            {{ param.paramName }}
            <span v-if="param.required" class="required">*</span>
          </span>
          <span class="param-value">
            <template v-if="param.paramType === 5">
              <q-chip
                v-for="tag in param.paramValue.split(',')"
                :key="tag"
                size="sm"
                color="primary"
                text-color="white"
              >
                {{ tag }}
              </q-chip>
            </template>
            <template v-else>
              {{ formatParamValue(param) }}
            </template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Param {
  paramId: number
  paramName: string
  paramValue: string
  required: number
  paramType: number // 1:文本 2:数字 3:日期 4:单选 5:多选
}

interface ParamGroup {
  groupName: string
  params: Param[]
}

const props = defineProps<{
  params: ParamGroup[]
}>()

const formatParamValue = (param: Param) => {
  switch (param.paramType) {
    case 2: // 数字
      return param.paramValue + (param.paramName.includes('重量') ? 'kg' : '')
    case 3: // 日期
      return new Date(param.paramValue).toLocaleDateString()
    default:
      return param.paramValue
  }
}
</script>

<style scoped>
.param-list {
  padding: 16px;
}

.param-group {
  margin-bottom: 24px;
}

.group-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
  padding-left: 8px;
  border-left: 4px solid var(--primary-color);
}

.param-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.param-item {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.param-name {
  color: #666;
  min-width: 100px;
  display: flex;
  align-items: center;
}

.required {
  color: #ff4d4f;
  margin-left: 4px;
  font-size: 14px;
}

.param-value {
  color: #333;
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

/* 添加悬停效果 */
.param-item:hover {
  background-color: #f8f9fa;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .param-items {
    grid-template-columns: 1fr;
  }
}
</style> 