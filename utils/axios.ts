import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import {Cookies} from "quasar";
import { Notify } from 'quasar'
import {API_CONSTANTS} from "~/utils/constants";

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below ƒ(which runs individually
// for each client)
const api = axios.create({
  // baseURL: 'https://admin.51x.uk'
  baseURL: API_CONSTANTS.BASE_URL
});

// 添加请求拦截器
api.interceptors.request.use(function (config) {
  config.headers['change'] = 'pc'; // 自定义头信息

  // 获取当前语言
  const currentLang = useCookie('user-language');
  // 添加语言参数到请求头
  config.headers['Accept-Language'] = currentLang.value || 'zh-CN';
  config.headers['Landing-Type'] = 'system';

  // 从本地存储或其他地方获取token
  const token = useCookie('token');

  // 如果token存在，则添加到请求头部
  if (token) {
    config.headers.Authorization = `Bearer ${token.value}`;
  }else{
    const url=config.url??""
    if (url.startsWith('/admin')) {
      // 重定向到登录页面
      window.location.href = '/login';
    }
  }

  // 如果是GET请求，添加语言参数到URL
  if (config.method?.toLowerCase() === 'get') {
    config.params = {
      ...config.params,
      lang: currentLang.value || 'zh-CN'
    };
  }

  // 如果是POST请求
  if (config.method?.toLowerCase() === 'post') {
    // 确保不会覆盖已存在的Content-Type
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    // 如果是JSON请求，将语言参数添加到请求体
    if (config.headers['Content-Type'] === 'application/json') {
      // config.data = {
      //   ...config.data
      // };
    }
  }

  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
api.interceptors.response.use(
  (response) => {
    // 检查是否是 admin 相关接口
    const isAdminApi = response.config.url?.startsWith('/admin');

    // 如果是 admin 接口且返回 401
    if (isAdminApi && response.data.code === 401) {
      // 删除所有相关 cookie
      Cookies.remove('token');
      Cookies.remove('id');
      Cookies.remove('userInfo');

      // 显示提示
      Notify.create({
        type: 'warning',
        message: '请先登录',
        position: 'top',
        timeout: 1500
      });

      // 延迟跳转，让用户看到提示
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);

      // 返回错误，中断后续处理
      return Promise.reject(new Error('Unauthorized'));
    }

    return response;
  },
  (error) => {
    // 处理请求错误
    if (error.response) {
      // 检查是否是 admin 相关接口
      const isAdminApi = error.config.url?.startsWith('/admin');

      // 如果是 admin 接口且返回 401
      if (isAdminApi && (error.response.status === 401 || error.response.data?.code === 401)) {
        // 删除所有相关 cookie
        Cookies.remove('token');
        Cookies.remove('id');
        Cookies.remove('userInfo');

        // 显示提示
        Notify.create({
          type: 'warning',
          message: '请先登录',
          position: 'top',
          timeout: 1500
        });

        // 延迟跳转，让用户看到提示
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 检查是否是 admin 相关接口
    const isAdminApi = config.url?.startsWith('/admin');

    // 从 cookie 获取 token
    const token = useCookie('token').value;

    // 如果是 admin 接口且没有 token
    if (isAdminApi && !token) {
      // 显示提示
      Notify.create({
        type: 'warning',
        message: '请先登录',
        position: 'top',
        timeout: 1500
      });

      // 延迟跳转，让用户看到提示
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);

      // 返回错误，中断请求
      return Promise.reject(new Error('No token'));
    }

    // 如果有 token，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
