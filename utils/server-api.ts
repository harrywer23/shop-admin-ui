import axios from 'axios'
import {API_CONSTANTS} from "~/utils/constants";

// 创建一个专门用于服务器端的 API 实例
export const serverApi = axios.create({
  baseURL: process.env.NUXT_PUBLIC_BASE_URL || API_CONSTANTS.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 添加响应拦截器
serverApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message)
    return Promise.reject(error)
  }
)
