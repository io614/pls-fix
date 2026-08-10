import {
  alignmentProgress,
  byId,
  hasObjective,
  isLevelComplete,
  isRotationAligned,
  isSizeAligned,
  objectives,
  rotationDelta,
} from './alignment'
import { resolveTolerance } from './constants'
import { applyHandle, snapMove, snapResize } from './snapping'
import type { GameShape, HintGhost, Level, LevelCanvas, Twist } from './types'

/** Fresh, independent copies so a level can be restarted or reverted. */
export function instantiate(level: Level): GameShape[] {
  return level.shapes.map((s) => ({ ...s, rotation: s.rotation ?? 0 }))
}

export function isMovable(s: GameShape): boolean {
  return s.movable !== false
}

export function isInteractive(s: GameShape): boolean {
  return isMovable(s) || s.resizable === true || s.rotatable === true
}

/** Keeps a shape reachable: part of it must always remain on the canvas. */
export function clampToCanvas(
  x: number,
  y: number,
  shape: GameShape,
  canvas: LevelCanvas,
): { x: number; y: number } {
  const keep = 40
  return {
    x: Math.min(Math.max(x, keep - shape.width), canvas.width - keep),
    y: Math.min(Math.max(y, keep - shape.height), canvas.height - keep),
  }
}

export function replaceShape(shapes: GameShape[], next: GameShape): GameShape[] {
  return shapes.map((s) => (s.id === next.id ? next : s))
}

export interface LevelStatus {
  complete: boolean
  total: number
  satisfied: number
  /** Objectives met, as a fraction. Steps discretely. */
  progress: number
  /** Partial credit for near-misses, so the readout moves while dragging. */
  smooth: number
}

export function levelStatus(shapes: GameShape[], level: Level): LevelStatus {
  const tol = resolveTolerance(level.tolerance)
  const objs = objectives(shapes, level.constraints, tol)
  const satisfied = objs.filter((o) => o.satisfied).length
  return {
    complete: satisfied === objs.length,
    total: objs.length,
    satisfied,
    progress: objs.length === 0 ? 1 : satisfied / objs.length,
    smooth: alignmentProgress(objs),
  }
}

/** Applies a follow-up request to the current composition. */
export function applyTwist(shapes: GameShape[], level: Level, twist: Twist): GameShape[] {
  let next = shapes
  for (const op of twist.ops) {
    if (op.kind === 'reset') {
      next = instantiate(level)
      continue
    }
    next = next.map((s) => {
      if (s.id !== op.id) return s
      switch (op.kind) {
        case 'offset':
          return { ...s, x: s.x + (op.dx ?? 0), y: s.y + (op.dy ?? 0) }
        case 'place':
          return { ...s, x: op.x ?? s.x, y: op.y ?? s.y }
        case 'retarget':
          return { ...s, target: { ...s.target, ...op.target } }
        case 'resize':
          return { ...s, width: op.width ?? s.width, height: op.height ?? s.height }
        case 'rotate':
          return { ...s, rotation: op.degrees }
        default:
          return s
      }
    })
  }
  return next
}

/**
 * Plays the level the way an attentive player would: take each shape in turn, aim it at
 * wherever it is supposed to end up, and let snapping settle the exact value. Relational
 * puzzles need several passes because each shape's correct spot depends on the others.
 *
 * The generous radius stands in for the player's eye; correctness is still judged
 * afterwards against the level's real tolerance.
 */
export function solveFrom(start: GameShape[], level: Level): GameShape[] {
  const tol = resolveTolerance(level.tolerance)
  const aim = { ...tol, snap: 400, snapSize: 400 }
  let shapes = start
  const ids = shapes.map((s) => s.id)

  for (let pass = 0; pass < 4; pass++) {
    for (const id of ids) {
      const shape = shapes.find((s) => s.id === id)
      if (!shape || !isInteractive(shape)) continue
      const ctx = {
        shapes,
        constraints: level.constraints,
        tol: aim,
        enabled: true,
        grid: level.canvas.grid,
      }

      let next = shape
      if (shape.rotatable && shape.target?.rotation !== undefined) {
        next = { ...next, rotation: shape.target.rotation }
      }
      if (shape.resizable) {
        // One pass per axis: an edge handle only ever drives its own dimension.
        const wide = applyHandle(next, 'e', (next.target?.width ?? next.width) - next.width, 0)
        next = { ...next, width: snapResize(next, wide, ctx).width }
        const tall = applyHandle(next, 's', 0, (next.target?.height ?? next.height) - next.height)
        next = { ...next, height: snapResize(next, tall, ctx).height }
      }
      if (isMovable(next)) {
        const moved = snapMove(next, next.target?.x ?? next.x, next.target?.y ?? next.y, ctx)
        next = { ...next, x: moved.x, y: moved.y }
      }
      shapes = replaceShape(shapes, next)
    }
  }
  return shapes
}

export function attemptSolve(level: Level): GameShape[] {
  return solveFrom(instantiate(level), level)
}

/**
 * Where everything still needs to go, from wherever it currently is. Runs the same
 * solver the tests use, so it answers correctly for relational puzzles too — including
 * ones where no shape declares a target of its own.
 */
export function computeHints(shapes: GameShape[], level: Level): HintGhost[] {
  const current = byId(shapes)
  const ghosts: HintGhost[] = []
  for (const solved of solveFrom(shapes, level)) {
    const now = current.get(solved.id)
    if (!now || !isInteractive(now)) continue
    const shifted =
      Math.abs(solved.x - now.x) > 1 ||
      Math.abs(solved.y - now.y) > 1 ||
      Math.abs(solved.width - now.width) > 1 ||
      Math.abs(solved.height - now.height) > 1 ||
      rotationDelta(solved.rotation ?? 0, now.rotation ?? 0) > 0.5
    if (!shifted) continue
    ghosts.push({
      id: solved.id,
      x: solved.x,
      y: solved.y,
      width: solved.width,
      height: solved.height,
      rotation: solved.rotation ?? 0,
    })
  }
  return ghosts
}

/**
 * Development guard: a level that starts already solved, or that cannot be solved at
 * all, is a content bug rather than a puzzle.
 */
export function validateLevel(level: Level): string[] {
  const problems: string[] = []
  const tol = resolveTolerance(level.tolerance)
  const start = instantiate(level)

  if (isLevelComplete(start, level.constraints, tol)) {
    problems.push('starts already complete')
  }

  let solved = attemptSolve(level)
  if (!isLevelComplete(solved, level.constraints, tol)) {
    const failing = objectives(solved, level.constraints, tol)
      .filter((o) => !o.satisfied)
      .map((o) => `${o.key} (${o.error.toFixed(2)})`)
    problems.push(`unsolvable: ${failing.join(', ')}`)
  }

  // Every follow-up request must actually reopen the task, and must itself be solvable.
  for (const [i, twist] of (level.twists ?? []).entries()) {
    const twisted = applyTwist(solved, level, twist)
    if (isLevelComplete(twisted, level.constraints, tol)) {
      problems.push(`twist ${i} leaves the level already complete`)
    }
    solved = solveFrom(twisted, level)
    if (!isLevelComplete(solved, level.constraints, tol)) {
      const failing = objectives(solved, level.constraints, tol)
        .filter((o) => !o.satisfied)
        .map((o) => `${o.key} (${o.error.toFixed(2)})`)
      problems.push(`twist ${i} unsolvable: ${failing.join(', ')}`)
    }
  }

  for (const s of start) {
    if (hasObjective(s) && !isInteractive(s)) {
      problems.push(`${s.id} has a target but cannot be manipulated`)
    }
    // A size or rotation target the shape already meets is decoration, not an objective.
    if (s.target?.rotation !== undefined && isRotationAligned(s, tol)) {
      problems.push(`${s.id} declares a rotation target it already satisfies`)
    }
    if (
      (s.target?.width !== undefined || s.target?.height !== undefined) &&
      isSizeAligned(s, tol)
    ) {
      problems.push(`${s.id} declares a size target it already satisfies`)
    }
  }

  const ids = new Set<string>()
  for (const s of level.shapes) {
    if (ids.has(s.id)) problems.push(`duplicate shape id: ${s.id}`)
    ids.add(s.id)
  }
  for (const c of level.constraints ?? []) {
    for (const id of c.ids) {
      if (!ids.has(id)) problems.push(`constraint ${c.kind} references missing shape ${id}`)
    }
  }

  return problems
}
