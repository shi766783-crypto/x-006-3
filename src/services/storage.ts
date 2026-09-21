import type {
  FamilyMember,
  Medicine,
  MedicationLog,
  MedicationPlan,
  MedicalRecord,
} from '../types'

/**
 * Persistence layer. Owns localStorage keys and (de)serialization.
 * UI / store layers never touch localStorage directly.
 */
const KEYS = {
  members: 'fh_members',
  medicines: 'fh_medicines',
  plans: 'fh_plans',
  logs: 'fh_logs',
  records: 'fh_records',
  achievements: 'fh_achievements',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const StorageService = {
  loadMembers: (): FamilyMember[] => read(KEYS.members, []),
  saveMembers: (v: FamilyMember[]) => write(KEYS.members, v),

  loadMedicines: (): Medicine[] => read(KEYS.medicines, []),
  saveMedicines: (v: Medicine[]) => write(KEYS.medicines, v),

  loadPlans: (): MedicationPlan[] => read(KEYS.plans, []),
  savePlans: (v: MedicationPlan[]) => write(KEYS.plans, v),

  loadLogs: (): MedicationLog[] => read(KEYS.logs, []),
  saveLogs: (v: MedicationLog[]) => write(KEYS.logs, v),

  loadRecords: (): MedicalRecord[] => read(KEYS.records, []),
  saveRecords: (v: MedicalRecord[]) => write(KEYS.records, v),

  loadAchievements: (): Record<string, number> => read(KEYS.achievements, {}),
  saveAchievements: (v: Record<string, number>) => write(KEYS.achievements, v),
}
