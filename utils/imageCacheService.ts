import { openDB, IDBPDatabase } from 'idb';

interface CachedImage {
  url: string;
  data: string;
  expirationTimestamp: number;
}

const dbName = 'image-cache';
const dbVersion = 1;
const storeName = 'images';
const expirationDays = 7; // 缓存过期时间（天）

// 打开数据库
async function openDatabase(): Promise<IDBPDatabase> {
  return openDB(dbName, dbVersion, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'url' });
      }
    }
  });
}

// 从缓存获取图片
export async function getImageFromCache(url: string): Promise<string | null> {
  if (process.server) return null;

  try {
    const db = await openDatabase();
    const record: CachedImage | undefined = await db.get(storeName, url);

    if (record && !isRecordExpired(record)) {
      return record.data;
    } else {
      if (record) {
        await db.delete(storeName, url);
      }
      return null;
    }
  } catch (error) {
    console.error('Error getting image from cache:', error);
    return null;
  }
}

// 缓存图片
export async function cacheImage(url: string): Promise<string> {
  if (process.server) return url;

  try {
    // 先检查缓存
    const cachedImage = await getImageFromCache(url);
    if (cachedImage) return cachedImage;

    // 如果没有缓存，则获取图片并缓存
    const response = await fetch(url);
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);

    const db = await openDatabase();
    const expirationTimestamp = Date.now() + expirationDays * 24 * 60 * 60 * 1000;

    await db.put(storeName, {
      url,
      data: base64,
      expirationTimestamp
    });

    return base64;
  } catch (error) {
    console.error('Error caching image:', error);
    return url;
  }
}

// Blob 转 Base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// 检查记录是否过期
function isRecordExpired(record: CachedImage): boolean {
  return Date.now() > record.expirationTimestamp;
}

// 清理过期记录
export async function cleanupExpiredRecords(): Promise<void> {
  if (process.server) return;

  try {
    const db = await openDatabase();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    let cursor = await store.openCursor();

    while (cursor) {
      if (isRecordExpired(cursor.value)) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }

    await tx.done;
  } catch (error) {
    console.error('Error cleaning up expired records:', error);
  }
}

// 在组件中使用的组合式函数
export function useImageCache() {
  if (process.client) {
    onMounted(() => {
      // 启动定期清理
      const cleanup = setInterval(cleanupExpiredRecords, 24 * 60 * 60 * 1000);

      onBeforeUnmount(() => {
        clearInterval(cleanup);
      });
    });
  }

  return {
    getImageFromCache,
    cacheImage
  };
}
