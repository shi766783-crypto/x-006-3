<script setup lang="ts">
import { reactive } from 'vue'
import { BLOOD_TYPE_OPTIONS, RELATION_OPTIONS } from '../../constants'
import type { FamilyMember } from '../../types'
import ImageUpload from '../ui/ImageUpload.vue'

const props = defineProps<{ member?: FamilyMember | null }>()
const emit = defineEmits<{
  (e: 'save', data: Omit<FamilyMember, 'id' | 'metrics'>): void
  (e: 'close'): void
}>()

const form = reactive({
  name: props.member?.name ?? '',
  relation: props.member?.relation ?? RELATION_OPTIONS[0],
  dob: props.member?.dob ?? '',
  bloodType: props.member?.bloodType ?? BLOOD_TYPE_OPTIONS[0],
  height: props.member?.height ?? 0,
  weight: props.member?.weight ?? 0,
  allergies: props.member?.allergies ?? '',
  chronicDiseases: props.member?.chronicDiseases ?? '',
  emergencyContact: props.member?.emergencyContact ?? '',
  avatar: props.member?.avatar ?? '',
})

function submit() {
  if (!form.name.trim()) return
  emit('save', {
    name: form.name.trim(),
    relation: form.relation,
    dob: form.dob,
    bloodType: form.bloodType,
    height: Number(form.height) || 0,
    weight: Number(form.weight) || 0,
    allergies: form.allergies.trim(),
    chronicDiseases: form.chronicDiseases.trim(),
    emergencyContact: form.emergencyContact.trim(),
    avatar: form.avatar || undefined,
  })
}
</script>

<template>
  <div class="form-grid">
    <div class="form-group">
      <label class="form-label">姓名 *</label>
      <input v-model="form.name" class="input" placeholder="请输入姓名" />
    </div>
    <div class="form-group">
      <label class="form-label">与本人关系</label>
      <select v-model="form.relation" class="input">
        <option v-for="r in RELATION_OPTIONS" :key="r" :value="r">{{ r }}</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">出生日期</label>
      <input v-model="form.dob" type="date" class="input" />
    </div>
    <div class="form-group">
      <label class="form-label">血型</label>
      <select v-model="form.bloodType" class="input">
        <option v-for="b in BLOOD_TYPE_OPTIONS" :key="b" :value="b">{{ b }}</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">身高 (cm)</label>
      <input v-model.number="form.height" type="number" min="0" class="input" />
    </div>
    <div class="form-group">
      <label class="form-label">体重 (kg)</label>
      <input v-model.number="form.weight" type="number" min="0" class="input" />
    </div>
    <div class="form-group">
      <label class="form-label">紧急联系人电话</label>
      <input v-model="form.emergencyContact" class="input" placeholder="手机号" />
    </div>
    <div class="form-group">
      <label class="form-label">头像</label>
      <ImageUpload v-model="form.avatar" label="上传头像" />
    </div>
    <div class="form-group span-2">
      <label class="form-label">过敏史</label>
      <input v-model="form.allergies" class="input" placeholder="如：青霉素过敏" />
    </div>
    <div class="form-group span-2">
      <label class="form-label">慢性病史</label>
      <textarea v-model="form.chronicDiseases" class="input textarea" rows="2" placeholder="如：高血压、糖尿病"></textarea>
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
