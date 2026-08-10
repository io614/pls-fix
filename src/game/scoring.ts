export interface Kpi {
  label: string
  value: number
  /** Rendered suffix; most of these are percentages that nobody audits. */
  unit?: string
  tone?: 'good' | 'neutral' | 'warn' | 'bad'
}

function hash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

function tone(value: number): Kpi['tone'] {
  if (value >= 90) return 'good'
  if (value >= 60) return 'neutral'
  if (value >= 30) return 'warn'
  return 'bad'
}

/**
 * ALIGNMENT tracks real puzzle progress. The rest are stable per level and drift just
 * enough to look like a dashboard somebody maintains.
 */
export function computeKpis(
  levelId: string,
  progress: number,
  elapsedSeconds: number,
  escalations = 0,
): Kpi[] {
  const seed = hash(levelId)
  const alignment = Math.round(progress * 100)
  const efficiency = Math.max(12, Math.round(118 - elapsedSeconds * 0.55))
  const satisfaction = Math.round(48 + seed * 40 + progress * 8)
  const delivery = Math.round(96 + seed * 18)
  // Escalating a rectangle is, of course, an ownership problem.
  const ownership = Math.max(4, Math.round(31 + hash(levelId + 'own') * 44) - escalations * 11)
  const synergy = Math.round(4 + hash(levelId + 'syn') * 22)

  return [
    { label: 'Alignment', value: alignment, unit: '%', tone: tone(alignment) },
    { label: 'Efficiency', value: efficiency, unit: '%', tone: tone(Math.min(efficiency, 100)) },
    { label: 'Stakeholder Satisfaction', value: satisfaction, unit: '%', tone: tone(satisfaction) },
    { label: 'Delivery', value: delivery, unit: '%', tone: 'good' },
    { label: 'Ownership', value: ownership, unit: '%', tone: tone(ownership) },
    { label: 'Synergy', value: synergy, unit: '%', tone: tone(synergy) },
  ]
}

export type Rating =
  | 'Exceeds Expectations'
  | 'Meets Expectations'
  | 'Partially Meets Expectations'
  | 'Needs Improvement'

/**
 * Deliberately only loosely correlated with skill, and never used to block progress.
 */
export function performanceRating(levelId: string, elapsedSeconds: number): Rating {
  const seed = hash(levelId + 'rating')
  if (elapsedSeconds < 25 && seed > 0.7) return 'Exceeds Expectations'
  if (elapsedSeconds > 240) return 'Partially Meets Expectations'
  return 'Meets Expectations'
}

export function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(clamped / 60)
  const s = clamped % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
