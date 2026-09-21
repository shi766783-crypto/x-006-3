<script setup lang="ts">
import { reactive } from 'vue'
import { useFamilyStore } from '../../stores/useFamilyStore'
import type { MedicationPlan } from '../../types'

const props = defineProps<{ plan?: MedicationPlan | null }>()
const emit = defineEmits<{
  (e: 'save', data: Omit<MedicationPlan, 'id'>): void
  (e: 'close'): void
}>()

const store = useFamilyStore()

const form = reactive({
  memberId: props.plan?.memberId ?? store.state.members[0]?.id ?? '',
  medicineId: props.plan?.medicineId ?? store.state.medicines[0]?.id ?? '',
  dosage: props.plan?.dosage ?? '',
  times: props.plan?.times?.length ? [...props.plan.times] : ['08:00'],
  startDate: props.plan?.startDate ?? '',
  endDate: props.plan?.endDate ?? '',
})

function addTime() {
  form.times.push('12:00')
}

function removeTime(index: number) {
  form.times.splice(index, 1)
}

function submit() {
  if (!form.memberId || !form.medicineId) return
  if (!form.times.length) return
  emit('save', {
    memberId: form.memberId,
    medicineId: form.medicineId,
    dosage: form.dosage.trim(),
    times: [...form.times].sort(),
    startDate: form.startDate,
    endDate: form.endDate,
  })
}
</script>

<template>
  <div class="form-grid">
    <div class="form-group">
      <label class="form-label">家庭成员 *</label>
      <select v-model="form.memberId" class="input">
        <option v-for="m in store.state.members" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">药品 *</label>
      <select v-model="form.medicineId" class="input">
        <option v-for="m in store.state.medicines" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">每次剂量</label>
      <input v-model="form.dosage" class="input" placeholder="如：1粒 / 5ml" />
    </div>
    <div class="form-group">
      <label class="form-label">开始日期</label>
      <input v-model="form.startDate" type="date" class="input" />
    </div>
    <div class="form-group">
      <label class="form-label">结束日期</label>
      <input v-model="form.endDate" type="date" class="input" />
    </div>
    <div class="form-group span-2">
      <label class="form-label">每日服药时间</label>
      <div class="time-list">
        <div v-for="(time, i) in form.times" :key="time + i" class="time-row">
          <input v-model="form.times[i]" type="time" class="input" />
          <button
            type="button"
            class="btn btn-sm btn-ghost"
            :disabled="form.times.length <= 1"
            @click="removeTime(i)"
          >
            移除
          </button>
        </div>
        <button type="button" class="btn btn-sm btn-ghost" @click="addTime">+ 添加时间点</button>
      </div>
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
.time-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.time-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
