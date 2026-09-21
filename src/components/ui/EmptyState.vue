<script setup lang="ts">
defineProps<{ icon?: string; text?: string }>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon">{{ icon || '📭' }}</div>
    <p>{{ text || '暂无数据' }}</p>
  </div>
</template>

<style scoped>
.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary);
}
.empty-icon {
  font-size: 40px;
  margin-bottom: 8px;
}
.empty-state p {
  font-size: 14px;
}
</style>
