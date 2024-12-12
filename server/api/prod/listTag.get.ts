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
  // const cacheKey = `listTag2:${JSON.stringify(query)}`;
  // const cachedData = cache.get('prod2:'+cacheKey);
  // if (cachedData) {
  //   return cachedData;
  // }
  try {
    // 构建完整的 URL
    const fullUrl = `${API_CONSTANTS.BASE_URL}/prod/listByTagId?`+tansParams(query);
    // 在处理函数内执行 fetch
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    // 解析响应
    const data = await response.json();
    // if (data.code === 200) {
    //    cache.set('prod2:'+cacheKey, data);
    // }

    return data;

  } catch (error) {
    console.error('Error fetching album info:', error);
    return {
      code: 500,
      msg: '获取专辑信息失败',
      data: null
    };
  }
});
