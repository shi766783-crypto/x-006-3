<script setup lang="ts">
import { computed, ref } from 'vue'
import RecordForm from '../components/record/RecordForm.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useFamilyStore } from '../stores/useFamilyStore'
import type { MedicalRecord } from '../types'
import { formatDate } from '../utils/date'
import { formatCurrency } from '../utils/format'

const store = useFamilyStore()
const showForm = ref(false)
const filterMember = ref('all')
const dateFrom = ref('')
const dateTo = ref('')

const filtered = computed(() => {
  let list = store.state.records
  if (filterMember.value !== 'all') list = list.filter((r) => r.memberId === filterMember.value)
  if (dateFrom.value) list = list.filter((r) => r.date >= dateFrom.value)
  if (dateTo.value) list = list.filter((r) => r.date <= dateTo.value)
  return [...list].sort((a, b) => b.date.localeCompare(a.date))
})

function memberName(id: string) {
  return store.getMember(id)?.name ?? '—'
}

function onSave(data: Omit<MedicalRecord, 'id'>) {
  store.addRecord(data)
  showForm.value = false
}

function onDelete(record: MedicalRecord) {
  if (window.confirm('确定删除该就医记录吗？')) {
    store.deleteRecord(record.id)
  }
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h1 class="page-title">就医记录</h1>
      <button type="button" class="btn btn-primary" @click="showForm = true">＋ 添加就医事件</button>
    </div>

    <!-- Filters -->
    <section class="card filters-card">
      <div class="filter-group">
        <label class="form-label">成员</label>
        <select v-model="filterMember" class="input">
          <option value="all">全部成员</option>
          <option v-for="m in store.state.members" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="form-label">开始日期</label>
        <input v-model="dateFrom" type="date" class="input" />
      </div>
      <div class="filter-group">
        <label class="form-label">结束日期</label>
        <input v-model="dateTo" type="date" class="input" />
      </div>
    </section>

    <div v-if="filtered.length" class="record-list">
      <div v-for="r in filtered" :key="r.id" class="record-item card">
        <div class="record-head">
          <div class="record-title">
            <strong>{{ memberName(r.memberId) }}</strong>
            <span class="record-date">{{ formatDate(r.date) }}</span>
          </div>
          <button type="button" class="btn btn-sm btn-danger-ghost" @click="onDelete(r)">删除</button>
        </div>
        <div class="record-meta">
          <span v-if="r.hospital">🏥 {{ r.hospital }}</span>
          <span v-if="r.department">{{ r.department }}</span>
          <span v-if="r.doctor">医生：{{ r.doctor }}</span>
          <span class="cost">费用 {{ formatCurrency(r.cost) }}</span>
        </div>
        <div v-if="r.diagnosis" class="record-field"><label>诊断：</label>{{ r.diagnosis }}</div>
        <div v-if="r.prescription" class="record-field"><label>处方：</label>{{ r.prescription }}</div>
        <div v-if="r.remark" class="record-field"><label>备注：</label>{{ r.remark }}</div>
        <div v-if="r.attachments.length" class="record-attach">
          <img v-for="(img, i) in r.attachments" :key="i" :src="img" alt="" />
        </div>
      </div>
    </div>
    <EmptyState v-else icon="🏥" text="暂无就医记录" />
  </div>

  <BaseModal v-if="showForm" title="添加就医事件" @close="showForm = false">
    <RecordForm @save="onSave" @close="showForm = false" />
  </BaseModal>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.page-title {
  margin: 0;
}
.filters-card {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.record-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.record-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.record-date {
  color: var(--text-secondary);
  font-size: 13px;
}
.record-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 8px;
}
.record-meta .cost {
  color: var(--warning-color);
  font-weight: 600;
}
.record-field {
  font-size: 14px;
  margin-top: 6px;
  color: var(--text-primary);
}
.record-field label {
  color: var(--text-secondary);
}
.record-attach {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.record-attach img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  cursor: pointer;
}
</style>
