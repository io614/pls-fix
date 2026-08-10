import { CAST } from '../content/messages'
import type { Constraint, GameShape, Level, ShapeStyle } from '../game/types'
import { C, ROW_LABEL, SUBTITLE, TITLE, decor } from './kit'

interface Tile {
  id: string
  x: number
  y: number
  width: number
  height: number
  content: string
  sub?: string
  target?: GameShape['target']
  rotation?: number
  fixed?: boolean
  resizable?: boolean
  style?: ShapeStyle
}

const strong: ShapeStyle = {
  fill: C.blueSoft,
  border: C.blueLine,
  color: C.ink,
  radius: 4,
  fontSize: 12,
  weight: 600,
  align: 'center',
}
const quiet: ShapeStyle = {
  fill: C.paper,
  border: C.line,
  color: C.ink2,
  radius: 4,
  fontSize: 11.5,
  align: 'center',
}
const accentTile: ShapeStyle = {
  fill: C.slate,
  border: C.line,
  color: C.ink2,
  radius: 4,
  fontSize: 11,
  align: 'center',
}

function tile(t: Tile): GameShape {
  const shape: GameShape = {
    id: t.id,
    kind: 'roundedRectangle',
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    content: t.content,
    sub: t.sub,
    style: t.style ?? quiet,
  }
  if (t.rotation !== undefined) shape.rotation = t.rotation
  if (t.target) {
    shape.target = t.target
    if (t.target.rotation !== undefined) shape.rotatable = true
  }
  if (t.fixed) shape.movable = false
  if (t.resizable) shape.resizable = true
  return shape
}

function rowLabel(id: string, y: number, height: number, text: string): GameShape {
  return decor({
    id,
    kind: 'text',
    x: 40,
    y: y + height / 2 - 9,
    width: 130,
    height: 18,
    content: text,
    style: ROW_LABEL,
  })
}

const PILLAR_X = [190, 398, 606, 814]
const STREAM_X = [190, 356, 522, 688, 854]

const shapes: GameShape[] = [
  decor({
    id: 'deck-title',
    kind: 'text',
    x: 40,
    y: 8,
    width: 620,
    height: 30,
    content: 'Transformation Blueprint',
    style: { ...TITLE, fontSize: 21 },
  }),
  decor({
    id: 'deck-sub',
    kind: 'text',
    x: 700,
    y: 14,
    width: 300,
    height: 18,
    content: 'Board pack · page 34 of 96',
    style: { ...SUBTITLE, align: 'right' },
  }),

  rowLabel('l-vision', 56, 54, 'Vision'),
  tile({
    id: 'vision',
    x: 190,
    y: 56,
    width: 810,
    height: 54,
    content: 'A future ready, customer centric operating model',
    rotation: -1.9,
    target: { x: 190, y: 56, rotation: 0 },
    style: { ...strong, fill: C.blue, border: C.blue, color: '#ffffff', fontSize: 13 },
  }),

  rowLabel('l-priorities', 138, 54, 'Strategic priorities'),
  tile({ id: 'p1', x: 190, y: 138, width: 250, height: 54, content: 'Customer Centricity', fixed: true, style: strong }),
  tile({ id: 'p2', x: 478, y: 145, width: 250, height: 54, content: 'Digital First', target: { x: 470, y: 138 }, style: strong }),
  tile({ id: 'p3', x: 742, y: 131, width: 250, height: 54, content: 'Operational Excellence', target: { x: 750, y: 138 }, style: strong }),

  rowLabel('l-pillars', 220, 54, 'Transformation pillars'),
  tile({ id: 'pl1', x: PILLAR_X[0], y: 220, width: 186, height: 54, content: 'AI Enabled', fixed: true }),
  tile({ id: 'pl2', x: 405, y: 220, width: 186, height: 54, content: 'Strategic Enablement', target: { x: PILLAR_X[1], y: 220 } }),
  tile({
    id: 'pl3',
    x: PILLAR_X[2],
    y: 220,
    width: 186,
    height: 54,
    content: 'Future Ready',
    rotation: 2.6,
    target: { x: PILLAR_X[2], y: 220, rotation: 0 },
  }),
  tile({ id: 'pl4', x: 821, y: 226, width: 186, height: 54, content: 'Synergy', target: { x: PILLAR_X[3], y: 220 } }),

  rowLabel('l-workstreams', 302, 50, 'Workstreams'),
  tile({ id: 'w1', x: STREAM_X[0], y: 302, width: 146, height: 50, content: 'Data', fixed: true, style: accentTile }),
  tile({ id: 'w2', x: 349, y: 308, width: 146, height: 50, content: 'Platform', target: { x: STREAM_X[1], y: 302 }, style: accentTile }),
  tile({
    id: 'w3',
    x: 528,
    y: 302,
    width: 128,
    height: 50,
    content: 'Ways of Working',
    target: { x: STREAM_X[2], y: 302, width: 146 },
    resizable: true,
    style: accentTile,
  }),
  tile({ id: 'w4', x: STREAM_X[3], y: 302, width: 146, height: 50, content: 'Talent', fixed: true, style: accentTile }),
  tile({ id: 'w5', x: 861, y: 295, width: 146, height: 50, content: 'Governance', target: { x: STREAM_X[4], y: 302 }, style: accentTile }),

  rowLabel('l-initiatives', 380, 44, 'Initiatives'),
  ...['Discovery', 'Pilot', 'Scale', 'Embed', 'Sustain'].map((name, i) =>
    tile({
      id: `i${i + 1}`,
      x: STREAM_X[i],
      y: 380,
      width: 146,
      height: 44,
      content: name,
      fixed: true,
      style: { ...quiet, fontSize: 10.5, color: C.ink3 },
    }),
  ),

  rowLabel('l-deliverables', 452, 44, 'Deliverables'),
  tile({ id: 'd1', x: PILLAR_X[0], y: 452, width: 186, height: 44, content: 'Roadmap', fixed: true, style: accentTile }),
  tile({ id: 'd2', x: 391, y: 458, width: 186, height: 44, content: 'Operating Model', target: { x: PILLAR_X[1], y: 452 }, style: accentTile }),
  tile({ id: 'd3', x: PILLAR_X[2], y: 452, width: 186, height: 44, content: 'Target State', fixed: true, style: accentTile }),
  tile({ id: 'd4', x: 807, y: 445, width: 186, height: 44, content: 'Benefits Case', target: { x: PILLAR_X[3], y: 452 }, style: accentTile }),

  rowLabel('l-kpis', 524, 52, 'KPIs'),
  tile({ id: 'k1', x: PILLAR_X[0], y: 524, width: 186, height: 52, content: 'Adoption', sub: '68%', fixed: true, style: strong }),
  tile({ id: 'k2', x: 405, y: 531, width: 186, height: 52, content: 'Velocity', sub: '41', target: { x: PILLAR_X[1], y: 524 }, style: strong }),
  tile({ id: 'k3', x: 599, y: 524, width: 186, height: 52, content: 'NPS', sub: '+12', target: { x: PILLAR_X[2], y: 524 }, style: strong }),
  tile({ id: 'k4', x: PILLAR_X[3], y: 524, width: 186, height: 52, content: 'Synergy Capture', sub: '4%', fixed: true, style: strong }),
]

const constraints: Constraint[] = [
  { kind: 'alignTop', ids: ['p1', 'p2', 'p3'], label: 'Priorities aligned' },
  { kind: 'equalSpacingX', ids: ['p1', 'p2', 'p3'], tolerance: 2 },
  { kind: 'alignTop', ids: ['pl1', 'pl2', 'pl3', 'pl4'], label: 'Pillars aligned' },
  { kind: 'equalSpacingX', ids: ['pl1', 'pl2', 'pl3', 'pl4'], tolerance: 2 },
  { kind: 'alignTop', ids: ['w1', 'w2', 'w3', 'w4', 'w5'], label: 'Workstreams aligned' },
  { kind: 'equalWidth', ids: ['w1', 'w2', 'w3', 'w4', 'w5'], tolerance: 2, label: 'Equal widths' },
  { kind: 'equalSpacingX', ids: ['w1', 'w2', 'w3', 'w4', 'w5'], tolerance: 2 },
  { kind: 'alignTop', ids: ['d1', 'd2', 'd3', 'd4'], label: 'Deliverables aligned' },
  { kind: 'equalSpacingX', ids: ['d1', 'd2', 'd3', 'd4'], tolerance: 2 },
  { kind: 'alignTop', ids: ['k1', 'k2', 'k3', 'k4'], label: 'KPIs aligned' },
  { kind: 'equalSpacingX', ids: ['k1', 'k2', 'k3', 'k4'], tolerance: 2 },
  { kind: 'alignLeft', ids: ['vision', 'p1', 'pl1', 'w1', 'd1', 'k1'], label: 'Left margin' },
]

export const level09: Level = {
  id: 'board-deck',
  title: 'Board deck',
  brief: 'Transformation blueprint',
  priority: 'overdue',
  sender: { ...CAST.david, time: '22:14' },
  message: [
    'Pulling the blueprint together for the board.',
    'Needs to land properly.',
  ],
  filename: 'Board_Pack_vFINAL_reviewed_v3.pptx',
  canvas: { width: 1040, height: 640, surface: 'board' },
  tolerance: { rotation: 1 },
  shapes,
  constraints,
  notifications: [
    { at: 10, from: 'Sarah', text: 'any update?' },
    { at: 24, from: 'Sarah', text: '?' },
    { at: 40, from: 'Marcus', text: 'Need asap', tone: 'urgent' },
    { at: 58, from: 'Priya', text: 'Steering committee moved forward' },
    { at: 78, from: 'Sarah', text: 'CEO joined early', tone: 'urgent' },
    { at: 104, from: 'Marcus', text: '?', tone: 'urgent' },
  ],
  twists: [
    {
      interlude: ['Thanks.'],
      notice: { from: 'Marcus', role: 'Managing Director', time: '22:48', text: '?' },
      ops: [
        { kind: 'offset', id: 'pl2', dx: 14 },
        { kind: 'offset', id: 'pl4', dx: -11 },
        { kind: 'offset', id: 'w3', dy: 9 },
      ],
      systemNote: 'A colleague is editing this file.',
      toast: { title: 'Shared editing', body: 'Someone else has the deck open.' },
    },
    {
      interlude: ['Noted.'],
      notice: {
        from: 'Priya',
        role: 'PMO',
        time: '23:09',
        text: 'The workstream boxes came back a different width.',
      },
      ops: [
        { kind: 'resize', id: 'w3', width: 122 },
        { kind: 'offset', id: 'w5', dx: 8 },
      ],
    },
    {
      interlude: ['Good.'],
      notice: {
        from: 'David',
        role: 'Transformation Lead',
        time: '23:37',
        text: 'Board have gone back to the earlier layout for the top half.',
      },
      ops: [
        { kind: 'rotate', id: 'vision', degrees: -1.6 },
        { kind: 'offset', id: 'vision', dy: 7 },
        { kind: 'offset', id: 'p2', dx: 12 },
        { kind: 'offset', id: 'p3', dx: -9 },
        { kind: 'offset', id: 'pl2', dx: 10 },
        { kind: 'offset', id: 'pl4', dx: -13 },
      ],
      systemNote: 'Top half reverted to an earlier version.',
    },
  ],
  completion: ['Great.', 'Sending to the board.'],
}
