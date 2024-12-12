import { useI18n } from 'vue-i18n';
import { ref, onMounted } from 'vue';

interface Translations {
  zh: string;
  en: string;
  zhTw: string;
  ja: string;
  ko: string;
}

export function useLanguage() {
  const { locale } = useI18n();
  const currentLocale = ref(locale.value);

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'zh-CN', label: '简体中文' },
    { value: 'zh-TW', label: '繁體中文' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' }
  ];

  /**
   * 获取当前语言的文本内容
   * @param translations 多语言翻译对象
   * @param defaultText 默认文本
   * @returns 当前语言对应的文本，如果没有则返回默认文本
   */
  const getLocalizedText = (translations: Translations | null | undefined, defaultText: string): string => {
    // 如果没有翻译对象或为空对象，返回默认文本
    if (!translations || Object.keys(translations).length === 0) {
      return defaultText;
    }

    // 获取当前语言
    const currentLang = useCookie('user-language').value || 'zh-CN';

    // 根据语言获取对应的翻译
    switch (currentLang) {
      case 'en':
        return translations.en || translations.zh || defaultText;
      case 'zh-TW':
        return translations.zhTw || translations.zh || defaultText;
      case 'ja':
        return translations.ja || translations.zh || defaultText;
      case 'ko':
        return translations.ko || translations.zh || defaultText;
      default:
        // 默认返回中文或默认文本
        return translations.zh || defaultText;
    }
  };

  const setLanguage = (lang: string) => {
    if (!lang) return;
    
    const langCookie = useCookie('user-language', {
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax'
    });

    langCookie.value = lang;
    locale.value = lang;
    currentLocale.value = lang;
  };

  const initLanguage = () => {
    if (process.client) {
      const langCookie = useCookie('user-language');
      if (langCookie.value) {
        setLanguage(langCookie.value);
      } else {
        const browserLang = navigator.language;
        const availableLocales = languageOptions.map(opt => opt.value);
        const defaultLang = 'zh-CN';
        
        const lang = availableLocales.includes(browserLang) ? browserLang : defaultLang;
        setLanguage(lang);
      }
    }
  };

  onMounted(() => {
    initLanguage();
  });

  return {
    currentLocale,
    languageOptions,
    setLanguage,
    getLocalizedText
  };
}

// 导出类型定义，方便其他文件使用
export type { Translations }; 