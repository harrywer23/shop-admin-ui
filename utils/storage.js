// utils/storage.js
// 检查是否在客户端环境
const isClient = typeof window !== 'undefined';

// 获取缓存
export function getCache(key) {
  if (!isClient) return null;

  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const data = JSON.parse(item);
    //console.log("chache json data:",data)
    return data;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
}

// 设置缓存
export function setCache(key, value) {
  if (!isClient) return;

  try {
    //console.log("chache json set:",value)

    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

// 删除缓存
export function deleteCache(key) {
  if (!isClient) return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error deleting cache:', error);
  }
}

// 清理过期缓存
export function cleanupCache() {
  if (!isClient) return;

  try {
    const now = new Date().getTime();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const item = localStorage.getItem(key);
      if (!item) continue;

      const data = JSON.parse(item);
      if (now > data.expiry) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error cleaning up cache:', error);
  }
}

// 如果在客户端，启动定期清理
if (isClient) {
  setInterval(cleanupCache, 60 * 60 * 1000); // 每小时清理一次
}
