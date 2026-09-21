import type { FamilyMember, Medicine, MedicationLog } from '../types'
import { lastNDates } from './date'

export interface HealthScoreInput {
  members: FamilyMember[]
  medicines: Medicine[]
  logs: MedicationLog[]
}

export interface ScoreBreakdownItem {
  label: string
  score: number
  max: number
  note: string
}

export interface HealthScoreResult {
  total: number
  grade: string
  breakdown: ScoreBreakdownItem[]
}

const EXPIRY_WARN_DAYS = 30

export function computeHealthScore(input: HealthScoreInput): HealthScoreResult {
  // 1) Medication compliance — 40 points
  const days = new Set(lastNDates(7))
  let taken = 0
  let skipped = 0
  for (const log of input.logs) {
    if (!days.has(log.date)) continue
    if (log.status === 'taken') taken++
    else skipped++
  }
  const total = taken + skipped
  const compliance = total ? taken / total : 0
  const complianceScore = Math.round(compliance * 40)

  // 2) Metric recording frequency — 30 points (last 30 days, target 10)
  const cutoff = Date.now() - 30 * 86400000
  const recent = input.members.reduce(
    (s, m) => s + m.metrics.filter((mt) => mt.timestamp >= cutoff).length,
    0,
  )
  const metricScore = Math.round(Math.min(recent / 10, 1) * 30)

  // 3) Medicine management — 30 points (deduct for expired / near-expiry)
  let expired = 0
  let expiring = 0
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  for (const med of input.medicines) {
    const [y, m, d] = med.expiryDate.split('-').map(Number)
    const diff = Math.round((new Date(y, m - 1, d).getTime() - today) / 86400000)
    if (diff < 0) expired++
    else if (diff <= EXPIRY_WARN_DAYS) expiring++
  }
  let medicineScore = 30
  medicineScore -= Math.min(expired * 5, 15)
  medicineScore -= Math.min(expiring * 2, 10)
  medicineScore = Math.max(0, medicineScore)

  const totalScore = complianceScore + metricScore + medicineScore
  const grade =
    totalScore >= 90 ? '优秀' : totalScore >= 75 ? '良好' : totalScore >= 60 ? '一般' : '待改善'

  return {
    total: totalScore,
    grade,
    breakdown: [
      {
        label: '用药依从率',
        score: complianceScore,
        max: 40,
        note: `近7天依从率 ${Math.round(compliance * 100)}%`,
      },
      {
        label: '指标记录频率',
        score: metricScore,
        max: 30,
        note: `近30天记录 ${recent} 条`,
      },
      {
        label: '药品管理规范度',
        score: medicineScore,
        max: 30,
        note: `过期 ${expired} 种 · 临期 ${expiring} 种`,
      },
    ],
  }
}
