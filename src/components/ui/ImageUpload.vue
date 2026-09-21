<script setup lang="ts">
import { fileToBase64 } from '../../utils/image'

const props = defineProps<{ modelValue?: string; label?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

async function onChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  emit('update:modelValue', await fileToBase64(file))
}

function clear() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="image-upload">
    <div v-if="props.modelValue" class="preview">
      <img :src="props.modelValue" alt="预览" />
      <button type="button" class="remove" @click="clear">×</button>
    </div>
    <label v-else class="trigger">
      <span>📷 {{ props.label || '上传图片' }}</span>
      <input type="file" accept="image/*" hidden @change="onChange" />
    </label>
  </div>
</template>

<style scoped>
.image-upload {
  display: inline-block;
}
.trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  transition: border-color 0.2s;
}
.trigger:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}
.preview {
  position: relative;
  width: 80px;
  height: 80px;
}
.preview img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.remove {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: var(--danger-color);
  color: #fff;
  cursor: pointer;
  line-height: 1;
}
</style>
