<script setup lang="ts">
const props = defineProps<{ src?: string; name: string; size?: number }>()
</script>

<template>
  <div
    class="avatar"
    :style="{ width: (props.size || 48) + 'px', height: (props.size || 48) + 'px', fontSize: (props.size || 48) / 2.4 + 'px' }"
  >
    <img v-if="props.src" :src="props.src" alt="" />
    <span v-else>{{ props.name?.charAt(0) || '?' }}</span>
  </div>
</template>

<style scoped>
.avatar {
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-color);
  color: #fff;
  font-weight: 600;
  flex-shrink: 0;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
