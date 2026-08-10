import { describe, expect, it } from 'vitest'
import { hasObjective, isLevelComplete } from '../game/alignment'
import { resolveTolerance } from '../game/constants'
import {
  applyTwist,
  attemptSolve,
  instantiate,
  isInteractive,
  solveFrom,
  validateLevel,
} from '../game/engine'
import { LEVELS } from './index'

describe('campaign', () => {
  it('ships exactly ten levels with unique ids', () => {
    expect(LEVELS).toHaveLength(10)
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(10)
  })

  it('lands its follow-up requests mostly in the back half', () => {
    const count = (from: number, to: number) =>
      LEVELS.slice(from, to).reduce((n, l) => n + (l.twists?.length ?? 0), 0)
    expect(count(5, 10)).toBeGreaterThan(count(0, 5))
  })

  it('never embeds a real person as the player', () => {
    const text = JSON.stringify(LEVELS)
    expect(text).not.toMatch(/\bivan\b/i)
  })
})

describe.each(LEVELS.map((l) => [l.id, l] as const))('level %s', (_id, level) => {
  const tol = resolveTolerance(level.tolerance)

  it('is structurally sound', () => {
    expect(validateLevel(level)).toEqual([])
  })

  it('starts incomplete', () => {
    expect(isLevelComplete(instantiate(level), level.constraints, tol)).toBe(false)
  })

  it('stays inside its canvas once solved', () => {
    for (const s of instantiate(level)) {
      const x = s.target?.x ?? s.x
      const y = s.target?.y ?? s.y
      const w = s.target?.width ?? s.width
      const h = s.target?.height ?? s.height
      expect(x).toBeGreaterThanOrEqual(0)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(x + w).toBeLessThanOrEqual(level.canvas.width)
      expect(y + h).toBeLessThanOrEqual(level.canvas.height)
    }
  })

  /**
   * If a surface draws a grid, the solution must sit on it — otherwise the visible
   * ruling is decoration and the player is aiming at nothing.
   */
  it('keeps every target on the grid its surface draws', () => {
    const grid = level.canvas.grid
    if (!grid) return
    const onGrid = (v: number, step: number, offset = 0) =>
      Math.abs(((v - offset) % step) % step) < 0.001
    for (const s of instantiate(level)) {
      if (!s.target) continue
      const w = s.target.width ?? s.width
      const h = s.target.height ?? s.height
      if (s.target.x !== undefined) {
        expect(onGrid(s.target.x, grid.x, grid.offsetX)).toBe(true)
        expect(onGrid(s.target.x + w, grid.x, grid.offsetX)).toBe(true)
      }
      if (s.target.y !== undefined) {
        expect(onGrid(s.target.y, grid.y, grid.offsetY)).toBe(true)
        expect(onGrid(s.target.y + h, grid.y, grid.offsetY)).toBe(true)
      }
    }
  })

  it('has at least one thing for the player to do', () => {
    const actionable = level.shapes.filter((s) => hasObjective(s) && isInteractive(s))
    const relational = level.constraints?.length ?? 0
    expect(actionable.length + relational).toBeGreaterThan(0)
  })

  /**
   * The real playability question: can a player who drops each shape roughly where it
   * belongs actually finish the level? Uses the same solver the debug validator runs.
   */
  it('can be completed by aiming each shape at its solution', () => {
    expect(isLevelComplete(attemptSolve(level), level.constraints, tol)).toBe(true)
  })

  /** Each follow-up request must genuinely reopen the task, and must itself be fixable. */
  it('reopens and re-closes for every follow-up request', () => {
    let shapes = attemptSolve(level)
    for (const twist of level.twists ?? []) {
      shapes = applyTwist(shapes, level, twist)
      expect(isLevelComplete(shapes, level.constraints, tol)).toBe(false)
      shapes = solveFrom(shapes, level)
      expect(isLevelComplete(shapes, level.constraints, tol)).toBe(true)
    }
  })
})
