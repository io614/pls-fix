import type { Sender } from '../game/types'

export const CAST = {
  sarah: { name: 'Sarah', role: 'VP, Strategy' },
  marcus: { name: 'Marcus', role: 'Managing Director' },
  priya: { name: 'Priya', role: 'PMO' },
  alex: { name: 'Alex', role: 'Design' },
  david: { name: 'David', role: 'Transformation Lead' },
} satisfies Record<string, Sender>

export type CastKey = keyof typeof CAST

/** Two initials on a flat disc — the house style for corporate avatars. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export const LOADING_COPY = [
  'Aligning stakeholders',
  'Building consensus',
  'Creating synergies',
  'Checking with management',
  'Socialising the deck',
  'Validating assumptions',
]

export const SAVE_COPY = ['Saving…', 'Saved locally.']
