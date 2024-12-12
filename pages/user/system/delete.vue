<script setup lang="ts">
function zhuxiao(){
  alert("操作成功，请耐心等待申请");
}
</script>

<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <q-card class="my-card bg-secondary text-white">
      <q-card-section>
        <div class="text-h6">注意</div>
      </q-card-section>

      <q-card-section>
        <div class="text-subtitle2">
          <q>1.其他用户购买的自己会员是否全部过期</q>
          <q>2.是否已全部提现</q>
          <q>3.一旦注销不可找回</q>
          <q>4.7天内可以取消注销</q>
        </div>
      </q-card-section>

      <q-separator dark />

      <q-card-actions>
        <q-btn flat @click="zhuxiao">注销当前用户</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<style scoped>

</style>
