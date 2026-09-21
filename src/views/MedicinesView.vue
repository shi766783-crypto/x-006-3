<script setup lang="ts">
import { computed, ref } from 'vue'
import MedicineCard from '../components/medicine/MedicineCard.vue'
import MedicineForm from '../components/medicine/MedicineForm.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { MEDICINE_CATEGORIES } from '../constants'
import { useFamilyStore } from '../stores/useFamilyStore'
import type { Medicine, MedicineCategory } from '../types'

const store = useFamilyStore()

const showForm = ref(false)
const editing = ref<Medicine | null>(null)
const filter = ref<MedicineCategory | 'all'>('all')

const categories = Object.entries(MEDICINE_CATEGORIES) as [MedicineCategory, string][]

const filtered = computed(() => {
  const list = store.state.medicines
  return filter.value === 'all' ? list : list.filter((m) => m.category === filter.value)
})

function openAdd() {
  editing.value = null
  showForm.value = true
}

function openEdit(medicine: Medicine) {
  editing.value = medicine
  showForm.value = true
}

function onSave(data: Omit<Medicine, 'id'>) {
  if (editing.value) store.updateMedicine(editing.value.id, data)
  else store.addMedicine(data)
  showForm.value = false
}

function onDelete(medicine: Medicine) {
  if (window.confirm(`确定删除药品「${medicine.name}」吗？`)) {
    store.deleteMedicine(medicine.id)
  }
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h1 class="page-title">药品库存</h1>
      <div class="head-actions">
        <button
          v-if="store.expiredMedicines.length"
          type="button"
          class="btn btn-danger"
          @click="store.cleanExpired()"
        >
          一键清理过期药品
        </button>
        <button type="button" class="btn btn-primary" @click="openAdd">＋ 添加药品</button>
      </div>
    </div>

    <div class="filters">
      <button
        type="button"
        class="filter-chip"
        :class="{ active: filter === 'all' }"
        @click="filter = 'all'"
      >
        全部 ({{ store.state.medicines.length }})
      </button>
      <button
        v-for="[key, label] in categories"
        :key="key"
        type="button"
        class="filter-chip"
        :class="{ active: filter === key }"
        @click="filter = key"
      >
        {{ label }}
      </button>
    </div>

    <div v-if="filtered.length" class="medicine-list">
      <MedicineCard
        v-for="m in filtered"
        :key="m.id"
        :medicine="m"
        @edit="openEdit(m)"
        @delete="onDelete(m)"
      />
    </div>
    <EmptyState v-else icon="💊" text="暂无药品" />
  </div>

  <BaseModal v-if="showForm" :title="editing ? '编辑药品' : '添加药品'" @close="showForm = false">
    <MedicineForm :medicine="editing" @save="onSave" @close="showForm = false" />
  </BaseModal>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}
.page-title {
  margin: 0;
}
.head-actions {
  display: flex;
  gap: 10px;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.filter-chip {
  padding: 6px 14px;
  border-radius: 18px;
  border: 1px solid var(--border-color);
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
}
.filter-chip.active {
  background: var(--accent-color);
  color: #fff;
  border-color: var(--accent-color);
}
.medicine-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}
</style>
