<script setup lang="ts">
import type { Achievement } from '../../types'

defineProps<{ achievement: Achievement }>()
</script>

<template>
  <div class="badge" :class="{ locked: !achievement.unlockedAt }">
    <div class="badge-icon">{{ achievement.icon }}</div>
    <div class="badge-name">{{ achievement.name }}</div>
    <div class="badge-desc">{{ achievement.description }}</div>
  </div>
</template>

<style scoped>
.badge {
  padding: 16px;
  border-radius: 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.badge:not(.locked):hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
.badge.locked {
  opacity: 0.45;
  filter: grayscale(1);
}
.badge-icon {
  font-size: 34px;
  margin-bottom: 6px;
}
.badge-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
}
.badge-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}
</style>
