<template>
  <div class="q-pa-md">
    <h1>优惠券管理</h1>
    <q-btn color="primary" @click="openCreateDialog">添加优惠券</q-btn>
    <q-btn color="secondary" @click="$router.push('/admin/coupons/received')">查看已领取的优惠券</q-btn>

    <q-table
        :rows="coupons"
        :columns="columns"
        row-key="couponId"
    >
      <template v-slot:body-cell-actions="props">
        <q-td>
          <q-btn color="secondary" @click="openEditDialog(props.row)">编辑</q-btn>
          <q-btn color="negative" @click="deleteCoupon(props.row.couponId)">删除</q-btn>
          <q-btn
              :color="props.row.status === 1 ? 'green' : 'red'"
              @click="toggleStatus(props.row)"
          >
            {{ props.row.status === 1 ? '启用' : '停用' }}
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="couponDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ isEdit ? '编辑优惠券' : '添加优惠券' }}</div>
          <q-form @submit.prevent="saveCoupon">
            <q-input v-model="form.title" label="优惠券标题" required />
            <q-select
                v-model="form.couponType"
                :options="couponTypeOptions"
                label="优惠券类型"
                required
            />
            <q-input v-model="form.discount" label="折扣" type="number" required />
            <q-input v-model="form.minAmount" label="最低消费金额" type="number" required />
            <q-input v-model="form.maxDiscount" label="最大优惠金额" type="number" required />
            <q-input v-model="form.startTime" label="开始时间" type="datetime-local" required />
            <q-input v-model="form.endTime" label="结束时间" type="datetime-local" required />
            <q-select
                v-model="form.status"
                :options="statusOptions"
                label="状态"
                required
            />
            <q-input v-model="form.totalCount" label="发行总量" type="number" required />
            <q-input v-model="form.usedCount" label="已使用数量" type="number" required />
            <q-input v-model="form.receiveCount" label="已领取数量" type="number" required />
            <q-select
                v-model="form.canMultiple"
                :options="canMultipleOptions"
                label="是否可叠加使用"
                required
            />
          </q-form>
        </q-card-section>
        <q-card-actions>
          <q-btn type="submit" @click="saveCoupon" color="primary">{{ isEdit ? '保存' : '添加' }}</q-btn>
          <q-btn @click="couponDialog = false">取消</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { api } from '~/utils/axios';
import { Dialog } from 'quasar';

const coupons = ref([]);
const couponDialog = ref(false);
const isEdit = ref(false);
const form = ref({
  couponId: null,
  title: '',
  couponType: 1, // 默认值
  discount: 0,
  minAmount: 0,
  maxDiscount: 0,
  startTime: '',
  endTime: '',
  status: 1, // 默认值
  totalCount: 0, // 发行总量
  usedCount: 0,
  receiveCount: 0,
  canMultiple: 0 // 是否可叠加使用
});

// 优惠券类型选项
const couponTypeOptions = [
  { label: '满减', value: 1 },
  { label: '折扣', value: 2 }
];

// 状态选项
const statusOptions = [
  { label: '正常', value: 1 },
  { label: '已停用', value: 0 }
];

// 是否可叠加使用选项
const canMultipleOptions = [
  { label: '否', value: 0 },
  { label: '是', value: 1 }
];

const columns = [
  { name: 'title', label: '优惠券标题', align: 'left', field: 'title' },
  { name: 'couponType', label: '优惠券类型', align: 'left', field: 'couponType' },
  { name: 'discount', label: '折扣', align: 'left', field: 'discount' },
  { name: 'minAmount', label: '最低消费金额', align: 'left', field: 'minAmount' },
  { name: 'maxDiscount', label: '最大优惠金额', align: 'left', field: 'maxDiscount' },
  { name: 'startTime', label: '开始时间', align: 'left', field: 'startTime' },
  { name: 'endTime', label: '结束时间', align: 'left', field: 'endTime' },
  { name: 'status', label: '状态', align: 'left', field: 'status' },
  { name: 'totalCount', label: '发行总量', align: 'left', field: 'totalCount' },
  { name: 'usedCount', label: '已使用数量', align: 'left', field: 'usedCount' },
  { name: 'receiveCount', label: '已领取数量', align: 'left', field: 'receiveCount' },
  { name: 'canMultiple', label: '是否可叠加使用', align: 'left', field: 'canMultiple' },
  { name: 'actions', label: '操作', align: 'center' }
];

async function fetchCoupons() {
  const response = await api.get('/sys/coupons/list');
  coupons.value = response.data;
}

function openCreateDialog() {
  isEdit.value = false;
  form.value = { couponId: null, title: '', couponType: 1, discount: 0, minAmount: 0, maxDiscount: 0, startTime: '', endTime: '', status: 1, totalCount: 0, usedCount: 0, receiveCount: 0, canMultiple: 0 };
  couponDialog.value = true;
}

function openEditDialog(coupon) {
  isEdit.value = true;
  form.value = { ...coupon };
  couponDialog.value = true;
}

async function saveCoupon() {
  // 格式化时间
  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  form.value.startTime = formatDate(form.value.startTime);
  form.value.endTime = formatDate(form.value.endTime);

  if (isEdit.value) {
    await api.post('/sys/coupons/update', form.value);
  } else {
    await api.post('/sys/coupons/add', form.value);
  }
  couponDialog.value = false;
  fetchCoupons();
}

async function deleteCoupon(couponId) {
  await api.delete(`/sys/coupons/del/${couponId}`);
  fetchCoupons();
}

async function toggleStatus(coupon) {
  const newStatus = coupon.status === 1 ? 0 : 1; // 切换状态
  await api.post('/sys/coupons/update', { ...coupon, status: newStatus });
  fetchCoupons();
}

onMounted(() => {
  fetchCoupons();
});
</script>

<style scoped>
/* 添加样式 */
</style>
