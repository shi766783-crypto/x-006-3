<script setup lang="ts">
import { computed, ref } from 'vue'
import StatCard from '../components/dashboard/StatCard.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useFamilyStore } from '../stores/useFamilyStore'
import { availableYears, computeExpenseStats } from '../utils/expenseStats'
import { formatCurrency, formatPercent } from '../utils/format'

const store = useFamilyStore()

const years = computed(() => availableYears(store.state.records))
const selectedYear = ref(new Date().getFullYear())

// Fall back to the newest available year if the selection disappears
// (e.g. all records of that year were deleted).
const activeYear = computed(() =>
  years.value.includes(selectedYear.value) ? selectedYear.value : years.value[0],
)

const stats = computed(() =>
  computeExpenseStats(store.state.records, store.state.members, activeYear.value),
)

const yearIndex = computed(() => years.value.indexOf(activeYear.value))
const canOlder = computed(() => yearIndex.value >= 0 && yearIndex.value < years.value.length - 1)
const canNewer = computed(() => yearIndex.value > 0)

function shiftYear(delta: number) {
  const next = years.value[yearIndex.value + delta]
  if (next !== undefined) selectedYear.value = next
}

const maxMonthly = computed(() => Math.max(...stats.value.monthlyTotals, 0))

function barHeight(total: number): string {
  if (total <= 0 || maxMonthly.value <= 0) return '0%'
  return `${(total / maxMonthly.value) * 100}%`
}

const perCapitaText = computed(() =>
  stats.value.perCapita === null ? '—' : formatCurrency(stats.value.perCapita),
)
const maxMonthLabel = computed(() =>
  stats.value.maxMonth ? `单月最高（${stats.value.maxMonth.month}月）` : '单月最高',
)
const maxMonthText = computed(() =>
  stats.value.maxMonth ? formatCurrency(stats.value.maxMonth.total) : '—',
)
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h1 class="page-title">费用统计</h1>
      <div class="year-switcher">
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          :disabled="!canOlder"
          title="上一年"
          @click="shiftYear(1)"
        >
          ‹
        </button>
        <select v-model.number="selectedYear" class="input year-select" aria-label="选择年份">
          <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
        </select>
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          :disabled="!canNewer"
          title="下一年"
          @click="shiftYear(-1)"
        >
          ›
        </button>
      </div>
    </div>

    <template v-if="stats.validCount">
      <!-- Summary cards -->
      <section class="stat-grid">
        <StatCard label="年度合计" :value="formatCurrency(stats.yearTotal)" icon="💰" color="#e67e22" />
        <StatCard label="人均费用" :value="perCapitaText" icon="👤" color="#3498db" />
        <StatCard :label="maxMonthLabel" :value="maxMonthText" icon="📈" color="#e74c3c" />
        <StatCard label="计入记录" :value="`${stats.validCount} 条`" icon="🧾" color="#16a085" />
      </section>

      <!-- Monthly breakdown -->
      <section class="card">
        <div class="section-head">
          <h3>月度费用</h3>
          <span class="muted">{{ activeYear }}年 1–12 月</span>
        </div>
        <div class="month-chart">
          <div v-for="(total, i) in stats.monthlyTotals" :key="i" class="month-col">
            <div class="month-amount">{{ total > 0 ? formatCurrency(total) : '' }}</div>
            <div class="month-track">
              <div
                class="month-bar"
                :class="{ zero: total <= 0, top: stats.maxMonth?.month === i + 1 }"
                :style="{ height: barHeight(total) }"
                :title="`${i + 1}月 ${formatCurrency(total)}`"
              ></div>
            </div>
            <div class="month-label">{{ i + 1 }}月</div>
          </div>
        </div>
      </section>

      <!-- Per-member breakdown -->
      <section class="card">
        <div class="section-head">
          <h3>成员费用</h3>
          <span class="muted">按费用降序</span>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>成员</th>
              <th>就医次数</th>
              <th>费用合计</th>
              <th class="share-col">占比</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in stats.perMember" :key="m.memberId || 'unknown'">
              <td>{{ m.name }}</td>
              <td>{{ m.count }}</td>
              <td class="cost-cell">{{ formatCurrency(m.total) }}</td>
              <td class="share-col">
                <div class="share-cell">
                  <div class="progress">
                    <div class="progress-bar" :style="{ width: m.share * 100 + '%' }"></div>
                  </div>
                  <span class="share-text">{{ formatPercent(m.share) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
    <EmptyState v-else icon="🧾" :text="`${activeYear}年暂无可统计的就医费用`" />

    <!-- Statistical rules -->
    <section class="card caliber-card">
      <h3>统计口径</h3>
      <ul>
        <li>仅统计就诊日期有效且属于 {{ activeYear }} 年的记录，共计入 {{ stats.validCount }} 条。</li>
        <li>费用缺失或非法（如负数）的记录按 ¥0.00 计入总额：{{ stats.missingCostCount }} 条。</li>
        <li>就诊日期缺失或格式非法的记录不参与任何统计：{{ stats.invalidDateCount }} 条。</li>
        <li>
          人均费用 = 年度合计 ÷ 家庭成员数（当前 {{ store.state.members.length }} 人）；无成员时显示「—」。
        </li>
        <li>全年合计为 ¥0.00 时，单月最高不予展示。</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}
.page-title {
  margin: 0;
}
.year-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
}
.year-select {
  width: auto;
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

/* Monthly bar chart */
.month-chart {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 8px;
  align-items: end;
}
.month-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}
.month-amount {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  min-height: 16px;
}
.month-track {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.month-bar {
  width: 70%;
  min-width: 12px;
  background: var(--info-color);
  border-radius: 6px 6px 0 0;
  transition: height 0.3s;
}
.month-bar.top {
  background: var(--accent-color);
}
.month-bar.zero {
  background: var(--border-color);
  height: 2px !important;
}
.month-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
}

/* Member table */
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
.cost-cell {
  color: var(--warning-color);
  font-weight: 600;
  white-space: nowrap;
}
.share-col {
  width: 40%;
}
.share-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.progress {
  flex: 1;
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
.share-text {
  font-size: 13px;
  color: var(--text-secondary);
  min-width: 42px;
  text-align: right;
}

/* Statistical rules */
.caliber-card h3 {
  margin-bottom: 10px;
}
.caliber-card ul {
  padding-left: 20px;
  font-size: 13px;
  color: var(--text-secondary);
}
.caliber-card li {
  margin-bottom: 4px;
}

@media (max-width: 600px) {
  .month-chart {
    gap: 4px;
  }
  .month-amount {
    display: none;
  }
  .share-col {
    width: auto;
  }
}
</style>
