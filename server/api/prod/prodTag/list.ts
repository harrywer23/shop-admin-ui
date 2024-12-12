import { defineEventHandler } from 'h3';
import {API_CONSTANTS} from "~/utils/constants"
import { LRUCache } from 'lru-cache';
const cache =new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24,
})
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig();
  const fullUrl = `${API_CONSTANTS.BASE_URL}/prodTag/list`;
  try {

    // 使用服务端 axios 实例发起请求
    const response = await fetch(fullUrl);

    // 解析响应
    const data = await response.json();
    // 如果请求成功，返回数据
    // if (data.code === 200) {
    //    cache.set('album'+cacheKey, data);
    // }

    return data;
  } catch (error) {
    console.error('获取标签列表失败:', error)

    // 返回错误响应
    return {
      code: 500,
      msg: error instanceof Error ? error.message : '获取标签列表失败',
      data: []
    }
  }
})
