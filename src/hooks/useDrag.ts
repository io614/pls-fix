import { useCallback, useEffect, useRef, useState } from 'react'
import { clampToCanvas, isMovable, replaceShape } from '../game/engine'
import { applyHandle, snapMove, snapResize, snapRotation } from '../game/snapping'
import type { ResizeHandle } from '../game/snapping'
import type { Constraint, GameShape, GapBadge, Guide, LevelCanvas, Tolerance } from '../game/types'

export type InteractionKind = 'move' | 'resize' | 'rotate'

interface ActiveDrag {
  id: string
  kind: InteractionKind
  handle?: ResizeHandle
  pointerId: number
  startPointer: { x: number; y: number }
  startShape: { x: number; y: number; width: number; height: number; rotation: number }
  /** Pointer angle at grab time, for rotation. */
  startAngle: number
  moved: boolean
}

interface Args {
  shapes: GameShape[]
  setShapes: React.Dispatch<React.SetStateAction<GameShape[]>>
  constraints?: Constraint[]
  tol: Tolerance
  canvas: LevelCanvas
  surfaceRef: React.RefObject<HTMLDivElement | null>
  interactive: boolean
  snapEnabled: boolean
  onGrab?: () => void
  onSnap?: () => void
  onRelease?: (moved: boolean) => void
  onNudge?: () => void
}

const ROTATE_STEP = 0.5
const ROTATE_STEP_LARGE = 5

export function useDrag({
  shapes,
  setShapes,
  constraints,
  tol,
  canvas,
  surfaceRef,
  interactive,
  snapEnabled,
  onGrab,
  onSnap,
  onRelease,
  onNudge,
}: Args) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [guides, setGuides] = useState<Guide[]>([])
  const [gaps, setGaps] = useState<GapBadge[]>([])
  const [snapPulse, setSnapPulse] = useState(0)

  const shapesRef = useRef(shapes)
  shapesRef.current = shapes
  const dragRef = useRef<ActiveDrag | null>(null)
  const wasSnappedRef = useRef(false)
  const callbacks = useRef({ onGrab, onSnap, onRelease, onNudge })
  callbacks.current = { onGrab, onSnap, onRelease, onNudge }
  const configRef = useRef({ constraints, tol, canvas, snapEnabled })
  configRef.current = { constraints, tol, canvas, snapEnabled }

  const pointerToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const el = surfaceRef.current
      if (!el) return { x: clientX, y: clientY }
      const rect = el.getBoundingClientRect()
      const scale = rect.width / canvas.width || 1
      return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale }
    },
    [surfaceRef, canvas.width],
  )

  const clearFeedback = useCallback(() => {
    setGuides((g) => (g.length ? [] : g))
    setGaps((g) => (g.length ? [] : g))
  }, [])

  const begin = useCallback(
    (
      e: React.PointerEvent,
      id: string,
      kind: InteractionKind,
      handle?: ResizeHandle,
    ) => {
      if (!interactive) return
      const shape = shapesRef.current.find((s) => s.id === id)
      if (!shape) return
      if (kind === 'move' && !isMovable(shape)) {
        setSelectedId(id)
        return
      }
      e.preventDefault()
      e.stopPropagation()
      const target = e.currentTarget as HTMLElement
      try {
        target.setPointerCapture(e.pointerId)
      } catch {
        // Capture is an optimisation; window listeners still deliver the events.
      }
      // preventDefault above suppresses the browser's own focus handling, so move focus
      // explicitly — otherwise arrow-key nudging never reaches the shape you just grabbed.
      const shapeEl = target.closest<HTMLElement>('.shape')
      shapeEl?.focus({ preventScroll: true })
      const pointer = pointerToCanvas(e.clientX, e.clientY)
      const cx = shape.x + shape.width / 2
      const cy = shape.y + shape.height / 2
      dragRef.current = {
        id,
        kind,
        handle,
        pointerId: e.pointerId,
        startPointer: pointer,
        startShape: {
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
          rotation: shape.rotation ?? 0,
        },
        startAngle: (Math.atan2(pointer.y - cy, pointer.x - cx) * 180) / Math.PI,
        moved: false,
      }
      wasSnappedRef.current = false
      setSelectedId(id)
      setActiveId(id)
      callbacks.current.onGrab?.()
    },
    [interactive, pointerToCanvas],
  )

  const onShapePointerDown = useCallback(
    (e: React.PointerEvent, id: string) => begin(e, id, 'move'),
    [begin],
  )
  const onHandlePointerDown = useCallback(
    (e: React.PointerEvent, id: string, handle: ResizeHandle) => begin(e, id, 'resize', handle),
    [begin],
  )
  const onRotatePointerDown = useCallback(
    (e: React.PointerEvent, id: string) => begin(e, id, 'rotate'),
    [begin],
  )

  useEffect(() => {
    function handleMove(ev: PointerEvent) {
      const drag = dragRef.current
      if (!drag || ev.pointerId !== drag.pointerId) return
      const shape = shapesRef.current.find((s) => s.id === drag.id)
      if (!shape) return

      const cfg = configRef.current
      const pointer = pointerToCanvas(ev.clientX, ev.clientY)
      const dx = pointer.x - drag.startPointer.x
      const dy = pointer.y - drag.startPointer.y
      if (!drag.moved && Math.hypot(dx, dy) > 1) drag.moved = true

      const ctx = {
        shapes: shapesRef.current,
        constraints: cfg.constraints,
        tol: cfg.tol,
        enabled: cfg.snapEnabled,
        grid: cfg.canvas.grid,
      }

      let next: GameShape
      let snappedNow = false

      if (drag.kind === 'move') {
        let rawX = drag.startShape.x + dx
        let rawY = drag.startShape.y + dy
        if (shape.axis === 'x') rawY = drag.startShape.y
        if (shape.axis === 'y') rawX = drag.startShape.x
        const snap = snapMove(shape, rawX, rawY, ctx)
        const clamped = clampToCanvas(snap.x, snap.y, shape, cfg.canvas)
        next = { ...shape, x: clamped.x, y: clamped.y }
        snappedNow = snap.snapped.x || snap.snapped.y
        setGuides(snap.guides)
        setGaps(snap.gaps)
      } else if (drag.kind === 'resize' && drag.handle) {
        const input = applyHandle(drag.startShape, drag.handle, dx, dy)
        const snap = snapResize(shape, input, ctx)
        next = { ...shape, x: snap.x, y: snap.y, width: snap.width, height: snap.height }
        snappedNow = snap.snapped.width || snap.snapped.height
        setGuides([])
        setGaps([])
      } else {
        const cx = drag.startShape.x + drag.startShape.width / 2
        const cy = drag.startShape.y + drag.startShape.height / 2
        const angle = (Math.atan2(pointer.y - cy, pointer.x - cx) * 180) / Math.PI
        const snap = snapRotation(shape, drag.startShape.rotation + (angle - drag.startAngle), ctx)
        next = { ...shape, rotation: snap.rotation }
        snappedNow = snap.snapped.rotation
      }

      setShapes((prev) => replaceShape(prev, next))

      if (snappedNow && !wasSnappedRef.current) {
        callbacks.current.onSnap?.()
        setSnapPulse((n) => n + 1)
      }
      wasSnappedRef.current = snappedNow
    }

    function handleUp(ev: PointerEvent) {
      const drag = dragRef.current
      if (!drag || ev.pointerId !== drag.pointerId) return
      dragRef.current = null
      wasSnappedRef.current = false
      setActiveId(null)
      clearFeedback()
      callbacks.current.onRelease?.(drag.moved)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleUp)
    }
  }, [pointerToCanvas, setShapes, clearFeedback])

  /** Cancel any in-flight drag when the level changes underneath us. */
  useEffect(() => {
    dragRef.current = null
    setActiveId(null)
    setSelectedId(null)
    setGuides([])
    setGaps([])
  }, [canvas])

  const mutateSelected = useCallback(
    (fn: (s: GameShape) => GameShape | null) => {
      const id = selectedId
      if (!id || !interactive) return false
      // Probe decides whether the key applies at all; eligibility never changes mid-level.
      const probe = shapesRef.current.find((s) => s.id === id)
      if (!probe || !fn(probe)) return false
      // Apply functionally so a burst of key repeats within one tick composes rather
      // than each press recomputing from the same stale position.
      setShapes((prev) => prev.map((s) => (s.id === id ? (fn(s) ?? s) : s)))
      return true
    },
    [selectedId, interactive, setShapes],
  )

  /** Keyboard nudging is deliberately exact: no snapping, one pixel at a time. */
  const nudge = useCallback(
    (dx: number, dy: number) =>
      mutateSelected((shape) => {
        if (!isMovable(shape)) return null
        const rawX = shape.axis === 'y' ? shape.x : shape.x + dx
        const rawY = shape.axis === 'x' ? shape.y : shape.y + dy
        const clamped = clampToCanvas(rawX, rawY, shape, configRef.current.canvas)
        return { ...shape, x: clamped.x, y: clamped.y }
      }),
    [mutateSelected],
  )

  const resizeBy = useCallback(
    (dw: number, dh: number) =>
      mutateSelected((shape) => {
        if (!shape.resizable) return null
        return {
          ...shape,
          width: Math.max(28, shape.width + dw),
          height: Math.max(28, shape.height + dh),
        }
      }),
    [mutateSelected],
  )

  const rotateBy = useCallback(
    (deg: number) =>
      mutateSelected((shape) => {
        if (!shape.rotatable) return null
        return { ...shape, rotation: (shape.rotation ?? 0) + deg }
      }),
    [mutateSelected],
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!interactive || !selectedId) return
      const large = e.shiftKey
      const step = large ? 10 : 1
      let handled = false

      if (e.altKey && e.key.startsWith('Arrow')) {
        const dw = e.key === 'ArrowRight' ? step : e.key === 'ArrowLeft' ? -step : 0
        const dh = e.key === 'ArrowDown' ? step : e.key === 'ArrowUp' ? -step : 0
        handled = resizeBy(dw, dh)
      } else {
        switch (e.key) {
          case 'ArrowLeft':
            handled = nudge(-step, 0)
            break
          case 'ArrowRight':
            handled = nudge(step, 0)
            break
          case 'ArrowUp':
            handled = nudge(0, -step)
            break
          case 'ArrowDown':
            handled = nudge(0, step)
            break
          case '[':
            handled = rotateBy(-(large ? ROTATE_STEP_LARGE : ROTATE_STEP))
            break
          case ']':
            handled = rotateBy(large ? ROTATE_STEP_LARGE : ROTATE_STEP)
            break
          case 'Escape':
            setSelectedId(null)
            handled = true
            break
          default:
            break
        }
      }

      if (handled) {
        e.preventDefault()
        if (e.key !== 'Escape') callbacks.current.onNudge?.()
      }
    },
    [interactive, selectedId, nudge, resizeBy, rotateBy],
  )

  return {
    selectedId,
    setSelectedId,
    activeId,
    guides,
    gaps,
    snapPulse,
    onShapePointerDown,
    onHandlePointerDown,
    onRotatePointerDown,
    onKeyDown,
  }
}
