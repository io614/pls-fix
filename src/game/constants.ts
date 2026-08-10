import type { Tolerance } from './types'

export const DEFAULT_TOLERANCE: Tolerance = {
  position: 8,
  rotation: 3,
  size: 5,
  snap: 8,
  snapRotation: 4,
  snapSize: 6,
  relational: 2.5,
}

export const MIN_SHAPE_SIZE = 28

export function resolveTolerance(override?: Partial<Tolerance>): Tolerance {
  return override ? { ...DEFAULT_TOLERANCE, ...override } : DEFAULT_TOLERANCE
}
