export type ShapeKind =
  | 'rectangle'
  | 'roundedRectangle'
  | 'circle'
  | 'text'
  | 'arrow'
  | 'line'
  | 'card'
  | 'kpi'
  | 'chart'
  | 'table'
  | 'pill'
  | 'logo'

export interface ShapeStyle {
  fill?: string
  border?: string
  color?: string
  fontSize?: number
  weight?: number
  align?: 'left' | 'center' | 'right'
  valign?: 'top' | 'middle' | 'bottom'
  radius?: number
  dashed?: boolean
  shadow?: boolean
  tracking?: number
  uppercase?: boolean
  accent?: string
  opacity?: number
  muted?: boolean
}

export interface ShapeTarget {
  x?: number
  y?: number
  width?: number
  height?: number
  rotation?: number
}

export interface GameShape {
  id: string
  kind: ShapeKind
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  /** Absent means the shape is decoration and carries no objective of its own. */
  target?: ShapeTarget
  movable?: boolean
  resizable?: boolean
  rotatable?: boolean
  /** Restrict dragging to a single axis. */
  axis?: 'x' | 'y' | 'both'
  style?: ShapeStyle
  content?: string
  sub?: string
  /** Bar heights, 0..1, for `chart`. */
  bars?: number[]
  /** Cell text for `table`. */
  rows?: string[][]
  /** Accessible name; falls back to content. */
  label?: string
  z?: number
}

export type ConstraintKind =
  | 'alignLeft'
  | 'alignRight'
  | 'alignTop'
  | 'alignBottom'
  | 'alignCenterX'
  | 'alignCenterY'
  | 'equalSpacingX'
  | 'equalSpacingY'
  | 'equalWidth'
  | 'equalHeight'

export interface Constraint {
  kind: ConstraintKind
  /** Declared order matters for spacing constraints: first and last act as anchors. */
  ids: string[]
  tolerance?: number
  /** Shown in the objectives readout. */
  label?: string
}

export interface Tolerance {
  position: number
  rotation: number
  size: number
  /** Pull radius for position snapping, per axis. */
  snap: number
  snapRotation: number
  snapSize: number
  /** Satisfaction threshold for relational constraints. */
  relational: number
}

export interface Sender {
  name: string
  role: string
  time?: string
}

export interface LevelNotification {
  /** Seconds after the level starts. */
  at: number
  from?: string
  text: string
  tone?: 'neutral' | 'urgent' | 'system'
}

/** What a follow-up request does to the composition. */
export type TwistOp =
  /** Everything goes back to how it arrived. */
  | { kind: 'reset' }
  /** Something quietly moved. */
  | { kind: 'offset'; id: string; dx?: number; dy?: number }
  /** Something was moved to a specific place, usually a fixed anchor. */
  | { kind: 'place'; id: string; x?: number; y?: number }
  /** The brief changed: the shape stays put, the correct answer does not. */
  | { kind: 'retarget'; id: string; target: ShapeTarget }
  | { kind: 'resize'; id: string; width?: number; height?: number }
  /** Absolute rotation, in degrees. */
  | { kind: 'rotate'; id: string; degrees: number }

export interface Twist {
  /** Sent when the player finishes, just before the request is reopened. */
  interlude: string[]
  notice: { from: string; role?: string; time?: string; text: string }
  ops: TwistOp[]
  /** Dry one-liner dropped into the thread as a system entry. */
  systemNote?: string
  toast?: { title: string; body?: string }
}

export type SurfaceKind = 'slide' | 'sheet' | 'doc' | 'board'

/** The ruling the surface draws, and which shapes can therefore snap to. */
export interface CanvasGrid {
  x: number
  y: number
  offsetX?: number
  offsetY?: number
}

export interface LevelCanvas {
  width: number
  height: number
  surface: SurfaceKind
  /** Rendered on the surface itself, e.g. a slide header. */
  caption?: string
  /** When set, shape edges snap to these lines as well as to their own targets. */
  grid?: CanvasGrid
}

export interface Level {
  id: string
  title: string
  sender: Sender
  message: string[]
  /** Short line for the task list in the sidebar. */
  brief: string
  priority?: 'urgent' | 'overdue' | 'normal'
  filename?: string
  filenameAfter?: string
  canvas: LevelCanvas
  shapes: GameShape[]
  constraints?: Constraint[]
  tolerance?: Partial<Tolerance>
  /** Messages shown, in sequence, once every objective is satisfied. */
  completion: string[]
  /** Seconds for the countdown gag. Never causes failure. */
  countdown?: number
  countdownLabel?: string
  /**
   * Follow-up requests that land *after* the player finishes, each one reopening the
   * task. Worked through in order; the level only closes once the last one is resolved.
   */
  twists?: Twist[]
  notifications?: LevelNotification[]
  /** Dry note surfaced in the status bar. */
  statusNote?: string
  /** Ends the campaign and rolls the performance review. */
  finale?: boolean
}

export interface Guide {
  kind: 'v' | 'h'
  /** Canvas coordinate of the line. */
  at: number
  /** Extent of the line along the other axis. */
  from: number
  to: number
}

/** A brief reveal of where one shape is supposed to end up. */
export interface HintGhost {
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

export interface GapBadge {
  x: number
  y: number
  value: number
  axis: 'x' | 'y'
}

export interface SnapResult {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  /** Which properties landed on a snap candidate this frame. */
  snapped: { x: boolean; y: boolean; width: boolean; height: boolean; rotation: boolean }
  guides: Guide[]
  gaps: GapBadge[]
}
