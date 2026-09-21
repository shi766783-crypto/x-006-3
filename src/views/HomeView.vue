<script setup lang="ts">
import { computed } from 'vue'
import StatCard from '../components/dashboard/StatCard.vue'
import DoseItem from '../components/medication/DoseItem.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useFamilyStore } from '../stores/useFamilyStore'
import { formatPercent } from '../utils/format'

const store = useFamilyStore()

const score = computed(() => store.healthScore)
const stats = computed(() => store.stats)
const expired = computed(() => store.expiredMedicines)
const expiring = computed(() => store.expiringMedicines)
const todayDoses = computed(() => store.todayDoses)

const scoreColor = computed(() => {
  const s = score.value.total
  if (s >= 90) return '#27ae60'
  if (s >= 75) return '#3498db'
  if (s >= 60) return '#f39c12'
  return '#e74c3c'
})
</script>

<template>
  <div class="page">
    <h1 class="page-title">家庭健康看板</h1>

    <!-- Health score -->
    <section class="card score-card">
      <div class="score-main">
        <div class="score-ring" :style="{ '--score-color': scoreColor, '--score': score.total }">
          <div class="score-value">{{ score.total }}</div>
          <div class="score-grade">{{ score.grade }}</div>
        </div>
        <div class="score-breakdown">
          <h3>家庭健康评分</h3>
          <div v-for="item in score.breakdown" :key="item.label" class="breakdown-row">
            <div class="breakdown-head">
              <span>{{ item.label }}</span>
              <span>{{ item.score }}/{{ item.max }}</span>
            </div>
            <div class="progress">
              <div
                class="progress-bar"
                :style="{ width: (item.score / item.max) * 100 + '%' }"
              ></div>
            </div>
            <div class="breakdown-note">{{ item.note }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stat cards -->
    <section class="stat-grid">
      <StatCard label="家庭成员" :value="stats.memberCount" icon="👨‍👩‍👧‍👦" color="#3498db" />
      <StatCard label="药品总数" :value="stats.medicineCount" icon="💊" color="#9b59b6" />
      <StatCard label="今日待服药" :value="stats.todayPending" icon="⏰" color="#e67e22" />
      <StatCard label="近7天依从率" :value="formatPercent(stats.complianceRate)" icon="✅" color="#27ae60" />
      <StatCard label="过期药品" :value="stats.expiredCount" icon="⚠️" color="#e74c3c" />
      <StatCard label="最近就医" :value="stats.lastRecordDate" icon="🏥" color="#16a085" />
    </section>

    <!-- Expiry warnings -->
    <section v-if="expired.length || expiring.length" class="card">
      <div class="section-head">
        <h3>药品效期预警</h3>
        <button v-if="expired.length" type="button" class="btn btn-danger" @click="store.cleanExpired()">
          一键清理过期药品
        </button>
      </div>
      <div v-if="expired.length" class="warning warning-red">
        <strong>已过期（{{ expired.length }}）</strong>
        <span v-for="m in expired" :key="m.id" class="warn-pill">{{ m.name }}</span>
      </div>
      <div v-if="expiring.length" class="warning warning-yellow">
        <strong>临近过期（{{ expiring.length }}）</strong>
        <span v-for="m in expiring" :key="m.id" class="warn-pill">{{ m.name }}</span>
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
  </div>
</template>

<style scoped>
.page-title {
  margin-bottom: 20px;
}
.score-card {
  margin-bottom: 20px;
}
.score-main {
  display: flex;
  gap: 28px;
  align-items: center;
  flex-wrap: wrap;
}
.score-ring {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--score-color);
  border: 8px solid var(--score-color);
  flex-shrink: 0;
}
.score-value {
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
}
.score-grade {
  font-size: 14px;
  margin-top: 4px;
}
.score-breakdown {
  flex: 1;
  min-width: 260px;
}
.breakdown-row {
  margin-bottom: 10px;
}
.breakdown-head {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}
.progress {
  height: 8px;
  background: var(--bg-color);
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: var(--accent-color);
  border-radius: 4px;
}
.breakdown-note {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
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
.warning {
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 10px;
  font-size: 14px;
}
.warning-red {
  background: #fdecea;
  color: #c0392b;
  border: 1px solid #f5c6cb;
}
.warning-yellow {
  background: #fef5e7;
  color: #b9770e;
  border: 1px solid #f9e79f;
}
.warn-pill {
  display: inline-block;
  background: rgba(0, 0, 0, 0.06);
  padding: 1px 8px;
  border-radius: 10px;
  margin: 2px 4px 2px 0;
}
</style>
