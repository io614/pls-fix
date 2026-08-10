export const POSITIVE = [
  'Looks good.',
  'Perfect.',
  'Much better.',
  'Thanks.',
  'Approved.',
  'LGTM.',
  'Nice.',
  'This works.',
  'Exactly what I had in mind.',
]

export const AMBIGUOUS = [
  'Something still feels off.',
  'Can we tighten this?',
  'Almost there.',
  'Maybe slightly cleaner?',
  'Can we make this feel more premium?',
  'Can we simplify?',
  'Can we make it pop?',
]

export const URGENT = [
  'Need this asap.',
  'CEO is waiting.',
  'Can we prioritise this?',
  'Need before EOD.',
  'Quick turnaround please.',
  'Can we close this today?',
]

export const CONTRADICTORY = [
  'Can we make it bigger but take up less space?',
  'Can we simplify while keeping all the information?',
  'Can we make it more premium but less designed?',
  'Can we keep it exactly the same but different?',
]

/** Deterministic pick so a given level always says the same thing. */
export function pickFrom(pool: string[], seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return pool[h % pool.length]
}
