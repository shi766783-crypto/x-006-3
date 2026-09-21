<script setup lang="ts">
import { computed, ref } from 'vue'
import MemberCard from '../components/member/MemberCard.vue'
import MemberForm from '../components/member/MemberForm.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useFamilyStore } from '../stores/useFamilyStore'
import type { FamilyMember } from '../types'
import MemberDetailView from './MemberDetailView.vue'

const store = useFamilyStore()

const selectedId = ref<string | null>(null)
const showForm = ref(false)
const editing = ref<FamilyMember | null>(null)

const members = computed(() => store.state.members)
const selectedMember = computed(() =>
  selectedId.value ? store.getMember(selectedId.value) : undefined,
)

function openAdd() {
  editing.value = null
  showForm.value = true
}

function openEdit(member: FamilyMember) {
  editing.value = member
  showForm.value = true
}

function onSave(data: Omit<FamilyMember, 'id' | 'metrics'>) {
  if (editing.value) store.updateMember(editing.value.id, data)
  else store.addMember(data)
  showForm.value = false
}

function onDelete(member: FamilyMember) {
  if (window.confirm(`确定删除成员「${member.name}」及其相关记录吗？`)) {
    store.deleteMember(member.id)
  }
}
</script>

<template>
  <MemberDetailView
    v-if="selectedMember"
    :member-id="selectedMember.id"
    @back="selectedId = null"
  />

  <div v-else class="page">
    <div class="page-head">
      <h1 class="page-title">家庭成员</h1>
      <button type="button" class="btn btn-primary" @click="openAdd">＋ 添加成员</button>
    </div>

    <div v-if="members.length" class="member-grid">
      <MemberCard
        v-for="m in members"
        :key="m.id"
        :member="m"
        @select="selectedId = m.id"
        @edit="openEdit(m)"
        @delete="onDelete(m)"
      />
    </div>
    <EmptyState v-else icon="👨‍👩‍👧‍👦" text="还没有家庭成员，点击右上角添加" />
  </div>

  <BaseModal v-if="showForm" :title="editing ? '编辑成员' : '添加成员'" @close="showForm = false">
    <MemberForm :member="editing" @save="onSave" @close="showForm = false" />
  </BaseModal>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.page-title {
  margin: 0;
}
.member-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
</style>
