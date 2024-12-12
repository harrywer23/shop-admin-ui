import en from './i18n/locales/en'
import zhCN from './i18n/locales/zh-CN'
import zhTW from './i18n/locales/zh-TW'
import ja from './i18n/locales/ja'
import ko from './i18n/locales/ko'

export default defineI18nConfig(() => ({
  legacy: false,
  messages: {
    en,
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    ja,
    ko
  }
}))