<script setup lang="ts">
import { computed } from 'vue'
import { MEDICINE_CATEGORIES } from '../../constants'
import type { Medicine } from '../../types'
import { daysUntil, formatDate } from '../../utils/date'

const props = defineProps<{ medicine: Medicine }>()
const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const expiryDays = computed(() => daysUntil(props.medicine.expiryDate))

const status = computed<'expired' | 'expiring' | 'normal'>(() => {
  if (expiryDays.value < 0) return 'expired'
  if (expiryDays.value <= 30) return 'expiring'
  return 'normal'
})

const statusText = computed(() => {
  if (status.value === 'expired') return `已过期 ${Math.abs(expiryDays.value)} 天`
  if (status.value === 'expiring') return `临期 ${expiryDays.value} 天`
  return `有效期至 ${formatDate(props.medicine.expiryDate)}`
})
</script>

<template>
  <div class="medicine-card card">
    <div class="medicine-top">
      <div class="medicine-name">
        <span class="medicine-photo">{{ medicine.photo ? '💊' : '💊' }}</span>
        {{ medicine.name }}
      </div>
      <span class="tag" :class="`tag-${status}`">{{ statusText }}</span>
    </div>
    <div class="medicine-meta">
      <span class="pill">{{ MEDICINE_CATEGORIES[medicine.category] }}</span>
      <span>规格 {{ medicine.spec || '—' }}</span>
      <span>数量 {{ medicine.quantity }}{{ medicine.unit }}</span>
      <span>位置 {{ medicine.location || '—' }}</span>
    </div>
    <div v-if="medicine.usage" class="medicine-usage">用法：{{ medicine.usage }}</div>
    <div class="medicine-actions">
      <button type="button" class="btn btn-sm btn-ghost" @click="emit('edit')">编辑</button>
      <button type="button" class="btn btn-sm btn-danger-ghost" @click="emit('delete')">删除</button>
    </div>
  </div>
</template>

<style scoped>
.medicine-card {
  margin-bottom: 12px;
}
.medicine-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.medicine-name {
  font-weight: 700;
  font-size: 16px;
  color: var(--text-primary);
}
.medicine-photo {
  margin-right: 4px;
}
.medicine-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}
.pill {
  background: var(--info-color);
  color: #fff;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 12px;
}
.medicine-usage {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}
.medicine-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
.tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}
.tag-expired {
  background: #fdecea;
  color: var(--danger-color);
}
.tag-expiring {
  background: #fef5e7;
  color: var(--warning-color);
}
.tag-normal {
  background: #eafaf1;
  color: var(--success-color);
}
</style>
