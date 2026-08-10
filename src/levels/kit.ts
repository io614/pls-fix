import type { GameShape, ShapeStyle } from '../game/types'

/** Enterprise palette. Muted on purpose — the interface is pretending to be boring. */
export const C = {
  paper: '#ffffff',
  slate: '#f4f4f1',
  slateDeep: '#eceae4',
  blue: '#2f6fd0',
  blueSoft: '#eaf1fc',
  blueLine: '#bcd2f2',
  green: '#3d8a5c',
  greenSoft: '#e9f2ec',
  amber: '#b8801a',
  amberSoft: '#faf1de',
  red: '#bc3b30',
  redSoft: '#fbedec',
  ink: '#1d2023',
  ink2: '#5c6268',
  ink3: '#8f959b',
  line: '#d9d9d2',
  lineSoft: '#e7e7e0',
}

export const TITLE: ShapeStyle = {
  fontSize: 27,
  weight: 600,
  color: C.ink,
  align: 'left',
  valign: 'middle',
}

export const SUBTITLE: ShapeStyle = {
  fontSize: 12,
  color: C.ink3,
  align: 'left',
  valign: 'middle',
  tracking: 0.4,
}

export const FOOTER: ShapeStyle = {
  fontSize: 10.5,
  color: C.ink3,
  align: 'left',
  valign: 'middle',
  tracking: 0.3,
}

export const ROW_LABEL: ShapeStyle = {
  fontSize: 9.5,
  color: C.ink3,
  align: 'right',
  valign: 'middle',
  uppercase: true,
  tracking: 1.1,
  weight: 600,
}

export function panel(fill = C.blueSoft, border = C.blueLine): ShapeStyle {
  return { fill, border, color: C.ink, radius: 4, fontSize: 13, weight: 600, align: 'center' }
}

export function quietPanel(): ShapeStyle {
  return { fill: C.paper, border: C.line, color: C.ink2, radius: 4, fontSize: 12, align: 'center' }
}

/** Decoration: visible, never draggable, never an objective. */
export function decor(s: Omit<GameShape, 'movable' | 'target'>): GameShape {
  return { ...s, movable: false }
}
