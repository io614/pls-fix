import { CAST } from '../content/messages'
import type { GameShape, Level } from '../game/types'
import { C, FOOTER, SUBTITLE, TITLE, decor } from './kit'

function workstream(
  id: string,
  x: number,
  y: number,
  tx: number,
  ty: number,
  title: string,
  status: string,
  accent: string,
): GameShape {
  return {
    id,
    kind: 'card',
    x,
    y,
    width: 250,
    height: 130,
    content: title,
    sub: status,
    target: { x: tx, y: ty },
    style: { fill: C.paper, border: C.line, radius: 4, accent },
  }
}

export const level08: Level = {
  id: 'stakeholder-feedback',
  title: 'Stakeholder feedback',
  brief: 'Workstream overview',
  sender: { ...CAST.sarah, time: '18:26' },
  message: ['Can you clean up the workstream slide?', 'Then I think we are done.'],
  filename: 'Strategy_Final_v2_FINAL_USE_THIS.pptx',
  filenameAfter: 'Strategy_Final_v2_FINAL_USE_THIS_2.pptx',
  canvas: { width: 960, height: 600, surface: 'slide' },
  shapes: [
    {
      id: 'heading',
      kind: 'text',
      x: 78,
      y: 44,
      width: 520,
      height: 34,
      content: 'Transformation Workstreams',
      target: { x: 70, y: 50 },
      style: TITLE,
    },
    decor({
      id: 'subtitle',
      kind: 'text',
      x: 70,
      y: 94,
      width: 520,
      height: 18,
      content: 'Status as at close of business',
      style: SUBTITLE,
    }),
    workstream('c1', 70, 170, 70, 170, 'Customer', 'On track', C.green),
    workstream('c2', 362, 178, 355, 170, 'Product', 'On track', C.green),
    workstream('c3', 631, 161, 640, 170, 'Operations', 'At risk', C.amber),
    workstream('c4', 78, 338, 70, 330, 'Technology', 'On track', C.green),
    workstream('c5', 349, 341, 355, 330, 'People', 'Watch', C.amber),
    workstream('c6', 648, 322, 640, 330, 'Risk', 'Blocked', C.red),
    decor({
      id: 'footer',
      kind: 'text',
      x: 70,
      y: 522,
      width: 520,
      height: 18,
      content: 'Version control maintained by PMO.',
      style: FOOTER,
    }),
  ],
  constraints: [
    { kind: 'alignTop', ids: ['c1', 'c2', 'c3'], label: 'Top row aligned' },
    { kind: 'alignTop', ids: ['c4', 'c5', 'c6'], label: 'Bottom row aligned' },
    { kind: 'equalSpacingX', ids: ['c1', 'c2', 'c3'], tolerance: 2 },
    { kind: 'equalSpacingX', ids: ['c4', 'c5', 'c6'], tolerance: 2 },
    { kind: 'alignLeft', ids: ['c1', 'c4'], label: 'Columns aligned' },
    { kind: 'alignLeft', ids: ['c2', 'c5'] },
    { kind: 'alignLeft', ids: ['c3', 'c6'] },
  ],
  twists: [
    {
      interlude: ['Looks great.'],
      notice: {
        from: 'Sarah',
        role: 'VP, Strategy',
        time: '18:41',
        text: 'Actually can we revert to the previous version?',
      },
      ops: [{ kind: 'reset' }],
      systemNote: 'Reverted to previous version.',
      toast: { title: 'Version restored', body: 'Previous version loaded.' },
    },
    {
      interlude: ['Perfect.'],
      notice: {
        from: 'Priya',
        role: 'PMO',
        time: '19:04',
        text: 'I merged the comments from the shared copy.',
      },
      ops: [
        { kind: 'offset', id: 'c2', dx: 9, dy: -7 },
        { kind: 'offset', id: 'c5', dy: 11 },
        { kind: 'offset', id: 'c3', dx: -6 },
      ],
      systemNote: 'Merged 3 comments from a shared copy.',
    },
  ],
  completion: ['Perfect.', "Let's use this version."],
}
