import { CAST } from '../content/messages'
import type { GameShape, Level } from '../game/types'
import { C, SUBTITLE, TITLE, decor } from './kit'

function kpi(id: string, x: number, y: number, label: string, value: string, accent: string): GameShape {
  return {
    id,
    kind: 'kpi',
    x,
    y,
    width: 150,
    height: 130,
    content: label,
    sub: value,
    style: { fill: C.paper, border: C.line, radius: 4, accent },
  }
}

export const level05: Level = {
  id: 'consistency',
  title: 'Consistency',
  brief: 'Scorecard spacing',
  priority: 'urgent',
  sender: { ...CAST.priya, time: '13:02' },
  message: [
    'Can we make the spacing consistent?',
    'Need this before the steering committee.',
  ],
  filename: 'Scorecard_final.xlsx',
  canvas: { width: 960, height: 600, surface: 'doc' },
  shapes: [
    decor({
      id: 'title',
      kind: 'text',
      x: 90,
      y: 92,
      width: 560,
      height: 32,
      content: 'Q3 Scorecard',
      style: TITLE,
    }),
    decor({
      id: 'subtitle',
      kind: 'text',
      x: 90,
      y: 128,
      width: 560,
      height: 18,
      content: 'Governance pack · appendix C',
      style: SUBTITLE,
    }),
    decor({
      id: 'rule',
      kind: 'line',
      x: 90,
      y: 190,
      width: 780,
      height: 1,
      style: { color: C.line },
    }),
    { ...kpi('k1', 90, 250, 'Adoption', '68%', C.blue), movable: false },
    kpi('k2', 252, 250, 'Velocity', '41', C.blue),
    kpi('k3', 474, 259, 'Quality', '92%', C.green),
    { ...kpi('k4', 720, 250, 'Risk', '3 open', C.amber), movable: false },
  ],
  constraints: [
    {
      kind: 'equalSpacingX',
      ids: ['k1', 'k2', 'k3', 'k4'],
      tolerance: 2,
      label: 'Equal horizontal spacing',
    },
    {
      kind: 'alignCenterY',
      ids: ['k1', 'k2', 'k3', 'k4'],
      tolerance: 2,
      label: 'Shared vertical centre',
    },
  ],
  twists: [
    {
      interlude: ['Alignment KPI restored.'],
      notice: {
        from: 'Priya',
        role: 'PMO',
        time: '13:40',
        text: 'PMO have updated the template. Right margin is now 120px.',
      },
      ops: [{ kind: 'place', id: 'k4', x: 690 }],
      systemNote: 'Template v12 applied.',
    },
  ],
  completion: ['Noted.'],
}
