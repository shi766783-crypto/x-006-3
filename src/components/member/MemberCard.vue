<script setup lang="ts">
import type { FamilyMember } from '../../types'
import { calculateAge } from '../../utils/format'
import Avatar from '../ui/Avatar.vue'

defineProps<{ member: FamilyMember }>()
const emit = defineEmits<{
  (e: 'select'): void
  (e: 'edit'): void
  (e: 'delete'): void
}>()
</script>

<template>
  <div class="member-card card" @click="emit('select')">
    <Avatar :src="member.avatar" :name="member.name" :size="52" />
    <div class="member-info">
      <div class="member-name">{{ member.name }}</div>
      <div class="member-meta">
        {{ member.relation }} · {{ calculateAge(member.dob) }}岁 · {{ member.bloodType }}
      </div>
    </div>
    <div class="member-actions">
      <button type="button" class="icon-btn" title="编辑" @click.stop="emit('edit')">✏️</button>
      <button type="button" class="icon-btn" title="删除" @click.stop="emit('delete')">🗑️</button>
    </div>
  </div>
</template>

<style scoped>
.member-card {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  margin-bottom: 12px;
  transition: box-shadow 0.2s, transform 0.2s;
}
.member-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}
.member-info {
  flex: 1;
}
.member-name {
  font-weight: 700;
  font-size: 17px;
  color: var(--text-primary);
}
.member-meta {
  font-size: 13px;
  color: var(--text-secondary);
}
.member-actions {
  display: flex;
  gap: 6px;
}
.icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 6px;
}
.icon-btn:hover {
  background: var(--bg-color);
}
</style>
