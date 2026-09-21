import type {
  AchievementDefinition,
  MedicineCategory,
  MetricType,
} from '../types'

export const RELATION_OPTIONS = [
  '本人',
  '配偶',
  '父亲',
  '母亲',
  '儿子',
  '女儿',
  '祖父',
  '祖母',
  '其他',
]

export const BLOOD_TYPE_OPTIONS = ['A型', 'B型', 'AB型', 'O型', '未知']

export const MEDICINE_CATEGORIES: Record<MedicineCategory, string> = {
  cold: '感冒',
  'anti-inflammatory': '消炎',
  hypertension: '降压',
  diabetes: '降糖',
  external: '外用药',
  other: '其他',
}

export interface MetricMeta {
  label: string
  unit: string
  normalRange: string
  color: string
}

export const METRIC_META: Record<MetricType, MetricMeta> = {
  blood_pressure: {
    label: '血压',
    unit: 'mmHg',
    normalRange: '90-140 / 60-90',
    color: '#e74c3c',
  },
  blood_sugar: {
    label: '血糖',
    unit: 'mmol/L',
    normalRange: '3.9-6.1',
    color: '#f39c12',
  },
  heart_rate: {
    label: '心率',
    unit: '次/分',
    normalRange: '60-100',
    color: '#3498db',
  },
  temperature: {
    label: '体温',
    unit: '℃',
    normalRange: '36.0-37.2',
    color: '#9b59b6',
  },
  weight: {
    label: '体重',
    unit: 'kg',
    normalRange: '视个体情况',
    color: '#16a085',
  },
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'first_member', name: '首次建档', icon: '🏠', description: '创建第一位家庭成员档案' },
  { id: 'family_guardian', name: '全家守护者', icon: '👨‍👩‍👧‍👦', description: '建立 3 位及以上成员档案' },
  { id: 'first_metric', name: '健康管家', icon: '📈', description: '记录第一条健康指标' },
  { id: 'metric_expert', name: '健康记录达人', icon: '📊', description: '累计记录 20 条健康指标' },
  { id: 'first_medicine', name: '药箱初体验', icon: '💊', description: '添加第一种药品' },
  { id: 'medicine_master', name: '药品管理师', icon: '🗃️', description: '药箱中拥有 10 种药品' },
  { id: 'zero_expired', name: '药品零过期', icon: '✅', description: '药箱中无过期药品' },
  { id: 'first_record', name: '就医记录员', icon: '🏥', description: '记录第一次就医事件' },
  { id: 'first_plan', name: '用药规划师', icon: '📅', description: '创建第一个用药计划' },
  { id: 'long_term', name: '长期坚持', icon: '💪', description: '建立持续 30 天及以上的用药计划' },
  { id: 'on_time_7', name: '按时服药7天', icon: '⏰', description: '有 7 天全部按时服药' },
  { id: 'perfect_compliance', name: '完美依从', icon: '🌟', description: '近 7 天用药依从率 100%' },
]
