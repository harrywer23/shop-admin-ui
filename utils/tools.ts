import pica from "pica";
import { useI18n } from 'vue-i18n'

export function tansParams(params: { [x: string]: any; }) {
    let result = ''
    for (const propName of Object.keys(params)) {
        const value = params[propName];
        const part = encodeURIComponent(propName) + "=";
        if (value !== null && value !== "" && typeof (value) !== "undefined") {
            if (typeof value === 'object') {
                for (const key of Object.keys(value)) {
                    if (value[key] !== null && value[key] !== "" && typeof (value[key]) !== 'undefined') {
                        const params = propName + '[' + key + ']';
                        const subPart = encodeURIComponent(params) + "=";
                        result += subPart + encodeURIComponent(value[key]) + "&";
                    }
                }
            } else {
                result += part + encodeURIComponent(value) + "&";
            }
        }
    }
    return result
}
export function compressIfNeeded(file:any) {
  if (file.size > 500 * 1024) {
    return compressImage(file).catch(error => {
      console.error('Compression failed', error);
      return file;
    });
  } else {
    return file;
  }
}

// 压缩图片的函数
export function compressImage(file:any) {
  //console.log("---------compressImage---------------");
  const picaInstance = pica();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let targetWidth = img.width;
        let targetHeight = img.height;
        if (img.width > 1920) {
          targetWidth = 1920;
          targetHeight = (img.height / img.width) * 1920;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        picaInstance.resize(img, canvas, {
          unsharpAmount: 80,
          unsharpRadius: 0.6,
          unsharpThreshold: 2
        })
          .then(resizedCanvas => picaInstance.toBlob(resizedCanvas, 'image/jpeg', 0.8))
          .then(blob => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          })
          .catch(error => {
            reject(error);
          });
      };
      img.onerror = () => reject(new Error('Image load error'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
}

export  function compressIfNeededBatch(files: FileList): File[] {
  const processedFiles: File[] = []; // 用于存储处理后的文件

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (file.size > 500 * 1024) {
      // 尝试压缩文件并处理可能的错误
      try {
        const compressedFile =  compressImage(file);
        processedFiles.push(compressedFile);
      } catch (error) {
        console.error('Compression failed for', file.name, error);
        // 如果压缩失败，仍然将原始文件加入列表
        processedFiles.push(file);
      }
    } else {
      // 直接添加小于等于指定大小的文件
      processedFiles.push(file);
    }
  }

  // 所有文件处理完毕后，返回处理后的文件列表
  return processedFiles;
}

export function getImageUrl(imgUrl: string | null | undefined): string {
    if (imgUrl && typeof imgUrl === 'string' && (imgUrl.startsWith('/image') ||imgUrl.startsWith('/user') ||imgUrl.startsWith('/video')  )) {
        return `${API_CONSTANTS.IMAGE_BASE_URL}${imgUrl}`;
    }
    return '/empty.webp';
}

export function getVideoUrl(url: string | null | undefined): string {
    return `${API_CONSTANTS.IMAGE_BASE_URL}${url}`;
}


export function getHeadImageUrl(imgUrl:string) {
    if (imgUrl != null && imgUrl != undefined && imgUrl != '') {
        return `${API_CONSTANTS.IMAGE_BASE_URL}`+imgUrl; // Replace with your default image URL
    }
    return `/favicon.png`;
}

// 获取当前语言的分类名称
export const getCurrentLanguageName = (translations: Translations, name: string) => {
    const { locale } = useI18n()
    const lang = locale.value;

    // 如果没有translations，返回原始名称
    if (!translations) return name;

    // 确保 translations 是一个对象
    let parsedTranslations = translations;
    if (typeof translations === 'string') {
        try {
            parsedTranslations = JSON.parse(translations);
        } catch (error) {
            console.error("Failed to parse translations:", error);
            return name;  // 如果 JSON 解析失败，返回原始名称
        }
    }

    // 根据当前语言返回对应的翻译
    switch (lang) {
        case 'en':
            return parsedTranslations.en || name;
        case 'zh-TW':
            return parsedTranslations.zhTw || name;
        case 'ja':
            return parsedTranslations.ja || name;
        case 'ko':
            return parsedTranslations.ko || name;
        default:
            return name;
    }
}
export const getLanguageName = (translations: Translations, name: string, lang: string) => {
    // 如果没有translations，返回原始名称
    if (!translations) return name;

    // 确保 translations 是一个对象
    let parsedTranslations = translations;
    if (typeof translations === 'string') {
        try {
            parsedTranslations = JSON.parse(translations);
        } catch (error) {
            console.error("Failed to parse translations:", error);
            return name;  // 如果 JSON 解析失败，返回原始名称
        }
    }

    // 根据当前语言返回对应的翻译
    switch (lang) {
        case 'en':
            return parsedTranslations.en || name;
        case 'zh-TW':
            return parsedTranslations.zhTw || name;
        case 'ja':
            return parsedTranslations.ja || name;
        case 'ko':
            return parsedTranslations.ko || name;
        default:
            return name;
    }
}
// 格式化日期时间
export function formatDateTime(datetime: string) {
    if (!datetime) return ''
    return new Date(datetime).toLocaleString()
}
