<template>
    <q-header class="bg-primary text-black" height-hint="98" >
      <q-toolbar class="bg-purple text-white shadow-2 rounded-borders">
        <q-toolbar-title>
          <q-avatar>
            <q-img src="/favicon.webp"/>
          </q-avatar>
          {{ $t('common.title') }}
        </q-toolbar-title>
        <q-space />
        <q-select
            filled
            v-model="currentLocale"
            :options="languageOptions"
            emit-value
            map-options
            dense
            outlined
            @update:model-value="handleLanguageChange"
            class="language-selector"
        >
          <template v-slot:prepend>
            <q-icon name="language" />
          </template>
        </q-select>
         <!-- 用户信息/登录按钮 -->
         <template v-if="userInfo">


          <q-btn-dropdown flat class="user-menu">
            <template v-slot:label>
              <q-avatar size="32px">
                <q-img
                  :src="getImageUrl(userInfo.imgUrl) || '/images/favicon.ico'"
                  @error="(err) => err.target.src = '/images/favicon.ico'"
                />
              </q-avatar>
              <span class="q-ml-sm">{{ userInfo.nickname }}</span>
            </template>

            <q-list>
              <q-item clickable v-close-popup to="/user">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ t('profile') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ t('logout') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
            <q-btn
            flat
            :to="'/user/orders'"
            class="q-mr-sm"
            v-tooltip="{ text: t('nav.ordersTooltip') }"
          >
            <q-icon name="receipt_long" />
            <span class="q-ml-xs">{{ t('nav.orders') }}</span>
          </q-btn>

          <q-btn
            flat
            :to="'/cart'"
            class="q-mr-sm"
            v-tooltip="{ text: t('nav.cartTooltip') }"
          >
            <q-icon name="shopping_cart" />
            <span class="q-ml-xs">{{ t('nav.cart') }}</span>
            <q-badge
              v-if="cartItemCount"
              color="red"
              floating
            >
              {{ cartItemCount }}
            </q-badge>
          </q-btn>
        </template>

        <template v-else>

          <q-btn
            flat
            :label="t('logins')"
            to="/login"
            icon="login"
            class="q-mr-sm"
          />
          <q-btn
            flat
            :label="t('register')"
            to="/register"
            icon="person_add"
          />
               <q-btn
            flat
            :to="'/user/orders'"
            class="q-mr-sm"
            v-tooltip="{ text: t('nav.ordersTooltip') }"
          >
            <q-icon name="receipt_long" />
            <span class="q-ml-xs">{{ t('nav.orders') }}</span>
          </q-btn>

          <q-btn
            flat
            :to="'/cart'"
            class="q-mr-sm"
            v-tooltip="{ text: t('nav.cartTooltip') }"
          >
            <q-icon name="shopping_cart" />
            <span class="q-ml-xs">{{ t('nav.cart') }}</span>
            <q-badge
              v-if="cartItemCount"
              color="red"
              floating
            >
              {{ cartItemCount }}
            </q-badge>
          </q-btn>

        </template>
      </q-toolbar>

      <q-tabs align="left">
        <q-route-tab to="/" :label="$t('nav.home')" />
        <q-route-tab to="/product/list?parentId=1" :label="$t('nav.anime')" />
        <q-route-tab to="/product/list?parentId=2" :label="$t('nav.games')" />
        <q-route-tab to="/product/list?parentId=3" :label="$t('nav.movies')" />
        <q-route-tab to="/product/list?parentId=4" :label="$t('nav.novels')" />
        <q-route-tab to="/product/list?parentId=5" :label="t('nav.comprehensive')" />
<q-route-tab to="/custom" :label="t('nav.custom')" />
<q-route-tab to="/forum" :label="t('nav.community')" />
        <q-route-tab to="/user" :label="$t('nav.user')" />
      </q-tabs>
      <q-banner inline-actions class="text-white bg-red">
        {{ t('common.maintenance') }}
      </q-banner>
    </q-header>


</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
const router = useRouter()
const userInfo = useCookie('userInfo');
const currentLocale = ref(locale.value);


// 语言选项
const languageOptions = [
  {
    label: 'English',
    value: 'en'
  },
  {
    label: '简体中文',
    value: 'zh-CN'
  },
  {
    label: '日本語',
    value: 'ja'
  },
  {
    label: '한국어',
    value: 'ko'
  },
  {
    label: '繁體中文',
    value: 'zh-TW'
  }
]
const cartItemCount=ref(0);
// 切换语言
const handleLanguageChange = (newLang) => {
 //console.log(newLang)
  if (!newLang) return;
  // 保存语言选择到 cookie
  const langCookie = useCookie('user-language', {
    maxAge: 60 * 60 * 24 * 365, // 一年过期
    path: '/'
  });
  langCookie.value = newLang;
  locale.value = newLang;
  currentLocale.value = newLang;
};
// 登出
const handleLogout = () => {
  const token = useCookie('token');
  const id = useCookie('id');

  token.value = null;
  id.value = null;
  userInfo.value = null;

  router.push('/login');
};
// 在组件挂载时设置初始语言
onMounted(() => {
  const langCookie = useCookie('user-language');
  if (langCookie.value) {
    handleLanguageChange(langCookie.value);
  }
});
</script>

<style scoped lang="scss">
.language-selector {
  width: 150px;
  margin-right: 16px;
}

.user-menu {
  .q-avatar {
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }
  }
}

.q-btn {
  .q-icon {
    font-size: 20px;
  }

  &:hover {
    .q-icon {
      transform: scale(1.1);
    }
  }
}
</style>
