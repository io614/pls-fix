import { CAST } from '../content/messages'
import type { Level } from '../game/types'
import { C, SUBTITLE, TITLE, decor } from './kit'

const CONTAINER = { x: 230, y: 130, width: 500, height: 340 }
const MARK = 150

export const level03: Level = {
  id: 'can-we-center-this',
  title: 'Can we center this?',
  brief: 'Brand placement',
  sender: { ...CAST.sarah, time: '10:05' },
  message: ['Can we center this?'],
  filename: 'Brand_Guidelines_v9.pptx',
  canvas: { width: 960, height: 600, surface: 'slide' },
  tolerance: { snap: 12 },
  shapes: [
    decor({
      id: 'title',
      kind: 'text',
      x: 80,
      y: 56,
      width: 460,
      height: 34,
      content: 'Brand Application',
      style: TITLE,
    }),
    decor({
      id: 'subtitle',
      kind: 'text',
      x: 80,
      y: 94,
      width: 460,
      height: 18,
      content: 'Primary lockup · holding area',
      style: SUBTITLE,
    }),
    {
      id: 'container',
      kind: 'rectangle',
      ...CONTAINER,
      movable: false,
      style: { fill: C.slate, border: C.line, dashed: true, radius: 2 },
    },
    decor({
      id: 'container-label',
      kind: 'text',
      x: CONTAINER.x + 14,
      y: CONTAINER.y + 12,
      width: 200,
      height: 16,
      content: 'HOLDING AREA',
      style: { fontSize: 9, color: C.ink3, uppercase: true, tracking: 1.2, weight: 600 },
    }),
    {
      id: 'mark',
      kind: 'circle',
      x: 296,
      y: 302,
      width: MARK,
      height: MARK,
      content: 'LOGO',
      target: {
        x: CONTAINER.x + CONTAINER.width / 2 - MARK / 2,
        y: CONTAINER.y + CONTAINER.height / 2 - MARK / 2,
      },
      style: {
        fill: C.blue,
        border: C.blue,
        color: '#ffffff',
        fontSize: 13,
        weight: 600,
        tracking: 1.6,
        align: 'center',
        shadow: true,
      },
    },
  ],
  twists: [
    {
      interlude: ['Perfect.'],
      notice: {
        from: 'Alex',
        role: 'Design',
        time: '10:31',
        text: 'That is mathematically centred. Can we make it optically centred?',
      },
      ops: [
        {
          kind: 'retarget',
          id: 'mark',
          target: {
            x: CONTAINER.x + CONTAINER.width / 2 - MARK / 2,
            y: CONTAINER.y + CONTAINER.height / 2 - MARK / 2 - 14,
          },
        },
      ],
    },
  ],
  completion: ['Better.'],
}
