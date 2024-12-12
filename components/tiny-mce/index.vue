<template>
  <div class="components-tiny-mce">
    <div class="tinymce-container" :class="{ 'tox-fullscreen': toxFullscreen }">
      <Editor
        :id="props.id"
        :init="init"
        :value="props.modelValue"
        @input="handleEditorInput"
        api-key="z0s2wjpp6mrvdagfhnkghbi1bcsszmg52v1p3lvh69ljlygc"
        :disabled="false"
        :inline="false"
        :tag-name="'div'"
        :plugins="plugins"
        :toolbar="toolbar"
      />
      <!-- 上传按钮区域 -->
      <div class="add-or-upload">
        <input
          ref="fileInput"
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp"
          style="display: none"
          @change="handleFileChange"
        />
        <q-btn
          color="primary"
          icon="add_photo_alternate"
          :label="'上传图片'"
          size="sm"
          @click="triggerFileInput"
        >
          <q-tooltip>支持 jpg/png/gif/webp 格式，单个文件不超过2MB</q-tooltip>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import Editor from '@tinymce/tinymce-vue'
import { useQuasar } from 'quasar'
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { api } from '~/utils/axios'

const config = useRuntimeConfig()
const IMAGE_BASE_URL = config.public.imageBaseUrl
const $q = useQuasar()
const fileInput = ref(null)
const toxFullscreen = ref(false)

// Props 定义
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `vue-tinymce-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  },
  height: {
    type: [Number, String],
    default: 400
  }
})

const emit = defineEmits(['update:modelValue'])

// 编辑器配置
const plugins = 'preview anchor autolink codesample emoticons image link lists media searchreplace table visualblocks pagebreak insertdatetime fullscreen'
const toolbar = 'searchreplace bold italic underline strikethrough alignleft aligncenter alignright outdent indent blockquote undo redo removeformat subscript superscript code codesample hr numlist link image preview anchor pagebreak insertdatetime media table emoticons forecolor backcolor fullscreen'

// 编辑器初始化配置
const init = {
  height: props.height,
  menubar: true,
  plugins,
  toolbar,
  toolbar_mode: 'wrap',
  content_style: `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      padding: 20px;
    }
  `,
  language: computed(() => process.client ? localStorage.getItem('b2cLang') || 'zh_CN' : 'zh_CN'),

  // 初始化回调
  init_instance_callback: (editor) => {
    if (props.modelValue) {
      editor.setContent(props.modelValue)
    }

    // 监听内容变化
    editor.on('Change KeyUp SetContent', () => {
      emit('update:modelValue', editor.getContent())
    })
  },

  // 设置处理
  setup: (editor) => {
    if (process.client) {
      const uploadButtons = document.querySelectorAll('.components-tiny-mce .tinymce-container .add-or-upload')
      uploadButtons.forEach(btn => btn.style.zIndex = 10)

      editor.on('FullscreenStateChanged', (e) => {
        toxFullscreen.value = e.state
        handleFullScreenStateChange(e.state)
      })
    }
  }
}

// 处理编辑器输入
const handleEditorInput = (value) => {
  emit('update:modelValue', value)
}

// 处理文件上传
// const handleFileChange = async (event) => {
//   const file = event.target.files[0]
//   if (!file) return

//   // 文件验证
//   if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
//     $q.notify({
//       type: 'negative',
//       message: '仅支持 jpg/png/gif/webp 格式图片'
//     })
//     return
//   }

//   if (file.size > 2 * 1024 * 1024) {
//     $q.notify({
//       type: 'negative',
//       message: '图片大小不能超过 2MB'
//     })
//     return
//   }

//   try {
//     $q.loading.show({ message: '正在上传图片...' })

//     const formData = new FormData()
//     formData.append('file', file)

//     const response = await api.post('/common/uploadImage', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     })

//     if (response.data.code === 200) {
//       const fullImageUrl = `${IMAGE_BASE_URL}${response.data.data.sourceUrl}`
//       const editor = window.tinymce.get(props.id)

//       if (editor) {
//         editor.execCommand('mceInsertContent', false, `<img src="${fullImageUrl}" alt="" />`)
//         editor.fire('change')
//       }

//       $q.notify({
//         type: 'positive',
//         message: '图片上传成功'
//       })
//     }
//   } catch (error) {
//     console.error('上传失败:', error)
//     $q.notify({
//       type: 'negative',
//       message: '图片上传失败'
//     })
//   } finally {
//     $q.loading.hide()
//     event.target.value = ''
//   }
// }
// 处理文件上传
const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 文件验证
  if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
    $q.notify({
      type: 'negative',
      message: '仅支持 jpg/png/gif/webp 格式图片'
    })
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    $q.notify({
      type: 'negative',
      message: '图片大小不能超过 2MB'
    })
    return
  }

  try {
    $q.loading.show({ message: '正在上传图片...' })

    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/common/uploadImage', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (response.data.code === 200) {
      const fullImageUrl = `${IMAGE_BASE_URL}${response.data.data.sourceUrl}`

      // 获取当前活动的编辑器实例
      const editor = window.tinymce.activeEditor || window.tinymce.get(props.id)

      if (editor) {
        // 插入图片到编辑器
        editor.insertContent(`<img src="${fullImageUrl}" alt="" style="max-width:100%;" />`)

        // 确保触发内容变化事件
        editor.fire('change')
        editor.fire('input')

        // 更新 v-model 绑定的值
        emit('update:modelValue', editor.getContent())

        $q.notify({
          type: 'positive',
          message: '图片上传成功'
        })
      } else {
        throw new Error('编辑器实例未找到')
      }
    } else {
      throw new Error(response.data.msg || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '图片上传失败'
    })
  } finally {
    $q.loading.hide()
    event.target.value = ''
  }
}
// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理全屏状态变化
const handleFullScreenStateChange = (isFullscreen) => {
  if (!process.client) return

  const uploadButtons = document.querySelectorAll('.components-tiny-mce .tinymce-container .add-or-upload')
  uploadButtons.forEach(btn => {
    btn.style.zIndex = isFullscreen ? '0' : '10'
  })
}

// 清理
onBeforeUnmount(() => {
  const editor = window.tinymce?.get(props.id)
  if (editor) {
    editor.destroy()
  }
})
</script>

<style lang="scss">
.components-tiny-mce {
  .tox-fullscreen .add-or-upload {
    z-index: 9999 !important;
    position: fixed !important;
    right: 10px;
    top: 10px;
  }

  .tinymce-container {
    position: relative;

    .add-or-upload {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 10;
    }
  }
}

.tox-tinymce-aux {
  z-index: 9999 !important;
}
</style>
