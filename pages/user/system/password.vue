<script lang="ts" setup>
definePageMeta({
  layout: 'users',
  middleware: 'auth'
});
import { Dialog, useQuasar } from 'quasar';
import {ref} from "vue";

const token = useCookie('token');

const $q = useQuasar()
const oldPassword = ref(null)
const newPassword = ref(null)
const newPassword2 = ref(null)


async function onSubmit() {
  if(newPassword.value != newPassword2.value){
    Dialog.create({
      title: '错误',
      message: '2次密码输入不一致.',
      ok: {
        push: true
      },
    });
    return;
  }
  const response = await api.post("/admin/systemUser/updatePassworld", JSON.stringify({
    oldPassword: oldPassword.value,
    newPassword: newPassword.value,
  }),{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = response.data;
  if (data.code == 200) {
    Dialog.create({
      title: '通知',
      message: '修改密码成功.',
      ok: {
        push: true
      },
    });
  } else {
    Dialog.create({
      title: '错误',
      message: '修改密码失败.',
      ok: {
        push: true
      },
    });
  }
}
</script>

<template>

  <div class="q-pa-md" style="max-width: 400px">

    <q-form
        class="q-gutter-md"
        @submit="onSubmit"
    >
      <q-input
          v-model="oldPassword"
          :rules="[ val => val && val.length > 0 || 'Please type something']"
          filled
          type="password"
          hint="旧密码"
          label="请输入旧密码 *"
      />
      <q-input
          v-model="newPassword"
          :rules="[ val => val && val.length > 0 || 'Please type something']"
          filled
          type="password"
          hint="新密码"
          label="请输入新密码 *"
      />
      <q-input
          v-model="newPassword2"
          :rules="[ val => val && val.length > 0 || 'Please type something']"
          filled
          type="password"
          hint="新密码"
          label="请重复新密码 *"
      />

      <div>
        <q-btn color="primary" label="重置密码" type="submit"/>
      </div>
    </q-form>

  </div>
</template>

<style scoped>

</style>
