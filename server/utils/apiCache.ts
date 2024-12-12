import { LRUCache } from 'lru-cache';

// 创建缓存实例
const caches = {
  tissue: new LRUCache<string, any>({
    max: 500,
    ttl: 1000 * 60 * 60 * 24, // 24小时
  }),
  album: new LRUCache<string, any>({
    max: 500,
    ttl: 1000 * 60 * 60 * 24,
  }),
  userAlbum: new LRUCache<string, any>({
    max: 500,
    ttl: 1000 * 60 * 60 * 24,
  }),
  systemUser: new LRUCache<string, any>({
    max: 500,
    ttl: 1000 * 60 * 60 * 24,
  })
};

// 导出缓存工具
export const apiCache = {
  get: (type: keyof typeof caches, key: string) => {
    const cacheKey = `${type}:${key}`;
    return caches[type].get(cacheKey);
  },

  set: (type: keyof typeof caches, key: string, value: any) => {
    const cacheKey = `${type}:${key}`;
    caches[type].set(cacheKey, value);
  },

  delete: (type: keyof typeof caches, key: string) => {
    const cacheKey = `${type}:${key}`;
    caches[type].delete(cacheKey);
  },

  clear: (type: keyof typeof caches) => {
    caches[type].clear();
  }
};

// 设置定时清理缓存
const setupCacheClearing = () => {
  const clearAllCaches = () => {
    //console.log('Clearing all caches');
    Object.keys(caches).forEach(type => {
      apiCache.clear(type as keyof typeof caches);
    });
  };

  // 计算到凌晨3点的时间
  const now = new Date();
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    3, 0, 0
  );
  const msToNight = night.getTime() - now.getTime();

  // 设置定时清理
  setTimeout(() => {
    clearAllCaches();
    // 每24小时执行一次
    setInterval(clearAllCaches, 24 * 60 * 60 * 1000);
  }, msToNight);
};

setupCacheClearing(); 
