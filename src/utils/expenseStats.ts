import type { FamilyMember, MedicalRecord } from '../types'

export interface MemberExpense {
  memberId: string
  name: string
  total: number
  count: number
  /** Share of the yearly total, 0–1. */
  share: number
}

export interface ExpenseStats {
  year: number
  /** Sum of valid costs for records dated within the year. */
  yearTotal: number
  /** Records actually included in the statistics. */
  validCount: number
  /** Included records whose cost was missing/invalid (counted as ¥0). */
  missingCostCount: number
  /** Records excluded entirely because the date was missing/invalid. */
  invalidDateCount: number
  /** 12 entries, index 0 = January. */
  monthlyTotals: number[]
  /** Highest-spending month; null when the yearly total is ¥0. */
  maxMonth: { month: number; total: number } | null
  /** yearTotal / member count; null when there are no family members. */
  perCapita: number | null
  perMember: MemberExpense[]
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

/** Strictly validate a YYYY-MM-DD string as a real calendar date. */
export function isValidDateStr(dateStr: unknown): boolean {
  if (typeof dateStr !== 'string') return false
  const m = DATE_RE.exec(dateStr)
  if (!m) return false
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  if (month < 1 || month > 12) return false
  // Day 0 of the next month = last day of the given month.
  return day >= 1 && day <= new Date(year, month, 0).getDate()
}

/** Coerce a raw cost value; null when missing/invalid (NaN, negative, non-finite). */
export function sanitizeCost(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return null
  return n
}

/** Years that contain at least one validly-dated record, plus the current year. */
export function availableYears(records: MedicalRecord[]): number[] {
  const years = new Set<number>([new Date().getFullYear()])
  for (const r of records) {
    if (r && isValidDateStr(r.date)) years.add(Number(r.date.slice(0, 4)))
  }
  return [...years].sort((a, b) => b - a)
}

/**
 * Aggregate medical-record costs for one year.
 *
 * Statistical rules (mirrored on the stats page):
 * - Records with a missing/invalid date are excluded from every figure.
 * - Records with a missing/invalid cost count as ¥0 but are tallied separately.
 * - Per-capita = yearly total ÷ current family-member count.
 */
export function computeExpenseStats(
  records: MedicalRecord[],
  members: FamilyMember[],
  year: number,
): ExpenseStats {
  const monthlyTotals: number[] = new Array(12).fill(0)
  const byMember = new Map<string, MemberExpense>()
  let yearTotal = 0
  let validCount = 0
  let missingCostCount = 0
  let invalidDateCount = 0

  for (const r of records) {
    if (!r || !isValidDateStr(r.date)) {
      invalidDateCount++
      continue
    }
    if (Number(r.date.slice(0, 4)) !== year) continue

    const cost = sanitizeCost(r.cost)
    if (cost === null) missingCostCount++
    const amount = cost ?? 0

    validCount++
    yearTotal += amount
    monthlyTotals[Number(r.date.slice(5, 7)) - 1] += amount

    const memberId = typeof r.memberId === 'string' ? r.memberId : ''
    const name = members.find((m) => m.id === memberId)?.name ?? '未知成员'
    const entry = byMember.get(memberId) ?? { memberId, name, total: 0, count: 0, share: 0 }
    entry.total += amount
    entry.count++
    byMember.set(memberId, entry)
  }

  const perMember = [...byMember.values()]
    .map((e) => ({ ...e, share: yearTotal > 0 ? e.total / yearTotal : 0 }))
    .sort((a, b) => b.total - a.total)

  let maxMonth: ExpenseStats['maxMonth'] = null
  if (yearTotal > 0) {
    let idx = 0
    for (let i = 1; i < 12; i++) {
      if (monthlyTotals[i] > monthlyTotals[idx]) idx = i
    }
    maxMonth = { month: idx + 1, total: monthlyTotals[idx] }
  }

  return {
    year,
    yearTotal,
    validCount,
    missingCostCount,
    invalidDateCount,
    monthlyTotals,
    maxMonth,
    perCapita: members.length ? yearTotal / members.length : null,
    perMember,
  }
}
