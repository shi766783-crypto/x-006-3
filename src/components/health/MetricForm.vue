<script setup lang="ts">
import { computed, reactive } from 'vue'
import { METRIC_META } from '../../constants'
import type { HealthMetric, MetricType } from '../../types'
import { toDateStr } from '../../utils/date'

const emit = defineEmits<{
  (e: 'save', data: Omit<HealthMetric, 'id'>): void
  (e: 'close'): void
}>()

const now = new Date()
const defaultDateTime = `${toDateStr(now)}T${String(now.getHours()).padStart(2, '0')}:${String(
  now.getMinutes(),
).padStart(2, '0')}`

const types = Object.keys(METRIC_META) as MetricType[]

const form = reactive({
  type: 'blood_pressure' as MetricType,
  value: '',
  measuredAt: defaultDateTime,
})

const meta = computed(() => METRIC_META[form.type])

function submit() {
  if (!form.value.trim()) return
  emit('save', {
    type: form.type,
    value: form.value.trim(),
    unit: meta.value.unit,
    timestamp: form.measuredAt ? new Date(form.measuredAt).getTime() : Date.now(),
  })
}
</script>

<template>
  <div class="form-grid">
    <div class="form-group">
      <label class="form-label">指标类型</label>
      <select v-model="form.type" class="input">
        <option v-for="t in types" :key="t" :value="t">{{ METRIC_META[t].label }}</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">数值 ({{ meta.unit }})</label>
      <input
        v-model="form.value"
        class="input"
        :placeholder="form.type === 'blood_pressure' ? '如 120/80' : '请输入数值'"
      />
    </div>
    <div class="form-group span-2">
      <label class="form-label">测量时间</label>
      <input v-model="form.measuredAt" type="datetime-local" class="input" />
    </div>
    <div class="form-group span-2">
      <span class="normal-range">正常范围参考：{{ meta.normalRange }}</span>
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
.normal-range {
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
