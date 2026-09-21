export function calculateAge(dob: string): number {
  if (!dob) return 0
  const [y, m, d] = dob.split('-').map(Number)
  const now = new Date()
  let age = now.getFullYear() - y
  const before =
    now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)
  if (before) age--
  return Math.max(0, age)
}

export function formatCurrency(n: number): string {
  return `¥${(Number(n) || 0).toFixed(2)}`
}

/** Extract the first numeric value from a string like "120/80". */
export function numericValue(value: string): number {
  const m = value.match(/-?\d+(\.\d+)?/)
  return m ? parseFloat(m[0]) : NaN
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`
}
