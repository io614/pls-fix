import { CAST } from '../content/messages'
import type { GameShape, Level } from '../game/types'
import { C, SUBTITLE, TITLE, decor } from './kit'

function card(id: string, x: number, y: number, label: string, value: string, delta: string): GameShape {
  return {
    id,
    kind: 'kpi',
    x,
    y,
    width: 220,
    height: 150,
    content: label,
    sub: value,
    label: `${label} card`,
    style: { fill: C.paper, border: C.line, radius: 5, accent: delta },
  }
}

export const level02: Level = {
  id: 'looks-slightly-off',
  title: 'Looks slightly off',
  brief: 'Weekly performance summary',
  sender: { ...CAST.sarah, time: '09:47' },
  message: ['Looks slightly off.', 'Can we tighten this up?'],
  filename: 'Weekly_Summary_v4.xlsx',
  canvas: { width: 960, height: 600, surface: 'doc' },
  shapes: [
    decor({
      id: 'title',
      kind: 'text',
      x: 100,
      y: 84,
      width: 520,
      height: 34,
      content: 'Weekly Performance Summary',
      style: TITLE,
    }),
    decor({
      id: 'subtitle',
      kind: 'text',
      x: 100,
      y: 122,
      width: 520,
      height: 20,
      content: 'Week 32 · Prepared for the leadership forum',
      style: SUBTITLE,
    }),
    decor({
      id: 'rule',
      kind: 'line',
      x: 100,
      y: 176,
      width: 760,
      height: 1,
      style: { color: C.line },
    }),
    {
      ...card('c1', 100, 230, 'Revenue', '+4.1%', C.green),
      target: { x: 100, y: 230 },
    },
    {
      ...card('c2', 370, 245, 'Margin', '+1.2pt', C.green),
      target: { x: 370, y: 230 },
    },
    {
      ...card('c3', 640, 230, 'Headcount', '−2.0%', C.amber),
      target: { x: 640, y: 230 },
    },
  ],
  constraints: [{ kind: 'alignTop', ids: ['c1', 'c2', 'c3'], label: 'Cards share a baseline' }],
  twists: [
    {
      interlude: ['Much better.'],
      notice: { from: 'Sarah', role: 'VP, Strategy', time: '09:58', text: 'Did something move?' },
      ops: [
        { kind: 'offset', id: 'c3', dy: 24 },
        { kind: 'offset', id: 'c1', dx: -11 },
      ],
      systemNote: 'Autosave restored an earlier version.',
      toast: { title: 'Autosave', body: 'An earlier version was restored.' },
    },
  ],
  completion: ['Thanks.'],
}
