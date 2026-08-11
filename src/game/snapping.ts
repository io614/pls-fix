import {
  byId,
  distributeIdeal,
  edges,
  isHorizontalConstraint,
  normaliseRotation,
} from './alignment'
import { MIN_SHAPE_SIZE } from './constants'
import type {
  CanvasGrid,
  Constraint,
  GameShape,
  GapBadge,
  Guide,
  SnapResult,
  Tolerance,
} from './types'

export interface SnapContext {
  shapes: GameShape[]
  constraints?: Constraint[]
  tol: Tolerance
  enabled: boolean
  /** Present when the surface draws a grid the player can align against. */
  grid?: CanvasGrid
}

interface Candidate {
  value: number
  guide?: Guide
  /** Present for spacing candidates so the gap pills can be drawn. */
  spacing?: { ids: string[]; axis: 'x' | 'y' }
  /**
   * A shape's own target always wins over a candidate implied by where its
   * neighbours happen to be sitting. Without this, two misaligned siblings can snap
   * to each other and leave the level quietly unsolvable.
   */
  primary?: boolean
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function nearest(candidates: Candidate[], raw: number, radius: number): Candidate | undefined {
  let best: Candidate | undefined
  let bestDist = radius
  for (const c of candidates) {
    const d = Math.abs(raw - c.value)
    if (d < bestDist) {
      best = c
      bestDist = d
    }
  }
  return best
}

function pick(candidates: Candidate[], raw: number, radius: number): Candidate | undefined {
  const primary = nearest(
    candidates.filter((c) => c.primary),
    raw,
    radius,
  )
  return primary ?? nearest(candidates, raw, radius)
}

/** Bounding span of a group along one axis, used to size the guide lines. */
function span(group: GameShape[], axis: 'x' | 'y'): { from: number; to: number } {
  const starts = group.map((s) => (axis === 'x' ? s.x : s.y))
  const ends = group.map((s) => (axis === 'x' ? s.x + s.width : s.y + s.height))
  return { from: Math.min(...starts) - 14, to: Math.max(...ends) + 14 }
}

function constraintsFor(ctx: SnapContext, id: string): Constraint[] {
  return (ctx.constraints ?? []).filter((c) => c.ids.includes(id))
}

function groupOf(c: Constraint, map: Map<string, GameShape>): GameShape[] {
  return c.ids.map((id) => map.get(id)).filter((s): s is GameShape => Boolean(s))
}

/**
 * Position candidates along one axis: the shape's own target, plus whatever its
 * relational constraints imply given where every other shape currently sits.
 */
function positionCandidates(
  shape: GameShape,
  axis: 'x' | 'y',
  raw: number,
  ctx: SnapContext,
): Candidate[] {
  const out: Candidate[] = []
  const horizontal = axis === 'x'
  const size = horizontal ? shape.width : shape.height

  const targetValue = horizontal ? shape.target?.x : shape.target?.y
  if (targetValue !== undefined) out.push({ value: targetValue, primary: true })

  // Ruled surfaces are a real reference: let both edges settle onto a line.
  const grid = ctx.grid
  if (grid) {
    const step = horizontal ? grid.x : grid.y
    const offset = (horizontal ? grid.offsetX : grid.offsetY) ?? 0
    if (step > 0) {
      out.push({ value: offset + Math.round((raw - offset) / step) * step })
      out.push({ value: offset + Math.round((raw + size - offset) / step) * step - size })
    }
  }

  // Constraint candidates are evaluated against a world where the dragged shape has
  // already moved, so distribute anchors follow the pointer when the anchor is dragged.
  const live = ctx.shapes.map((s) =>
    s.id === shape.id ? { ...s, [axis]: raw } as GameShape : s,
  )
  const map = byId(live)

  for (const c of constraintsFor(ctx, shape.id)) {
    if (isHorizontalConstraint(c.kind) !== horizontal) continue
    const group = groupOf(c, map)
    if (group.length < 2) continue
    const others = group.filter((s) => s.id !== shape.id)

    if (c.kind === 'equalSpacingX' || c.kind === 'equalSpacingY') {
      if (group.length < 3) continue
      const ideal = distributeIdeal(group, axis)
      const value = ideal.get(shape.id)
      if (value === undefined) continue
      out.push({ value, spacing: { ids: c.ids, axis } })
      continue
    }

    if (others.length === 0) continue
    const perpendicular = span(group, horizontal ? 'y' : 'x')
    if (c.kind === 'alignLeft' || c.kind === 'alignTop') {
      const at = median(others.map((s) => (horizontal ? s.x : s.y)))
      out.push({ value: at, guide: { kind: horizontal ? 'v' : 'h', at, ...perpendicular } })
    } else if (c.kind === 'alignRight' || c.kind === 'alignBottom') {
      const at = median(others.map((s) => (horizontal ? s.x + s.width : s.y + s.height)))
      out.push({
        value: at - size,
        guide: { kind: horizontal ? 'v' : 'h', at, ...perpendicular },
      })
    } else if (c.kind === 'alignCenterX' || c.kind === 'alignCenterY') {
      const at = median(others.map((s) => (horizontal ? edges(s).centerX : edges(s).centerY)))
      out.push({
        value: at - size / 2,
        guide: { kind: horizontal ? 'v' : 'h', at, ...perpendicular },
      })
    }
  }

  return out
}

/** How close two edges must sit before they count as the same line. */
const COINCIDENT = 0.6

/**
 * Guides for every edge or centre the settled shape now shares with another shape.
 *
 * The constraint candidates above only describe where a shape *should* go, so a shape
 * landing on its own target — the moment the whole game turns on — produced no line at
 * all. These are the lines a presentation editor draws: whatever you have just lined
 * up with, shown for as long as you hold it there.
 */
function coincidenceGuides(shape: GameShape, x: number, y: number, all: GameShape[]): Guide[] {
  const w = shape.width
  const h = shape.height
  const selfX = [x, x + w / 2, x + w]
  const selfY = [y, y + h / 2, y + h]
  const found: Guide[] = []

  for (const other of all) {
    if (other.id === shape.id) continue
    const oe = edges(other)

    for (const at of selfX) {
      for (const ov of [oe.left, oe.centerX, oe.right]) {
        if (Math.abs(at - ov) > COINCIDENT) continue
        found.push({
          kind: 'v',
          at: ov,
          from: Math.min(y, oe.top),
          to: Math.max(y + h, oe.bottom),
        })
      }
    }

    for (const at of selfY) {
      for (const ov of [oe.top, oe.centerY, oe.bottom]) {
        if (Math.abs(at - ov) > COINCIDENT) continue
        found.push({
          kind: 'h',
          at: ov,
          from: Math.min(x, oe.left),
          to: Math.max(x + w, oe.right),
        })
      }
    }
  }

  return found
}

/** One line per coordinate, stretched to cover everything it touches. */
function mergeGuides(guides: Guide[]): Guide[] {
  const byLine = new Map<string, Guide>()
  for (const g of guides) {
    const key = `${g.kind}:${g.at.toFixed(1)}`
    const seen = byLine.get(key)
    if (seen) {
      seen.from = Math.min(seen.from, g.from)
      seen.to = Math.max(seen.to, g.to)
    } else {
      byLine.set(key, { ...g })
    }
  }
  return [...byLine.values()]
}

function gapBadges(ids: string[], axis: 'x' | 'y', map: Map<string, GameShape>): GapBadge[] {
  const group = ids.map((id) => map.get(id)).filter((s): s is GameShape => Boolean(s))
  const badges: GapBadge[] = []
  for (let i = 0; i < group.length - 1; i++) {
    const a = group[i]
    const b = group[i + 1]
    if (axis === 'x') {
      const gap = b.x - (a.x + a.width)
      badges.push({
        x: a.x + a.width + gap / 2,
        y: Math.max(a.y + a.height / 2, b.y + b.height / 2),
        value: Math.round(gap),
        axis,
      })
    } else {
      const gap = b.y - (a.y + a.height)
      badges.push({
        x: Math.max(a.x + a.width / 2, b.x + b.width / 2),
        y: a.y + a.height + gap / 2,
        value: Math.round(gap),
        axis,
      })
    }
  }
  return badges
}

function emptySnapped() {
  return { x: false, y: false, width: false, height: false, rotation: false }
}

export function snapMove(
  shape: GameShape,
  rawX: number,
  rawY: number,
  ctx: SnapContext,
): SnapResult {
  const result: SnapResult = {
    x: rawX,
    y: rawY,
    width: shape.width,
    height: shape.height,
    rotation: shape.rotation ?? 0,
    snapped: emptySnapped(),
    guides: [],
    gaps: [],
  }
  if (!ctx.enabled) return result

  const spacingGroups: { ids: string[]; axis: 'x' | 'y' }[] = []

  const hitX = pick(positionCandidates(shape, 'x', rawX, ctx), rawX, ctx.tol.snap)
  if (hitX) {
    result.x = hitX.value
    result.snapped.x = true
    if (hitX.guide) result.guides.push(hitX.guide)
    if (hitX.spacing) spacingGroups.push(hitX.spacing)
  }

  const hitY = pick(positionCandidates(shape, 'y', rawY, ctx), rawY, ctx.tol.snap)
  if (hitY) {
    result.y = hitY.value
    result.snapped.y = true
    if (hitY.guide) result.guides.push(hitY.guide)
    if (hitY.spacing) spacingGroups.push(hitY.spacing)
  }

  if (spacingGroups.length > 0) {
    const settled = byId(
      ctx.shapes.map((s) => (s.id === shape.id ? { ...s, x: result.x, y: result.y } : s)),
    )
    for (const g of spacingGroups) result.gaps.push(...gapBadges(g.ids, g.axis, settled))
  }

  // Whatever the shape ended up lining up with, say so.
  result.guides = mergeGuides([
    ...result.guides,
    ...coincidenceGuides(shape, result.x, result.y, ctx.shapes),
  ])

  return result
}

export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export interface ResizeInput {
  handle: ResizeHandle
  x: number
  y: number
  width: number
  height: number
}

function sizeCandidates(
  shape: GameShape,
  axis: 'width' | 'height',
  ctx: SnapContext,
): Candidate[] {
  const out: Candidate[] = []
  const target = axis === 'width' ? shape.target?.width : shape.target?.height
  if (target !== undefined) out.push({ value: target, primary: true })

  const map = byId(ctx.shapes)
  const wanted = axis === 'width' ? 'equalWidth' : 'equalHeight'
  for (const c of constraintsFor(ctx, shape.id)) {
    if (c.kind !== wanted) continue
    const others = groupOf(c, map).filter((s) => s.id !== shape.id)
    if (others.length === 0) continue
    out.push({ value: median(others.map((s) => (axis === 'width' ? s.width : s.height))) })
  }
  return out
}

export function snapResize(shape: GameShape, input: ResizeInput, ctx: SnapContext): SnapResult {
  const result: SnapResult = {
    x: input.x,
    y: input.y,
    width: Math.max(MIN_SHAPE_SIZE, input.width),
    height: Math.max(MIN_SHAPE_SIZE, input.height),
    rotation: shape.rotation ?? 0,
    snapped: emptySnapped(),
    guides: [],
    gaps: [],
  }
  if (!ctx.enabled) return result

  const movesLeft = input.handle.includes('w')
  const movesTop = input.handle.includes('n')

  const widthHit = pick(sizeCandidates(shape, 'width', ctx), result.width, ctx.tol.snapSize)
  if (widthHit && input.handle !== 'n' && input.handle !== 's') {
    if (movesLeft) result.x += result.width - widthHit.value
    result.width = widthHit.value
    result.snapped.width = true
  }

  const heightHit = pick(sizeCandidates(shape, 'height', ctx), result.height, ctx.tol.snapSize)
  if (heightHit && input.handle !== 'e' && input.handle !== 'w') {
    if (movesTop) result.y += result.height - heightHit.value
    result.height = heightHit.value
    result.snapped.height = true
  }

  return result
}

export function snapRotation(shape: GameShape, raw: number, ctx: SnapContext): SnapResult {
  const result: SnapResult = {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
    rotation: normaliseRotation(raw),
    snapped: emptySnapped(),
    guides: [],
    gaps: [],
  }
  if (!ctx.enabled) return result

  const candidates: Candidate[] = [0, 90, -90, 180].map((value) => ({ value }))
  if (shape.target?.rotation !== undefined) {
    candidates.unshift({ value: shape.target.rotation, primary: true })
  }
  const hit = pick(candidates, result.rotation, ctx.tol.snapRotation)
  if (hit) {
    result.rotation = hit.value
    result.snapped.rotation = true
  }
  return result
}

/** Applies a resize handle drag to a starting rect, before snapping. */
export function applyHandle(
  start: { x: number; y: number; width: number; height: number },
  handle: ResizeHandle,
  dx: number,
  dy: number,
): ResizeInput {
  let { x, y, width, height } = start
  if (handle.includes('e')) width = start.width + dx
  if (handle.includes('w')) {
    width = start.width - dx
    x = start.x + dx
  }
  if (handle.includes('s')) height = start.height + dy
  if (handle.includes('n')) {
    height = start.height - dy
    y = start.y + dy
  }
  if (width < MIN_SHAPE_SIZE) {
    if (handle.includes('w')) x = start.x + start.width - MIN_SHAPE_SIZE
    width = MIN_SHAPE_SIZE
  }
  if (height < MIN_SHAPE_SIZE) {
    if (handle.includes('n')) y = start.y + start.height - MIN_SHAPE_SIZE
    height = MIN_SHAPE_SIZE
  }
  return { handle, x, y, width, height }
}
