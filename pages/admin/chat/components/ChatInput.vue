<template>
  <div class="chat-input">
    <q-input
      v-model="inputValue"
      outlined
      dense
      :placeholder="hasContact ? t('chat.inputPlaceholder') : t('chat.selectContactFirst')"
      :disable="!hasContact"
      @keyup.enter="handleSend"
    >
      <template v-slot:before>
        <q-btn
          round
          dense
          flat
          icon="mood"
          :disable="!hasContact"
          @click="toggleEmojiPicker"
        >
          <q-tooltip>{{ t('chat.emoji') }}</q-tooltip>
        </q-btn>
      </template>
      <template v-slot:append>
        <q-btn
          round
          dense
          flat
          icon="send"
          :disable="!hasContact"
          @click="handleSend"
        >
          <q-tooltip>{{ t('chat.send') }}</q-tooltip>
        </q-btn>
      </template>
    </q-input>
    
    <div v-if="showEmojiPicker" class="emoji-picker">
      <div class="emoji-container">
        <span
          v-for="emoji in emojis"
          :key="emoji"
          class="emoji-item"
          @click="insertEmoji(emoji)"
        >
          {{ emoji }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const inputValue = ref('')
const showEmojiPicker = ref(false)

const emojis = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', 
  '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐',
  '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕', '💞', '💓', '💗'
]

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  currentContact: {
    type: Object as PropType<Contact | null>,
    default: null
  }
})

// 计算是否有选中的联系人
const hasContact = computed(() => !!props.currentContact)

const emit = defineEmits(['update:modelValue', 'send'])

watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue
})

watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue)
})

const handleSend = () => {
  if (!inputValue.value.trim()) return
  emit('send')
}

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const insertEmoji = (emoji) => {
  inputValue.value += emoji
  showEmojiPicker.value = false
}
</script>

<style lang="scss" scoped>
.chat-input {
  position: relative;
  padding: 10px;
  background: white;
  border-top: 1px solid #ddd;
  
  .emoji-picker {
    position: absolute;
    bottom: 100%;
    left: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 5px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    
    .emoji-container {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 5px;
      max-height: 200px;
      overflow-y: auto;
      
      .emoji-item {
        cursor: pointer;
        padding: 5px;
        text-align: center;
        transition: background-color 0.2s;
        border-radius: 4px;
        
        &:hover {
          background-color: #f5f5f5;
        }
      }
    }
  }
}
</style> 