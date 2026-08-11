import { describe, expect, it } from 'vitest'
import { snapMove } from './snapping'
import { resolveTolerance } from './constants'
import { instantiate } from './engine'
import { level02 } from '../levels/level02'
import type { GameShape } from './types'

const tol = resolveTolerance(undefined)

function box(id: string, x: number, y: number, width = 100, height = 60): GameShape {
  return { id, kind: 'rectangle', x, y, width, height, rotation: 0 }
}

function ctxFor(shapes: GameShape[]) {
  return { shapes, constraints: undefined, tol, enabled: true, grid: undefined }
}

describe('snapMove guides', () => {
  it('draws a line for an edge shared with another shape', () => {
    const moving = box('a', 0, 0)
    const anchor = box('b', 300, 400)
    const r = snapMove(moving, 300, 120, ctxFor([moving, anchor]))
    const vertical = r.guides.filter((g) => g.kind === 'v')
    expect(vertical.map((g) => g.at)).toContain(300)
  })

  it('draws a line for a shared centre, not only shared edges', () => {
    const moving = box('a', 0, 0, 100, 60)
    // b's centreX is 250; a is 100 wide, so a.x = 200 puts the centres together.
    const anchor = box('b', 200, 400, 100, 60)
    const r = snapMove(moving, 200, 120, ctxFor([moving, anchor]))
    expect(r.guides.some((g) => g.kind === 'v' && Math.abs(g.at - 250) < 0.01)).toBe(true)
  })

  it('stretches one line across everything it touches instead of stacking duplicates', () => {
    const moving = box('a', 0, 0)
    const near = box('b', 300, 100)
    const far = box('c', 300, 600)
    const r = snapMove(moving, 300, 300, ctxFor([moving, near, far]))
    const at300 = r.guides.filter((g) => g.kind === 'v' && Math.abs(g.at - 300) < 0.01)
    expect(at300).toHaveLength(1)
    expect(at300[0].from).toBeLessThanOrEqual(100)
    expect(at300[0].to).toBeGreaterThanOrEqual(660)
  })

  it('says nothing when the shape lines up with nothing', () => {
    const moving = box('a', 0, 0)
    const anchor = box('b', 300, 400)
    const r = snapMove(moving, 137, 211, ctxFor([moving, anchor]))
    expect(r.guides).toHaveLength(0)
  })

  /*
   * The regression this all exists for: a shape settling onto its own target used to
   * report no guide, so the moment the game is built around gave the least feedback.
   */
  it('guides a card that has landed on its target', () => {
    const shapes = instantiate(level02)
    const card = shapes.find((s) => s.id === 'c3')!
    const ctx = {
      shapes,
      constraints: level02.constraints,
      tol: resolveTolerance(level02.tolerance),
      enabled: true,
      grid: level02.canvas.grid,
    }
    const r = snapMove(card, card.target!.x!, card.target!.y!, ctx)
    expect(r.snapped.y).toBe(true)
    expect(r.guides.length).toBeGreaterThan(0)
    expect(r.guides.some((g) => g.kind === 'h')).toBe(true)
  })

  it('stays quiet while snapping is disabled', () => {
    const moving = box('a', 0, 0)
    const anchor = box('b', 300, 400)
    const r = snapMove(moving, 300, 120, { ...ctxFor([moving, anchor]), enabled: false })
    expect(r.guides).toHaveLength(0)
  })
})
