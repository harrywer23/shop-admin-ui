<script lang="ts" setup>
definePageMeta({
  layout: 'users',
  middleware: 'auth'
});
import {reactive, ref, toRefs} from "vue";
import { useI18n } from 'vue-i18n'
import {tansParams} from "~/utils/tools";

const token = useCookie('token');
const { t } = useI18n()

interface ServiceItem {
  title: string;
  wordType: number;
  status: number;
  createTime: string;
  explanation: string;
  reply: string | null;
}

const total = ref(0);
const maxPage = ref(0);

const current=ref(1)
const serviceList = ref<ServiceItem[]>([]);
const queryData = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 20,
  }
});
const {queryParams} = toRefs(queryData);

async function getList(page: number) {
  queryParams.value.pageNum = page;
  try {
    const response = await api.get('/admin/workOrder/list?' + tansParams(queryParams.value), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.data.code == 200) {
      total.value = response.data.total;
      maxPage.value=  total.value/queryParams.value.pageSize+1;
      serviceList.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching images:', error);
  }
}
getList(1)


</script>

<template>
  <div>
    <router-link to="/user/system/addService">
      <q-btn color="primary" :label="t('service.add')"/>
    </router-link>
  </div>
  <div class="q-pa-md" style="max-width: 800px">
    <q-list bordered padding>
      <q-item-label header>{{ t('service.list') }}（{{total}}）</q-item-label>
      <div v-for="(service,index) in serviceList"  :key="index">
        <q-item>
          <q-item-section>
            <q-item-label>{{ service.title }}</q-item-label>
            <q-item-label v-if="service.wordType ==1" caption>{{ t('service.type.bug') }}</q-item-label>
            <q-item-label v-if="service.wordType ==2" caption>{{ t('service.type.complaint') }}</q-item-label>
            <q-item-label v-if="service.wordType ==3" caption>{{ t('service.type.suggestion') }}</q-item-label>
            <q-item-label v-if="service.wordType ==0" caption>{{ t('service.type.other') }}</q-item-label>
            <q-item-label v-if="service.status ==1" caption>{{ t('service.status.pending') }}</q-item-label>
            <q-item-label v-if="service.status ==2" caption>{{ t('service.status.processed') }}</q-item-label>
            <q-item-label v-if="service.status ==3" caption>{{ t('service.status.final') }}</q-item-label>
            <q-item-label v-if="service.status ==4" caption>{{ t('service.status.rejected') }}</q-item-label>
            <q-item-label caption>{{ service.createTime }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ service.explanation }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label caption>{{ service.reply ==null? t('service.pendingReply'):service.reply}}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator inset="item" spaced/>
      </div>
    </q-list>
    <div class="q-pa-lg flex flex-center">
      <q-pagination
          v-model="current"
          :max="maxPage"
          max-pages="6"
          direction-links
          @update:modelValue="getList(current)"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
