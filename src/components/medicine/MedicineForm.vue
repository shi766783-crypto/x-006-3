<script setup lang="ts">
import { reactive } from 'vue'
import { MEDICINE_CATEGORIES } from '../../constants'
import type { Medicine, MedicineCategory } from '../../types'
import ImageUpload from '../ui/ImageUpload.vue'

const props = defineProps<{ medicine?: Medicine | null }>()
const emit = defineEmits<{
  (e: 'save', data: Omit<Medicine, 'id'>): void
  (e: 'close'): void
}>()

const categories = Object.entries(MEDICINE_CATEGORIES) as [MedicineCategory, string][]

const form = reactive({
  name: props.medicine?.name ?? '',
  category: props.medicine?.category ?? ('cold' as MedicineCategory),
  spec: props.medicine?.spec ?? '',
  quantity: props.medicine?.quantity ?? 0,
  unit: props.medicine?.unit ?? '盒',
  expiryDate: props.medicine?.expiryDate ?? '',
  location: props.medicine?.location ?? '',
  usage: props.medicine?.usage ?? '',
  remark: props.medicine?.remark ?? '',
  photo: props.medicine?.photo ?? '',
})

function submit() {
  if (!form.name.trim()) return
  emit('save', {
    name: form.name.trim(),
    category: form.category,
    spec: form.spec.trim(),
    quantity: Number(form.quantity) || 0,
    unit: form.unit.trim(),
    expiryDate: form.expiryDate,
    location: form.location.trim(),
    usage: form.usage.trim(),
    remark: form.remark.trim(),
    photo: form.photo || undefined,
  })
}
</script>

<template>
  <div class="form-grid">
    <div class="form-group">
      <label class="form-label">药品名称 *</label>
      <input v-model="form.name" class="input" placeholder="如：布洛芬缓释胶囊" />
    </div>
    <div class="form-group">
      <label class="form-label">类别</label>
      <select v-model="form.category" class="input">
        <option v-for="[key, label] in categories" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">规格</label>
      <input v-model="form.spec" class="input" placeholder="如：0.3g×20粒" />
    </div>
    <div class="form-group">
      <label class="form-label">有效期至 *</label>
      <input v-model="form.expiryDate" type="date" class="input" />
    </div>
    <div class="form-group">
      <label class="form-label">数量</label>
      <input v-model.number="form.quantity" type="number" min="0" class="input" />
    </div>
    <div class="form-group">
      <label class="form-label">单位</label>
      <input v-model="form.unit" class="input" placeholder="盒/瓶/板" />
    </div>
    <div class="form-group">
      <label class="form-label">存放位置</label>
      <input v-model="form.location" class="input" placeholder="如：客厅药箱" />
    </div>
    <div class="form-group">
      <label class="form-label">药品照片</label>
      <ImageUpload v-model="form.photo" label="上传照片" />
    </div>
    <div class="form-group span-2">
      <label class="form-label">用法用量</label>
      <input v-model="form.usage" class="input" placeholder="如：一次1粒，一日2次" />
    </div>
    <div class="form-group span-2">
      <label class="form-label">备注</label>
      <textarea v-model="form.remark" class="input textarea" rows="2"></textarea>
    </div>
  </div>
  <div class="form-actions">
    <button type="button" class="btn btn-ghost" @click="emit('close')">取消</button>
    <button type="button" class="btn btn-primary" @click="submit">保存</button>
  </div>
</template>

<style scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
</style>
