<template>
  <q-input
    :model-value="displayValue"
    @update:model-value="handleInput"
    :label="label"
    :placeholder="placeholder"
    :rules="[
      ...rules,
      val => !isNaN(Number(val)) || '请输入有效数字',
      val => Number(val) >= 0 || '金额不能为负数',
      val => !max || Number(val) <= max || `金额不能超过${max}`,
      val => !min || Number(val) >= min || `金额不能小于${min}`
    ]"
    :error="!!error"
    :error-message="error"
    :disable="disable"
    :readonly="readonly"
    :dense="dense"
    :filled="filled"
    :outlined="outlined"
    :borderless="borderless"
    :clearable="clearable"
    class="money-input"
  >
    <!-- 前置图标插槽 -->
    <template v-slot:prepend v-if="$slots.prepend || prependIcon">
      <slot name="prepend">
        <q-icon :name="prependIcon" />
      </slot>
    </template>

    <!-- 后置图标插槽 -->
    <template v-slot:append v-if="$slots.append || appendIcon">
      <slot name="append">
        <q-icon :name="appendIcon" />
      </slot>
    </template>

    <!-- 前缀 -->
    <template v-slot:prefix v-if="prefix">
      {{ prefix }}
    </template>

    <!-- 后缀 -->
    <template v-slot:suffix v-if="suffix">
      {{ suffix }}
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: number | null // 绑定值
  label?: string // 标签
  placeholder?: string // 占位符
  rules?: Array<(val: any) => boolean | string> // 验证规则
  error?: string // 错误信息
  disable?: boolean // 是否禁用
  readonly?: boolean // 是否只读
  dense?: boolean // 是否紧凑
  filled?: boolean // 是否填充样式
  outlined?: boolean // 是否轮廓样式
  borderless?: boolean // 是否无边框
  clearable?: boolean // 是否可清除
  max?: number // 最大值
  min?: number // 最小值
  prefix?: string // 前缀
  suffix?: string // 后缀
  prependIcon?: string // 前置图标
  appendIcon?: string // 后置图标
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  placeholder: '请输入金额',
  rules: () => [],
  error: '',
  disable: false,
  readonly: false,
  dense: false,
  filled: false,
  outlined: false,
  borderless: false,
  clearable: false,
  max: undefined,
  min: 0,
  prefix: '¥',
  suffix: '',
  prependIcon: 'attach_money',
  appendIcon: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  'change': [value: number | null]
}>()

// 显示值
const displayValue = computed(() => {
  if (props.modelValue === null) return ''
  return formatNumber(props.modelValue)
})

// 处理输入
function handleInput(value: string) {
  // 移除所有非数字和小数点字符
  let cleanValue = value.replace(/[^\d.]/g, '')

  // 处理多个小数点
  const parts = cleanValue.split('.')
  if (parts.length > 2) {
    cleanValue = parts[0] + '.' + parts.slice(1).join('')
  }

  // 限制小数位数
  if (parts.length === 2 && parts[1].length > 2) {
    cleanValue = parts[0] + '.' + parts[1].slice(0, 2)
  }

  // 转换为数字
  const numValue = cleanValue === '' ? null : Number(cleanValue)

  // 验证最大最小值
  if (numValue !== null) {
    if (props.max !== undefined && numValue > props.max) {
      return
    }
    if (props.min !== undefined && numValue < props.min) {
      return
    }
  }

  // 更新值
  emit('update:modelValue', numValue)
  emit('change', numValue)
}

// 格式化数字
function formatNumber(num: number): string {
  return num.toFixed(2)
}
</script>

<style lang="scss" scoped>
.money-input {
  :deep(.q-field__prefix) {
    padding-right: 4px;
    color: rgba(0, 0, 0, 0.6);
  }

  :deep(.q-field__suffix) {
    padding-left: 4px;
    color: rgba(0, 0, 0, 0.6);
  }

  :deep(.q-field__control) {
    .q-field_Native {
      text-align: right;
      padding-right: 4px;
    }
  }
}
</style>
