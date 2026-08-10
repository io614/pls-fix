import { CAST } from '../content/messages'
import type { Level } from '../game/types'
import { C, decor } from './kit'

const W = 300
const H = 90

export const level10: Level = {
  id: 'performance-review',
  title: 'Performance Review',
  brief: 'One last thing',
  sender: { ...CAST.marcus, time: '23:51' },
  message: ['pls fix'],
  filename: 'Closing_Slide.pptx',
  canvas: { width: 960, height: 600, surface: 'slide' },
  tolerance: { position: 2, snap: 6, relational: 2 },
  finale: true,
  shapes: [
    decor({
      id: 'kicker',
      kind: 'text',
      x: 330,
      y: 196,
      width: W,
      height: 16,
      content: 'IN CLOSING',
      style: {
        fontSize: 9,
        color: C.ink3,
        uppercase: true,
        tracking: 2,
        weight: 600,
        align: 'center',
      },
    }),
    {
      id: 'closing',
      kind: 'rectangle',
      x: 334,
      y: 258,
      width: W,
      height: H,
      content: 'THANK YOU',
      target: { x: (960 - W) / 2, y: (600 - H) / 2 },
      style: {
        fill: C.paper,
        border: C.line,
        color: C.ink,
        fontSize: 15,
        weight: 600,
        tracking: 2.4,
        align: 'center',
        radius: 2,
      },
    },
  ],
  completion: [],
}
