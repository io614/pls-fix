interface Props {
  /** Which task is on screen, in the position PowerPoint keeps its slide count. */
  taskLabel: string
  taskReopened: boolean
  status: string
  note?: string
  satisfied: number
  total: number
  progress: number
  showProgress: boolean
  clock: string
  clockLabel: string
  clockUrgent: boolean
  nudgeHint: boolean
  zoom: string
  onZoomIn: () => void
  onZoomOut: () => void
  canZoomIn: boolean
  canZoomOut: boolean
  onHint: () => void
  hintDisabled: boolean
  hintLabel: string
}

export default function StatusBar({
  taskLabel,
  taskReopened,
  status,
  note,
  satisfied,
  total,
  progress,
  showProgress,
  clock,
  clockLabel,
  clockUrgent,
  nudgeHint,
  zoom,
  onZoomIn,
  onZoomOut,
  canZoomIn,
  canZoomOut,
  onHint,
  hintDisabled,
  hintLabel,
}: Props) {
  return (
    <footer className="statusbar">
      <span className={`status-task${taskReopened ? ' is-reopened' : ''}`}>
        {taskLabel}
        {taskReopened ? <span className="status-task-flag">Reopened</span> : null}
      </span>

      <span className="status-dot" aria-hidden="true" />
      <span className="status-text">{status}</span>
      {note ? <span className="status-note">{note}</span> : null}

      {nudgeHint ? (
        <span className="nudge-hint">
          <kbd>↑</kbd>
          <kbd>↓</kbd>
          <kbd>←</kbd>
          <kbd>→</kbd>
          <span>nudge</span>
          <kbd>shift</kbd>
          <span>10px</span>
        </span>
      ) : null}

      <span className="status-spacer" />

      <button
        type="button"
        className="status-hint"
        onClick={onHint}
        disabled={hintDisabled}
        title="Escalate for visibility on intended positioning (H)"
      >
        {hintLabel}
      </button>

      {showProgress ? (
        <span className="status-progress" aria-label={`${satisfied} of ${total} objectives aligned`}>
          <span className="status-progress-label">
            {satisfied}/{total} aligned
          </span>
          <span className="status-progress-track" aria-hidden="true">
            <span
              className="status-progress-fill"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </span>
        </span>
      ) : null}

      <span className="status-zoomer">
        <button
          type="button"
          className="zoom-step"
          onClick={onZoomOut}
          disabled={!canZoomOut}
          aria-label="Zoom out"
        >
          <span className="zoom-glyph zoom-glyph--out" aria-hidden="true" />
        </button>
        <span className="status-zoom">{zoom}</span>
        <button
          type="button"
          className="zoom-step"
          onClick={onZoomIn}
          disabled={!canZoomIn}
          aria-label="Zoom in"
        >
          <span className="zoom-glyph zoom-glyph--in" aria-hidden="true" />
        </button>
      </span>

      <span className={`status-clock${clockUrgent ? ' is-urgent' : ''}`}>
        <span className="status-clock-label">{clockLabel}</span>
        <span className="status-clock-value">{clock}</span>
      </span>
    </footer>
  )
}
