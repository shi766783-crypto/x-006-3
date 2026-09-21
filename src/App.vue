<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import HomeView from './views/HomeView.vue'
import MembersView from './views/MembersView.vue'
import MedicinesView from './views/MedicinesView.vue'
import MedicationView from './views/MedicationView.vue'
import RecordsView from './views/RecordsView.vue'
import ExpenseStatsView from './views/ExpenseStatsView.vue'
import ProfileView from './views/ProfileView.vue'

type ViewName = 'home' | 'members' | 'medicines' | 'medication' | 'records' | 'expenses' | 'profile'

const navItems: { key: ViewName; label: string; icon: string }[] = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'members', label: '家庭成员', icon: '👨‍👩‍👧‍👦' },
  { key: 'medicines', label: '药品库存', icon: '💊' },
  { key: 'medication', label: '用药提醒', icon: '⏰' },
  { key: 'records', label: '就医记录', icon: '🏥' },
  { key: 'expenses', label: '费用统计', icon: '💰' },
  { key: 'profile', label: '个人中心', icon: '🏆' },
]

const views: Record<ViewName, Component> = {
  home: HomeView,
  members: MembersView,
  medicines: MedicinesView,
  medication: MedicationView,
  records: RecordsView,
  expenses: ExpenseStatsView,
  profile: ProfileView,
}

const currentView = ref<ViewName>('home')
const activeView = computed(() => views[currentView.value])
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-icon">🏥</span>
        <span class="brand-text">家庭健康管家</span>
      </div>
      <nav class="nav">
        <button
          v-for="item in navItems"
          :key="item.key"
          type="button"
          class="nav-item"
          :class="{ active: currentView === item.key }"
          @click="currentView = item.key"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </button>
      </nav>
    </aside>
    <main class="main">
      <component :is="activeView" />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 220px;
  background: var(--primary-color);
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 20px;
  font-size: 17px;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.brand-icon {
  font-size: 24px;
}
.nav {
  display: flex;
  flex-direction: column;
  padding: 12px 10px;
  gap: 4px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  text-align: left;
  transition: background 0.2s, color 0.2s;
}
.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.nav-item.active {
  background: var(--accent-color);
  color: #fff;
  font-weight: 600;
}
.nav-icon {
  font-size: 18px;
}
.main {
  flex: 1;
  padding: 28px;
  min-width: 0;
}
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
    flex-direction: row;
    align-items: center;
    overflow-x: auto;
  }
  .brand {
    border-bottom: none;
    padding: 14px;
  }
  .nav {
    flex-direction: row;
    padding: 8px;
  }
  .nav-item {
    white-space: nowrap;
  }
  .main {
    padding: 16px;
  }
}
</style>
