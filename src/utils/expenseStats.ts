import type { FamilyMember, MedicalRecord } from '../types'

/**
 * 就医费用统计的纯函数实现。
 *
 * 统计口径（脏数据不会拖垮整页，而是按约定归类并计数）：
 * 1. 日期缺失或非法（不符合 YYYY-MM-DD 或不存在的日期）的记录无法归属到
 *    任何年份/月份，排除出全部统计，计入 excludedCount。
 * 2. 费用缺失、负数或非数字的记录按 ¥0 计入总额（仍计入就诊笔数），
 *    计入 zeroCostCount 提醒用户补录。
 * 3. 人均 = 年度合计 ÷ 家庭成员总数；无成员时为 null。
 * 4. 单月最高只在当年有记录的月份中比较。
 * 5. 成员已删除的历史记录归入「已删除成员」。
 */

export interface MemberExpenseRow {
  memberId: string
  name: string
  total: number
  count: number
  /** 占年度合计的比例，0-1 */
  share: number
}

export interface ExpenseStatsResult {
  year: number
  /** 年度合计（元） */
  yearTotal: number
  /** 12 个月的费用合计，下标 0 = 1 月 */
  monthTotals: number[]
  /** 计入统计的记录条数 */
  recordCount: number
  /** 单月最高（month 为 1-12）；当年无有效记录时为 null */
  maxMonth: { month: number; amount: number } | null
  /** 人均费用；无家庭成员时为 null */
  perCapita: number | null
  memberRows: MemberExpenseRow[]
  /** 费用缺失/非法、按 ¥0 计入的记录条数 */
  zeroCostCount: number
  /** 日期缺失/非法、被排除出统计的记录条数 */
  excludedCount: number
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

/** 解析 YYYY-MM-DD；缺失或不存在的日期返回 null。 */
export function parseRecordDate(date: string): { year: number; month: number } | null {
  const m = DATE_RE.exec(date ?? '')
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  // 拒绝 2025-02-30 这类不存在的日期
  const d = new Date(year, month - 1, day)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null
  return { year, month }
}

/** 费用只有是「有限的非负数字」时才可用，否则返回 null（按 ¥0 处理）。 */
export function normalizeCost(cost: unknown): number | null {
  const n = typeof cost === 'string' && cost.trim() !== '' ? Number(cost) : cost
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : null
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function computeExpenseStats(
  records: MedicalRecord[],
  members: FamilyMember[],
  year: number,
): ExpenseStatsResult {
  const monthTotals = new Array<number>(12).fill(0)
  const monthCounts = new Array<number>(12).fill(0)
  const byMember = new Map<string, { total: number; count: number }>()
  const memberIds = new Set(members.map((m) => m.id))
  let recordCount = 0
  let zeroCostCount = 0
  let excludedCount = 0
  let removedTotal = 0
  let removedCount = 0

  for (const r of records) {
    const parsed = parseRecordDate(r.date)
    if (!parsed) {
      excludedCount++
      continue
    }
    if (parsed.year !== year) continue

    const cost = normalizeCost(r.cost)
    if (cost === null) zeroCostCount++
    const amount = cost ?? 0

    recordCount++
    monthTotals[parsed.month - 1] += amount
    monthCounts[parsed.month - 1]++

    if (memberIds.has(r.memberId)) {
      const row = byMember.get(r.memberId) ?? { total: 0, count: 0 }
      row.total += amount
      row.count++
      byMember.set(r.memberId, row)
    } else {
      removedTotal += amount
      removedCount++
    }
  }

  const yearTotal = round2(monthTotals.reduce((s, v) => s + v, 0))

  // 单月最高：只在当年有记录的月份中比较，金额相同取较早的月份
  let maxMonth: ExpenseStatsResult['maxMonth'] = null
  if (recordCount > 0) {
    let best = -1
    for (let i = 0; i < 12; i++) {
      if (monthCounts[i] === 0) continue
      if (best === -1 || monthTotals[i] > monthTotals[best]) best = i
    }
    maxMonth = { month: best + 1, amount: round2(monthTotals[best]) }
  }

  const memberRows: MemberExpenseRow[] = members.map((m) => {
    const row = byMember.get(m.id) ?? { total: 0, count: 0 }
    return {
      memberId: m.id,
      name: m.name,
      total: round2(row.total),
      count: row.count,
      share: yearTotal > 0 ? row.total / yearTotal : 0,
    }
  })
  if (removedCount > 0) {
    memberRows.push({
      memberId: '',
      name: '已删除成员',
      total: round2(removedTotal),
      count: removedCount,
      share: yearTotal > 0 ? removedTotal / yearTotal : 0,
    })
  }
  memberRows.sort((a, b) => b.total - a.total)

  return {
    year,
    yearTotal,
    monthTotals: monthTotals.map(round2),
    recordCount,
    maxMonth,
    perCapita: members.length ? round2(yearTotal / members.length) : null,
    memberRows,
    zeroCostCount,
    excludedCount,
  }
}

/** 有有效记录的年份集合，始终包含当前年份，倒序排列。 */
export function availableYears(records: MedicalRecord[]): number[] {
  const years = new Set<number>([new Date().getFullYear()])
  for (const r of records) {
    const parsed = parseRecordDate(r.date)
    if (parsed) years.add(parsed.year)
  }
  return [...years].sort((a, b) => b - a)
}
