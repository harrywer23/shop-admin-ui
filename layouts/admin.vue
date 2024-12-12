<template>
  <q-layout view="hHh lpR fFf">
    <app-head></app-head>
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd">
        <q-list padding>
          <q-item v-ripple
                  :active="link === 'areas'"
                  active-class="my-menu-link"
                  clickable
                  to="/admin/areas"
                  @click="link = 'areas'"
          >
            <q-item-section avatar>
              <q-icon name="account_circle"/>
            </q-item-section>

            <q-item-section>
               地址
            </q-item-section>
          </q-item>
          <q-item v-ripple
                  :active="link === 'banner'"
                  active-class="my-menu-link"
                  clickable
                  to="/admin/banner"
                  @click="link = 'banner'"
          >
            <q-item-section avatar>
              <q-icon name="star_rate"/>
            </q-item-section>

            <q-item-section>
              banner
            </q-item-section>
          </q-item>
          <q-separator/>
          <q-item v-ripple
                  :active="link === 'category'"
                  active-class="my-menu-link"
                  clickable
                  to="/admin/category"
                  @click="link = 'category'"
          >
            <q-item-section avatar>
              <q-icon name="star_rate"/>
            </q-item-section>
            <q-item-section>
              category
            </q-item-section>
          </q-item>
          <q-separator/>
          <q-item v-ripple
                  :active="link === 'delivery'"
                  active-class="my-menu-link"
                  clickable
                  to="/admin/delivery"
                  @click="link = 'delivery'"
          >
            <q-item-section avatar>
              <q-icon name="reorder"/>
            </q-item-section>

            <q-item-section>
              物流公司
            </q-item-section>
          </q-item>
          <q-separator/>

          <q-item v-ripple
                  :active="link === 'forum'"
                  active-class="my-menu-link"
                  clickable
                  to="/admin/forum"
                  @click="link = 'forum'"
          >
            <q-item-section avatar>
              <q-icon name="send"/>
            </q-item-section>
            <q-item-section>
              论坛
            </q-item-section>
          </q-item>
          <q-item v-ripple
                  :active="link === 'message'"
                  active-class="my-menu-link"
                  clickable
                  to="/admin/message"
                  @click="link = 'message'"
          >
            <q-item-section avatar>
              <q-icon name="password"/>
            </q-item-section>

            <q-item-section>
              消息管理
            </q-item-section>
          </q-item>
          <q-item v-ripple
                  :active="link === 'notice'"
                  active-class="my-menu-link"
                  clickable
                  to="/admin/notice"
                  @click="link = 'notice'"
          >
            <q-item-section avatar>
              <q-icon name="vertical_split"/>
            </q-item-section>

            <q-item-section>
              公告管理
            </q-item-section>
          </q-item>
          <q-item
            v-ripple
            :active="link === 'order'"
            active-class="my-menu-link"
            clickable
            to="/admin/order"
            @click="link = 'order'"
          >
            <q-item-section avatar>
              <q-icon name="mail_outline"/>
            </q-item-section>

            <q-item-section>
              订单
            </q-item-section>
          </q-item>
          <q-item
              v-ripple
              :active="link === 'payment'"
              active-class="my-menu-link"
              clickable
              to="/admin/payment"
              @click="link = 'payment'"
          >
            <q-item-section avatar>
              <q-icon name="mail_outline"/>
            </q-item-section>

            <q-item-section>
              支付记录
            </q-item-section>
          </q-item>
          <q-item
              v-ripple
              :active="link === 'product'"
              active-class="my-menu-link"
              clickable
              to="/admin/product"
              @click="link = 'product'"
          >
            <q-item-section avatar>
              <q-icon name="mail_outline"/>
            </q-item-section>

            <q-item-section>
              产品
            </q-item-section>
          </q-item>
          <q-item
              v-ripple
              :active="link === 'refund'"
              active-class="my-menu-link"
              clickable
              to="/admin/refund"
              @click="link = 'refund'"
          >
            <q-item-section avatar>
              <q-icon name="mail_outline"/>
            </q-item-section>

            <q-item-section>
              退款管理
            </q-item-section>
          </q-item>
          <q-item
              v-ripple
              :active="link === 'cancel'"
              active-class="my-menu-link"
              clickable
              to="/admin/cancel-requests"
              @click="link = 'cancel'"
          >
            <q-item-section avatar>
              <q-icon name="mail_outline"/>
            </q-item-section>

            <q-item-section>
              取消订单管理
            </q-item-section>
          </q-item>
          <q-item
              v-ripple
              :active="link === 'service'"
              active-class="my-menu-link"
              clickable
              to="/admin/workOrder"
              @click="link = 'service'"
          >
            <q-item-section avatar>
              <q-icon name="mail_outline"/>
            </q-item-section>

            <q-item-section>
              工单
            </q-item-section>
          </q-item>
          <q-item
              v-ripple
              :active="link === 'transport'"
              active-class="my-menu-link"
              clickable
              to="/admin/transport"
              @click="link = 'transport'"
          >
            <q-item-section avatar>
              <q-icon name="mail_outline"/>
            </q-item-section>

            <q-item-section>
              运输方式管理
            </q-item-section>
          </q-item>
          <q-item
            v-ripple
            :active="link === 'drafts'"
            active-class="my-menu-link"
            clickable
            @click="logout"
          >
            <q-item-section avatar>
                <q-icon name="logout" />
            </q-item-section>

            <q-item-section>
              {{ $t(`user.logOut`) }}
            </q-item-section>
          </q-item>
        </q-list>

      </q-scroll-area>
      <q-img class="absolute-top" src="https://cdn.quasar.dev/img/material.png" style="height: 150px">
        <div class="absolute-bottom bg-transparent">
          <q-avatar  class="q-mb-sm" size="56px">
            <q-img
              :src="getImageUrl(user.imgUrl) || `/favicon.webp`" @error.once="e => { e.target.src = `/favicon.webp` }"
            />
          </q-avatar>
          <div class="text-weight-bold">{{ user != null ? user.nickname : '待登录' }}</div>
          <div v-if="user.email">
            {{ user.email }}
            <q-icon v-if="user.isEmail==2" name="warning" style="color: red"/>
          </div>
          <div v-if="user.isEmail==2">
            ( {{ $t(`user.emailVerification`) }})
          </div>
        </div>
      </q-img>

    </q-drawer>

    <q-page-container>
      <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
      <slot />
      <app-footer></app-footer>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHead from "~/components/AppHead.vue";

const router = useRouter()
const leftDrawerOpen = ref(false)
const link = ref('detail')

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
const user = useCookie('userInfo');
const logout = () => {
  // 清除所有 cookies
  const token = useCookie('token')
  const userInfo = useCookie('userInfo')
  const id = useCookie('id')

  token.value = null
  userInfo.value = null
  id.value = null

  // 重定向到登录页面
  router.push('/login')
}
</script>

<style scoped>
.q-drawer {
  background-color: #f5f5f5;
}

.q-item.q-router-link-active {
  color: #1976d2;
  background: #e3f2fd;
}
</style>
