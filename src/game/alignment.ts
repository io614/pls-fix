import type { Constraint, GameShape, Tolerance } from './types'

export interface Edges {
  left: number
  right: number
  top: number
  bottom: number
  centerX: number
  centerY: number
  width: number
  height: number
}

export function edges(s: GameShape): Edges {
  return {
    left: s.x,
    right: s.x + s.width,
    top: s.y,
    bottom: s.y + s.height,
    centerX: s.x + s.width / 2,
    centerY: s.y + s.height / 2,
    width: s.width,
    height: s.height,
  }
}

export function byId(shapes: GameShape[]): Map<string, GameShape> {
  return new Map(shapes.map((s) => [s.id, s]))
}

/** Normalises a rotation to the (-180, 180] range so 359° and -1° compare equal. */
export function normaliseRotation(deg: number): number {
  let r = deg % 360
  if (r > 180) r -= 360
  if (r <= -180) r += 360
  return r
}

export function rotationDelta(a: number, b: number): number {
  return Math.abs(normaliseRotation(a - b))
}

/** Euclidean distance from the target position, ignoring axes the target leaves free. */
export function distanceFromTarget(s: GameShape): number {
  if (!s.target) return 0
  const dx = s.target.x === undefined ? 0 : s.x - s.target.x
  const dy = s.target.y === undefined ? 0 : s.y - s.target.y
  return Math.hypot(dx, dy)
}

export function isPositionAligned(s: GameShape, tol: Tolerance): boolean {
  if (!s.target || (s.target.x === undefined && s.target.y === undefined)) return true
  return distanceFromTarget(s) <= tol.position
}

export function isSizeAligned(s: GameShape, tol: Tolerance): boolean {
  if (!s.target) return true
  if (s.target.width !== undefined && Math.abs(s.width - s.target.width) > tol.size) return false
  if (s.target.height !== undefined && Math.abs(s.height - s.target.height) > tol.size) return false
  return true
}

export function isRotationAligned(s: GameShape, tol: Tolerance): boolean {
  if (!s.target || s.target.rotation === undefined) return true
  return rotationDelta(s.rotation ?? 0, s.target.rotation) <= tol.rotation
}

export function hasObjective(s: GameShape): boolean {
  if (!s.target) return false
  const t = s.target
  return (
    t.x !== undefined ||
    t.y !== undefined ||
    t.width !== undefined ||
    t.height !== undefined ||
    t.rotation !== undefined
  )
}

export function isShapeComplete(s: GameShape, tol: Tolerance): boolean {
  return isPositionAligned(s, tol) && isSizeAligned(s, tol) && isRotationAligned(s, tol)
}

type Accessor = (e: Edges) => number

const ALIGN_ACCESSORS: Partial<Record<Constraint['kind'], Accessor>> = {
  alignLeft: (e) => e.left,
  alignRight: (e) => e.right,
  alignTop: (e) => e.top,
  alignBottom: (e) => e.bottom,
  alignCenterX: (e) => e.centerX,
  alignCenterY: (e) => e.centerY,
  equalWidth: (e) => e.width,
  equalHeight: (e) => e.height,
}

export function constraintAccessor(kind: Constraint['kind']): Accessor | undefined {
  return ALIGN_ACCESSORS[kind]
}

export function isHorizontalConstraint(kind: Constraint['kind']): boolean {
  return (
    kind === 'alignLeft' ||
    kind === 'alignRight' ||
    kind === 'alignCenterX' ||
    kind === 'equalSpacingX'
  )
}

function resolveIds(c: Constraint, map: Map<string, GameShape>): GameShape[] {
  const out: GameShape[] = []
  for (const id of c.ids) {
    const s = map.get(id)
    if (s) out.push(s)
  }
  return out
}

/** Consecutive gaps, in declared order, along the given axis. */
export function gapsAlong(shapes: GameShape[], axis: 'x' | 'y'): number[] {
  const gaps: number[] = []
  for (let i = 0; i < shapes.length - 1; i++) {
    const a = shapes[i]
    const b = shapes[i + 1]
    gaps.push(axis === 'x' ? b.x - (a.x + a.width) : b.y - (a.y + a.height))
  }
  return gaps
}

function spread(values: number[]): number {
  if (values.length === 0) return 0
  return Math.max(...values) - Math.min(...values)
}

export function constraintError(c: Constraint, map: Map<string, GameShape>): number {
  const group = resolveIds(c, map)
  if (group.length < 2) return 0
  if (c.kind === 'equalSpacingX' || c.kind === 'equalSpacingY') {
    if (group.length < 3) return 0
    return spread(gapsAlong(group, c.kind === 'equalSpacingX' ? 'x' : 'y'))
  }
  const accessor = constraintAccessor(c.kind)
  if (!accessor) return 0
  return spread(group.map((s) => accessor(edges(s))))
}

export function isConstraintSatisfied(
  c: Constraint,
  map: Map<string, GameShape>,
  tol: Tolerance,
): boolean {
  return constraintError(c, map) <= (c.tolerance ?? tol.relational)
}

/**
 * PowerPoint-style "distribute": the first and last shapes in declared order are
 * anchors, and everything between them is laid out with identical gaps. Returns the
 * ideal leading edge for every shape in the group, which is what snapping aims at.
 */
export function distributeIdeal(
  group: GameShape[],
  axis: 'x' | 'y',
): Map<string, number> {
  const ideal = new Map<string, number>()
  if (group.length < 2) return ideal
  const sizeOf = (s: GameShape) => (axis === 'x' ? s.width : s.height)
  const startOf = (s: GameShape) => (axis === 'x' ? s.x : s.y)

  const first = group[0]
  const last = group[group.length - 1]
  const from = startOf(first)
  const to = startOf(last) + sizeOf(last)
  const totalSize = group.reduce((sum, s) => sum + sizeOf(s), 0)
  const gap = (to - from - totalSize) / (group.length - 1)

  let cursor = from
  for (const s of group) {
    ideal.set(s.id, cursor)
    cursor += sizeOf(s) + gap
  }
  return ideal
}

export function distributeIdealForConstraint(
  c: Constraint,
  map: Map<string, GameShape>,
): Map<string, number> {
  const axis = c.kind === 'equalSpacingX' ? 'x' : 'y'
  return distributeIdeal(resolveIds(c, map), axis)
}

export interface Objective {
  key: string
  satisfied: boolean
  /** How far off, in px (or degrees for rotation-only objectives). */
  error: number
}

export function objectives(
  shapes: GameShape[],
  constraints: Constraint[] | undefined,
  tol: Tolerance,
): Objective[] {
  const map = byId(shapes)
  const out: Objective[] = []
  for (const s of shapes) {
    if (!hasObjective(s)) continue
    const positional = distanceFromTarget(s)
    const sizeError = Math.max(
      s.target?.width === undefined ? 0 : Math.abs(s.width - s.target.width),
      s.target?.height === undefined ? 0 : Math.abs(s.height - s.target.height),
    )
    const rotError =
      s.target?.rotation === undefined ? 0 : rotationDelta(s.rotation ?? 0, s.target.rotation)
    out.push({
      key: `shape:${s.id}`,
      satisfied: isShapeComplete(s, tol),
      error: Math.max(positional, sizeError, rotError),
    })
  }
  for (const [i, c] of (constraints ?? []).entries()) {
    out.push({
      key: `constraint:${c.kind}:${i}`,
      satisfied: isConstraintSatisfied(c, map, tol),
      error: constraintError(c, map),
    })
  }
  return out
}

export function isLevelComplete(
  shapes: GameShape[],
  constraints: Constraint[] | undefined,
  tol: Tolerance,
): boolean {
  return objectives(shapes, constraints, tol).every((o) => o.satisfied)
}

/**
 * 0..1 progress. Satisfied objectives count in full; unsatisfied ones contribute a
 * partial credit that decays with error, so the ALIGNMENT readout moves while dragging.
 */
export function alignmentProgress(objs: Objective[]): number {
  if (objs.length === 0) return 1
  let score = 0
  for (const o of objs) {
    if (o.satisfied) {
      score += 1
    } else {
      // Near-misses earn a little credit so the readout responds to dragging, but not
      // enough to claim the work is nearly done when nothing has actually landed.
      score += Math.max(0, 1 - o.error / 45) * 0.35
    }
  }
  return score / objs.length
}
