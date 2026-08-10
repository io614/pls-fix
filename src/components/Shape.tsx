import { memo } from 'react'
import type { CSSProperties } from 'react'
import type { ResizeHandle } from '../game/snapping'
import type { GameShape } from '../game/types'

const HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

interface Props {
  shape: GameShape
  selected: boolean
  active: boolean
  interactive: boolean
  movable: boolean
  debug: boolean
  satisfied: boolean
  hinted: boolean
  pulseKey: number
  onPointerDown: (e: React.PointerEvent, id: string) => void
  onHandlePointerDown: (e: React.PointerEvent, id: string, handle: ResizeHandle) => void
  onRotatePointerDown: (e: React.PointerEvent, id: string) => void
  onSelect: (id: string) => void
}

function Arrow({ shape }: { shape: GameShape }) {
  const horizontal = shape.width >= shape.height
  const color = shape.style?.color ?? '#8f959b'
  return (
    <svg
      className="shape-arrow"
      viewBox={`0 0 ${shape.width} ${shape.height}`}
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      {horizontal ? (
        <>
          <line
            x1={2}
            y1={shape.height / 2}
            x2={shape.width - 9}
            y2={shape.height / 2}
            stroke={color}
            strokeWidth={1.5}
          />
          <path
            d={`M ${shape.width - 10} ${shape.height / 2 - 5} L ${shape.width - 1} ${shape.height / 2} L ${shape.width - 10} ${shape.height / 2 + 5} Z`}
            fill={color}
          />
        </>
      ) : (
        <>
          <line
            x1={shape.width / 2}
            y1={2}
            x2={shape.width / 2}
            y2={shape.height - 9}
            stroke={color}
            strokeWidth={1.5}
          />
          <path
            d={`M ${shape.width / 2 - 5} ${shape.height - 10} L ${shape.width / 2} ${shape.height - 1} L ${shape.width / 2 + 5} ${shape.height - 10} Z`}
            fill={color}
          />
        </>
      )}
    </svg>
  )
}

function Body({ shape }: { shape: GameShape }) {
  const s = shape.style ?? {}
  switch (shape.kind) {
    case 'arrow':
      return <Arrow shape={shape} />
    case 'line':
      return <div className="shape-rule" style={{ background: s.color ?? '#d9d9d2' }} />
    case 'text':
      return <span className="shape-text">{shape.content}</span>
    case 'kpi':
      return (
        <div className="shape-kpi">
          <span className="shape-kpi-label">{shape.content}</span>
          <span className="shape-kpi-value">{shape.sub}</span>
          <span className="shape-kpi-bar" style={{ background: s.accent ?? '#2f6fd0' }} />
        </div>
      )
    case 'card':
      return (
        <div className="shape-card">
          <span className="shape-card-dot" style={{ background: s.accent ?? '#2f6fd0' }} />
          <span className="shape-card-title">{shape.content}</span>
          {shape.sub ? <span className="shape-card-sub">{shape.sub}</span> : null}
        </div>
      )
    case 'chart':
      return (
        <div className="shape-chart">
          <span className="shape-panel-title">{shape.content}</span>
          <div className="shape-chart-plot">
            {(shape.bars ?? []).map((v, i) => (
              <span
                key={i}
                className="shape-chart-bar"
                style={{ height: `${Math.round(v * 100)}%`, background: s.accent ?? '#2f6fd0' }}
              />
            ))}
          </div>
        </div>
      )
    case 'table':
      return (
        <div className="shape-table">
          <span className="shape-panel-title">{shape.content}</span>
          <div className="shape-table-grid">
            {(shape.rows ?? []).map((row, i) => (
              <div className="shape-table-row" key={i}>
                {row.map((cell, j) => (
                  <span key={j}>{cell}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )
    default:
      return (
        <div className="shape-block">
          <span className="shape-block-title">{shape.content}</span>
          {shape.sub ? <span className="shape-block-sub">{shape.sub}</span> : null}
        </div>
      )
  }
}

function ShapeView({
  shape,
  selected,
  active,
  interactive,
  movable,
  debug,
  satisfied,
  hinted,
  pulseKey,
  onPointerDown,
  onHandlePointerDown,
  onRotatePointerDown,
  onSelect,
}: Props) {
  const s = shape.style ?? {}
  const chrome = shape.kind === 'text' || shape.kind === 'line' || shape.kind === 'arrow'

  const style: CSSProperties = {
    transform: `translate3d(${shape.x}px, ${shape.y}px, 0) rotate(${shape.rotation ?? 0}deg)`,
    width: shape.width,
    height: shape.height,
    zIndex: (shape.z ?? 0) + (active ? 40 : selected ? 20 : 0),
    background: chrome ? 'transparent' : s.fill ?? '#ffffff',
    borderColor: chrome ? 'transparent' : s.border ?? '#d9d9d2',
    borderStyle: s.dashed ? 'dashed' : 'solid',
    borderRadius: shape.kind === 'circle' ? '50%' : s.radius ?? 0,
    color: s.color ?? '#1d2023',
    fontSize: s.fontSize ?? 13,
    fontWeight: s.weight ?? 400,
    letterSpacing: s.tracking ? `${s.tracking}px` : undefined,
    textTransform: s.uppercase ? 'uppercase' : undefined,
    justifyContent:
      s.align === 'center' ? 'center' : s.align === 'right' ? 'flex-end' : 'flex-start',
    alignItems: s.valign === 'top' ? 'flex-start' : s.valign === 'bottom' ? 'flex-end' : 'center',
    opacity: s.opacity,
    boxShadow: s.shadow ? '0 6px 18px rgba(29, 32, 35, 0.14)' : undefined,
  }

  const className = [
    'shape',
    `shape--${shape.kind}`,
    interactive ? 'is-interactive' : 'is-static',
    movable ? 'is-movable' : 'is-fixed',
    selected ? 'is-selected' : '',
    active ? 'is-active' : '',
    debug && satisfied ? 'is-satisfied' : '',
    hinted ? 'is-hinted' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={className}
      style={style}
      data-shape-id={shape.id}
      data-pulse={pulseKey}
      role={interactive ? 'button' : 'presentation'}
      tabIndex={interactive ? 0 : -1}
      aria-label={
        interactive
          ? `${shape.label ?? shape.content ?? shape.kind}, at ${Math.round(shape.x)}, ${Math.round(shape.y)}`
          : undefined
      }
      aria-pressed={interactive ? selected : undefined}
      onPointerDown={interactive ? (e) => onPointerDown(e, shape.id) : undefined}
      onFocus={interactive ? () => onSelect(shape.id) : undefined}
    >
      <Body shape={shape} />

      {/* Remounting on pulseKey is what restarts the one-shot snap animation. */}
      {active && pulseKey > 0 ? <span key={pulseKey} className="snap-flash" aria-hidden="true" /> : null}

      {selected && interactive ? (
        <>
          <span className="shape-ring" aria-hidden="true" />
          {shape.rotatable ? (
            <span
              className="shape-rotate"
              aria-hidden="true"
              onPointerDown={(e) => onRotatePointerDown(e, shape.id)}
            />
          ) : null}
          {shape.resizable
            ? HANDLES.map((h) => (
                <span
                  key={h}
                  className={`shape-handle shape-handle--${h}`}
                  aria-hidden="true"
                  onPointerDown={(e) => onHandlePointerDown(e, shape.id, h)}
                />
              ))
            : null}
        </>
      ) : null}

      {debug ? (
        <span className="shape-debug">
          {Math.round(shape.x)},{Math.round(shape.y)}
        </span>
      ) : null}
    </div>
  )
}

export default memo(ShapeView)
