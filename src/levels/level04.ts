import { CAST } from '../content/messages'
import type { GameShape, Level } from '../game/types'
import { C, SUBTITLE, TITLE, decor } from './kit'

/**
 * The sheet surface rules itself every 80px across and every 26px down, starting below
 * the column header. Tiles are whole cells — three columns by five rows — so every
 * target edge lands on a line the player can actually see. "Grid must be exact" is
 * meant literally: the grid is the reference, not an invisible coordinate.
 */
const CELL_W = 80
const CELL_H = 26
const HEADER = 26

const W = CELL_W * 3
const H = CELL_H * 5
const COLS = [CELL_W * 2, CELL_W * 7]
const ROWS = [HEADER + CELL_H * 5, HEADER + CELL_H * 12]

function tile(
  id: string,
  dx: number,
  dy: number,
  col: number,
  row: number,
  label: string,
  value: string,
): GameShape {
  return {
    id,
    kind: 'card',
    x: COLS[col] + dx,
    y: ROWS[row] + dy,
    width: W,
    height: H,
    content: label,
    sub: value,
    target: { x: COLS[col], y: ROWS[row] },
    style: { fill: C.paper, border: C.blueLine, radius: 2, accent: C.blue },
  }
}

export const level04: Level = {
  id: 'pixel-perfect',
  title: 'Pixel perfect',
  brief: 'Quarterly tiles',
  sender: { ...CAST.alex, time: '11:20' },
  message: ['Very close.', 'Needs to be pixel perfect though.'],
  statusNote: 'Pixel-perfect review · snap to grid',
  filename: 'Quarterly_Grid_v3.xlsx',
  canvas: {
    width: 960,
    height: 600,
    surface: 'sheet',
    grid: { x: CELL_W, y: CELL_H, offsetY: HEADER },
  },
  tolerance: { position: 2, snap: 3, relational: 2 },
  shapes: [
    decor({
      id: 'title',
      kind: 'text',
      x: COLS[0],
      y: HEADER + CELL_H,
      width: 500,
      height: 30,
      content: 'Quarterly Breakdown',
      style: { ...TITLE, fontSize: 22 },
    }),
    decor({
      id: 'subtitle',
      kind: 'text',
      x: COLS[0],
      y: HEADER + CELL_H * 2 + 6,
      width: 500,
      height: 18,
      content: 'Every edge should sit on a gridline.',
      style: SUBTITLE,
    }),
    tile('q1', 3, -5, 0, 0, 'Q1', '2,410'),
    tile('q2', -6, 4, 1, 0, 'Q2', '2,684'),
    tile('q3', 4, 6, 0, 1, 'Q3', '2,902'),
    tile('q4', -5, -3, 1, 1, 'Q4', '3,118'),
  ],
  constraints: [
    { kind: 'alignTop', ids: ['q1', 'q2'], tolerance: 2 },
    { kind: 'alignTop', ids: ['q3', 'q4'], tolerance: 2 },
    { kind: 'alignLeft', ids: ['q1', 'q3'], tolerance: 2 },
    { kind: 'alignLeft', ids: ['q2', 'q4'], tolerance: 2 },
  ],
  twists: [
    {
      interlude: ['Better.'],
      notice: { from: 'Alex', role: 'Design', time: '11:44', text: 'Something still feels off though.' },
      ops: [
        { kind: 'offset', id: 'q2', dx: 4 },
        { kind: 'offset', id: 'q3', dy: 4 },
      ],
    },
  ],
  completion: ['Fine.', 'Ship it.'],
}
