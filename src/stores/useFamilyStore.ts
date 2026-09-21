import { computed, reactive } from 'vue'
import { ACHIEVEMENTS } from '../constants'
import { StorageService } from '../services/storage'
import type {
  Achievement,
  DoseStatus,
  FamilyMember,
  HealthMetric,
  MedicalRecord,
  Medicine,
  MedicationLog,
  MedicationPlan,
  TodayDose,
} from '../types'
import { evaluateAchievements } from '../utils/achievements'
import { daysUntil, formatDate, lastNDates, timeToMinutes, todayStr } from '../utils/date'
import { computeHealthScore, type HealthScoreResult } from '../utils/healthScore'
import { uid } from '../utils/id'

interface FamilyState {
  members: FamilyMember[]
  medicines: Medicine[]
  plans: MedicationPlan[]
  logs: MedicationLog[]
  records: MedicalRecord[]
  unlockedAchievements: Record<string, number>
}

function loadState(): FamilyState {
  return {
    members: StorageService.loadMembers(),
    medicines: StorageService.loadMedicines(),
    plans: StorageService.loadPlans(),
    logs: StorageService.loadLogs(),
    records: StorageService.loadRecords(),
    unlockedAchievements: StorageService.loadAchievements(),
  }
}

function createStore() {
  const state = reactive<FamilyState>(loadState())

  // ---- persistence + achievements ----
  function refreshAchievements() {
    const unlocked = evaluateAchievements({
      members: state.members,
      medicines: state.medicines,
      plans: state.plans,
      logs: state.logs,
      records: state.records,
    })
    for (const [id, ts] of Object.entries(unlocked)) {
      if (!(id in state.unlockedAchievements)) {
        state.unlockedAchievements[id] = ts
      }
    }
  }

  function commit() {
    refreshAchievements()
    StorageService.saveMembers(state.members)
    StorageService.saveMedicines(state.medicines)
    StorageService.savePlans(state.plans)
    StorageService.saveLogs(state.logs)
    StorageService.saveRecords(state.records)
    StorageService.saveAchievements(state.unlockedAchievements)
  }

  // ---- members ----
  function addMember(member: Omit<FamilyMember, 'id' | 'metrics'>) {
    state.members.push({ ...member, id: uid(), metrics: [] })
    commit()
  }

  function updateMember(id: string, patch: Partial<FamilyMember>) {
    const member = state.members.find((m) => m.id === id)
    if (member) Object.assign(member, patch)
    commit()
  }

  function deleteMember(id: string) {
    state.members = state.members.filter((m) => m.id !== id)
    state.plans = state.plans.filter((p) => p.memberId !== id)
    state.logs = state.logs.filter((l) => l.memberId !== id)
    state.records = state.records.filter((r) => r.memberId !== id)
    commit()
  }

  function getMember(id: string): FamilyMember | undefined {
    return state.members.find((m) => m.id === id)
  }

  function addMetric(memberId: string, metric: Omit<HealthMetric, 'id'>) {
    const member = state.members.find((m) => m.id === memberId)
    if (!member) return
    member.metrics.push({ ...metric, id: uid() })
    commit()
  }

  function deleteMetric(memberId: string, metricId: string) {
    const member = state.members.find((m) => m.id === memberId)
    if (!member) return
    member.metrics = member.metrics.filter((m) => m.id !== metricId)
    commit()
  }

  // ---- medicines ----
  function addMedicine(medicine: Omit<Medicine, 'id'>) {
    state.medicines.push({ ...medicine, id: uid() })
    commit()
  }

  function updateMedicine(id: string, patch: Partial<Medicine>) {
    const medicine = state.medicines.find((m) => m.id === id)
    if (medicine) Object.assign(medicine, patch)
    commit()
  }

  function deleteMedicine(id: string) {
    state.medicines = state.medicines.filter((m) => m.id !== id)
    state.plans = state.plans.filter((p) => p.medicineId !== id)
    commit()
  }

  function cleanExpired() {
    state.medicines = state.medicines.filter((m) => daysUntil(m.expiryDate) >= 0)
    commit()
  }

  function getMedicine(id: string): Medicine | undefined {
    return state.medicines.find((m) => m.id === id)
  }

  // ---- medication plans ----
  function addPlan(plan: Omit<MedicationPlan, 'id'>) {
    state.plans.push({ ...plan, id: uid() })
    commit()
  }

  function deletePlan(id: string) {
    state.plans = state.plans.filter((p) => p.id !== id)
    commit()
  }

  function logDose(planId: string, time: string, status: DoseStatus) {
    const plan = state.plans.find((p) => p.id === planId)
    if (!plan) return
    const date = todayStr()
    const existing = state.logs.find(
      (l) => l.planId === planId && l.date === date && l.time === time,
    )
    if (existing) {
      existing.status = status
      existing.timestamp = Date.now()
    } else {
      state.logs.push({
        id: uid(),
        planId,
        memberId: plan.memberId,
        date,
        time,
        status,
        timestamp: Date.now(),
      })
    }
    commit()
  }

  // ---- medical records ----
  function addRecord(record: Omit<MedicalRecord, 'id'>) {
    state.records.push({ ...record, id: uid() })
    commit()
  }

  function deleteRecord(id: string) {
    state.records = state.records.filter((r) => r.id !== id)
    commit()
  }

  // ---- derived state ----
  const expiredMedicines = computed(() =>
    state.medicines.filter((m) => daysUntil(m.expiryDate) < 0),
  )

  const expiringMedicines = computed(() =>
    state.medicines.filter((m) => {
      const d = daysUntil(m.expiryDate)
      return d >= 0 && d <= 30
    }),
  )

  const todayDoses = computed<TodayDose[]>(() => {
    const today = todayStr()
    const doses: TodayDose[] = []
    for (const plan of state.plans) {
      if (plan.startDate > today || plan.endDate < today) continue
      const member = state.members.find((m) => m.id === plan.memberId)
      const medicine = state.medicines.find((m) => m.id === plan.medicineId)
      if (!member || !medicine) continue
      for (const time of plan.times) {
        const log = state.logs.find(
          (l) => l.planId === plan.id && l.date === today && l.time === time,
        )
        doses.push({
          planId: plan.id,
          memberId: member.id,
          memberName: member.name,
          medicineName: medicine.name,
          dosage: plan.dosage,
          time,
          status: log ? log.status : 'pending',
        })
      }
    }
    return doses.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
  })

  const compliance7 = computed(() => {
    const days = new Set(lastNDates(7))
    let taken = 0
    let skipped = 0
    for (const log of state.logs) {
      if (!days.has(log.date)) continue
      if (log.status === 'taken') taken++
      else skipped++
    }
    const total = taken + skipped
    return { taken, skipped, rate: total ? taken / total : 0 }
  })

  const achievements = computed<Achievement[]>(() =>
    ACHIEVEMENTS.map((def) => ({
      ...def,
      unlockedAt: state.unlockedAchievements[def.id] ?? null,
    })),
  )

  const healthScore = computed<HealthScoreResult>(() =>
    computeHealthScore({
      members: state.members,
      medicines: state.medicines,
      logs: state.logs,
    }),
  )

  const lastRecordDate = computed(() => {
    if (!state.records.length) return '—'
    const max = state.records.reduce((a, r) => (r.date > a ? r.date : a), '')
    return formatDate(max)
  })

  const stats = computed(() => ({
    memberCount: state.members.length,
    medicineCount: state.medicines.length,
    todayDoseCount: todayDoses.value.length,
    todayPending: todayDoses.value.filter((d) => d.status === 'pending').length,
    complianceRate: compliance7.value.rate,
    expiredCount: expiredMedicines.value.length,
    lastRecordDate: lastRecordDate.value,
  }))

  return reactive({
    state,
    // actions
    addMember,
    updateMember,
    deleteMember,
    getMember,
    addMetric,
    deleteMetric,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    cleanExpired,
    getMedicine,
    addPlan,
    deletePlan,
    logDose,
    addRecord,
    deleteRecord,
    // derived
    expiredMedicines,
    expiringMedicines,
    todayDoses,
    compliance7,
    achievements,
    healthScore,
    lastRecordDate,
    stats,
  })
}

export type FamilyStore = ReturnType<typeof createStore>

const store = createStore()

export function useFamilyStore(): FamilyStore {
  return store
}
