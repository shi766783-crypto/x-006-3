<script setup lang="ts">
import { reactive } from 'vue'
import { useFamilyStore } from '../../stores/useFamilyStore'
import type { MedicalRecord } from '../../types'
import { todayStr } from '../../utils/date'
import { fileToBase64 } from '../../utils/image'

const emit = defineEmits<{
  (e: 'save', data: Omit<MedicalRecord, 'id'>): void
  (e: 'close'): void
}>()

const store = useFamilyStore()

const form = reactive({
  memberId: store.state.members[0]?.id ?? '',
  date: todayStr(),
  hospital: '',
  department: '',
  doctor: '',
  diagnosis: '',
  prescription: '',
  cost: 0,
  remark: '',
  attachments: [] as string[],
})

async function onFiles(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (!files) return
  for (const file of Array.from(files)) {
    form.attachments.push(await fileToBase64(file))
  }
  ;(event.target as HTMLInputElement).value = ''
}

function removeAttachment(index: number) {
  form.attachments.splice(index, 1)
}

function submit() {
  if (!form.memberId) return
  emit('save', {
    memberId: form.memberId,
    date: form.date,
    hospital: form.hospital.trim(),
    department: form.department.trim(),
    doctor: form.doctor.trim(),
    diagnosis: form.diagnosis.trim(),
    prescription: form.prescription.trim(),
    cost: Number(form.cost) || 0,
    remark: form.remark.trim(),
    attachments: [...form.attachments],
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
      <label class="form-label">就诊日期</label>
      <input v-model="form.date" type="date" class="input" />
    </div>
    <div class="form-group">
      <label class="form-label">医院</label>
      <input v-model="form.hospital" class="input" placeholder="医院名称" />
    </div>
    <div class="form-group">
      <label class="form-label">科室</label>
      <input v-model="form.department" class="input" placeholder="如：心内科" />
    </div>
    <div class="form-group">
      <label class="form-label">医生</label>
      <input v-model="form.doctor" class="input" />
    </div>
    <div class="form-group">
      <label class="form-label">费用 (元)</label>
      <input v-model.number="form.cost" type="number" min="0" class="input" />
    </div>
    <div class="form-group span-2">
      <label class="form-label">诊断结果</label>
      <input v-model="form.diagnosis" class="input" />
    </div>
    <div class="form-group span-2">
      <label class="form-label">处方内容</label>
      <textarea v-model="form.prescription" class="input textarea" rows="2"></textarea>
    </div>
    <div class="form-group span-2">
      <label class="form-label">备注</label>
      <textarea v-model="form.remark" class="input textarea" rows="2"></textarea>
    </div>
    <div class="form-group span-2">
      <label class="form-label">病历/检查报告照片</label>
      <div class="attach-list">
        <div v-for="(img, i) in form.attachments" :key="i" class="attach-item">
          <img :src="img" alt="" />
          <button type="button" class="attach-remove" @click="removeAttachment(i)">×</button>
        </div>
        <label class="attach-add">
          <span>＋ 上传</span>
          <input type="file" accept="image/*" multiple hidden @change="onFiles" />
        </label>
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
.attach-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.attach-item {
  position: relative;
}
.attach-item img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.attach-remove {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: var(--danger-color);
  color: #fff;
  cursor: pointer;
  line-height: 1;
}
.attach-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
