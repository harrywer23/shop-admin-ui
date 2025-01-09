<template>
  <div class="q-pa-md">
    <h1>已领取的优惠券</h1>
    <q-input v-model="filter" label="搜索用户ID" />
    <q-table
      :rows="filteredCoupons"
      :columns="columns"
      row-key="receiveId"
    >
      <template v-slot:body-cell-actions="props">
        <q-td>
          <q-btn color="negative" @click="deleteReceivedCoupon(props.row.receiveId)">删除</q-btn>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { api } from '~/utils/axios';

const coupons = ref([]);
const filter = ref('');

const columns = [
  { name: 'couponId', label: '优惠券ID', align: 'left', field: 'couponId' },
  { name: 'userId', label: '用户ID', align: 'left', field: 'userId' },
  { name: 'status', label: '使用状态', align: 'left', field: 'status' },
  { name: 'receiveTime', label: '领取时间', align: 'left', field: 'receiveTime' },
  { name: 'actions', label: '操作', align: 'center' }
];

async function fetchReceivedCoupons() {
  const response = await api.get('/sys/coupons/received');
  coupons.value = response.data;
}

function deleteReceivedCoupon(receiveId) {
  api.delete(`/sys/coupons/received/${receiveId}`).then(() => {
    fetchReceivedCoupons();
  });
}

const filteredCoupons = computed(() => {
  return coupons.value.filter(coupon => {
    return coupon.userId.includes(filter.value);
  });
});

onMounted(() => {
  fetchReceivedCoupons();
});
</script>

<style scoped>
/* 添加样式 */
</style> 