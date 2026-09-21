<script setup lang="ts">
import { computed } from 'vue'
import AchievementBadge from '../components/dashboard/AchievementBadge.vue'
import { useFamilyStore } from '../stores/useFamilyStore'

const store = useFamilyStore()

const achievements = computed(() => store.achievements)
const unlockedCount = computed(() => achievements.value.filter((a) => a.unlockedAt).length)
const score = computed(() => store.healthScore)
</script>

<template>
  <div class="page">
    <h1 class="page-title">个人中心</h1>

    <section class="card">
      <div class="section-head">
        <h3>成就徽章</h3>
        <span class="muted">已解锁 {{ unlockedCount }} / {{ achievements.length }}</span>
      </div>
      <div class="badge-grid">
        <AchievementBadge
          v-for="a in achievements"
          :key="a.id"
          :achievement="a"
        />
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <h3>家庭健康评分</h3>
        <span class="score-grade" :class="'grade-' + (score.total >= 75 ? 'good' : score.total >= 60 ? 'mid' : 'low')">
          {{ score.grade }}
        </span>
      </div>
      <div class="score-total">
        <span class="score-num">{{ score.total }}</span>
        <span class="score-max">/ 100</span>
      </div>
      <div v-for="item in score.breakdown" :key="item.label" class="breakdown-row">
        <div class="breakdown-head">
          <span>{{ item.label }}</span>
          <span>{{ item.score }}/{{ item.max }}</span>
        </div>
        <div class="progress">
          <div class="progress-bar" :style="{ width: (item.score / item.max) * 100 + '%' }"></div>
        </div>
        <div class="breakdown-note">{{ item.note }}</div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-title {
  margin-bottom: 20px;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-head h3 {
  margin: 0;
}
.muted {
  color: var(--text-secondary);
  font-size: 13px;
}
.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}
.score-grade {
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 14px;
}
.grade-good {
  background: #eafaf1;
  color: var(--success-color);
}
.grade-mid {
  background: #fef5e7;
  color: var(--warning-color);
}
.grade-low {
  background: #fdecea;
  color: var(--danger-color);
}
.score-total {
  text-align: center;
  margin-bottom: 20px;
}
.score-num {
  font-size: 48px;
  font-weight: 800;
  color: var(--accent-color);
}
.score-max {
  color: var(--text-secondary);
}
.breakdown-row {
  margin-bottom: 12px;
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
</style>
