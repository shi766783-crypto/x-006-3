<script setup lang="ts">
import { computed, ref } from 'vue'
import MemberForm from '../components/member/MemberForm.vue'
import MetricForm from '../components/health/MetricForm.vue'
import TrendChart from '../components/health/TrendChart.vue'
import Avatar from '../components/ui/Avatar.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { METRIC_META } from '../constants'
import { useFamilyStore } from '../stores/useFamilyStore'
import type { FamilyMember, HealthMetric, MetricType } from '../types'
import type { ChartPoint } from '../utils/chart'
import { formatDateTime } from '../utils/date'
import { calculateAge, numericValue } from '../utils/format'

const props = defineProps<{ memberId: string }>()
const emit = defineEmits<{ (e: 'back'): void }>()

const store = useFamilyStore()

const member = computed(() => store.getMember(props.memberId))
const chartType = ref<MetricType>('blood_pressure')
const showMetric = ref(false)
const showEdit = ref(false)

const metricTypes = Object.keys(METRIC_META) as MetricType[]

const sortedMetrics = computed(() =>
  member.value ? [...member.value.metrics].sort((a, b) => a.timestamp - b.timestamp) : [],
)

const chartPoints = computed<ChartPoint[]>(() =>
  sortedMetrics.value
    .filter((m) => m.type === chartType.value)
    .map((m) => ({ label: formatDateTime(m.timestamp).slice(5), value: numericValue(m.value) }))
    .filter((p) => !Number.isNaN(p.value)),
)

const latest = computed<HealthMetric | null>(() => {
  const list = sortedMetrics.value.filter((m) => m.type === chartType.value)
  return list.length ? list[list.length - 1] : null
})

function compareNormal(type: MetricType, value: string): 'in' | 'out' | 'na' {
  const n = numericValue(value)
  if (Number.isNaN(n)) return 'na'
  switch (type) {
    case 'heart_rate':
      return n >= 60 && n <= 100 ? 'in' : 'out'
    case 'temperature':
      return n >= 36 && n <= 37.2 ? 'in' : 'out'
    case 'blood_sugar':
      return n >= 3.9 && n <= 6.1 ? 'in' : 'out'
    default:
      return 'na'
  }
}

const latestStatus = computed(() =>
  latest.value ? compareNormal(latest.value.type, latest.value.value) : 'na',
)

function onSaveMetric(data: Omit<HealthMetric, 'id'>) {
  store.addMetric(props.memberId, data)
  if (chartType.value !== data.type) chartType.value = data.type
  showMetric.value = false
}

function onSaveMember(data: Omit<FamilyMember, 'id' | 'metrics'>) {
  store.updateMember(props.memberId, data)
  showEdit.value = false
}

function onDelete() {
  if (window.confirm(`确定删除成员「${member.value?.name}」吗？`)) {
    store.deleteMember(props.memberId)
    emit('back')
  }
}
</script>

<template>
  <div v-if="member" class="page">
    <button type="button" class="btn btn-ghost back-btn" @click="emit('back')">← 返回列表</button>

    <!-- Profile -->
    <section class="card profile-card">
      <Avatar :src="member.avatar" :name="member.name" :size="72" />
      <div class="profile-info">
        <h2>{{ member.name }}</h2>
        <div class="profile-tags">
          <span class="pill">{{ member.relation }}</span>
          <span class="pill">{{ calculateAge(member.dob) }}岁</span>
          <span class="pill">{{ member.bloodType }}</span>
          <span class="pill">身高 {{ member.height || '—' }}cm</span>
          <span class="pill">体重 {{ member.weight || '—' }}kg</span>
        </div>
        <div class="profile-rows">
          <div class="row"><label>过敏史</label><span>{{ member.allergies || '无' }}</span></div>
          <div class="row"><label>慢性病史</label><span>{{ member.chronicDiseases || '无' }}</span></div>
          <div class="row"><label>紧急联系人</label><span>{{ member.emergencyContact || '—' }}</span></div>
        </div>
      </div>
      <div class="profile-actions">
        <button type="button" class="btn btn-ghost" @click="showEdit = true">编辑</button>
        <button type="button" class="btn btn-danger-ghost" @click="onDelete">删除</button>
      </div>
    </section>

    <!-- Health metrics -->
    <section class="card">
      <div class="section-head">
        <h3>健康指标</h3>
        <div class="head-actions">
          <select v-model="chartType" class="input inline-input">
            <option v-for="t in metricTypes" :key="t" :value="t">{{ METRIC_META[t].label }}</option>
          </select>
          <button type="button" class="btn btn-primary" @click="showMetric = true">＋ 记录指标</button>
        </div>
      </div>

      <div class="latest-row">
        <div class="latest-value">
          <span class="latest-label">{{ METRIC_META[chartType].label }} · 最近一次</span>
          <span class="latest-num">{{ latest ? latest.value : '—' }}</span>
          <span v-if="latest" class="latest-unit">{{ latest.unit }}</span>
        </div>
        <div class="latest-range">
          <span
            v-if="latestStatus !== 'na'"
            class="range-badge"
            :class="latestStatus === 'in' ? 'range-in' : 'range-out'"
          >
            {{ latestStatus === 'in' ? '正常' : '异常' }}
          </span>
          <span class="range-text">正常范围：{{ METRIC_META[chartType].normalRange }}</span>
        </div>
      </div>

      <TrendChart :points="chartPoints" :color="METRIC_META[chartType].color" />

      <div v-if="sortedMetrics.filter((m) => m.type === chartType).length" class="history">
        <h4>历史记录</h4>
        <table class="table">
          <thead>
            <tr>
              <th>时间</th>
              <th>数值</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in sortedMetrics.filter((x) => x.type === chartType).slice().reverse()" :key="m.id">
              <td>{{ formatDateTime(m.timestamp) }}</td>
              <td>{{ m.value }} {{ m.unit }}</td>
              <td>
                <button type="button" class="icon-btn" @click="store.deleteMetric(member.id, m.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <EmptyState v-else icon="📉" text="暂无该指标的记录" />
    </section>

    <BaseModal v-if="showMetric" title="记录健康指标" @close="showMetric = false">
      <MetricForm @save="onSaveMetric" @close="showMetric = false" />
    </BaseModal>

    <BaseModal v-if="showEdit" title="编辑成员" @close="showEdit = false">
      <MemberForm :member="member" @save="onSaveMember" @close="showEdit = false" />
    </BaseModal>
  </div>
</template>

<style scoped>
.back-btn {
  margin-bottom: 16px;
}
.profile-card {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.profile-info {
  flex: 1;
  min-width: 240px;
}
.profile-info h2 {
  margin-bottom: 8px;
}
.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.pill {
  background: var(--accent-bg, rgba(66, 185, 131, 0.12));
  color: var(--accent-color);
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 13px;
}
.profile-rows .row {
  display: flex;
  gap: 10px;
  font-size: 14px;
  padding: 4px 0;
}
.profile-rows label {
  color: var(--text-secondary);
  min-width: 76px;
}
.profile-actions {
  display: flex;
  gap: 8px;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}
.section-head h3 {
  margin: 0;
}
.head-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.inline-input {
  width: auto;
}
.latest-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px 16px;
  background: var(--bg-color);
  border-radius: 10px;
}
.latest-value {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.latest-label {
  font-size: 13px;
  color: var(--text-secondary);
}
.latest-num {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
}
.latest-unit {
  color: var(--text-secondary);
  font-size: 13px;
}
.latest-range {
  display: flex;
  align-items: center;
  gap: 10px;
}
.range-badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}
.range-in {
  background: #eafaf1;
  color: var(--success-color);
}
.range-out {
  background: #fdecea;
  color: var(--danger-color);
}
.range-text {
  font-size: 13px;
  color: var(--text-secondary);
}
.history {
  margin-top: 16px;
}
.history h4 {
  margin-bottom: 8px;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.table th,
.table td {
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-color);
}
.table th {
  color: var(--text-secondary);
  font-weight: 600;
}
.icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
}
</style>
