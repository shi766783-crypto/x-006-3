<script setup lang="ts">
import type { TodayDose } from '../../types'

defineProps<{ dose: TodayDose }>()
const emit = defineEmits<{ (e: 'mark', status: 'taken' | 'skipped'): void }>()
</script>

<template>
  <div class="dose-item" :class="`dose-${dose.status}`">
    <div class="dose-time">{{ dose.time }}</div>
    <div class="dose-info">
      <div class="dose-title">
        {{ dose.memberName }} · {{ dose.medicineName }}
      </div>
      <div class="dose-dosage">剂量：{{ dose.dosage || '—' }}</div>
    </div>
    <div class="dose-actions">
      <template v-if="dose.status === 'pending'">
        <button type="button" class="btn btn-sm btn-primary" @click="emit('mark', 'taken')">已服用</button>
        <button type="button" class="btn btn-sm btn-ghost" @click="emit('mark', 'skipped')">跳过</button>
      </template>
      <span v-else class="dose-status" :class="`status-${dose.status}`">
        {{ dose.status === 'taken' ? '✓ 已服用' : '已跳过' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.dose-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 10px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  margin-bottom: 8px;
}
.dose-taken {
  opacity: 0.7;
}
.dose-time {
  font-weight: 700;
  font-size: 18px;
  color: var(--text-primary);
  min-width: 52px;
}
.dose-info {
  flex: 1;
}
.dose-title {
  font-weight: 600;
  color: var(--text-primary);
}
.dose-dosage {
  font-size: 13px;
  color: var(--text-secondary);
}
.dose-actions {
  display: flex;
  gap: 8px;
}
.dose-status {
  font-size: 14px;
  font-weight: 600;
}
.status-taken {
  color: var(--success-color);
}
.status-skipped {
  color: var(--text-secondary);
}
</style>
