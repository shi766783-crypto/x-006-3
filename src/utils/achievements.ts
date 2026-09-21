import type {
  FamilyMember,
  Medicine,
  MedicationLog,
  MedicationPlan,
  MedicalRecord,
} from '../types'
import { daysUntil, lastNDates } from './date'

export interface AchievementInput {
  members: FamilyMember[]
  medicines: Medicine[]
  plans: MedicationPlan[]
  logs: MedicationLog[]
  records: MedicalRecord[]
}

function planDurationDays(plan: MedicationPlan): number {
  if (!plan.startDate || !plan.endDate) return 0
  const start = plan.startDate
  const end = plan.endDate
  const [sy, sm, sd] = start.split('-').map(Number)
  const [ey, em, ed] = end.split('-').map(Number)
  return Math.round(
    (new Date(ey, em - 1, ed).getTime() - new Date(sy, sm - 1, sd).getTime()) / 86400000,
  )
}

/** Days (distinct) where every recorded dose was taken. */
function onTimeDays(logs: MedicationLog[]): number {
  const byDate = new Map<string, MedicationLog[]>()
  for (const log of logs) {
    const list = byDate.get(log.date) ?? []
    list.push(log)
    byDate.set(log.date, list)
  }
  let count = 0
  for (const list of byDate.values()) {
    if (list.length > 0 && list.every((l) => l.status === 'taken')) count++
  }
  return count
}

/** Whether the last 7 days show 100% compliance with at least one taken dose. */
function perfectCompliance7(logs: MedicationLog[]): boolean {
  const days = new Set(lastNDates(7))
  let taken = 0
  let skipped = 0
  for (const log of logs) {
    if (!days.has(log.date)) continue
    if (log.status === 'taken') taken++
    else skipped++
  }
  return taken > 0 && skipped === 0
}

export function evaluateAchievements(input: AchievementInput): Record<string, number> {
  const unlocked: Record<string, number> = {}
  const now = Date.now()
  const unlock = (id: string) => {
    unlocked[id] = now
  }

  const totalMetrics = input.members.reduce((s, m) => s + m.metrics.length, 0)
  const hasExpired = input.medicines.some((m) => daysUntil(m.expiryDate) < 0)

  if (input.members.length >= 1) unlock('first_member')
  if (input.members.length >= 3) unlock('family_guardian')
  if (totalMetrics >= 1) unlock('first_metric')
  if (totalMetrics >= 20) unlock('metric_expert')
  if (input.medicines.length >= 1) unlock('first_medicine')
  if (input.medicines.length >= 10) unlock('medicine_master')
  if (input.medicines.length >= 1 && !hasExpired) unlock('zero_expired')
  if (input.records.length >= 1) unlock('first_record')
  if (input.plans.length >= 1) unlock('first_plan')
  if (input.plans.some((p) => planDurationDays(p) >= 30)) unlock('long_term')
  if (onTimeDays(input.logs) >= 7) unlock('on_time_7')
  if (perfectCompliance7(input.logs)) unlock('perfect_compliance')

  return unlocked
}
