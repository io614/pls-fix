import { describe, expect, it } from 'vitest'
import {
  constraintError,
  distributeIdeal,
  gapsAlong,
  isConstraintSatisfied,
  isLevelComplete,
  isShapeComplete,
  normaliseRotation,
  byId,
  alignmentProgress,
  objectives,
} from './alignment'
import { DEFAULT_TOLERANCE } from './constants'
import type { GameShape } from './types'

const tol = DEFAULT_TOLERANCE

function box(id: string, x: number, y: number, width = 100, height = 50): GameShape {
  return { id, kind: 'rectangle', x, y, width, height }
}

describe('rotation', () => {
  it('normalises into (-180, 180]', () => {
    expect(normaliseRotation(359)).toBeCloseTo(-1)
    expect(normaliseRotation(-361)).toBeCloseTo(-1)
    expect(normaliseRotation(180)).toBe(180)
  })
})

describe('shape objectives', () => {
  it('accepts a shape inside the position tolerance', () => {
    const s: GameShape = { ...box('a', 105, 100), target: { x: 100, y: 100 } }
    expect(isShapeComplete(s, tol)).toBe(true)
  })

  it('rejects a shape outside the position tolerance', () => {
    const s: GameShape = { ...box('a', 112, 100), target: { x: 100, y: 100 } }
    expect(isShapeComplete(s, tol)).toBe(false)
  })

  it('measures only the axes the target constrains', () => {
    const s: GameShape = { ...box('a', 100, 900), target: { x: 100 } }
    expect(isShapeComplete(s, tol)).toBe(true)
  })

  it('checks size and rotation independently', () => {
    const wide: GameShape = { ...box('a', 0, 0, 140), target: { width: 100 } }
    expect(isShapeComplete(wide, tol)).toBe(false)
    const tilted: GameShape = { ...box('a', 0, 0), rotation: 10, target: { rotation: 0 } }
    expect(isShapeComplete(tilted, tol)).toBe(false)
  })
})

describe('relational constraints', () => {
  it('reports the spread of an alignment group', () => {
    const map = byId([box('a', 10, 0), box('b', 14, 0), box('c', 10, 0)])
    expect(constraintError({ kind: 'alignLeft', ids: ['a', 'b', 'c'] }, map)).toBe(4)
  })

  it('measures gaps between consecutive shapes', () => {
    const shapes = [box('a', 0, 0), box('b', 120, 0), box('c', 260, 0)]
    expect(gapsAlong(shapes, 'x')).toEqual([20, 40])
  })

  it('is satisfied only when spacing is even', () => {
    const uneven = byId([box('a', 0, 0), box('b', 120, 0), box('c', 260, 0)])
    const even = byId([box('a', 0, 0), box('b', 130, 0), box('c', 260, 0)])
    const c = { kind: 'equalSpacingX' as const, ids: ['a', 'b', 'c'], tolerance: 2 }
    expect(isConstraintSatisfied(c, uneven, tol)).toBe(false)
    expect(isConstraintSatisfied(c, even, tol)).toBe(true)
  })

  it('distributes interior shapes between the outer anchors', () => {
    const group = [box('a', 0, 0), box('b', 999, 0), box('c', 400, 0)]
    const ideal = distributeIdeal(group, 'x')
    // Anchors keep their positions; the middle shape lands on the even gap.
    expect(ideal.get('a')).toBe(0)
    expect(ideal.get('c')).toBe(400)
    expect(ideal.get('b')).toBe(200)
  })

  it('distributes vertically as well', () => {
    const group = [box('a', 0, 0), box('b', 0, 77), box('c', 0, 300)]
    const ideal = distributeIdeal(group, 'y')
    expect(ideal.get('b')).toBe(150)
  })
})

describe('level evaluation', () => {
  const shapes = [
    { ...box('a', 0, 0), target: { x: 0, y: 0 } },
    { ...box('b', 40, 0), target: { x: 0, y: 0 } },
  ]

  it('combines shape and constraint objectives', () => {
    expect(objectives(shapes, [{ kind: 'alignLeft', ids: ['a', 'b'] }], tol)).toHaveLength(3)
  })

  it('is incomplete while any objective fails', () => {
    expect(isLevelComplete(shapes, undefined, tol)).toBe(false)
  })

  it('completes once every objective is met', () => {
    const solved = shapes.map((s) => ({ ...s, x: 0, y: 0 }))
    expect(isLevelComplete(solved, [{ kind: 'alignLeft', ids: ['a', 'b'] }], tol)).toBe(true)
  })

  it('reports partial progress that rises as error falls', () => {
    const far = alignmentProgress(objectives(shapes, undefined, tol))
    const near = alignmentProgress(
      objectives(
        shapes.map((s) => (s.id === 'b' ? { ...s, x: 12 } : s)),
        undefined,
        tol,
      ),
    )
    expect(near).toBeGreaterThan(far)
  })
})
