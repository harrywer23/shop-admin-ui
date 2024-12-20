<script setup lang="ts">

import {ref, watch} from "vue";
const props = defineProps({
  sourceUrl: {
    type: String
  }
})
const price = ref(0.0)
const multiple = ref(1.5)
const rmbprice = ref(0.0)
const usprice = ref(0.0)

function headUpdatePrice(){
  usprice.value=price.value/7*multiple.value;
  rmbprice.value=usprice.value*7;
}
function headUpdatRMBePrice(){
  rmbprice.value=usprice.value*7;
}
</script>

<template>
  <div class="row q-col-gutter-md">
    <div class="col-2 col-md-3">
      <a :href="props.sourceUrl" target="_blank">源地址</a>
    </div>
    <div class="col-2 col-md-3">
      <q-input
          v-model.number="price"
          type="number"
          label="价格"
          @update:model-value="headUpdatePrice"
      />
    </div>
    <div class="col-2 col-md-3">
      <q-input
          v-model.number="multiple"
          type="number"
          label="倍"
          @update:model-value="headUpdatePrice"

      />
    </div>
    <div class="col-2 col-md-3">
      <q-input
          v-model.number="usprice"
          type="number"
          label="美元价格"
          @update:model-value="headUpdatRMBePrice"
      />
    </div>
    <div class="col-2 col-md-3">
      <q-input
          v-model.number="rmbprice"
          type="number"
          label="人民币价格"
      />
    </div>

  </div>

</template>

<style scoped lang="scss">

</style>
