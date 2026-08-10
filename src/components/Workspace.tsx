import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ResizeHandle } from '../game/snapping'
import { isInteractive, isMovable } from '../game/engine'
import type { GameShape, GapBadge, Guide, HintGhost, Level } from '../game/types'
import ShapeView from './Shape'

interface Props {
  level: Level
  shapes: GameShape[]
  selectedId: string | null
  activeId: string | null
  guides: Guide[]
  gaps: GapBadge[]
  hints: HintGhost[]
  /** Changes on every request so the reveal animation replays. */
  hintToken: number
  hintLeaving: boolean
  snapPulse: number
  interactive: boolean
  debug: boolean
  satisfiedIds: Set<string>
  fading: boolean
  surfaceRef: React.RefObject<HTMLDivElement | null>
  onShapePointerDown: (e: React.PointerEvent, id: string) => void
  onHandlePointerDown: (e: React.PointerEvent, id: string, handle: ResizeHandle) => void
  onRotatePointerDown: (e: React.PointerEvent, id: string) => void
  onSelect: (id: string | null) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onScale: (scale: number) => void
}

const COLUMN_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export default function Workspace({
  level,
  shapes,
  selectedId,
  activeId,
  guides,
  gaps,
  hints,
  hintToken,
  hintLeaving,
  snapPulse,
  interactive,
  debug,
  satisfiedIds,
  fading,
  surfaceRef,
  onShapePointerDown,
  onHandlePointerDown,
  onRotatePointerDown,
  onSelect,
  onKeyDown,
  onScale,
}: Props) {
  const frameRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const measure = () => {
      // clientWidth/Height include padding, which is not usable space for the canvas.
      const cs = getComputedStyle(frame)
      const width =
        frame.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const height =
        frame.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      if (width <= 0 || height <= 0) return
      const next = Math.min(width / level.canvas.width, height / level.canvas.height, 1.35)
      const resolved = next > 0 ? next : 1
      setScale(resolved)
      onScale(resolved)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(frame)
    return () => ro.disconnect()
  }, [level.canvas.width, level.canvas.height, onScale])

  // Deselect when the level changes so the nudge hint does not linger.
  useEffect(() => {
    onSelect(null)
  }, [level.id, onSelect])

  const hintedIds = new Set(hints.map((h) => h.id))
  const { width: cw, height: ch } = level.canvas

  return (
    <div className={`workspace${fading ? ' is-fading' : ''}`} ref={frameRef}>
      <div className="workspace-stage" style={{ width: cw * scale, height: ch * scale }}>
        <div
          className={`surface surface--${level.canvas.surface}`}
          ref={surfaceRef}
          style={{ width: cw, height: ch, transform: `scale(${scale})` }}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) onSelect(null)
          }}
          onKeyDown={onKeyDown}
          tabIndex={-1}
        >
          {level.canvas.surface === 'sheet' ? (
            <div className="sheet-columns" aria-hidden="true">
              {COLUMN_LETTERS.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          ) : null}

          {debug
            ? shapes
                .filter((s) => s.target)
                .map((s) => (
                  <div
                    key={`ghost-${s.id}`}
                    className="target-ghost"
                    style={{
                      transform: `translate3d(${s.target?.x ?? s.x}px, ${s.target?.y ?? s.y}px, 0) rotate(${s.target?.rotation ?? s.rotation ?? 0}deg)`,
                      width: s.target?.width ?? s.width,
                      height: s.target?.height ?? s.height,
                    }}
                  />
                ))
            : null}

          {shapes.map((shape) => (
            <ShapeView
              key={shape.id}
              shape={shape}
              selected={selectedId === shape.id}
              active={activeId === shape.id}
              interactive={interactive && isInteractive(shape)}
              movable={isMovable(shape)}
              debug={debug}
              satisfied={satisfiedIds.has(shape.id)}
              hinted={hintedIds.has(shape.id)}
              pulseKey={activeId === shape.id ? snapPulse : 0}
              onPointerDown={onShapePointerDown}
              onHandlePointerDown={onHandlePointerDown}
              onRotatePointerDown={onRotatePointerDown}
              onSelect={onSelect}
            />
          ))}

          {hints.map((h) => (
            <div
              key={`hint-${hintToken}-${h.id}`}
              className={`hint-ghost${hintLeaving ? ' is-leaving' : ''}`}
              style={{
                transform: `translate3d(${h.x}px, ${h.y}px, 0) rotate(${h.rotation}deg)`,
                width: h.width,
                height: h.height,
              }}
              aria-hidden="true"
            />
          ))}

          {guides.map((g, i) => (
            <div
              key={`guide-${i}`}
              className={`guide guide--${g.kind}`}
              style={
                g.kind === 'v'
                  ? { left: g.at, top: g.from, height: g.to - g.from }
                  : { top: g.at, left: g.from, width: g.to - g.from }
              }
              aria-hidden="true"
            />
          ))}

          {gaps.map((gap, i) => (
            <div
              key={`gap-${i}`}
              className="gap-badge"
              style={{ left: gap.x, top: gap.y }}
              aria-hidden="true"
            >
              {gap.value}
            </div>
          ))}

          {level.canvas.surface === 'slide' ? <span className="slide-number">34</span> : null}
        </div>
      </div>
    </div>
  )
}
