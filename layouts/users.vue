<template>
  <q-layout view="hHh lpR fFf">
    <app-head></app-head>
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd">
        <q-list padding>
          <q-item v-ripple
                  :active="link === 'detail'"
                  active-class="my-menu-link"
                  clickable
                  to="/user"
                  @click="link = 'detail'"
          >
            <q-item-section avatar>
              <q-icon name="account_circle"/>
            </q-item-section>

            <q-item-section>
              {{ $t(`user.personalInfo`) }}
            </q-item-section>
          </q-item>
          <q-item v-ripple
                  :active="link === 'collection'"
                  active-class="my-menu-link"
                  clickable
                  to="/user/collection"
                  @click="link = 'collection'"
          >
            <q-item-section avatar>
              <q-icon name="star_rate"/>
            </q-item-section>

            <q-item-section>
              {{ $t(`user.myCollection`) }}
            </q-item-section>
          </q-item>
          <q-separator/>
          <q-item v-ripple
                  :active="link === 'address'"
                  active-class="my-menu-link"
                  clickable
                  to="/user/address"
                  @click="link = 'address'"
          >
            <q-item-section avatar>
              <q-icon name="star_rate"/>
            </q-item-section>
            <q-item-section>
              {{ $t('user.address.title') }}
            </q-item-section>
          </q-item>
          <q-separator/>
          <q-item v-ripple
                  :active="link === 'forum'"
                  active-class="my-menu-link"
                  clickable
                  to="/user/forum/topic"
                  @click="link = 'forum'"
          >
            <q-item-section avatar>
              <q-icon name="forum"/>
            </q-item-section>

            <q-item-section>
              {{ $t('user.forum.myTopics') }}
            </q-item-section>
          </q-item>
          <q-separator/>
          <q-item v-ripple
                  :active="link === 'order'"
                  active-class="my-menu-link"
                  clickable
                  to="/user/orders"
                  @click="link = 'order'"
          >
            <q-item-section avatar>
              <q-icon name="reorder"/>
            </q-item-section>

            <q-item-section>
              {{ $t('user.order.title') }}
            </q-item-section>
          </q-item>

          <q-item v-ripple
                  :active="link === 'presell'"
                  active-class="my-menu-link"
                  clickable
                  to="/user/presell"
                  @click="link = 'presell'"
          >
            <q-item-section avatar>
              <q-icon name="schedule"/>
            </q-item-section>

            <q-item-section>
              {{ $t('presell.orders.title') }}
            </q-item-section>
          </q-item>

          <q-item v-ripple
                  :active="link === 'custom'"
                  active-class="my-menu-link"
                  clickable
                  to="/user/custom"
                  @click="link = 'custom'"
          >
            <q-item-section avatar>
              <q-icon name="design_services"/>
            </q-item-section>

            <q-item-section>
              {{ $t('custom.orders.title') }}
            </q-item-section>
          </q-item>
          <q-separator/>

          <q-item v-ripple
                  :active="link === 'invite'"
                  active-class="my-menu-link"
                  clickable
                  to="/user/system/invite"
                  @click="link = 'invite'"
          >
            <q-item-section avatar>
              <q-icon name="send"/>
            </q-item-section>
            <q-item-section>
              {{ $t(`user.myInvitation`) }}
            </q-item-section>
          </q-item>
          <q-item v-ripple
                  :active="link === 'password'"
                  active-class="my-menu-link"
                  clickable
                  to="/user/system/password"
                  @click="link = 'password'"
          >
            <q-item-section avatar>
              <q-icon name="password"/>
            </q-item-section>

            <q-item-section>
              {{ $t(`user.resetPassword`) }}
            </q-item-section>
          </q-item>
          <q-item v-ripple
                  :active="link === 'buyLog'"
                  active-class="my-menu-link"
                  clickable
                  to="/user/system/buyLog"
                  @click="link = 'buyLog'"
          >
            <q-item-section avatar>
              <q-icon name="vertical_split"/>
            </q-item-section>

            <q-item-section>
              {{ $t(`user.consumptionRecord`) }}
            </q-item-section>
          </q-item>
          <q-item
            v-ripple
            :active="link === 'service'"
            active-class="my-menu-link"
            clickable
            to="/user/system/service"
            @click="link = 'service'"
          >
            <q-item-section avatar>
              <q-icon name="mail_outline"/>
            </q-item-section>

            <q-item-section>
              {{ $t(`user.customerService`) }}
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
import { useI18n } from 'vue-i18n'

const router = useRouter()
const leftDrawerOpen = ref(false)
const link = ref('detail')
const { t } = useI18n()

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
