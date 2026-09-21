<script setup lang="ts">
import { computed, ref } from 'vue'
import StatCard from '../components/dashboard/StatCard.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useFamilyStore } from '../stores/useFamilyStore'
import { availableYears, computeExpenseStats } from '../utils/expenseStats'
import { formatCurrency, formatPercent } from '../utils/format'

const store = useFamilyStore()
const selectedYear = ref(new Date().getFullYear())

const years = computed(() => availableYears(store.state.records))
const stats = computed(() =>
  computeExpenseStats(store.state.records, store.state.members, selectedYear.value),
)

const memberCount = computed(() => store.state.members.length)
const hasDirtyData = computed(() => stats.value.zeroCostCount > 0 || stats.value.excludedCount > 0)

const maxMonthLabel = computed(() => {
  const mm = stats.value.maxMonth
  return mm ? `${mm.month}月 · ${formatCurrency(mm.amount)}` : '—'
})

const peakMonthTotal = computed(() => Math.max(...stats.value.monthTotals))

function barHeight(amount: number): string {
  if (amount <= 0 || peakMonthTotal.value <= 0) return '0%'
  // 保证非零月份至少有可见高度
  return `${Math.max((amount / peakMonthTotal.value) * 100, 3)}%`
}

function isPeakMonth(month: number): boolean {
  const mm = stats.value.maxMonth
  return !!mm && mm.amount > 0 && mm.month === month
}

/** 柱状图上的紧凑金额标签，如 ¥1,200 */
function shortMoney(n: number): string {
  return `¥${Math.round(n).toLocaleString('zh-CN')}`
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h1 class="page-title">费用统计</h1>
      <div class="year-switch">
        <label class="form-label">统计年份</label>
        <select v-model.number="selectedYear" class="input year-select">
          <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
        </select>
      </div>
    </div>

    <!-- 脏数据提示：费用/日期缺失的记录按口径处理，不影响页面 -->
    <section v-if="hasDirtyData" class="dirty-notice">
      <strong>⚠️ 数据完整性提示</strong>
      <ul>
        <li v-if="stats.excludedCount">
          {{ stats.excludedCount }} 条记录缺少有效就诊日期，未纳入任何年度统计。
        </li>
        <li v-if="stats.zeroCostCount">
          {{ stats.zeroCostCount }} 条记录未填写有效费用，已按 ¥0 计入统计。
        </li>
      </ul>
    </section>

    <!-- 汇总卡片 -->
    <section class="stat-grid">
      <StatCard label="年度合计" :value="formatCurrency(stats.yearTotal)" icon="💰" color="#42b983" />
      <StatCard label="单月最高" :value="maxMonthLabel" icon="📈" color="#f39c12" />
      <StatCard
        :label="`人均（共${memberCount}人）`"
        :value="stats.perCapita === null ? '—' : formatCurrency(stats.perCapita)"
        icon="👤"
        color="#3498db"
      />
      <StatCard label="计入记录" :value="`${stats.recordCount} 条`" icon="🧾" color="#9b59b6" />
    </section>

    <!-- 按月维度 -->
    <section class="card">
      <div class="section-head">
        <h3>{{ selectedYear }}年各月费用</h3>
        <span v-if="stats.maxMonth && stats.maxMonth.amount > 0" class="muted">
          最高为 {{ stats.maxMonth.month }}月（{{ formatCurrency(stats.maxMonth.amount) }}）
        </span>
      </div>
      <div v-if="stats.recordCount" class="chart">
        <div v-for="(amount, i) in stats.monthTotals" :key="i" class="bar-col">
          <div class="bar-value">{{ amount > 0 ? shortMoney(amount) : '' }}</div>
          <div class="bar-track">
            <div
              class="bar"
              :class="{ peak: isPeakMonth(i + 1) }"
              :style="{ height: barHeight(amount) }"
            ></div>
          </div>
          <div class="bar-label" :class="{ peak: isPeakMonth(i + 1) }">{{ i + 1 }}月</div>
        </div>
      </div>
      <EmptyState v-else icon="📊" :text="`${selectedYear}年暂无可统计的就医记录`" />
    </section>

    <!-- 按成员维度 -->
    <section class="card">
      <div class="section-head">
        <h3>按成员汇总</h3>
        <span class="muted">{{ selectedYear }}年</span>
      </div>
      <template v-if="stats.memberRows.length">
        <div v-for="row in stats.memberRows" :key="row.memberId || 'removed'" class="member-row">
          <div class="member-head">
            <span class="member-name">{{ row.name }}</span>
            <span class="member-meta">{{ row.count }} 笔 · {{ formatPercent(row.share) }}</span>
            <span class="member-amount">{{ formatCurrency(row.total) }}</span>
          </div>
          <div class="progress">
            <div class="progress-bar" :style="{ width: row.share * 100 + '%' }"></div>
          </div>
        </div>
      </template>
      <EmptyState v-else icon="👨‍👩‍👧‍👦" text="暂无家庭成员，请先在「家庭成员」中建档" />
    </section>

    <!-- 统计口径说明 -->
    <section class="card rules-card">
      <h3>统计口径</h3>
      <ul>
        <li>仅统计就诊日期有效的记录；日期缺失或非法的记录不计入任何年度统计。</li>
        <li>费用缺失、为负数或非数字的记录按 ¥0 计入，并在上方提示笔数。</li>
        <li>人均 = 年度合计 ÷ 家庭成员总数（当前 {{ memberCount }} 人）。</li>
        <li>单月最高只在当年有记录的月份中比较。</li>
        <li>成员被删除后，其历史费用归入「已删除成员」继续参与合计。</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.page-title {
  margin: 0;
}
.year-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}
.year-select {
  width: 120px;
}
.dirty-notice {
  background: #fef5e7;
  border: 1px solid #f9e79f;
  color: #b9770e;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 14px;
}
.dirty-notice ul {
  margin: 6px 0 0;
  padding-left: 20px;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
.chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 220px;
}
.bar-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.bar-value {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  margin-bottom: 4px;
  min-height: 15px;
}
.bar-track {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.bar {
  width: 70%;
  max-width: 42px;
  background: var(--info-color);
  border-radius: 6px 6px 0 0;
  transition: height 0.3s;
}
.bar.peak {
  background: var(--warning-color);
}
.bar-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
}
.bar-label.peak {
  color: var(--warning-color);
  font-weight: 700;
}
.member-row {
  margin-bottom: 14px;
}
.member-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 4px;
}
.member-name {
  font-weight: 600;
}
.member-meta {
  flex: 1;
  font-size: 12px;
  color: var(--text-secondary);
}
.member-amount {
  font-weight: 700;
  color: var(--warning-color);
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
.rules-card h3 {
  margin-top: 0;
}
.rules-card ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.9;
}
@media (max-width: 600px) {
  .bar-value {
    display: none;
  }
}
</style>
