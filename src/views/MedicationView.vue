<script setup lang="ts">
import { computed, ref } from 'vue'
import DoseItem from '../components/medication/DoseItem.vue'
import PlanForm from '../components/medication/PlanForm.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useFamilyStore } from '../stores/useFamilyStore'
import type { MedicationPlan } from '../types'
import { formatDate } from '../utils/date'
import { formatPercent } from '../utils/format'

const store = useFamilyStore()
const showForm = ref(false)

const todayDoses = computed(() => store.todayDoses)
const compliance = computed(() => store.compliance7)
const plans = computed(() => store.state.plans)

function memberName(plan: MedicationPlan) {
  return store.getMember(plan.memberId)?.name ?? '—'
}
function medicineName(plan: MedicationPlan) {
  return store.getMedicine(plan.medicineId)?.name ?? '—'
}

function onSave(data: Omit<MedicationPlan, 'id'>) {
  store.addPlan(data)
  showForm.value = false
}

function onDelete(plan: MedicationPlan) {
  if (window.confirm('确定删除该用药计划吗？')) {
    store.deletePlan(plan.id)
  }
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h1 class="page-title">用药提醒</h1>
      <button type="button" class="btn btn-primary" @click="showForm = true">＋ 新建用药计划</button>
    </div>

    <!-- Compliance -->
    <section class="card compliance-card">
      <div>
        <div class="compliance-value">{{ formatPercent(compliance.rate) }}</div>
        <div class="compliance-label">近 7 天用药依从率</div>
      </div>
      <div class="compliance-detail">
        <span>已服用 {{ compliance.taken }} 次</span>
        <span>已跳过 {{ compliance.skipped }} 次</span>
      </div>
    </section>

    <!-- Today's doses -->
    <section class="card">
      <div class="section-head">
        <h3>今日待服药</h3>
        <span class="muted">共 {{ todayDoses.length }} 项</span>
      </div>
      <template v-if="todayDoses.length">
        <DoseItem
          v-for="d in todayDoses"
          :key="d.planId + d.time"
          :dose="d"
          @mark="(s) => store.logDose(d.planId, d.time, s)"
        />
      </template>
      <EmptyState v-else icon="💤" text="今日暂无服药安排" />
    </section>

    <!-- Plans -->
    <section class="card">
      <div class="section-head">
        <h3>用药计划（{{ plans.length }}）</h3>
      </div>
      <template v-if="plans.length">
        <div v-for="p in plans" :key="p.id" class="plan-item">
          <div class="plan-info">
            <div class="plan-title">{{ memberName(p) }} · {{ medicineName(p) }}</div>
            <div class="plan-meta">
              <span>剂量 {{ p.dosage || '—' }}</span>
              <span>时间 {{ p.times.join(' / ') }}</span>
              <span>{{ formatDate(p.startDate) }} ~ {{ formatDate(p.endDate) }}</span>
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-danger-ghost" @click="onDelete(p)">删除</button>
        </div>
      </template>
      <EmptyState v-else icon="📅" text="暂无用药计划" />
    </section>
  </div>

  <BaseModal v-if="showForm" title="新建用药计划" @close="showForm = false">
    <PlanForm @save="onSave" @close="showForm = false" />
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
.compliance-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.compliance-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--success-color);
}
.compliance-label {
  font-size: 13px;
  color: var(--text-secondary);
}
.compliance-detail {
  display: flex;
  gap: 16px;
  color: var(--text-secondary);
  font-size: 14px;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.section-head h3 {
  margin: 0;
}
.muted {
  color: var(--text-secondary);
  font-size: 13px;
}
.plan-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}
.plan-item:last-child {
  border-bottom: none;
}
.plan-title {
  font-weight: 600;
  color: var(--text-primary);
}
.plan-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}
</style>
